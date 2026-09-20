import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './config';
import { isPlatformOwner } from './authService';
import {
  PlatformPlan,
  UserSubscription,
  UserProfile,
  UserCustomLimitsOverride,
} from '../types';
import { handleFirestoreError, OperationType } from './errors';

export const PLANS_COLLECTION = collection(db, 'plans');
export const SUBSCRIPTIONS_COLLECTION = collection(db, 'subscriptions');
export const USERS_COLLECTION = collection(db, 'users');

/**
 * Initial Default Real Platform Plans (Fully editable via Admin)
 */
export const DEFAULT_PLANS: PlatformPlan[] = [
  {
    id: 'plan_free',
    name: 'المبتدئ (Free)',
    slug: 'free',
    badge: 'مجانية للأبد',
    price: 0,
    currency: '$',
    billingPeriod: 'free',
    description: 'كل ما تحتاجه لتجربة المنصة وبناء أولى مواقعك بالذكاء الاصطناعي وتنزيل الكود نظيفاً مجاناً.',
    featuresList: [
      'إنشاء حتى 3 مواقع إلكترونية متكاملة',
      '10 عمليات توليد مواقع بالذكاء الاصطناعي شهرياً',
      '30 عملية تعديل ذكي ومحادثة (AI Chat Companion)',
      '10 عمليات إصلاح أخطاء الكود آلياً (AI Repair)',
      'نشر فوري برابط مجاني مباشر ومستقل',
      'تنزيل حزمة الكود كاملة (Clean ZIP) بنقرة واحدة',
      'معاينة كاملة على الجوال والتابلت والحاسوب',
    ],
    features: {
      canUseAI: true,
      canUseAIEdit: true,
      canUseAIRepair: true,
      canPublish: true,
      canExportGitHub: false,
      canDownloadZip: true,
      removeWatermark: false,
      customDomainAllowed: false,
      prioritySupport: false,
    },
    limits: {
      maxProjects: 3,
      maxMonthlyAiGenerations: 10,
      maxMonthlyAiEdits: 30,
      maxMonthlyAiRepairs: 10,
      maxPublishedSites: 1,
      maxMonthlyGithubExports: 0,
    },
    isDefault: true,
    isActive: true,
    sortOrder: 1,
    highlighted: false,
    ctaText: 'ابدأ مجاناً',
  },
  {
    id: 'plan_pro',
    name: 'المحترف (Pro)',
    slug: 'pro',
    badge: 'الأكثر طلباً وشعبية',
    price: 19,
    currency: '$',
    billingPeriod: 'monthly',
    description: 'المثالية للمصممين ورواد الأعمال المستقلين الراغبين بإنتاج أسرع، وتصدير GitHub، وإزالة الشعار.',
    featuresList: [
      'إنشاء حتى 20 موقعاً إلكترونياً متكاملاً',
      '60 عملية توليد مواقع بالذكاء الاصطناعي شهرياً',
      '200 عملية تعديل وتطوير بالذكاء الاصطناعي شهرياً',
      '100 عملية إصلاح كود فورية (AI Repair)',
      'تصدير ومزامنة مباشرة مع مستودعات GitHub',
      'نشر حتى 10 مواقع حية نشطة في نفس الوقت',
      'تنزيل غير محدود لأرشيفات ZIP النظيفة',
      'إزالة شارة وعلامة المنصة بالكامل (White-label)',
      'أولوية معالجة طلبات الذكاء الاصطناعي',
    ],
    features: {
      canUseAI: true,
      canUseAIEdit: true,
      canUseAIRepair: true,
      canPublish: true,
      canExportGitHub: true,
      canDownloadZip: true,
      removeWatermark: true,
      customDomainAllowed: false,
      prioritySupport: true,
    },
    limits: {
      maxProjects: 20,
      maxMonthlyAiGenerations: 60,
      maxMonthlyAiEdits: 200,
      maxMonthlyAiRepairs: 100,
      maxPublishedSites: 10,
      maxMonthlyGithubExports: 50,
    },
    isDefault: false,
    isActive: true,
    sortOrder: 2,
    highlighted: true,
    ctaText: 'ترقية إلى Pro',
  },
  {
    id: 'plan_business',
    name: 'الشركات والوكالات (Business)',
    slug: 'business',
    badge: 'أقصى أداء وإمكانيات',
    price: 49,
    currency: '$',
    billingPeriod: 'monthly',
    description: 'حل متكامل للوكالات وفرق العمل لبناء وتسليم مشاريع غير محدودة لعملائهم مع دعم فني مخصص.',
    featuresList: [
      'عدد مشاريع غير محدود (Unlimited Projects)',
      'توليد وتعديل ذكاء اصطناعي غير محدود',
      'تصدير غير محدود إلى GitHub ونشر مباشر',
      'نشر غير محدود للمواقع المستقلة',
      'جاهزية كاملة لربط النطاقات المخصصة (Custom Domains)',
      'تنزيل غير محدود وحرية كود 100%',
      'بدون أي قيود أو علامات مائية',
      'دعم فني استشاري مخصص على مدار الساعة',
    ],
    features: {
      canUseAI: true,
      canUseAIEdit: true,
      canUseAIRepair: true,
      canPublish: true,
      canExportGitHub: true,
      canDownloadZip: true,
      removeWatermark: true,
      customDomainAllowed: true,
      prioritySupport: true,
    },
    limits: {
      maxProjects: -1,
      maxMonthlyAiGenerations: -1,
      maxMonthlyAiEdits: -1,
      maxMonthlyAiRepairs: -1,
      maxPublishedSites: -1,
      maxMonthlyGithubExports: -1,
    },
    isDefault: false,
    isActive: true,
    sortOrder: 3,
    highlighted: false,
    ctaText: 'ترقية للشركات',
  },
];

