import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ProjectItem } from '../types';
import { createProject, updateProjectDetails, deleteProject } from '../firebase/projectService';
import {
  X,
  FolderPlus,
  Edit3,
  Trash2,
  Globe,
  Tag,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'view' | 'edit';
  project?: ProjectItem | null;
  onProjectSaved?: (project: ProjectItem) => void;
  onProjectDeleted?: (projectId: string) => void;
}

const CATEGORIES = [
  'مطاعم وضيافة',
  'تجارة إلكترونية',
  'معرض أعمال شخصي',
  'شركات ومؤسسات',
  'عقارات ومقاولات',
  'تعليم وتدريب',
  'صحة وطب',
  'أخرى',
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  mode,
  project,
  onProjectSaved,
  onProjectDeleted,
}) => {
  const { user } = useAuth();

  const [currentMode, setCurrentMode] = useState<'create' | 'view' | 'edit'>(mode);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setCurrentMode(mode);
    setConfirmDelete(false);
    setError(null);

    if (project && (mode === 'view' || mode === 'edit')) {
      setTitle(project.title || '');
      setCategory(project.category || CATEGORIES[0]);
      setDescription(project.description || '');
      setSlug(project.slug || '');
    } else {
      setTitle('');
      setCategory(CATEGORIES[0]);
      setDescription('');
      setSlug('');
    }
  }, [mode, project, isOpen]);

  if (!isOpen) return null;

  const generateSlug = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w\u0621-\u064A-]+/g, '')
      .slice(0, 30);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (currentMode === 'create' && !slug) {
      setSlug(generateSlug(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('يجب تسجيل الدخول لتنفيذ هذا الإجراء.');
      return;
    }

    if (!title.trim()) {
      setError('عنوان المشروع مطلوب.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (currentMode === 'create') {
        const finalSlug = slug.trim() || generateSlug(title) || `site-${Date.now().toString().slice(-4)}`;
        const newProj = await createProject(
          user.uid,
          user.email || '',
          user.displayName || user.email?.split('@')[0] || 'مستخدم سَوّيها',
          {
            title: title.trim(),
            description: description.trim(),
            category,
            slug: finalSlug,
          }
        );

        if (onProjectSaved) onProjectSaved(newProj);
        onClose();
      } else if (currentMode === 'edit' && project) {
        await updateProjectDetails(project.id, user.uid, {
          title: title.trim(),
          description: description.trim(),
          category,
        });

        const updatedProj: ProjectItem = {
          ...project,
          title: title.trim(),
          description: description.trim(),
          category,
          slug: slug.trim() || project.slug,
          updatedAt: new Date().toISOString(),
        };

        if (onProjectSaved) onProjectSaved(updatedProj);
        onClose();
      }
    } catch (err) {
      setError('حدث خطأ أثناء حفظ المشروع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !user) return;
    setLoading(true);
    setError(null);

    try {
      await deleteProject(project.id, user.uid);
      if (onProjectDeleted) onProjectDeleted(project.id);
      onClose();
    } catch (err) {
      setError('تعذر حذف المشروع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="project-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir="rtl"
    >
      <div
        id="project-modal-card"
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden text-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              {currentMode === 'create' ? <FolderPlus className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {currentMode === 'create' && 'إنشاء مشروع جديد'}
                {currentMode === 'view' && 'تفاصيل المشروع'}
                {currentMode === 'edit' && 'تعديل بيانات المشروع'}
              </h3>
              <p className="text-xs text-slate-500">
                {currentMode === 'create' ? 'أدخل تفاصيل موقعك للبدء' : project?.title || ''}
              </p>
            </div>
          </div>
          <button
            id="close-project-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* VIEW MODE */}
          {currentMode === 'view' && project && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">اسم المشروع</span>
                  <span className="font-bold text-slate-900 text-sm">{project.title}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> التصنيف
                  </span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                    {project.category}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> الرابط
                  </span>
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    /{project.slug}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> تاريخ الإنشاء
                  </span>
                  <span className="text-slate-600">
                    {new Date(project.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">وصف المشروع:</label>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed max-h-28 overflow-y-auto">
                    {project.description}
                  </div>
                </div>
              )}

              {/* Delete confirmation section */}
              {confirmDelete && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                  <p className="text-xs font-bold text-rose-800">
                    هل أنت متأكد من رغبتك في حذف هذا المشروع نهائياً؟
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      نعم، احذف
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="h-9 px-4 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentMode('edit')}
                  className="h-9 px-4 flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل البيانات</span>
                </button>

                {!confirmDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="h-9 px-4 flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف المشروع</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CREATE OR EDIT FORM */}
          {(currentMode === 'create' || currentMode === 'edit') && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  عنوان المشروع <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="مثال: مطعم دجلة للمأكولات الحديثة"
                  className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/15 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تصنيف المشروع</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/15 transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الرابط المختصر (Slug)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-restaurant"
                    className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  وصف المشروع أو الفكرة الأولية
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب نبذة عن موقعك أو الخدمات التي تود استعراضها..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/15 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  id="save-project-btn"
                  type="submit"
                  disabled={loading}
                  className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{currentMode === 'create' ? 'إنشاء المشروع' : 'حفظ التعديلات'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
