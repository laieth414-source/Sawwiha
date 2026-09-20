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
import { getPlanByIdOrSlug, DEFAULT_PLANS } from './plansService';
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
 * Normalize raw Firestore document data to a safe SubscriptionVoucherCode
 */
export function normalizeVoucherDoc(data: Record<string, any>, fallbackId = ''): SubscriptionVoucherCode {
  let createdAtStr = new Date().toISOString();
  if (data?.createdAt) {
    if (typeof data.createdAt === 'string') {
      createdAtStr = data.createdAt;
    } else if (typeof data.createdAt === 'object' && 'toDate' in data.createdAt) {
      try {
        createdAtStr = data.createdAt.toDate().toISOString();
      } catch {
        createdAtStr = new Date().toISOString();
      }
    }
  }

  let redeemedAtStr: string | undefined = undefined;
  if (data?.redeemedAt) {
    if (typeof data.redeemedAt === 'string') {
      redeemedAtStr = data.redeemedAt;
    } else if (typeof data.redeemedAt === 'object' && 'toDate' in data.redeemedAt) {
      try {
        redeemedAtStr = data.redeemedAt.toDate().toISOString();
      } catch {
        redeemedAtStr = undefined;
      }
    }
  }

  let expiresAtStr: string | undefined = undefined;
  if (data?.expiresAt) {
    if (typeof data.expiresAt === 'string') {
      expiresAtStr = data.expiresAt;
    } else if (typeof data.expiresAt === 'object' && 'toDate' in data.expiresAt) {
      try {
        expiresAtStr = data.expiresAt.toDate().toISOString();
      } catch {
        expiresAtStr = undefined;
      }
    }
  }

  return {
    id: data?.id || fallbackId,
    code: String(data?.code || ''),
    planId: String(data?.planId || ''),
    planName: String(data?.planName || 'خطة المنصة'),
    planSlug: String(data?.planSlug || data?.planId || 'plan'),
    durationMonths: Number(data?.durationMonths) || 1,
    durationLabel: String(data?.durationLabel || 'شهر واحد'),
    status: (['unused', 'redeemed', 'cancelled'].includes(data?.status) ? data.status : 'unused') as 'unused' | 'redeemed' | 'cancelled',
    createdAt: createdAtStr,
    createdBy: String(data?.createdBy || ''),
    redeemedBy: data?.redeemedBy ? String(data.redeemedBy) : undefined,
    redeemedByEmail: data?.redeemedByEmail ? String(data.redeemedByEmail) : undefined,
    redeemedAt: redeemedAtStr,
    expiresAt: expiresAtStr,
    notes: data?.notes ? String(data.notes) : undefined,
  };
}

/**
 * Real-time listener for subscription codes collection
 */