/**
 * Special Owner Unlimited Plan (Non-editable, strict platform owner privilege)
 */
export const OWNER_UNLIMITED_PLAN: PlatformPlan = {
  id: 'plan_owner_unlimited',
  name: 'مالك — غير محدود',
  slug: 'owner_unlimited',
  badge: 'مالك المنصة',
  price: 0,
  currency: '$',
  billingPeriod: 'free',
  description: 'صلاحيات وإمكانيات مطلقة غير محدودة خاصة بمالك ومطور المنصة.',
  featuresList: [
    'عدد مواقع ومشاريع غير محدود نهائياً',
    'إنشاء مشاريع ذكية غير محدود',
    'عدم استهلاك أي حدود للخطط المجانية أو المدفوعة',
    'تجاوز كافة قيود الاستهلاك (Usage Limits) بالكامل',
    'وصول كامل وشامل لجميع ميزات المنصة والذكاء الاصطناعي',
    'تصدير كود نظيف وتنزيل ZIP ومزامنة GitHub دون قيود',
    'إدارة الخطط والمشتركين والأكواد والإعدادات الحية',
  ],
  features: {
    canUseAI: true,
    canUseAIEdit: true,
    canUseAIRepair: true,
    canPublish: true,
    canExportGitHub: true,
    canDownloadZip: true,
    removeWatermark: true,
    customDomainAllowed: true,
    prioritySupport: true,
  },
  limits: {
    maxProjects: -1,
    maxMonthlyAiGenerations: -1,
    maxMonthlyAiEdits: -1,
    maxMonthlyAiRepairs: -1,
    maxPublishedSites: -1,
    maxMonthlyGithubExports: -1,
  },
  isDefault: false,
  isActive: true,
  sortOrder: 0,
  highlighted: true,
  ctaText: 'حساب المالك',
};

/**
 * Seed default plans if Firestore plans collection is empty
 */
export async function seedDefaultPlansIfEmpty(): Promise<PlatformPlan[]> {
  try {
    const snap = await getDocs(PLANS_COLLECTION);
    if (snap.empty) {
      // Only attempt writing default plans to Firestore if current user is owner
      if (auth.currentUser && isPlatformOwner(auth.currentUser, null)) {
        try {
          const batch = writeBatch(db);
          for (const p of DEFAULT_PLANS) {
            const ref = doc(db, 'plans', p.id);
            batch.set(ref, {
              ...p,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              serverCreatedAt: serverTimestamp(),
            });
          }
          await batch.commit();
        } catch (commitErr) {
          console.warn('Could not write seed plans to Firestore:', commitErr);
        }
      }
      return DEFAULT_PLANS;
    } else {
      const plans: PlatformPlan[] = [];
      snap.forEach((d) => plans.push(d.data() as PlatformPlan));
      return plans.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
  } catch (err) {
    console.warn('Error reading or seeding plans from Firestore, using default fallback:', err);
    return DEFAULT_PLANS;
  }
}

/**
 * Real-time listener for all active/available plans
 */
export function subscribeToPlans(
  callback: (plans: PlatformPlan[]) => void,
  includeInactive: boolean = false
): () => void {
  const q = query(PLANS_COLLECTION, orderBy('sortOrder', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // Seed default plans in background
        seedDefaultPlansIfEmpty().then((seeded) => {
          callback(includeInactive ? seeded : seeded.filter((p) => p.isActive));
        });
        return;
      }

      const list: PlatformPlan[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as PlatformPlan;
        if (includeInactive || item.isActive) {
          list.push(item);
        }
      });
      callback(list);
    },
    (err) => {
      console.warn('Plans snapshot subscription warning:', err);
      callback(includeInactive ? DEFAULT_PLANS : DEFAULT_PLANS.filter((p) => p.isActive));
    }
  );
}

