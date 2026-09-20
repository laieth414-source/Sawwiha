import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Star,
  ExternalLink,
  Eye,
  AlertCircle,
  RefreshCw,
  Shield,
  Layers,
  Filter,
} from 'lucide-react';
import { ProjectItem } from '../../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { logAdminAction } from '../../firebase/auditLogService';
import { useAuth } from '../../context/AuthContext';

interface AdminShowcaseTabProps {
  projects: ProjectItem[];
  onRefresh: () => Promise<void>;
}

type ShowcaseFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'featured';

export const AdminShowcaseTab: React.FC<AdminShowcaseTabProps> = ({
  projects,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<ShowcaseFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Filter projects based on showcaseOptIn, status, and search
  const showcaseProjects = projects.filter((p) => {
    // We consider projects that either have showcaseOptIn set or have a showcaseStatus
    const isShowcaseCandidate = Boolean(p.showcaseOptIn || p.showcaseStatus);
    if (!isShowcaseCandidate && filter !== 'all') return false;

    if (filter === 'pending') {
      return p.showcaseStatus === 'pending' || (p.showcaseOptIn && !p.showcaseStatus);
    }
    if (filter === 'approved') {
      return p.showcaseStatus === 'approved';
    }
    if (filter === 'rejected') {
      return p.showcaseStatus === 'rejected';
    }
    if (filter === 'featured') {
      return Boolean(p.featuredInShowcase);
    }

    // Filter 'all' shows showcase candidates first, but allows searching all projects
    return true;
  });

  const filteredList = showcaseProjects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.title || '').toLowerCase().includes(q) ||
      (p.slug || '').toLowerCase().includes(q) ||
      (p.ownerEmail || '').toLowerCase().includes(q) ||
      (p.showcaseCategory || p.category || '').toLowerCase().includes(q)
    );
  });

  const handleUpdateStatus = async (
    project: ProjectItem,
    newStatus: 'approved' | 'rejected' | 'none',
    reason?: string
  ) => {
    if (!user) return;
    setActionLoadingId(project.id);
    setNotice(null);

    try {
      const projectRef = doc(db, 'projects', project.id);
      await setDoc(
        projectRef,
        {
          showcaseStatus: newStatus,
          showcaseApprovedAt: newStatus === 'approved' ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await logAdminAction({
        action: 'showcase_moderation',
        targetEntity: 'showcase',
        targetId: project.id,
        targetName: project.title,
        summary:
          newStatus === 'approved'
            ? `قبول واعتماد المشروع (${project.title}) في معرض المواقع والمجتمع`
            : newStatus === 'rejected'
            ? `حجب أو رفض المشروع (${project.title}) من المعرض`
            : `إزالة المشروع (${project.title}) من المعرض`,
        details: {
          previousStatus: project.showcaseStatus || 'none',
          newStatus,
          reason: reason || 'إشراف إداري على المحتوى',
        },
        adminId: user.uid,
        adminEmail: user.email || '',
      });

      await onRefresh();
      setNotice(
        newStatus === 'approved'
          ? `تم اعتماد المشروع «${project.title}» في المعرض العام بنجاح!`
          : `تم تحديث حالة المشروع في المعرض بنجاح.`
      );
      setTimeout(() => setNotice(null), 3500);
    } catch (err: any) {
      console.warn('Notice moderating showcase status:', err);
      alert('حدث خطأ أثناء تعديل حالة المعرض: ' + (err.message || err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleFeatured = async (project: ProjectItem) => {
    if (!user) return;
    setActionLoadingId(project.id);
    const newFeaturedState = !project.featuredInShowcase;

    try {
      const projectRef = doc(db, 'projects', project.id);
      await setDoc(
        projectRef,
        {
          featuredInShowcase: newFeaturedState,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await logAdminAction({
        action: 'showcase_moderation',
        targetEntity: 'showcase',
        targetId: project.id,
        targetName: project.title,
        summary: newFeaturedState
          ? `تمييز المشروع (${project.title}) في صدارة معرض المواقع ⭐`
          : `إلغاء تمييز المشروع (${project.title}) من صدارة المعرض`,
        details: {
          featured: newFeaturedState,
        },
        adminId: user.uid,
        adminEmail: user.email || '',
      });

      await onRefresh();
    } catch (err: any) {
      console.warn('Notice toggling featured:', err);
      alert('حدث خطأ: ' + (err.message || err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = projects.filter((p) => p.showcaseStatus === 'pending' || (p.showcaseOptIn && !p.showcaseStatus)).length;
  const approvedCount = projects.filter((p) => p.showcaseStatus === 'approved').length;
  const featuredCount = projects.filter((p) => p.featuredInShowcase).length;

  return (
    <div className="space-y-6">
      {/* Metric Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">بانتظار المراجعة (Pending)</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">معتمد في المعرض (Approved)</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">مشاريع مميزة بالصدارة (Featured)</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{featuredCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Star className="w-5 h-5" />
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            الكل ({showcaseProjects.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'pending' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            بانتظار المراجعة ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'approved' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            معتمد ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('featured')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'featured' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            المميّزة ({featuredCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'rejected' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            مرفوض أو محجوب
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، الرابط، أو بريد المالك..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Showcase Moderation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs">
              <tr>
                <th className="py-3 px-4">المشروع والمالك</th>
                <th className="py-3 px-4">التصنيف</th>
                <th className="py-3 px-4">حالة المعرض</th>
                <th className="py-3 px-4">النشر المستقل</th>
                <th className="py-3 px-4">المميّز</th>
                <th className="py-3 px-4 text-center">إجراءات الإشراف والاعتماد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    لا توجد طلبات أو مشاريع تطابق الفلتر المحدد.
                  </td>
                </tr>
              ) : (
                filteredList.map((project) => {
                  const isLoading = actionLoadingId === project.id;
                  const isApproved = project.showcaseStatus === 'approved';
                  const isPending = project.showcaseStatus === 'pending' || (project.showcaseOptIn && !project.showcaseStatus);
                  const isRejected = project.showcaseStatus === 'rejected';
                  const origin = typeof window !== 'undefined' ? window.location.origin : '';
                  const cleanSlug = project.slug || project.id;
                  const liveUrl = project.publishedUrl || `${origin}/s/${cleanSlug}`;

                  return (
                    <tr key={project.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Title & Owner */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{project.title}</span>
                          {project.featuredInShowcase && (
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {project.ownerEmail || project.userId}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                          {project.showcaseCategory || project.category || 'صفحة هبوط'}
                        </span>
                      </td>

                      {/* Showcase Status */}
                      <td className="py-3.5 px-4">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>معتمد بالمعرض</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                            <AlertCircle className="w-3 h-3" />
                            <span>بانتظار المراجعة</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                            <XCircle className="w-3 h-3" />
                            <span>مرفوض أو محجوب</span>
                          </span>
                        )}
                        {!isApproved && !isPending && !isRejected && (
                          <span className="text-[10px] text-slate-400">خاص (غير مشترك)</span>
                        )}
                      </td>

                      {/* Live Published Status */}
                      <td className="py-3.5 px-4">
                        {project.isPublished ? (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                          >
                            <span>نشط</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">مسودة (غير منشور)</span>
                        )}
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(project)}
                          disabled={isLoading}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            project.featuredInShowcase
                              ? 'bg-amber-50 border-amber-300 text-amber-600'
                              : 'border-slate-200 text-slate-400 hover:text-slate-700'
                          }`}
                          title={project.featuredInShowcase ? 'إلغاء التمييز' : 'تمييز المشروع في الصدارة'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              project.featuredInShowcase ? 'fill-amber-400 text-amber-500' : ''
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Approve Button */}
                          {!isApproved && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(project, 'approved')}
                              disabled={isLoading}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                            >
                              اعتماد بالمعرض
                            </button>
                          )}

                          {/* Reject / Hide Button */}
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(project, 'rejected')}
                              disabled={isLoading}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              حجب من المعرض
                            </button>
                          )}

                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(project, 'rejected')}
                              disabled={isLoading}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              رفض الطلب
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
