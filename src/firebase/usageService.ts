import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './config';
import {
  LimitAction,
  LimitCheckResult,
  UserUsageRecord,
  UserProfile,
  PlatformPlan,
} from '../types';
import { getPlanByIdOrSlug, DEFAULT_PLANS } from './plansService';
import { isPlatformOwner, PLATFORM_OWNER_UID } from './authService';

export const USER_USAGE_COLLECTION = collection(db, 'user_usage');

/**
 * Returns current month key in format 'YYYY-MM'
 */
export function getCurrentMonthKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get or initialize user usage record for current month
 */
export async function getUserUsageRecord(userId: string): Promise<UserUsageRecord> {
  const currentMonth = getCurrentMonthKey();
  const usageRef = doc(db, 'user_usage', userId);

  try {
    const snap = await getDoc(usageRef);
    if (snap.exists()) {
      const data = snap.data() as UserUsageRecord;
      // If month changed, reset monthly counters while preserving cumulative counts
      if (data.currentMonth !== currentMonth) {
        const resetRecord: UserUsageRecord = {
          userId,
          currentMonth,
          projectsCount: data.projectsCount || 0,
          publishedSitesCount: data.publishedSitesCount || 0,
          monthlyAiGenerationsCount: 0,
          monthlyAiEditsCount: 0,
          monthlyAiRepairsCount: 0,
          githubExportsCount: 0,
          lastActivityAt: new Date().toISOString(),
        };
        await setDoc(usageRef, resetRecord, { merge: true });
        return resetRecord;
      }
      return data;
    } else {
      // First time initialization: count existing projects and published sites
      const projectsSnap = await getDocs(
        query(collection(db, 'projects'), where('userId', '==', userId))
      );
      const projectsCount = projectsSnap.size;
      let publishedCount = 0;
      projectsSnap.forEach((d) => {
        if (d.data().isPublished) publishedCount++;
      });

      const initialRecord: UserUsageRecord = {
        userId,
        currentMonth,
        projectsCount,
        publishedSitesCount: publishedCount,
        monthlyAiGenerationsCount: 0,
        monthlyAiEditsCount: 0,
        monthlyAiRepairsCount: 0,
        githubExportsCount: 0,
        lastActivityAt: new Date().toISOString(),
      };
      await setDoc(usageRef, initialRecord);
      return initialRecord;
    }
  } catch (err) {
    console.warn('Could not read user usage doc from Firestore, using in-memory baseline:', err);
    return {
      userId,
      currentMonth,
      projectsCount: 0,
      publishedSitesCount: 0,
      monthlyAiGenerationsCount: 0,
      monthlyAiEditsCount: 0,
      monthlyAiRepairsCount: 0,
      githubExportsCount: 0,
      lastActivityAt: new Date().toISOString(),
    };
  }
}

/**
 * Real-time subscription to a user's usage record
 */
export function subscribeToUserUsage(
  userId: string,
  callback: (usage: UserUsageRecord) => void
): () => void {
  const usageRef = doc(db, 'user_usage', userId);

  return onSnapshot(
    usageRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserUsageRecord);
      } else {
        getUserUsageRecord(userId).then(callback);
      }
    },
    (err) => {
      console.warn('User usage subscription warning:', err);
      getUserUsageRecord(userId).then(callback);
    }
  );
}

/**
 * Check if a specific user action is allowed under their active plan and limits
 */