/**
 * Fetch all plans once
 */
export async function getAllPlans(includeInactive: boolean = false): Promise<PlatformPlan[]> {
  try {
    const q = query(PLANS_COLLECTION, orderBy('sortOrder', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      return await seedDefaultPlansIfEmpty();
    }
    const list: PlatformPlan[] = [];
    snap.forEach((d) => {
      const p = d.data() as PlatformPlan;
      if (includeInactive || p.isActive) {
        list.push(p);
      }
    });
    return list;
  } catch (e) {
    console.warn('Failed to fetch plans from Firestore:', e);
    return DEFAULT_PLANS;
  }
}

/**
 * Fetch a single plan by its ID or Slug
 */
export async function getPlanByIdOrSlug(idOrSlug: string): Promise<PlatformPlan | null> {
  if (idOrSlug === 'plan_owner_unlimited' || idOrSlug === 'owner_unlimited') {
    return OWNER_UNLIMITED_PLAN;
  }
  try {
    const docRef = doc(db, 'plans', idOrSlug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PlatformPlan;
    }

    // Query by slug
    const q = query(PLANS_COLLECTION, where('slug', '==', idOrSlug));
    const slugSnap = await getDocs(q);
    if (!slugSnap.empty) {
      return slugSnap.docs[0].data() as PlatformPlan;
    }

    // Fallback to DEFAULT_PLANS
    const fallback = DEFAULT_PLANS.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    return fallback || null;
  } catch (err) {
    console.warn('Could not load plan doc:', err);
    return DEFAULT_PLANS.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
  }
}

/**
 * Create a new plan in Firestore (Owner only)
 */
export async function createPlan(
  planData: Omit<PlatformPlan, 'id' | 'createdAt' | 'updatedAt'>,
  ownerId: string
): Promise<PlatformPlan> {
  const planId = `plan_${planData.slug.trim().toLowerCase() || Date.now()}`;
  const now = new Date().toISOString();

  const plan: PlatformPlan = {
    ...planData,
    id: planId,
    slug: planData.slug.trim().toLowerCase(),
    createdAt: now,
    updatedAt: now,
  };

  try {
    const planRef = doc(db, 'plans', planId);
    await setDoc(planRef, {
      ...plan,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
      createdBy: ownerId,
    });
    return plan;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, `plans/${planId}`);
  }
}

/**
 * Update an existing plan in Firestore (Owner only)
 */
export async function updatePlan(
  planId: string,
  updates: Partial<PlatformPlan>,
  ownerId: string
): Promise<void> {
  const now = new Date().toISOString();
  try {
    const planRef = doc(db, 'plans', planId);
    await setDoc(
      planRef,
      {
        ...updates,
        updatedAt: now,
        serverUpdatedAt: serverTimestamp(),
        updatedBy: ownerId,
      },
      { merge: true }
    );
  } catch (error) {
    return handleFirestoreError(error, OperationType.UPDATE, `plans/${planId}`);
  }
}

/**
 * Set a plan as the system default (Owner only)
 */
export async function setDefaultPlan(planId: string, ownerId: string): Promise<void> {
  try {
    const all = await getAllPlans(true);
    const batch = writeBatch(db);

    for (const p of all) {
      const ref = doc(db, 'plans', p.id);
      batch.update(ref, {
        isDefault: p.id === planId,
        updatedAt: new Date().toISOString(),
        updatedBy: ownerId,
      });
    }

    await batch.commit();
  } catch (error) {
    return handleFirestoreError(error, OperationType.UPDATE, `plans/${planId}`);
  }
}

