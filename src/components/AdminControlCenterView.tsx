import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  PlatformSettings,
  UserProfile,
  ProjectItem,
  PlatformPlan,
  AdminOverviewStats,
  PlatformAiEngine,
  FeatureFlags,
  PlatformAnnouncement,
  PlatformAlert,
  PlatformFeatures,
  PlatformLimits,
} from '../types';
import {
  fetchLiveAdminOverviewStats,
  adminFetchAllUsers,
  adminFetchAllProjects,
} from '../firebase/adminService';
import { getAllPlans } from '../firebase/plansService';

// Tabs
import { AdminOverviewTab } from './admin/AdminOverviewTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminProjectsTab } from './admin/AdminProjectsTab';
import { AdminShowcaseTab } from './admin/AdminShowcaseTab';
import { AdminPlansManager } from './AdminPlansManager';
import { AdminUserSubscriptions } from './AdminUserSubscriptions';
import { AdminVoucherCodesTab } from './admin/AdminVoucherCodesTab';
import { AdminAiSettingsTab } from './admin/AdminAiSettingsTab';
import { AdminFeatureFlagsTab } from './admin/AdminFeatureFlagsTab';
import { AdminIdentityTab } from './admin/AdminIdentityTab';
import { AdminAnnouncementsTab } from './admin/AdminAnnouncementsTab';
import { AdminSystemSettingsTab } from './admin/AdminSystemSettingsTab';
import { AdminAuditLogsTab } from './admin/AdminAuditLogsTab';