export async function checkUserActionLimit(
  userId: string,
  userProfile: UserProfile | null,
  action: LimitAction
): Promise<LimitCheckResult> {
  // 1. Platform Owner has unlimited access to all features and zero limits
  if (isPlatformOwner(null, userProfile)) {
    return {
      allowed: true,
      current: 0,
      limit: -1,
      planName: 'مالك — غير محدود',
      action,
    };
  }

  // 2. Fetch user's active plan
  const planId = userProfile?.planId || 'plan_free';
  const plan: PlatformPlan =
    (await getPlanByIdOrSlug(planId)) || DEFAULT_PLANS[0];

  // 3. Fetch user's current usage
  const usage = await getUserUsageRecord(userId);

  // 4. Evaluate action
  switch (action) {
    case 'create_project': {
      const limit = userProfile?.customLimits?.maxProjects ?? plan.limits.maxProjects;
      const current = usage.projectsCount;
      if (limit !== -1 && current >= limit) {
        return {
          allowed: false,
          current,
          limit,
          planName: plan.name,
          action,
          reason: `وصلت للحد المتاح في خطتك (${plan.name}) لعدد المشاريع. الحد الأقصى: ${limit} مشاريع. يمكنك ترقية خطتك لإنشاء مشاريع إضافية.`,
        };
      }
      return { allowed: true, current, limit, planName: plan.name, action };
    }

    case 'ai_generate': {
      if (!plan.features.canUseAI) {
        return {
          allowed: false,
          current: usage.monthlyAiGenerationsCount,
          limit: 0,
          planName: plan.name,
          action,
          reason: `ميزة توليد المواقع بالذكاء الاصطناعي غير متاحة في خطتك الحالية (${plan.name}).`,
        };
      }
      const limit =
        userProfile?.customLimits?.maxMonthlyAiGenerations ??
        plan.limits.maxMonthlyAiGenerations;
      const current = usage.monthlyAiGenerationsCount;
      if (limit !== -1 && current >= limit) {
        return {
          allowed: false,
          current,
          limit,
          planName: plan.name,
          action,
          reason: `وصلت للحد الشهري المتاح في خطتك (${plan.name}) لتوليد المواقع بالذكاء الاصطناعي (${limit} عملية شهرياً).`,
        };
      }
      return { allowed: true, current, limit, planName: plan.name, action };
    }

    case 'ai_edit': {
      if (!plan.features.canUseAIEdit) {
        return {
          allowed: false,
          current: usage.monthlyAiEditsCount,
          limit: 0,
          planName: plan.name,
          action,
          reason: `ميزة التعديل الذكي بالمحادثة (AI Chat) غير متاحة في خطتك الحالية (${plan.name}).`,
        };
      }
      const limit =
        userProfile?.customLimits?.maxMonthlyAiEdits ??
        plan.limits.maxMonthlyAiEdits;
      const current = usage.monthlyAiEditsCount;
      if (limit !== -1 && current >= limit) {
        return {
          allowed: false,
          current,
          limit,
          planName: plan.name,
          action,
          reason: `وصلت للحد المتاح في خطتك (${plan.name}) لعمليات التعديل بالذكاء الاصطناعي (${limit} تعديل شهرياً).`,
        };
      }
      return { allowed: true, current, limit, planName: plan.name, action };
    }

    case 'ai_repair': {
      if (!plan.features.canUseAIRepair) {
        return {
          allowed: false,
          current: usage.monthlyAiRepairsCount,
          limit: 0,
          planName: plan.name,
          action,
          reason: `ميزة الإصلاح الذكي (AI Repair) غير متاحة في خطتك الحالية.`,
        };
      }
      const limit =
        userProfile?.customLimits?.maxMonthlyAiRepairs ??
        plan.limits.maxMonthlyAiRepairs;
      const current = usage.monthlyAiRepairsCount;
      if (limit !== -1 && current >= limit) {
        return {
          allowed: false,
          current,
          limit,
          planName: plan.name,
          action,
          reason: `وصلت للحد المتاح في خطتك لعمليات الإصلاح الذكي للكود (${limit} عملية).`,
        };
      }
      return { allowed: true, current, limit, planName: plan.name, action };
    }

    case 'publish_site': {
      if (!plan.features.canPublish) {
        return {
          allowed: false,
          current: usage.publishedSitesCount,
          limit: 0,
          planName: plan.name,
          action,
          reason: `ميزة نشر المواقع الحية غير متاحة في خطتك الحالية.`,
        };
      }
      const limit =
        userProfile?.customLimits?.maxPublishedSites ??
        plan.limits.maxPublishedSites;
      const current = usage.publishedSitesCount;
      if (limit !== -1 && current >= limit) {
        return {
          allowed: false,
          current,
          limit,
          planName: plan.name,
          action,
          reason: `وصلت للحد الأقصى لعدد المواقع المنشورة حية في نفس الوقت (${limit} موقع). يرجى إلغاء نشر أحد المواقع أو ترقية خطتك لنشر مواقع غير محدودة.`,
        };
      }
      return { allowed: true, current, limit, planName: plan.name, action };
    }

    case 'github_export': {
      if (!plan.features.canExportGitHub) {
        return {
          allowed: false,
          current: usage.githubExportsCount,
          limit: 0,
          planName: plan.name,
          action,
          reason: `ميزة تصدير الكود إلى مستودعات GitHub متاحة لمشتركي خطة Pro وما فوق. ارتقِ بخطتك للاستفادة منها فوراً.`,
        };
      }
      const limit =
        userProfile?.customLimits?.maxMonthlyGithubExports ??
        plan.limits.maxMonthlyGithubExports;
      const current = usage.githubExportsCount;
      if (limit !== -1 && current >= limit) {
        return {
          allowed: false,
          current,
          limit,
          planName: plan.name,
          action,
          reason: `وصلت للحد الشهري لتصدير مستودعات GitHub في خطتك (${limit} تصدير).`,
        };
      }
      return { allowed: true, current, limit, planName: plan.name, action };
    }

    case 'download_zip': {
      if (!plan.features.canDownloadZip) {
        return {
          allowed: false,
          current: 0,
          limit: 0,
          planName: plan.name,
          action,
          reason: `ميزة تنزيل الكود كملف ZIP غير مفعلة في خطتك الحالية.`,
        };
      }
      return { allowed: true, current: 0, limit: -1, planName: plan.name, action };
    }

    default:
      return { allowed: true, current: 0, limit: -1, planName: plan.name, action };
  }
}

