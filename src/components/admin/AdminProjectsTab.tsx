import React, { useState } from 'react';
import { ProjectItem } from '../../types';
import { adminUnpublishProject, adminDeleteProject } from '../../firebase/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  FolderKanban,
  Search,
  Globe,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldAlert,
  Calendar,
  Layers,
} from 'lucide-react';

interface AdminProjectsTabProps {
  projects: ProjectItem[];
  loading: boolean;
  onRefresh?: () => void;
}

export const AdminProjectsTab: React.FC<AdminProjectsTabProps> = ({
  projects,
  loading,
}) => {
  const { user: currentAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'ready'>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals
  const [unpublishModal, setUnpublishModal] = useState<{
    open: boolean;
    project: ProjectItem | null;
    reason: string;
  }>({
    open: false,
    project: null,
    reason: '',
  });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    project: ProjectItem | null;
    confirmationTitle: string;
    reason: string;
  }>({
    open: false,
    project: null,
    confirmationTitle: '',
    reason: '',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.ownerEmail && p.ownerEmail.toLowerCase().includes(q)) ||
      (p.ownerName && p.ownerName.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (statusFilter === 'published' && !p.isPublished) return false;
    if (statusFilter === 'draft' && p.status !== 'draft') return false;
    if (statusFilter === 'ready' && (p.isPublished || p.status !== 'ready')) return false;

    return true;
  });

  const handleExecuteUnpublish = async () => {
    const { project, reason } = unpublishModal;
    if (!project || !currentAdmin) return;

    setIsProcessing(true);
    setNotification(null);
    try {
      await adminUnpublishProject({
        adminUid: currentAdmin.uid,
        adminEmail: currentAdmin.email || 'owner',
        project,
        reason: reason || 'إلغاء نشر إداري لسلامة المحتوى',
      });

      setUnpublishModal({ open: false, project: null, reason: '' });
      setNotification({
        type: 'success',
        text: `تم حجب وإلغاء نشر المشروع (${project.title}) بنجاح وتدوين العملية في سجل التدقيق.`,
      });
    } catch (err: unknown) {
      setNotification({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر إلغاء نشر المشروع',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteDelete = async () => {
    const { project, reason, confirmationTitle } = deleteModal;
    if (!project || !currentAdmin) return;

    if (confirmationTitle.trim() !== project.title.trim()) {
      alert('يجب كتابة اسم المشروع بدقة لتأكيد الحذف النهائي.');
      return;
    }

    setIsProcessing(true);
    setNotification(null);
    try {
      await adminDeleteProject({
        adminUid: currentAdmin.uid,
        adminEmail: currentAdmin.email || 'owner',
        project,
        reason: reason || 'حذف إداري معتمد',
      });

      setDeleteModal({ open: false, project: null, confirmationTitle: '', reason: '' });
      setNotification({
        type: 'success',
        text: `تم حذف المشروع (${project.title}) نهائياً من Firestore وتدوين العملية في سجل التدقيق.`,
      });
    } catch (err: unknown) {
      setNotification({
        type: 'error',
        text: err instanceof Error ? err.message : 'تعذر حذف المشروع',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Header & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">إدارة مشاريع المنصة</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              استعراض جميع المواقع التي تم إنشاؤها وتوليدها عبر المنصة، فحص النشر، وحجب أو حذف المشاريع المخالفة.
            </p>
          </div>
          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            إجمالي المشاريع: {projects.length}
          </div>
        </div>

        {notification && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{notification.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم المشروع أو الرابط (slug) أو بريد المالك..."
              className="w-full h-10 pr-10 pl-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">جميع الحالات</option>
              <option value="published">المنشورة فقط (Live)</option>
              <option value="ready">المكتملة غير المنشورة</option>
              <option value="draft">المسودات</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
            <p>جاري تحميل المشاريع من Firestore...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <FolderKanban className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">لم يتم العثور على أي مشروع يطابق الفلتر.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">المشروع</th>
                  <th className="py-3 px-4">المالك</th>
                  <th className="py-3 px-4">التصنيف</th>
                  <th className="py-3 px-4">حالة النشر</th>
                  <th className="py-3 px-4">تاريخ التحديث</th>
                  <th className="py-3 px-4 text-center">إجراءات إدارية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((p) => {
                  const origin = typeof window !== 'undefined' ? window.location.origin : '';
                  const liveUrl = p.publishedUrl || `${origin}/s/${p.slug}`;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                            {p.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            /{p.slug}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block truncate max-w-[150px]">
                          {p.ownerName || 'مستخدم'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {p.ownerEmail || p.userId.substring(0, 10)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {p.category || 'صفحة ويب'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {p.isPublished ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <Globe className="w-3 h-3" />
                              <span>منشور لايف</span>
                            </span>
                            <a
                              href={liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-800"
                              title="فتح الرابط المنشور"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">غير منشور</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('ar-SA') : '—'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {p.isPublished && (
                            <button
                              type="button"
                              onClick={() => setUnpublishModal({ open: true, project: p, reason: '' })}
                              className="px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-all cursor-pointer"
                              title="إلغاء النشر وحجب الموقع"
                            >
                              إلغاء النشر
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                project: p,
                                confirmationTitle: '',
                                reason: '',
                              })
                            }
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all cursor-pointer"
                            title="حذف المشروع نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Unpublish Confirmation Modal */}
      {unpublishModal.open && unpublishModal.project && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-right space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">تأكيد إلغاء وحجب النشر</h3>
              <p className="text-xs text-slate-500">
                سيتم إزالة الموقع ({unpublishModal.project.title}) من الرابط العام فوراً وحجب الوصول إليه، مع الاحتفاظ بملف المشروع في حساب المستخدم.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">سبب إلغاء النشر (لسجل التدقيق):</label>
              <input
                type="text"
                value={unpublishModal.reason}
                onChange={(e) => setUnpublishModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="مثال: انتهاك شروط الخدمة، طلب من المستخدم..."
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setUnpublishModal({ open: false, project: null, reason: '' })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleExecuteUnpublish}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                {isProcessing ? 'جاري الإلغاء...' : 'تأكيد حجب النشر'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Delete Project Hazardous Modal */}
      {deleteModal.open && deleteModal.project && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-xl max-w-md w-full p-6 text-right space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">حذف نهائي للمشروع</h3>
              <p className="text-xs text-rose-600 font-semibold">
                تحذير إداري: هذا الإجراء لا يمكن التراجع عنه وسيتم مسح وثيقة المشروع ونسخه بالكامل من قاعدة البيانات.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="text-slate-500 block">اسم المشروع المراد حذفه:</span>
              <span className="font-mono font-bold text-slate-900 block select-all">{deleteModal.project.title}</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                اكتب اسم المشروع حرفياً للتأكيد:
              </label>
              <input
                type="text"
                value={deleteModal.confirmationTitle}
                onChange={(e) => setDeleteModal((prev) => ({ ...prev, confirmationTitle: e.target.value }))}
                placeholder="اكتب اسم المشروع هنا..."
                className="w-full h-9 px-3 rounded-xl border border-rose-300 text-xs bg-rose-50/30 focus:bg-white text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">سبب الحذف (لسجل التدقيق):</label>
              <input
                type="text"
                value={deleteModal.reason}
                onChange={(e) => setDeleteModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="اكتب سبب الحذف..."
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, project: null, confirmationTitle: '', reason: '' })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isProcessing || deleteModal.confirmationTitle.trim() !== deleteModal.project.title.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'جاري الحذف...' : 'حذف المشروع نهائياً'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
