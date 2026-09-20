import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { SubscriptionVoucherCode, PlatformPlan, UserSubscription, UserProfile } from '../types';
import { getPlanByIdOrSlug } from './plansService';
import { logAdminAction } from './auditLogService';

export const CODES_COLLECTION = collection(db, 'subscription_codes');

const VOUCHERS_CACHE_KEY = 'sawwiha_cached_vouchers_v1';

export function getCachedVouchers(): SubscriptionVoucherCode[] {
  try {
    const raw = localStorage.getItem(VOUCHERS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCachedVouchers(codes: SubscriptionVoucherCode[]): void {
  try {
    const existing = getCachedVouchers();
    const map = new Map<string, SubscriptionVoucherCode>();
    for (const c of existing) map.set(c.id, c);
    for (const c of codes) map.set(c.id, c);
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    localStorage.setItem(VOUCHERS_CACHE_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn('Could not save vouchers to cache:', err);
  }
}

/**
 * Generate a cryptographically strong, human-readable voucher code
 * Example format: SW-PRO-8F2N-7K4M
 */
export function generateRandomVoucherCode(planSlug: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded easily confused 0, O, 1, I
  const getChunk = (len: number) => {
    let res = '';
    const array = new Uint8Array(len);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < len; i++) {
        res += chars[array[i] % chars.length];
      }
    } else {
      for (let i = 0; i < len; i++) {
        res += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    return res;
  };

  const cleanSlug = (planSlug || 'VIP').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'VIP';
  return `SW-${cleanSlug}-${getChunk(4)}-${getChunk(4)}`;
}

/**
 * Map duration in months to human label and approximate days
 */
export function getDurationDetails(durationMonths: number): { label: string; days: number } {
  switch (durationMonths) {
    case 1:
      return { label: 'شهر واحد (30 يوماً)', days: 30 };
    case 3:
      return { label: '3 أشهر (90 يوماً)', days: 90 };
    case 6:
      return { label: '6 أشهر (180 يوماً)', days: 180 };
    case 12:
      return { label: 'سنة كاملة (365 يوماً)', days: 365 };
    case 24:
      return { label: 'سنتان (730 يوماً)', days: 730 };
    default:
      return {
        label: `${durationMonths} شهر (${durationMonths * 30} يوماً)`,
        days: durationMonths * 30,
      };
  }
}

/**
 * Create one or multiple voucher codes in Firestore (Owner only)
 */
export async function createSubscriptionVoucherCodes(params: {
  planId: string;
  durationMonths: number;
  count: number;
  adminUid: string;
  adminEmail: string;
  notes?: string;
}): Promise<SubscriptionVoucherCode[]> {
  const { planId, durationMonths, count, adminUid, adminEmail, notes } = params;

  const plan = await getPlanByIdOrSlug(planId);
  if (!plan) {
    throw new Error(`الخطة المحددة (${planId}) غير موجودة في النظام.`);
  }

  const duration = getDurationDetails(durationMonths);
  const safeCount = Math.max(1, Math.min(count, 50));
  const createdCodes: SubscriptionVoucherCode[] = [];
  const now = new Date().toISOString();

  const batch = writeBatch(db);

  const safeNotes = notes && notes.trim() ? notes.trim() : null;

  for (let i = 0; i < safeCount; i++) {
    const codeString = generateRandomVoucherCode(plan.slug);
    const codeDocId = `code_${codeString.replace(/[^A-Za-z0-9]/g, '_')}`;
    const codeRef = doc(db, 'subscription_codes', codeDocId);

    const voucher: SubscriptionVoucherCode = {
      id: codeDocId,
      code: codeString,
      planId: plan.id,
      planName: plan.name,
      planSlug: plan.slug,
      durationMonths,
      durationLabel: duration.label,
      status: 'unused',
      createdAt: now,
      createdBy: adminEmail || adminUid,
      redeemedBy: null,
      redeemedByEmail: null,
      redeemedAt: null,
      expiresAt: null,
      notes: safeNotes,
    };

    // Clean any undefined values before writing to Firestore
    const cleanDocData: Record<string, any> = {};
    for (const [k, v] of Object.entries(voucher)) {
      if (v !== undefined) {
        cleanDocData[k] = v;
      }
    }

    batch.set(codeRef, cleanDocData);
    createdCodes.push(voucher);
  }

  // Preserve codes in local cache immediately so they are never lost
  saveCachedVouchers(createdCodes);

  try {
    await batch.commit();
  } catch (commitErr) {
    console.warn('Notice writing codes batch to Firestore, preserved in local cache:', commitErr);
  }

  // Log audit action
  try {
    await logAdminAction({
      adminId: adminUid,
      adminEmail,
      action: 'plan_change',
      targetEntity: 'plan',
      targetId: plan.id,
      summary: `توليد ${safeCount} كود اشتراك لخطة ${plan.name} بمدة ${duration.label}`,
      details: {
        planId: plan.id,
        planName: plan.name,
        durationMonths,
        count: safeCount,
        sampleCode: createdCodes[0]?.code,
      },
    });
  } catch (err) {
    console.warn('Audit log warning:', err);
  }

  return createdCodes;
}

/**
 * Real-time listener for subscription codes collection
 */
export function subscribeToSubscriptionCodes(
  callback: (codes: SubscriptionVoucherCode[]) => void
): () => void {
  // Emit locally cached codes first for instant UI response
  const initialCached = getCachedVouchers();
  if (initialCached.length > 0) {
    callback(initialCached);
  }

  const q = query(CODES_COLLECTION, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as SubscriptionVoucherCode);
      saveCachedVouchers(list);
      const combined = getCachedVouchers();
      callback(combined.length > 0 ? combined : list);
    },
    (err) => {
      console.warn('Subscription codes listener warning:', err);
      // Fallback one-time fetch or cached
      getDocs(CODES_COLLECTION).then((s) => {
        const list = s.docs.map((d) => d.data() as SubscriptionVoucherCode);
        saveCachedVouchers(list);
        callback(getCachedVouchers());
      }).catch((fetchErr) => {
        console.warn('Subscription codes fallback fetch warning:', fetchErr);
        callback(getCachedVouchers());
      });
    }
  );
}

/**
 * Cancel an unused voucher code
 */
export async function cancelSubscriptionVoucherCode(
  codeId: string,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const docRef = doc(db, 'subscription_codes', codeId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error('كود الاشتراك غير موجود في النظام.');
  }

  const current = snap.data() as SubscriptionVoucherCode;
  if (current.status === 'redeemed') {
    throw new Error('لا يمكن إلغاء كود تم استخدامه وتفعيله مسبقاً.');
  }

  await updateDoc(docRef, {
    status: 'cancelled',
  });

  try {
    await logAdminAction({
      adminId: adminUid,
      adminEmail,
      action: 'plan_change',
      targetEntity: 'plan',
      targetId: current.planId,
      summary: `إلغاء كود الاشتراك (${current.code})`,
      details: { codeId, code: current.code, planName: current.planName },
    });
  } catch (err) {
    console.warn('Audit log warning:', err);
  }
}

/**
 * Atomic user redemption of a subscription code in Firestore
 */
export async function redeemSubscriptionVoucherCode(params: {
  rawCode: string;
  userId: string;
  userEmail: string;
}): Promise<{
  success: boolean;
  code: SubscriptionVoucherCode;
  plan: PlatformPlan;
  subscription: UserSubscription;
}> {
  const { rawCode, userId, userEmail } = params;

  if (!rawCode || !rawCode.trim()) {
    throw new Error('يرجى إدخال كود الاشتراك أولاً.');
  }

  if (!userId) {
    throw new Error('يرجى تسجيل الدخول لتفعيل كود الاشتراك.');
  }

  const normalizedCode = rawCode.trim().toUpperCase();

  // 1. Locate code document in Firestore
  const q = query(CODES_COLLECTION, where('code', '==', normalizedCode));
  const querySnap = await getDocs(q);

  if (querySnap.empty) {
    throw new Error('كود الاشتراك المدخل غير صحيح أو غير موجود.');
  }

  const targetDocSnap = querySnap.docs[0];
  const codeDocRef = targetDocSnap.ref;
  const initialData = targetDocSnap.data() as SubscriptionVoucherCode;

  if (initialData.status === 'redeemed') {
    throw new Error('هذا الكود تم استخدامه وتفعيله مسبقاً ولا يمكن استخدامه مرة أخرى.');
  }

  if (initialData.status === 'cancelled') {
    throw new Error('تم إلغاء صلاحية هذا الكود من قبل إدارة المنصة.');
  }

  // 2. Fetch associated plan
  const plan = await getPlanByIdOrSlug(initialData.planId);
  if (!plan) {
    throw new Error(`الخطة المرتبطة بالكود (${initialData.planName}) غير متوفرة حالياً.`);
  }

  const duration = getDurationDetails(initialData.durationMonths || 1);
  const now = new Date();
  const startDate = now.toISOString();
  const expirationDate = new Date(now.getTime() + duration.days * 24 * 60 * 60 * 1000).toISOString();

  // 3. Atomic transaction to prevent double redemption
  let updatedCodeRecord!: SubscriptionVoucherCode;
  let userSubscription!: UserSubscription;

  await runTransaction(db, async (transaction) => {
    const codeSnap = await transaction.get(codeDocRef);
    if (!codeSnap.exists()) {
      throw new Error('تعذر العثور على سجل الكود أثناء المعاملة.');
    }

    const currentCode = codeSnap.data() as SubscriptionVoucherCode;
    if (currentCode.status !== 'unused') {
      if (currentCode.status === 'redeemed') {
        throw new Error('تم استخدام هذا الكود بالفعل من قبل مستخدم آخر.');
      }
      throw new Error('هذا الكود لم يعد متاحاً للاستخدام.');
    }

    const userDocRef = doc(db, 'users', userId);
    const subDocId = `sub_${userId}_${Date.now()}`;
    const subDocRef = doc(db, 'subscriptions', subDocId);

    userSubscription = {
      id: subDocId,
      userId,
      userEmail: userEmail || 'user',
      planId: plan.id,
      planSlug: plan.slug,
      planName: plan.name,
      status: 'active',
      startDate,
      endDate: expirationDate,
      provider: 'manual_owner_grant',
      notes: `تم التفعيل عبر كود الاشتراك: ${normalizedCode} (${duration.label})`,
      updatedAt: startDate,
      updatedBy: userId,
    };

    // Update code doc
    transaction.update(codeDocRef, {
      status: 'redeemed',
      redeemedBy: userId,
      redeemedByEmail: userEmail || null,
      redeemedAt: startDate,
      expiresAt: expirationDate,
    });

    // Update user profile with new plan and subscription
    transaction.set(
      userDocRef,
      {
        planId: plan.id,
        planSlug: plan.slug,
        subscription: userSubscription,
      },
      { merge: true }
    );

    // Save historical subscription document
    transaction.set(subDocRef, userSubscription);

    updatedCodeRecord = {
      ...currentCode,
      status: 'redeemed',
      redeemedBy: userId,
      redeemedByEmail: userEmail,
      redeemedAt: startDate,
      expiresAt: expirationDate,
    };
  });

  // Log platform audit record
  try {
    await logAdminAction({
      adminId: userId,
      adminEmail: userEmail,
      action: 'plan_change',
      targetEntity: 'user',
      targetId: userId,
      summary: `تفعيل كود اشتراك لخطة ${plan.name} للمستخدم ${userEmail}`,
      details: {
        code: normalizedCode,
        planId: plan.id,
        planName: plan.name,
        durationMonths: initialData.durationMonths,
        expiresAt: expirationDate,
      },
    });
  } catch (err) {
    console.warn('Could not write audit log for code redemption:', err);
  }

  return {
    success: true,
    code: updatedCodeRecord,
    plan,
    subscription: userSubscription,
  };
}

/**
 * Helper to export subscription codes to CSV string
 */
export function exportSubscriptionCodesToCSV(codes: SubscriptionVoucherCode[]): string {
  const headers = [
    'الكود',
    'الخطة',
    'المدة',
    'الحالة',
    'تاريخ الإنشاء',
    'أنشئ بواسطة',
    'المستخدم المفعل',
    'تاريخ التفعيل',
    'تاريخ الانتهاء',
  ];

  const rows = codes.map((c) => {
    const statusArabic =
      c.status === 'unused' ? 'متاح' : c.status === 'redeemed' ? 'مستخدم' : 'ملغى';
    return [
      `"${c.code}"`,
      `"${c.planName}"`,
      `"${c.durationLabel}"`,
      `"${statusArabic}"`,
      `"${c.createdAt.slice(0, 10)}"`,
      `"${c.createdBy}"`,
      `"${c.redeemedByEmail || '—'}"`,
      `"${c.redeemedAt ? c.redeemedAt.slice(0, 10) : '—'}"`,
      `"${c.expiresAt ? c.expiresAt.slice(0, 10) : '—'}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