/**
 * Increment user's action usage after successful execution
 */
export async function recordActionUsage(
  userId: string,
  action: LimitAction,
  delta: number = 1
): Promise<void> {
  // Owner never consumes limits or quotas
  if (userId === PLATFORM_OWNER_UID || (auth.currentUser && isPlatformOwner(auth.currentUser, null))) {
    return;
  }
  const currentMonth = getCurrentMonthKey();
  const usageRef = doc(db, 'user_usage', userId);

  const updates: Record<string, unknown> = {
    currentMonth,
    lastActivityAt: new Date().toISOString(),
  };

  switch (action) {
    case 'create_project':
      updates.projectsCount = increment(delta);
      break;
    case 'ai_generate':
      updates.monthlyAiGenerationsCount = increment(delta);
      break;
    case 'ai_edit':
      updates.monthlyAiEditsCount = increment(delta);
      break;
    case 'ai_repair':
      updates.monthlyAiRepairsCount = increment(delta);
      break;
    case 'publish_site':
      updates.publishedSitesCount = increment(delta);
      break;
    case 'github_export':
      updates.githubExportsCount = increment(delta);
      break;
  }

  try {
    await setDoc(usageRef, updates, { merge: true });
  } catch (e) {
    console.warn('Could not record action usage to Firestore:', e);
  }
}

/**
 * Sync user's real project count directly from the projects collection
 */
export async function syncUserProjectsCount(userId: string): Promise<number> {
  try {
    const q = query(collection(db, 'projects'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const count = snap.size;
    let publishedCount = 0;
    snap.forEach((d) => {
      if (d.data().isPublished) publishedCount++;
    });

    const usageRef = doc(db, 'user_usage', userId);
    await setDoc(
      usageRef,
      {
        projectsCount: count,
        publishedSitesCount: publishedCount,
        lastActivityAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return count;
  } catch (err) {
    console.warn('Could not sync user project count:', err);
    return 0;
  }
}
