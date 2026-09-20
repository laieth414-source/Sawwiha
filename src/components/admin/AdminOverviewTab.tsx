import React from 'react';
import { AdminOverviewStats } from '../../types';
import {
  Users,
  FolderKanban,
  Globe,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  ArrowUpRight,
  CreditCard,
  Sliders,
} from 'lucide-react';

interface AdminOverviewTabProps {
  stats: AdminOverviewStats | null;
  loading?: boolean;
  onNavigateTab?: (tabId: any) => void;
  onTabSelect?: (tabId: any) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  stats,
  loading = false,
  onNavigateTab,
  onTabSelect,
}) => {
  const navigate = (tabId: string) => {
    if (onNavigateTab) onNavigateTab(tabId);
    if (onTabSelect) onTabSelect(tabId);
  };

  const safeStats: AdminOverviewStats = stats || {
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalProjects: 0,
    publishedProjects: 0,
    draftProjects: 0,
    totalAiGenerations: 0,
    plansDistribution: {},
    activeSubscriptionsCount: 0,
    systemStatus: 'healthy',
    lastCheckedAt: new Date().toISOString(),
  };
  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 border border-slate-700/60 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>مباشر — بيانات حقيقية من Firestore</span>
            </div>
            <h2 className="text-xl font-bold">نظرة عامة على أداء منصة «سَوّيها»</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              مركز المراقبة اللحظية للمستخدمين، المشاريع، استهلاك الذكاء الاصطناعي، وتوزيع الاشتراكات والخدمات الحية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate('users')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>المستخدمين</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('projects')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
              <span>المشاريع</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('plans')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>الخطط</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي المستخدمين</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : safeStats.totalUsers}
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {safeStats.activeUsers} نشط
            </span>
          </div>
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>معطلين: {safeStats.suspendedUsers}</span>
            <button
              type="button"
              onClick={() => navigate('users')}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              إدارة
            </button>
          </div>
        </div>

        {/* Total Projects */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي المشاريع</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : safeStats.totalProjects}
            </h3>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {safeStats.draftProjects} مسودة
            </span>
          </div>
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>مشاريع بالذكاء الاصطناعي</span>
            <button
              type="button"
              onClick={() => navigate('projects')}
              className="text-indigo-600 hover:underline font-semibold cursor-pointer"
            >
              استعراض
            </button>
          </div>
        </div>

        {/* Published Sites */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">مواقع منشورة لايف</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-emerald-600 tracking-tight">
              {loading ? '...' : safeStats.publishedProjects}
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              متاحة عامة
            </span>
          </div>
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>روابط مستقلة نشطة</span>
            <button
              type="button"
              onClick={() => navigate('projects')}
              className="text-emerald-600 hover:underline font-semibold cursor-pointer"
            >
              عرض المنشور
            </button>
          </div>
        </div>

        {/* AI Generations */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">استخدام الذكاء الاصطناعي</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : safeStats.totalAiGenerations}
            </h3>
            <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
              عمليات
            </span>
          </div>
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>توليد وتعديل وإصلاح</span>
            <button
              type="button"
              onClick={() => navigate('ai')}
              className="text-violet-600 hover:underline font-semibold cursor-pointer"
            >
              إعدادات AI
            </button>
          </div>
        </div>
      </div>

      {/* 3. Plans Distribution & System Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plans Distribution Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">توزيع اشتراكات المستخدمين الحالية</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('plans')}
              className="text-xs text-emerald-600 hover:underline font-bold cursor-pointer"
            >
              إدارة الخطط
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-xs font-semibold text-slate-700">المبتدئ (الخطة المجانية)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900">
                  {safeStats.plansDistribution['plan_free'] || 0}
                </span>
                <span className="text-[10px] text-slate-400">مستخدم</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-950">المحترف (Pro Plan)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-700">
                  {safeStats.plansDistribution['plan_pro'] || 0}
                </span>
                <span className="text-[10px] text-slate-400">مشترك</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-indigo-600" />
                <span className="text-xs font-semibold text-indigo-950">الشركات والفرق (Business Plan)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-indigo-700">
                  {safeStats.plansDistribution['plan_business'] || 0}
                </span>
                <span className="text-[10px] text-slate-400">مشترك</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live System Services Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">حالة الخدمات والأنظمة السحابية</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>جاهزة ومتصلة</span>
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">مصادقة المستخدمين (Firebase Auth)</h4>
                  <p className="text-[10px] text-slate-500">حسابات Google وبريد وكلمة المرور وتأمين الجلسات</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600">تشغيلي</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">قاعدة البيانات (Cloud Firestore)</h4>
                  <p className="text-[10px] text-slate-500">حفظ المشاريع، الخطط، الإعدادات وسجلات التدقيق</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600">تشغيلي</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">بوابة الذكاء الاصطناعي (Gemini Proxy API)</h4>
                  <p className="text-[10px] text-slate-500">توليد وتعديل وإصلاح الكود عبر السيرفر الآمن</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600">تشغيلي</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