import {
  ShieldCheck,
  BarChart3,
  Users,
  FolderKanban,
  CreditCard,
  UserCheck,
  Cpu,
  Sliders,
  Palette,
  Megaphone,
  Settings,
  FileText,
  Lock,
  Loader2,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Ticket,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'users'
  | 'projects'
  | 'showcase'
  | 'plans'
  | 'subscriptions'
  | 'vouchers'
  | 'ai'
  | 'features'
  | 'identity'
  | 'announcements'
  | 'system'
  | 'audit_logs';

export const AdminControlCenterView: React.FC = () => {
  const { user, isOwner, platformSettings, updatePlatformSettings } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Aggregated live state
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectItem[]>([]);
  const [allPlans, setAllPlans] = useState<PlatformPlan[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadAdminData = async () => {
    if (!isOwner) return;
    setLoadingData(true);
    try {
      const [statsRes, usersRes, projectsRes, plansRes] = await Promise.all([
        fetchLiveAdminOverviewStats(),
        adminFetchAllUsers(),
        adminFetchAllProjects(),
        getAllPlans(true),
      ]);

      setStats(statsRes);
      setAllUsers(usersRes);
      setAllProjects(projectsRes);
      setAllPlans(plansRes);
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      loadAdminData();
    }
  }, [isOwner]);

  if (!user || !isOwner) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center" dir="rtl">
        <div className="p-8 bg-white border border-rose-200 rounded-2xl shadow-xs space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">منطقة إدارية مخصصة لمالك المنصة فقط</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            تم تقييد هذا القسم لمالك المنصة (<span className="font-mono text-slate-900 font-bold">laieth772@gmail.com</span>) لحماية الأمان وصلاحيات النظام.
          </p>
          <div className="pt-2 text-xs text-slate-400">
            حسابك الحالي: <span className="font-semibold text-slate-700">{user?.email || 'زائر غير مسجل'}</span>
          </div>
        </div>
      </div>
    );
  }

  // Generic Save Helpers for modular tabs
  const handleSaveAiEngine = async (aiEngine: PlatformAiEngine) => {
    setIsSaving(true);
    try {
      await updatePlatformSettings({ ...platformSettings, aiEngine });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFeatureFlags = async (featureFlags: FeatureFlags) => {
    setIsSaving(true);
    try {
      await updatePlatformSettings({ ...platformSettings, featureFlags });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveIdentity = async (identityUpdates: Partial<PlatformSettings>) => {
    setIsSaving(true);
    try {
      await updatePlatformSettings({ ...platformSettings, ...identityUpdates });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAnnouncements = async (data: {
    announcement: PlatformAnnouncement;
    alert: PlatformAlert;
  }) => {
    setIsSaving(true);
    try {
      await updatePlatformSettings({
        ...platformSettings,
        announcement: data.announcement,
        alert: data.alert,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSystemSettings = async (data: {
    features: PlatformFeatures;
    limits?: PlatformLimits;
  }) => {
    setIsSaving(true);
    try {
      await updatePlatformSettings({
        ...platformSettings,
        features: data.features,
        limits: data.limits,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const pendingShowcaseCount = allProjects.filter(
    (p) => p.showcaseStatus === 'pending' || (p.showcaseOptIn && !p.showcaseStatus)
  ).length;

  const menuItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'overview', label: 'المؤشرات الحية (Overview)', icon: BarChart3 },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, badge: allUsers.length > 0 ? String(allUsers.length) : undefined },
    { id: 'projects', label: 'إدارة المشاريع والنشر', icon: FolderKanban, badge: allProjects.length > 0 ? String(allProjects.length) : undefined },
    { id: 'showcase', label: 'معرض ومجتمع المواقع', icon: Sparkles, badge: pendingShowcaseCount > 0 ? String(pendingShowcaseCount) : undefined },
    { id: 'plans', label: 'الخطط والأسعار', icon: CreditCard },
    { id: 'subscriptions', label: 'تخصيص الاشتراكات', icon: UserCheck },
    { id: 'vouchers', label: 'أكواد الاشتراك', icon: Ticket },
    { id: 'ai', label: 'محرك الذكاء الاصطناعي', icon: Cpu },
    { id: 'features', label: 'قواطع الميزات (Flags)', icon: Sliders },
    { id: 'identity', label: 'الهوية والبصرية', icon: Palette },
    { id: 'announcements', label: 'الإعلانات والتنبيهات', icon: Megaphone },
    { id: 'system', label: 'إعدادات النظام وفحص DB', icon: Settings },
    { id: 'audit_logs', label: 'سجل التدقيق (Audit Logs)', icon: FileText },
  ];

  const currentItem = menuItems.find((i) => i.id === activeTab) || menuItems[0];
  const CurrentIcon = currentItem.icon;

  const handleSelectTab = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 text-right overflow-x-hidden" dir="rtl">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 w-full md:w-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">لوحة الإدارة المتقدمة (Admin Control Center — Phase 6)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            إدارة منصة «{platformSettings.platformName || 'سَوّيها'}»
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            تحكم شامل وفوري في جميع مستخدمي ومشاريع وخطط وإعدادات المنصة دون الحاجة لكتابة كود.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t border-slate-800/80 pt-3 md:pt-0 md:border-none">
          <button
            type="button"
            onClick={loadAdminData}
            disabled={loadingData}
            className="h-9 px-3.5 sm:px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${loadingData ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span>تحديث البيانات الحية</span>
          </button>

          {/* Mobile Menu Trigger Button inside banner on small screens */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden h-9 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            aria-label="فتح قائمة الأقسام"
          >
            <Menu className="w-4 h-4 shrink-0" />
            <span>الأقسام</span>
          </button>
        </div>
      </div>

      {/* Mobile Sticky Section Bar (Visible only on < lg) */}
      <div className="lg:hidden bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs flex items-center justify-between gap-2 sticky top-2 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0">
            <CurrentIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">القسم الحالي</span>
            <span className="text-xs font-bold text-slate-900 truncate block">{currentItem.label}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>تغيير القسم</span>
        </button>
      </div>

      {/* Mobile Drawer Backdrop & Modal (Only on Mobile/Tablet < lg) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" dir="rtl">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-sm">أقسام لوحة الإدارة</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="إغلاق القائمة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Navigation Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronLeft className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-300'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
              <span className="text-[11px] text-slate-400 block font-mono">
                {user?.email || 'laieth772@gmail.com'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Desktop Sticky Sidebar + Active Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Navigation Sidebar (Hidden on mobile < lg, visible & sticky on lg+) */}
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-2xs space-y-1 sticky top-6">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              أقسام الإدارة
            </span>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                      isActive ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Pane - Full width on mobile, 9 cols on lg */}
        <div className="lg:col-span-9 space-y-6 w-full min-w-0 overflow-hidden">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              stats={stats}
              loading={loadingData}
              onNavigateTab={setActiveTab}
              onTabSelect={setActiveTab}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              users={allUsers}
              projects={allProjects}
              plans={allPlans}
              loading={loadingData}
              onRefresh={loadAdminData}
            />
          )}

          {activeTab === 'projects' && (
            <AdminProjectsTab
              projects={allProjects}
              loading={loadingData}
              onRefresh={loadAdminData}
            />
          )}

          {activeTab === 'showcase' && (
            <AdminShowcaseTab
              projects={allProjects}
              onRefresh={loadAdminData}
            />
          )}

          {activeTab === 'plans' && <AdminPlansManager />}

          {activeTab === 'subscriptions' && <AdminUserSubscriptions />}

          {activeTab === 'vouchers' && <AdminVoucherCodesTab plans={allPlans} />}

          {activeTab === 'ai' && (
            <AdminAiSettingsTab
              aiEngine={platformSettings.aiEngine}
              onSave={handleSaveAiEngine}
              saving={isSaving}
            />
          )}

          {activeTab === 'features' && (
            <AdminFeatureFlagsTab
              featureFlags={platformSettings.featureFlags}
              onSave={handleSaveFeatureFlags}
              saving={isSaving}
            />
          )}

          {activeTab === 'identity' && (
            <AdminIdentityTab
              settings={platformSettings}
              onSave={handleSaveIdentity}
              saving={isSaving}
            />
          )}

          {activeTab === 'announcements' && (
            <AdminAnnouncementsTab
              announcement={platformSettings.announcement}
              alert={platformSettings.alert}
              onSave={handleSaveAnnouncements}
              saving={isSaving}
            />
          )}

          {activeTab === 'system' && (
            <AdminSystemSettingsTab
              features={platformSettings.features}
              limits={platformSettings.limits}
              onSave={handleSaveSystemSettings}
              saving={isSaving}
            />
          )}

          {activeTab === 'audit_logs' && <AdminAuditLogsTab />}
        </div>
      </div>
    </div>
  );
};