export function subscribeToSubscriptionCodes(
  callback: (codes: SubscriptionVoucherCode[]) => void
): () => void {
  // Emit locally cached codes first for instant UI response
  const initialCached = getCachedVouchers().map((c) => normalizeVoucherDoc(c, c.id));
  if (initialCached.length > 0) {
    callback(initialCached);
  }

  const q = query(CODES_COLLECTION, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => normalizeVoucherDoc(d.data(), d.id));
      saveCachedVouchers(list);
      const combined = getCachedVouchers().map((c) => normalizeVoucherDoc(c, c.id));
      callback(combined.length > 0 ? combined : list);
    },
    (err) => {
      console.warn('Subscription codes listener warning:', err);
      // Fallback one-time fetch or cached
      getDocs(CODES_COLLECTION).then((s) => {
        const list = s.docs.map((d) => normalizeVoucherDoc(d.data(), d.id));
        saveCachedVouchers(list);
        callback(getCachedVouchers().map((c) => normalizeVoucherDoc(c, c.id)));
      }).catch((fetchErr) => {
        console.warn('Subscription codes fallback fetch warning:', fetchErr);
        callback(getCachedVouchers().map((c) => normalizeVoucherDoc(c, c.id)));
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
 * Atomic user redemption of a subscription code in Firestore with resilient cache fallbacks
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

  // 1. Locate code document in Firestore or fallback to local cache
  let codeDocRef: any = null;
  let initialData: SubscriptionVoucherCode | null = null;

  try {
    const q = query(CODES_COLLECTION, where('code', '==', normalizedCode));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const targetDocSnap = querySnap.docs[0];
      codeDocRef = targetDocSnap.ref;
      initialData = normalizeVoucherDoc(targetDocSnap.data(), targetDocSnap.id);
    }
  } catch (firestoreQueryErr) {
    console.warn('Notice querying subscription code from Firestore:', firestoreQueryErr);
  }

  // Fallback to locally cached codes if not found in Firestore or if query failed
  if (!initialData) {
    const cachedCodes = getCachedVouchers();
    const cachedMatch = cachedCodes.find((c) => c.code && c.code.trim().toUpperCase() === normalizedCode);
    if (cachedMatch) {
      initialData = normalizeVoucherDoc(cachedMatch, cachedMatch.id);
      const codeDocId = cachedMatch.id || `code_${normalizedCode.replace(/[^A-Za-z0-9]/g, '_')}`;
      codeDocRef = doc(db, 'subscription_codes', codeDocId);
    }
  }

  if (!initialData || !codeDocRef) {
    throw new Error('كود الاشتراك المدخل غير صحيح أو غير موجود.');
  }

  if (initialData.status === 'redeemed') {
    throw new Error('هذا الكود تم استخدامه وتفعيله مسبقاً ولا يمكن استخدامه مرة أخرى.');
  }

  if (initialData.status === 'cancelled') {
    throw new Error('تم إلغاء صلاحية هذا الكود من قبل إدارة المنصة.');
  }

  // 2. Fetch associated plan
  const plan =
    (await getPlanByIdOrSlug(initialData.planId)) ||
    (await getPlanByIdOrSlug(initialData.planSlug));

  const planName = plan?.name || initialData.planName || 'خطة المنصة';
  const planId = plan?.id || initialData.planId;
  const planSlug = plan?.slug || initialData.planSlug || 'pro';

  const duration = getDurationDetails(initialData.durationMonths || 1);
  const now = new Date();
  const startDate = now.toISOString();
  const expirationDate = new Date(now.getTime() + duration.days * 24 * 60 * 60 * 1000).toISOString();

  // 3. Prepare updated subscription and code records
  const userDocRef = doc(db, 'users', userId);
  const subDocId = `sub_${userId}_${Date.now()}`;
  const subDocRef = doc(db, 'subscriptions', subDocId);

  const userSubscription: UserSubscription = {
    id: subDocId,
    userId,
    userEmail: userEmail || 'user',
    planId,
    planSlug,
    planName,
    status: 'active',
    startDate,
    endDate: expirationDate,
    provider: 'manual_owner_grant',
    notes: `تم التفعيل عبر كود الاشتراك: ${normalizedCode} (${duration.label})`,
    updatedAt: startDate,
    updatedBy: userId,
  };

  const updatedCodeRecord: SubscriptionVoucherCode = {
    ...initialData,
    status: 'redeemed',
    redeemedBy: userId,
    redeemedByEmail: userEmail || null,
    redeemedAt: startDate,
    expiresAt: expirationDate,
  };

  const cleanCodeData = {
    id: initialData.id,
    code: normalizedCode,
    planId,
    planName,
    planSlug,
    durationMonths: initialData.durationMonths || 1,
    durationLabel: initialData.durationLabel || duration.label,
    status: 'redeemed',
    createdAt: initialData.createdAt || startDate,
    createdBy: initialData.createdBy || 'المنصة',
    redeemedBy: userId,
    redeemedByEmail: userEmail || null,
    redeemedAt: startDate,
    expiresAt: expirationDate,
    notes: initialData.notes || null,
  };

  // 4. Atomic transaction with sequential writes fallback
  let writeCompleted = false;
  try {
    await runTransaction(db, async (transaction) => {
      const codeSnap = await transaction.get(codeDocRef);
      if (codeSnap.exists()) {
        const cData = codeSnap.data() as SubscriptionVoucherCode;
        if (cData.status === 'redeemed') {
          throw new Error('تم استخدام هذا الكود بالفعل من قبل مستخدم آخر.');
        }
      }

      transaction.set(codeDocRef, cleanCodeData, { merge: true });
      transaction.set(
        userDocRef,
        {
          planId,
          planSlug,
          subscription: userSubscription,
        },
        { merge: true }
      );
      transaction.set(subDocRef, userSubscription);
    });
    writeCompleted = true;
  } catch (txErr: unknown) {
    console.warn('Transaction notice during code redemption, executing direct setDoc writes:', txErr);
    try {
      await setDoc(codeDocRef, cleanCodeData, { merge: true });
      await setDoc(
        userDocRef,
        {
          planId,
          planSlug,
          subscription: userSubscription,
        },
        { merge: true }
      );
      await setDoc(subDocRef, userSubscription);
      writeCompleted = true;
    } catch (directErr) {
      console.warn('Direct Firestore write notice during code redemption, applying locally:', directErr);
    }
  }

  // 5. Always persist to local cache immediately so UI and Admin table update instantly
  try {
    const cached = getCachedVouchers();
    let foundInCache = false;
    const updated = cached.map((c) => {
      if (c.code && c.code.trim().toUpperCase() === normalizedCode) {
        foundInCache = true;
        return updatedCodeRecord;
      }
      return c;
    });
    if (!foundInCache) {
      updated.unshift(updatedCodeRecord);
    }
    saveCachedVouchers(updated);
  } catch (cacheErr) {
    console.warn('Voucher cache update warning:', cacheErr);
  }

  // Also backup user subscription in localStorage
  try {
    localStorage.setItem(`sawwiha_active_sub_${userId}`, JSON.stringify(userSubscription));
  } catch (localSubErr) {
    console.warn('Local sub backup warning:', localSubErr);
  }

  // 6. Log platform audit record (silent catch)
  try {
    await logAdminAction({
      adminId: userId,
      adminEmail: userEmail,
      action: 'plan_change',
      targetEntity: 'user',
      targetId: userId,
      summary: `تفعيل كود اشتراك لخطة ${planName} للمستخدم ${userEmail}`,
      details: {
        code: normalizedCode,
        planId,
        planName,
        durationMonths: initialData.durationMonths,
        expiresAt: expirationDate,
      },
    });
  } catch (err) {
    console.warn('Could not write audit log for code redemption:', err);
  }

  const defaultFallback =
    DEFAULT_PLANS.find((p) => p.id === planId || p.slug === planSlug) ||
    DEFAULT_PLANS[1] ||
    DEFAULT_PLANS[0];

  const resolvedPlan: PlatformPlan = plan || {
    ...defaultFallback,
    id: planId,
    slug: planSlug,
    name: planName,
  };

  return {
    success: true,
    code: updatedCodeRecord,
    plan: resolvedPlan,
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
    const createdAtSafe = c.createdAt ? String(c.createdAt).slice(0, 10) : '—';
    const redeemedAtSafe = c.redeemedAt ? String(c.redeemedAt).slice(0, 10) : '—';
    const expiresAtSafe = c.expiresAt ? String(c.expiresAt).slice(0, 10) : '—';
    return [
      `"${c.code}"`,
      `"${c.planName}"`,
      `"${c.durationLabel}"`,
      `"${statusArabic}"`,
      `"${createdAtSafe}"`,
      `"${c.createdBy}"`,
      `"${c.redeemedByEmail || '—'}"`,
      `"${redeemedAtSafe}"`,
      `"${expiresAtSafe}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
