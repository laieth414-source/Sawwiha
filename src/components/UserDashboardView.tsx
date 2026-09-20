import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProjectItem } from '../types';
import { subscribeUserProjects, deleteProject } from '../firebase/projectService';
import { ProjectModal } from './ProjectModal';
import { SitePreviewModal } from './SitePreviewModal';
import {
  Search,
  Sparkles,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  MoreVertical,
  Calendar,
  AlertCircle,
  FolderKanban,
  FileCode,
  Globe,
  Github,
  Download,
  ExternalLink,
  CreditCard,
  Zap,
} from 'lucide-react';
import { downloadProjectZip } from '../services/exportService';

interface UserDashboardViewProps {
  onOpenBuilderWithProject?: (project?: ProjectItem, prompt?: string) => void;
  onOpenStudioWithProject?: (project: ProjectItem) => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  onOpenBuilderWithProject,
  onOpenStudioWithProject,
}) => {
  const {
    user,
    userProfile,
    openAuthModal,
    currentPlan,
    userUsage,
    checkActionLimit,
    showPlanLimitNotice,
    openUpgradeModal,
  } = useAuth();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'published' | 'ready' | 'draft'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [previewProject, setPreviewProject] = useState<ProjectItem | null>(null);

  // Dropdown menu for project options
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeUserProjects(
      user.uid,
      (userProjects) => {
        setProjects(userProjects);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Dashboard projects listener:', err);
        setError('تعذر تحميل المشاريع مؤقتاً.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, retryTrigger]);

  // Filter projects by search query & filter tab
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'published') {
      return Boolean(p.isPublished);
    }
    if (filterTab === 'ready') {
      return Boolean(p.currentCode?.html || p.generationStatus === 'completed');
    }
    if (filterTab === 'draft') {
      return !p.currentCode?.html && p.generationStatus !== 'completed';
    }
    return true;
  });

  const readyCount = projects.filter((p) => p.currentCode?.html || p.generationStatus === 'completed').length;
  const publishedCount = projects.filter((p) => p.isPublished).length;
  const draftCount = projects.length - readyCount;

  const handleOpenCreate = () => {
    // Phase 5: Check projects limit
    const pCheck = checkActionLimit('projects');
    if (!pCheck.allowed) {
      showPlanLimitNotice('projects');
      return;
    }

    if (onOpenBuilderWithProject) {
      onOpenBuilderWithProject();
    } else {
      setSelectedProject(null);
      setModalMode('create');
      setModalOpen(true);
    }
  };

  const handleOpenRename = (p: ProjectItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setSelectedProject(p);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleQuickDelete = async (p: ProjectItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(null);
    if (!user) return;
    if (window.confirm(`هل أنت متأكد من حذف مشروع "${p.title}" نهائياً؟`)) {
      try {
        await deleteProject(p.id, user.uid);
        setProjects((prev) => prev.filter((item) => item.id !== p.id));
      } catch {
        alert('تعذر حذف المشروع، يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'مؤخراً';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'مؤخراً';
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center" dir="rtl">
        <div className="p-8 sm:p-10 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900">سجل دخولك للوصول إلى مشاريعك</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              احتفظ بجميع مواقعك وأفكارك المنشأة في مكان واحد آمن ومتاح لك في أي وقت ومن أي جهاز.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => openAuthModal('login')}
              className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="h-10 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
            >
              إنشاء حساب جديد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 text-right" dir="rtl">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            أهلاً، {userProfile?.displayName || user.displayName || user.email?.split('@')[0]}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة وتطوير مواقعك الإلكترونية المنشأة عبر الذكاء الاصطناعي
          </p>
        </div>

        {/* Primary CTA Button */}
        <button
          id="dashboard-create-website-btn"
          onClick={handleOpenCreate}
          className="h-11 px-5 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-2xs transition-all text-xs sm:text-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>سَوّي موقع جديد</span>
        </button>
      </div>

      {/* Phase 5: Subscription Plan & Usage Status Bar */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-700/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">خطتك الحالية:</span>
              <span className="text-sm font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {currentPlan.name}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {currentPlan.price === 0
                ? 'استمتع بكافة أدوات الإنشاء المجانية مع إمكانية الترقية لفتح المزايا المتقدمة'
                : `مشترك بنجاح في ${currentPlan.name} مع صلاحيات موسّعة للمشاريع والنشر`}
            </p>
          </div>
        </div>

        {/* Usage Counters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-xl">
            <span className="text-slate-400 block text-[10px]">المشاريع:</span>
            <span className="font-bold text-white">
              {projects.length} / {currentPlan.limits.maxProjects === -1 ? '∞' : currentPlan.limits.maxProjects}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-xl">
            <span className="text-slate-400 block text-[10px]">توليد الذكاء الاصطناعي:</span>
            <span className="font-bold text-white">
              {userUsage?.aiGenerationsCount || 0} / {currentPlan.limits.maxAiGenerationsPerMonth === -1 ? '∞' : currentPlan.limits.maxAiGenerationsPerMonth}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-xl">
            <span className="text-slate-400 block text-[10px]">المواقع المنشورة:</span>
            <span className="font-bold text-white">
              {publishedCount} / {currentPlan.limits.maxPublishedSites === -1 ? '∞' : currentPlan.limits.maxPublishedSites}
            </span>
          </div>

          <button
            type="button"
            onClick={openUpgradeModal}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ترقية الخطة</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">إجمالي المشاريع</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{projects.length}</h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <FolderKanban className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">منشورة على الإنترنت</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5">{publishedCount}</h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">مواقع جاهزة للمعاينة</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{readyCount}</h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">مسودات قيد العمل</p>
            <h3 className="text-xl font-bold text-slate-700 mt-0.5">{draftCount}</h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({projects.length})
          </button>
          <button
            onClick={() => setFilterTab('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === 'published' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            منشورة Live ({publishedCount})
          </button>
          <button
            onClick={() => setFilterTab('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === 'ready' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جاهز للمعاينة ({readyCount})
          </button>
          <button
            onClick={() => setFilterTab('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === 'draft' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            مسودات ({draftCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مشروع أو تصنيف..."
            className="w-full h-10 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setRetryTrigger((prev) => prev + 1)}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer shrink-0"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* 4. Projects Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">جاري تحميل مشاريعك...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        // Empty State
        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 sm:p-14 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-emerald-500" />
          </div>

          <div className="space-y-1.5 max-w-xs mx-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {projects.length === 0 ? 'ما عندك مشاريع بعد' : 'لا توجد نتائج مطابقة لبحثك'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {projects.length === 0 ? 'عندك فكرة؟ سَوّيها الآن بالذكاء الاصطناعي في ثوانٍ معدودة.' : 'جرّب تعديل كلمات البحث أو تصفية نوع المشاريع.'}
            </p>
          </div>

          {projects.length === 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenCreate}
                className="h-10 px-5 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>سَوّي أول موقع لك</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => {
            const hasCode = Boolean(p.currentCode?.html || p.generationStatus === 'completed');
            const isMenuOpen = menuOpenId === p.id;

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl overflow-hidden transition-all flex flex-col justify-between group"
              >
                {/* Visual Top Preview Thumbnail */}
                <div className="h-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-3.5 relative flex flex-col justify-between text-white overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[11px] font-medium text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      {p.category || 'موقع إلكتروني'}
                    </span>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      {p.isPublished && (
                        <a
                          href={p.publishedUrl || `/s/${p.slug || p.id}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-700/60 hover:bg-emerald-900 transition-colors shadow-2xs"
                          title="فتح الموقع المنشور مباشرة"
                        >
                          <Globe className="w-3 h-3 text-emerald-400" />
                          <span>LIVE</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}

                      {hasCode ? (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-800/50">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>جاهز</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full">
                          مسودة
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Browser Mock Pill Inside Banner */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center gap-2 relative z-10">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 truncate">
                      {p.slug || 'sawwiha.app/site'}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 space-y-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {p.title}
                    </h3>

                    {/* Options Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(isMenuOpen ? null : p.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="خيارات"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(null);
                            }}
                          />
                          <div className="absolute left-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-right text-xs">
                            {hasCode && onOpenStudioWithProject && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                  onOpenStudioWithProject(p);
                                }}
                                className="w-full px-3 py-2 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-bold"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>استوديو التحرير</span>
                              </button>
                            )}
                            {p.isPublished && (
                              <a
                                href={p.publishedUrl || `/s/${p.slug || p.id}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                }}
                                className="w-full px-3 py-2 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-semibold"
                              >
                                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                                <span>فتح الموقع المنشور</span>
                              </a>
                            )}
                            {p.githubRepo && (
                              <a
                                href={p.githubRepo.repoUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-semibold"
                              >
                                <Github className="w-3.5 h-3.5 text-slate-800" />
                                <span>مستودع GitHub</span>
                              </a>
                            )}
                            {hasCode && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                  const zipCheck = checkActionLimit('canDownloadZip');
                                  if (!zipCheck.allowed) {
                                    showPlanLimitNotice('canDownloadZip');
                                    return;
                                  }
                                  try {
                                    await downloadProjectZip(p, p.currentCode?.html || '');
                                  } catch {
                                    alert('تعذر تنزيل ملف ZIP');
                                  }
                                }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5 text-blue-600" />
                                <span>تنزيل كود المشروع (ZIP)</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => handleOpenRename(p, e)}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>تعديل الاسم</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(null);
                                setSelectedProject(p);
                                setModalMode('view');
                                setModalOpen(true);
                              }}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <FileCode className="w-3.5 h-3.5 text-slate-400" />
                              <span>تفاصيل المشروع</span>
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={(e) => handleQuickDelete(p, e)}
                              className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>حذف المشروع</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                    {p.description || p.originalPrompt || 'لا يوجد وصف للمشروع.'}
                  </p>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 pt-1 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center gap-2">
                    {hasCode && (
                      <button
                        type="button"
                        onClick={() => setPreviewProject(p)}
                        className="flex-1 h-9 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200/80"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>معاينة الموقع</span>
                      </button>
                    )}

                    {hasCode && onOpenStudioWithProject ? (
                      <button
                        type="button"
                        onClick={() => onOpenStudioWithProject(p)}
                        className="h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                        <span>استوديو التحرير</span>
                      </button>
                    ) : onOpenBuilderWithProject ? (
                      <button
                        type="button"
                        onClick={() => onOpenBuilderWithProject(p)}
                        className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          hasCode
                            ? 'bg-slate-900 hover:bg-slate-800 text-white'
                            : 'flex-1 bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{hasCode ? 'تطوير بالـ AI' : 'سَوّيها بالذكاء الاصطناعي'}</span>
                      </button>
                    ) : null}
                  </div>

                  {/* Meta Date info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(p.updatedAt || p.createdAt)}</span>
                    </span>

                    <button
                      onClick={() => {
                        setSelectedProject(p);
                        setModalMode('view');
                        setModalOpen(true);
                      }}
                      className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      التفاصيل
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Details / Rename Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProject(null);
        }}
        mode={modalMode}
        project={selectedProject}
        onProjectSaved={(savedProj) => {
          setProjects((prev) => {
            const idx = prev.findIndex((item) => item.id === savedProj.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = savedProj;
              return updated;
            }
            return [savedProj, ...prev];
          });
        }}
        onProjectDeleted={(deletedId) => {
          setProjects((prev) => prev.filter((item) => item.id !== deletedId));
        }}
      />

      {/* Real Live Site Preview Modal */}
      <SitePreviewModal
        project={previewProject}
        onClose={() => setPreviewProject(null)}
        onOpenInBuilder={(proj) => {
          setPreviewProject(null);
          if (proj.currentCode?.html && onOpenStudioWithProject) {
            onOpenStudioWithProject(proj);
          } else if (onOpenBuilderWithProject) {
            onOpenBuilderWithProject(proj);
          }
        }}
      />
    </div>
  );
};
