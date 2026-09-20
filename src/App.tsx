import React, { useState, useEffect } from 'react';
import { TabType, ProjectItem } from './types';
import { Header } from './components/Header';
import { LandingHeroView } from './components/LandingHeroView';
import { UserDashboardView } from './components/UserDashboardView';
import { AIWebsiteBuilderView } from './components/AIWebsiteBuilderView';
import { ProjectStudioView } from './components/ProjectStudioView';
import { AdminControlCenterView } from './components/AdminControlCenterView';
import { PricingView } from './components/PricingView';
import { ShowcaseGalleryView } from './components/ShowcaseGalleryView';
import { PlanLimitNoticeModal } from './components/PlanLimitNoticeModal';
import { UpgradeRequestModal } from './components/UpgradeRequestModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { AuthModal } from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShieldCheck, X } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('landing');
  const [builderPrompt, setBuilderPrompt] = useState<string>('');
  const [builderProject, setBuilderProject] = useState<ProjectItem | null>(null);
  const [studioProject, setStudioProject] = useState<ProjectItem | null>(null);
  const [accountModalOpen, setAccountModalOpen] = useState<boolean>(false);
  const [pendingAdminRedirect, setPendingAdminRedirect] = useState<boolean>(false);
  const [adminAuthNotice, setAdminAuthNotice] = useState<string | null>(null);

  const {
    user,
    userProfile,
    platformSettings,
    isOwner,
    openAuthModal,
    logout,
    limitModalOpen,
    closeLimitNotice,
    upgradeModalOpen,
    closeUpgradeModal,
    targetUpgradePlan,
  } = useAuth();

  const handleAdminLoginClick = () => {
    setAdminAuthNotice(null);
    if (user) {
      if (isOwner) {
        setActiveTab('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setAdminAuthNotice(
          `حسابك الحالي (${user.email || 'المسجل'}) مسجل كمستخدم عادي وليس مالك المنصة (OWNER). لا يمكنك دخول لوحة الإدارة بهذا الحساب.`
        );
      }
    } else {
      setPendingAdminRedirect(true);
      openAuthModal('login');
    }
  };

  useEffect(() => {
    if (pendingAdminRedirect && user) {
      if (isOwner) {
        setActiveTab('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setPendingAdminRedirect(false);
        setAdminAuthNotice(null);
      } else if (userProfile) {
        setAdminAuthNotice(
          `تم تسجيل الدخول بنجاح بحساب (${user.email || ''})، لكن هذا الحساب ليس لديه صلاحية المالك (OWNER). تم توجيهك إلى لوحة التحكم الشخصية.`
        );
        setActiveTab('dashboard');
        setPendingAdminRedirect(false);
      }
    }
  }, [user, isOwner, userProfile, pendingAdminRedirect]);

  const handleOpenBuilderWithPrompt = (prompt?: string) => {
    setBuilderPrompt(prompt || '');
    setBuilderProject(null);
    setActiveTab('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBuilderWithProject = (project?: ProjectItem, prompt?: string) => {
    setBuilderProject(project || null);
    setBuilderPrompt(prompt || project?.originalPrompt || '');
    setActiveTab('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStudioWithProject = (project: ProjectItem) => {
    setStudioProject(project);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white" dir="rtl">
      {/* SaaS Header Navigation (Hidden in Studio full-screen mode) */}
      {activeTab !== 'studio' && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettings={() => setAccountModalOpen(true)}
          onAdminLoginClick={handleAdminLoginClick}
        />
      )}

      {/* Admin Notice Banner for non-owners */}
      {adminAuthNotice && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{adminAuthNotice}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {user && !isOwner && (
              <button
                type="button"
                onClick={async () => {
                  setAdminAuthNotice(null);
                  await logout();
                  setPendingAdminRedirect(true);
                  openAuthModal('login');
                }}
                className="text-xs font-bold text-amber-900 hover:underline px-2 py-1 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
              >
                تسجيل الخروج والدخول كمدير
              </button>
            )}
            <button
              type="button"
              onClick={() => setAdminAuthNotice(null)}
              className="p-1 rounded-md text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1 w-full">
        {activeTab === 'landing' && (
          <LandingHeroView
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onNavigateToBuilder={handleOpenBuilderWithPrompt}
            onNavigateToShowcase={() => {
              setActiveTab('showcase');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToPricing={() => {
              setActiveTab('pricing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAdminLoginClick={handleAdminLoginClick}
          />
        )}
        {activeTab === 'builder' && (
          <AIWebsiteBuilderView
            initialPrompt={builderPrompt}
            initialProject={builderProject}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onOpenStudio={handleOpenStudioWithProject}
          />
        )}
        {activeTab === 'studio' && (
          studioProject ? (
            <ProjectStudioView
              project={studioProject}
              aiConfig={platformSettings.aiEngine}
              onBackToDashboard={() => {
                setActiveTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onProjectUpdated={(updated) => {
                setStudioProject(updated);
              }}
            />
          ) : (
            <div className="py-24 text-center space-y-4">
              <p className="text-slate-500 text-sm">لم يتم تحديد مشروع للاستوديو.</p>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                العودة إلى لوحة التحكم
              </button>
            </div>
          )
        )}
        {activeTab === 'dashboard' && (
          <UserDashboardView
            onOpenBuilderWithProject={handleOpenBuilderWithProject}
            onOpenStudioWithProject={handleOpenStudioWithProject}
          />
        )}
        {activeTab === 'pricing' && (
          <PricingView
            onNavigateToBuilder={() => handleOpenBuilderWithPrompt('')}
            onNavigateToAdmin={() => {
              setActiveTab('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        {activeTab === 'showcase' && (
          <ShowcaseGalleryView
            onNavigateToBuilder={handleOpenBuilderWithPrompt}
          />
        )}
        {activeTab === 'admin' && <AdminControlCenterView />}
      </main>

      {/* Plan Limit Notice Modal (Phase 5) */}
      <PlanLimitNoticeModal
        isOpen={limitModalOpen}
        onClose={closeLimitNotice}
        onNavigateToPricing={() => {
          closeLimitNotice();
          setActiveTab('pricing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Upgrade Request / Contact Modal (Phase 5) */}
      <UpgradeRequestModal
        isOpen={upgradeModalOpen}
        onClose={closeUpgradeModal}
        targetPlan={targetUpgradePlan}
      />

      {/* User Account Settings Modal */}
      <AccountSettingsModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onOpenAdmin={() => {
          if (isOwner) {
            setActiveTab('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      {/* Global SaaS Auth Modal */}
      <AuthModal />

      {/* Secondary Clean Footer for non-landing, non-studio views */}
      {activeTab !== 'landing' && activeTab !== 'studio' && (
        <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-[10px]">
                {platformSettings.logoText || 'سـ'}
              </div>
              <span className="font-bold text-slate-800">{platformSettings.platformName || 'سَوّيها'}</span>
              <span>— منصة إنشاء المواقع بالذكاء الاصطناعي</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <button
                onClick={() => {
                  setActiveTab('landing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-slate-800 transition-colors cursor-pointer"
              >
                الرئيسية
              </button>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-slate-800 transition-colors cursor-pointer"
              >
                مشاريعي
              </button>
              <button
                onClick={() => {
                  setActiveTab('pricing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-slate-800 transition-colors cursor-pointer"
              >
                الأسعار
              </button>
              <button
                onClick={() => {
                  setActiveTab('builder');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-slate-800 transition-colors cursor-pointer"
              >
                إنشاء موقع
              </button>
              <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