/**
 * Delete a plan safely (Owner only)
 */
export async function deletePlan(planId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const planRef = doc(db, 'plans', planId);
    const snap = await getDoc(planRef);
    if (!snap.exists()) {
      return { success: false, message: 'الخطة غير موجودة.' };
    }

    const plan = snap.data() as PlatformPlan;
    if (plan.isDefault) {
      return { success: false, message: 'لا يمكن حذف الخطة الافتراضية للنظام.' };
    }

    // Check if users currently have this plan
    const usersQ = query(USERS_COLLECTION, where('planId', '==', planId));
    const userSnap = await getDocs(usersQ);
    if (!userSnap.empty) {
      return {
        success: false,
        message: `لا يمكن حذف الخطة لوجود ${userSnap.size} مستخدم مرتبطين بها حالياً. يمكنك تعطيل الخطة بدلاً من ذلك.`,
      };
    }

    await deleteDoc(planRef);
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `plans/${planId}`);
    return { success: false, message: 'فشل حذف الخطة من قاعدة البيانات.' };
  }
}

// ==========================================
// Admin User Subscriptions & Overrides
// ==========================================

/**
 * Fetch all registered users for Admin management
 */
export async function adminGetAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(USERS_COLLECTION);
    const users: UserProfile[] = [];
    snap.forEach((d) => {
      users.push(d.data() as UserProfile);
    });
    return users;
  } catch (err) {
    console.warn('Could not load users list for Admin:', err);
    return [];
  }
}

/**
 * Assign or update a user's plan and subscription (Owner Override)
 */
export async function adminAssignUserPlan(params: {
  userId: string;
  userEmail: string;
  planId: string;
  adminUid: string;
  durationDays?: number;
  notes?: string;
}): Promise<UserSubscription> {
  const plan = await getPlanByIdOrSlug(params.planId);
  const now = new Date();
  const startDate = now.toISOString();

  let endDate: string | null = null;
  if (params.durationDays && params.durationDays > 0) {
    const end = new Date(now.getTime() + params.durationDays * 24 * 60 * 60 * 1000);
    endDate = end.toISOString();
  }

  const subId = `sub_${params.userId}_${Date.now()}`;
  const subscription: UserSubscription = {
    id: subId,
    userId: params.userId,
    userEmail: params.userEmail,
    planId: plan?.id || params.planId,
    planSlug: plan?.slug || 'free',
    planName: plan?.name || 'خطة مخصصة',
    status: 'active',
    startDate,
    endDate,
    provider: plan?.price === 0 ? 'free' : 'manual_owner_grant',
    notes: params.notes || 'تفعيل إداري مباشر من مالك المنصة',
    updatedAt: startDate,
    updatedBy: params.adminUid,
  };

  try {
    // 1. Update user profile doc
    const userRef = doc(db, 'users', params.userId);
    await setDoc(
      userRef,
      {
        planId: subscription.planId,
        planSlug: subscription.planSlug,
        subscription,
      },
      { merge: true }
    );

    // 2. Log in subscriptions collection
    const subRef = doc(db, 'subscriptions', subId);
    await setDoc(subRef, {
      ...subscription,
      serverCreatedAt: serverTimestamp(),
    });

    return subscription;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `users/${params.userId}`);
  }
}

/**
 * Revert a user to the default Free plan (Owner Override)
 */
export async function adminRevertUserToFree(
  userId: string,
  adminUid: string
): Promise<void> {
  const freePlan = DEFAULT_PLANS[0];
  const now = new Date().toISOString();

  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        planId: freePlan.id,
        planSlug: freePlan.slug,
        subscription: {
          id: `sub_${userId}_free`,
          userId,
          planId: freePlan.id,
          planSlug: freePlan.slug,
          planName: freePlan.name,
          status: 'active',
          startDate: now,
          endDate: null,
          provider: 'free',
          notes: 'إعادة إلى الخطة المجانية بواسطة الإدارة',
          updatedAt: now,
          updatedBy: adminUid,
        },
      },
      { merge: true }
    );
  } catch (error) {
    return handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

/**
 * Set custom limit overrides for a specific user (Owner Override)
 */
export async function adminSetUserCustomLimits(
  userId: string,
  customLimits: UserCustomLimitsOverride | null,
  adminUid: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        customLimits: customLimits || null,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUid,
      },
      { merge: true }
    );
  } catch (error) {
    return handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}
