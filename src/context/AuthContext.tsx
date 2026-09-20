import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, FIREBASE_CONFIG } from '../firebase/config';
import {
  loginWithGoogle as apiLoginWithGoogle,
  loginWithEmail as apiLoginWithEmail,
  registerWithEmail as apiRegisterWithEmail,
  logoutUser as apiLogoutUser,
  syncUserProfile,
  isPlatformOwner,
  UserProfile,
} from '../firebase/authService';
import { testFirestoreConnection, ConnectionStatusResult } from '../firebase/firestoreService';
import {
  DEFAULT_PLATFORM_SETTINGS,
  subscribeToPlatformSettings,
  savePlatformSettings,
} from '../firebase/platformSettingsService';
import {
  PlatformSettings,
  PlatformPlan,
  UserUsageRecord,
  LimitAction,
  LimitCheckResult,
} from '../types';
import {
  subscribeToPlans,
  DEFAULT_PLANS,
  OWNER_UNLIMITED_PLAN,
} from '../firebase/plansService';
import {
  subscribeToUserUsage,
  checkUserActionLimit,
  recordActionUsage,
  getUserUsageRecord,
} from '../firebase/usageService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isOwner: boolean;
  loading: boolean;
  authReady: boolean;
  authError: string | null;
  clearAuthError: () => void;
  firestoreStatus: 'connected' | 'checking' | 'error';
  firestoreDetails: ConnectionStatusResult | null;
  projectId: string;
  authDomain: string;
  platformSettings: PlatformSettings;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => Promise<void>;
  authModalOpen: boolean;
  authModalInitialMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkConnection: () => Promise<ConnectionStatusResult>;
  // Phase 5: Plans, Usage & Limits
  allPlans: PlatformPlan[];
  currentPlan: PlatformPlan;
  userUsage: UserUsageRecord | null;
  refreshUsage: () => Promise<void>;
  checkActionLimit: (action: LimitAction | string) => LimitCheckResult;
  checkLimit: (action: LimitAction | string) => Promise<LimitCheckResult>;
  recordActionUsage: (action: LimitAction | string, delta?: number) => Promise<void>;
  recordUsage: (action: LimitAction | string, delta?: number) => Promise<void>;
  limitModalOpen: boolean;
  limitNoticeData: LimitCheckResult | null;
  showPlanLimitNotice: (target: LimitAction | string | LimitCheckResult) => void;
  showLimitNotice: (notice: LimitCheckResult) => void;
  closeLimitNotice: () => void;
  upgradeModalOpen: boolean;
  targetUpgradePlan: PlatformPlan | null;
  openUpgradeModal: (plan?: PlatformPlan | null) => void;
  closeUpgradeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register'>('login');

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);

  const [firestoreStatus, setFirestoreStatus] = useState<'connected' | 'checking' | 'error'>('checking');
  const [firestoreDetails, setFirestoreDetails] = useState<ConnectionStatusResult | null>(null);

  // Phase 5 States
  const [allPlans, setAllPlans] = useState<PlatformPlan[]>(DEFAULT_PLANS);
  const [userUsage, setUserUsage] = useState<UserUsageRecord | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState<boolean>(false);
  const [limitNoticeData, setLimitNoticeData] = useState<LimitCheckResult | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [targetUpgradePlan, setTargetUpgradePlan] = useState<PlatformPlan | null>(null);

  const isOwner = useMemo(() => isPlatformOwner(user, userProfile), [user, userProfile]);

  // Current Active Plan
  const currentPlan = useMemo<PlatformPlan>(() => {
    if (isOwner) {
      return OWNER_UNLIMITED_PLAN;
    }
    if (!userProfile?.planId) {
      return allPlans.find((p) => p.isDefault) || DEFAULT_PLANS[0];
    }
    if (userProfile.planId === 'plan_owner_unlimited' || userProfile.planSlug === 'owner_unlimited') {
      return OWNER_UNLIMITED_PLAN;
    }
    const found = allPlans.find((p) => p.id === userProfile.planId || p.slug === userProfile.planSlug);
    return found || allPlans.find((p) => p.isDefault) || DEFAULT_PLANS[0];
  }, [allPlans, userProfile, isOwner]);

  const clearAuthError = () => setAuthError(null);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalInitialMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const showLimitNotice = (notice: LimitCheckResult) => {
    setLimitNoticeData(notice);
    setLimitModalOpen(true);
  };

  const closeLimitNotice = () => {
    setLimitModalOpen(false);
    setLimitNoticeData(null);
  };

  const openUpgradeModal = (plan?: PlatformPlan | null) => {
    setTargetUpgradePlan(plan || null);
    setUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setUpgradeModalOpen(false);
    setTargetUpgradePlan(null);
  };

  // Check Firestore connection on boot
  const checkConnection = async (): Promise<ConnectionStatusResult> => {
    setFirestoreStatus('checking');
    try {
      const res = await testFirestoreConnection();
      setFirestoreDetails(res);
      setFirestoreStatus(res.success ? 'connected' : 'error');
      return res;
    } catch (err: unknown) {
      const res: ConnectionStatusResult = {
        success: false,
        projectId: FIREBASE_CONFIG.projectId,
        authDomain: FIREBASE_CONFIG.authDomain,
        latencyMs: 0,
        message: 'حدث خطأ أثناء فحص اتصال Firestore',
        details: err instanceof Error ? err.message : String(err),
      };
      setFirestoreDetails(res);
      setFirestoreStatus('error');
      return res;
    }
  };

  useEffect(() => {
    // 1. Initial Firestore connection test
    checkConnection();

    // 2. Subscribe to real-time Platform Settings
    const unsubscribeSettings = subscribeToPlatformSettings((settings) => {
      setPlatformSettings(settings);
    });

    // 3. Subscribe to real-time Plans
    const unsubscribePlans = subscribeToPlans((plans) => {
      if (plans && plans.length > 0) {
        setAllPlans(plans);
      }
    }, true);

    // 4. Listen to Auth State
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser);
        setAuthReady(true);
        setLoading(false);

        if (firebaseUser) {
          try {
            const profile = await syncUserProfile(firebaseUser);
            setUserProfile(profile);
          } catch (e) {
            console.warn('Profile sync warning:', e);
          }
        } else {
          setUserProfile(null);
          setUserUsage(null);
        }
      },
      (error) => {
        console.error('Firebase Auth state change error:', error);
        setAuthError(error.message);
        setAuthReady(true);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeSettings();
      unsubscribePlans();
      unsubscribeAuth();
    };
  }, []);

  // 5. Subscribe to user usage when authenticated
  useEffect(() => {
    if (!user?.uid) {
      setUserUsage(null);
      return;
    }

    const unsubscribeUsage = subscribeToUserUsage(user.uid, (usage) => {
      setUserUsage(usage);
    });

    return () => {
      unsubscribeUsage();
    };
  }, [user?.uid]);

  const refreshUsage = async () => {
    if (!user?.uid) return;
    const u = await getUserUsageRecord(user.uid);
    setUserUsage(u);
  };

  const normalizeLimitAction = (rawAction: LimitAction | string): LimitAction => {
    switch (rawAction) {
      case 'projects':
      case 'create_project':
        return 'create_project';
      case 'aiGenerations':
      case 'ai_generate':
        return 'ai_generate';
      case 'aiEdits':
      case 'ai_edit':
        return 'ai_edit';
      case 'aiRepairs':
      case 'ai_repair':
        return 'ai_repair';
      case 'publishedSites':
      case 'publish_site':
        return 'publish_site';
      case 'canExportGithub':
      case 'github_export':
        return 'github_export';
      case 'canDownloadZip':
      case 'download_zip':
        return 'download_zip';
      default:
        return 'create_project';
    }
  };

  const checkActionLimit = (rawAction: LimitAction | string): LimitCheckResult => {
    const action = normalizeLimitAction(rawAction);

    // 1. Platform Owner has unlimited access to all features and zero limits
    if (isOwner) {
      return {
        allowed: true,
        current: 0,
        limit: -1,
        planName: 'مالك — غير محدود',
        action,
      };
    }

    // 2. User not logged in
    if (!user) {
      return {
        allowed: false,
        current: 0,
        limit: 0,
        planName: 'زائر',
        action,
        reason: 'يرجى تسجيل الدخول أو إنشاء حساب لاستخدام هذه الميزة.',
      };
    }

    // 3. User account is suspended
    if (userProfile?.status === 'suspended') {
      return {
        allowed: false,
        current: 0,
        limit: 0,
        planName: currentPlan.name,
        action,
        reason: 'تم تعطيل حسابك مؤقتاً من قبل إدارة المنصة. يرجى مراجعة الإدارة.',
      };
    }

    // 4. Action evaluations
    switch (action) {
      case 'create_project': {
        const limit = userProfile?.customLimits?.maxProjects ?? currentPlan.limits.maxProjects;
        const current = userUsage?.projectsCount ?? 0;
        if (limit !== -1 && current >= limit) {
          return {
            allowed: false,
            current,
            limit,
            planName: currentPlan.name,
            action,
            reason: `وصلت للحد المتاح في خطتك (${currentPlan.name}) لعدد المشاريع (${limit} مشاريع). يمكنك ترقية خطتك لإنشاء مشاريع إضافية.`,
          };
        }
        return { allowed: true, current, limit, planName: currentPlan.name, action };
      }

      case 'ai_generate': {
        if (!currentPlan.features.canUseAI) {
          return {
            allowed: false,
            current: userUsage?.monthlyAiGenerationsCount ?? 0,
            limit: 0,
            planName: currentPlan.name,
            action,
            reason: `ميزة توليد المواقع بالذكاء الاصطناعي غير متاحة في خطتك الحالية (${currentPlan.name}).`,
          };
        }
        const limit =
          userProfile?.customLimits?.maxMonthlyAiGenerations ??
          currentPlan.limits.maxMonthlyAiGenerations;
        const current = userUsage?.monthlyAiGenerationsCount ?? 0;
        if (limit !== -1 && current >= limit) {
          return {
            allowed: false,
            current,
            limit,
            planName: currentPlan.name,
            action,
            reason: `وصلت للحد الشهري المتاح في خطتك (${currentPlan.name}) لتوليد المواقع بالذكاء الاصطناعي (${limit} عملية شهرياً).`,
          };
        }
        return { allowed: true, current, limit, planName: currentPlan.name, action };
      }

      case 'ai_edit': {
        if (!currentPlan.features.canUseAIEdit) {
          return {
            allowed: false,
            current: userUsage?.monthlyAiEditsCount ?? 0,
            limit: 0,
            planName: currentPlan.name,
            action,
            reason: `ميزة التعديل الذكي بالمحادثة غير متاحة في خطتك الحالية (${currentPlan.name}).`,
          };
        }
        const limit =
          userProfile?.customLimits?.maxMonthlyAiEdits ??
          currentPlan.limits.maxMonthlyAiEdits;
        const current = userUsage?.monthlyAiEditsCount ?? 0;
        if (limit !== -1 && current >= limit) {
          return {
            allowed: false,
            current,
            limit,
            planName: currentPlan.name,
            action,
            reason: `وصلت للحد المتاح في خطتك (${currentPlan.name}) لعمليات التعديل بالذكاء الاصطناعي (${limit} تعديل شهرياً).`,
          };
        }
        return { allowed: true, current, limit, planName: currentPlan.name, action };
      }

      case 'ai_repair': {
        if (!currentPlan.features.canUseAIRepair) {
          return {
            allowed: false,
            current: userUsage?.monthlyAiRepairsCount ?? 0,
            limit: 0,
            planName: currentPlan.name,
            action,
            reason: `ميزة الإصلاح الذكي للكود غير متاحة في خطتك الحالية (${currentPlan.name}).`,
          };
        }
        const limit =
          userProfile?.customLimits?.maxMonthlyAiRepairs ??
          currentPlan.limits.maxMonthlyAiRepairs;
        const current = userUsage?.monthlyAiRepairsCount ?? 0;
        if (limit !== -1 && current >= limit) {
          return {
            allowed: false,
            current,
            limit,
            planName: currentPlan.name,
            action,
            reason: `وصلت للحد المتاح في خطتك لإصلاح الكود بالذكاء الاصطناعي (${limit} عملية).`,
          };
        }
        return { allowed: true, current, limit, planName: currentPlan.name, action };
      }

      case 'publish_site': {
        if (!currentPlan.features.canPublish) {
          return {
            allowed: false,
            current: userUsage?.publishedSitesCount ?? 0,
            limit: 0,
            planName: currentPlan.name,
            action,
            reason: `ميزة نشر المواقع الحية غير متاحة في خطتك الحالية (${currentPlan.name}).`,
          };
        }
        const limit =
          userProfile?.customLimits?.maxPublishedSites ??
          currentPlan.limits.maxPublishedSites;
        const current = userUsage?.publishedSitesCount ?? 0;
        if (limit !== -1 && current >= limit) {
          return {
            allowed: false,
            current,
            limit,
            planName: currentPlan.name,
            action,
            reason: `وصلت للحد الأقصى لعدد المواقع المنشورة حية في نفس الوقت (${limit} موقع). يرجى إلغاء نشر أحد المواقع أو ترقية خطتك.`,
          };
        }
        return { allowed: true, current, limit, planName: currentPlan.name, action };
      }

      case 'github_export': {
        if (!currentPlan.features.canExportGitHub) {
          return {
            allowed: false,
            current: userUsage?.githubExportsCount ?? 0,
            limit: 0,
            planName: currentPlan.name,
            action,
            reason: `ميزة تصدير الكود إلى مستودعات GitHub متاحة لمشتركي خطة Pro وما فوق. ارتقِ بخطتك للاستفادة منها فوراً.`,
          };
        }
        const limit =
          userProfile?.customLimits?.maxMonthlyGithubExports ??
          currentPlan.limits.maxMonthlyGithubExports;
        const current = userUsage?.githubExportsCount ?? 0;
        if (limit !== -1 && current >= limit) {
          return {
            allowed: false,
            current,
            limit,
            planName: currentPlan.name,
            action,
            reason: `وصلت للحد الشهري المتاح في خطتك لتصدير الكود إلى GitHub (${limit} تصدير شهرياً).`,
          };
        }
        return { allowed: true, current, limit, planName: currentPlan.name, action };
      }

      case 'download_zip': {
        if (!currentPlan.features.canDownloadZip) {
          return {
            allowed: false,
            current: 0,
            limit: 0,
            planName: currentPlan.name,
            action,
            reason: `تنزيل حزمة المشروع (ZIP) كملفات برمجية كاملة متاح لمشتركي خطة Pro وما فوق.`,
          };
        }
        return { allowed: true, current: 0, limit: -1, planName: currentPlan.name, action };
      }

      default:
        return { allowed: true, current: 0, limit: -1, planName: currentPlan.name, action };
    }
  };

  const showPlanLimitNotice = (target: LimitAction | string | LimitCheckResult) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (typeof target === 'string') {
      const check = checkActionLimit(target);
      setLimitNoticeData(check);
      setLimitModalOpen(true);
      return;
    }
    setLimitNoticeData(target);
    setLimitModalOpen(true);
  };

  const checkLimit = async (action: LimitAction | string): Promise<LimitCheckResult> => {
    const result = checkActionLimit(action);
    if (!result.allowed) {
      showPlanLimitNotice(result);
    }
    return result;
  };

  const recordActionUsageHandler = async (
    rawAction: LimitAction | string,
    delta: number = 1
  ): Promise<void> => {
    if (!user?.uid) return;
    const action = normalizeLimitAction(rawAction);

    // Optimistically update local usage state
    setUserUsage((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (action === 'create_project') updated.projectsCount = (updated.projectsCount || 0) + delta;
      if (action === 'ai_generate') updated.monthlyAiGenerationsCount = (updated.monthlyAiGenerationsCount || 0) + delta;
      if (action === 'ai_edit') updated.monthlyAiEditsCount = (updated.monthlyAiEditsCount || 0) + delta;
      if (action === 'ai_repair') updated.monthlyAiRepairsCount = (updated.monthlyAiRepairsCount || 0) + delta;
      if (action === 'publish_site') updated.publishedSitesCount = (updated.publishedSitesCount || 0) + delta;
      if (action === 'github_export') updated.githubExportsCount = (updated.githubExportsCount || 0) + delta;
      return updated;
    });

    try {
      await recordActionUsage(user.uid, action, delta);
    } catch (err) {
      console.warn('recordActionUsage warning:', err);
    }
  };

  const updatePlatformSettings = async (newSettings: Partial<PlatformSettings>) => {
    if (!user) throw new Error('يجب تسجيل الدخول كمالك لتحديث إعدادات المنصة.');
    await savePlatformSettings(newSettings, user.uid);
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      await apiLoginWithGoogle();
      setAuthModalOpen(false);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setAuthError(msg);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await apiLoginWithEmail(email, pass);
      setAuthModalOpen(false);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setAuthError(msg);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    setAuthError(null);
    try {
      await apiRegisterWithEmail(email, pass, name);
      setAuthModalOpen(false);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setAuthError(msg);
      throw error;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await apiLogoutUser();
      setUser(null);
      setUserProfile(null);
      setUserUsage(null);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setAuthError(msg);
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      user,
      userProfile,
      isOwner,
      loading,
      authReady,
      authError,
      clearAuthError,
      firestoreStatus,
      firestoreDetails,
      projectId: FIREBASE_CONFIG.projectId,
      authDomain: FIREBASE_CONFIG.authDomain,
      platformSettings,
      updatePlatformSettings,
      authModalOpen,
      authModalInitialMode,
      openAuthModal,
      closeAuthModal,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
      checkConnection,
      allPlans,
      currentPlan,
      userUsage,
      refreshUsage,
      checkActionLimit,
      checkLimit,
      recordActionUsage: recordActionUsageHandler,
      recordUsage: recordActionUsageHandler,
      limitModalOpen,
      limitNoticeData,
      showPlanLimitNotice,
      showLimitNotice,
      closeLimitNotice,
      upgradeModalOpen,
      targetUpgradePlan,
      openUpgradeModal,
      closeUpgradeModal,
    }),
    [
      user,
      userProfile,
      isOwner,
      loading,
      authReady,
      authError,
      firestoreStatus,
      firestoreDetails,
      platformSettings,
      authModalOpen,
      authModalInitialMode,
      allPlans,
      currentPlan,
      userUsage,
      limitModalOpen,
      limitNoticeData,
      upgradeModalOpen,
      targetUpgradePlan,
      checkActionLimit,
      showPlanLimitNotice,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

