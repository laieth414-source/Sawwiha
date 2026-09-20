import React, { useState } from 'react';
import {
  X,
  Globe,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  History,
  Trash2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ProjectItem, PublishHistoryEntry } from '../types';
import { publishProject, unpublishProject } from '../firebase/projectService';
import { useAuth } from '../context/AuthContext';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem;
  currentHtml: string;
  onProjectUpdated: (updatedProject: ProjectItem) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  project,
  currentHtml,
  onProjectUpdated,
}) => {
  const { checkActionLimit, recordActionUsage, showPlanLimitNotice } = useAuth();
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isUnpublishing, setIsUnpublishing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPublished = Boolean(project.isPublished);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const cleanSlug = project.slug || project.id;
  const standaloneUrl = project.publishedUrl || `${origin}/s/${cleanSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(standaloneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenLiveSite = () => {
    window.open(standaloneUrl, '_blank');
  };

  const handlePublish = async () => {
    // Phase 5: Check publishedSites limit for new publishes
    if (!isPublished) {
      const pubCheck = checkActionLimit('publishedSites');
      if (!pubCheck.allowed) {
        showPlanLimitNotice('publishedSites');
        return;
      }
    }

    setIsPublishing(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const result = await publishProject(
        project.id,
        currentHtml,
        cleanSlug,
        project.title,
        project.publishHistory
      );

      // Phase 5: Record published site usage in Firestore
      if (!isPublished) {
        try {
          await recordActionUsage('publishedSites');
        } catch (usageErr) {
          console.warn('Failed to record published site usage:', usageErr);
        }
      }

      const updated: ProjectItem = {
        ...project,
        isPublished: true,
        status: 'ready',
        publishedUrl: result.publishedUrl,
        publishedAt: result.publishedAt,
        publishedCode: currentHtml,
        publishHistory: [
          ...(project.publishHistory || []),
          {
            id: `pub_${Date.now()}`,
            publishedAt: result.publishedAt,
            publishedUrl: result.publishedUrl,
            action: isPublished ? 'republish' : 'publish',
            summary: isPublished ? 'تم تحديث النشر بنجاح' : 'تم النشر المباشر بنجاح',
          },
        ],
      };

      onProjectUpdated(updated);
      setSuccessNotice(
        isPublished
          ? 'تم تحديث النسخة المنشورة بنجاح على الرابط المستقل! 🎉'
          : 'تم نشر موقعك بنجاح على الإنترنت! 🎉'
      );
      setTimeout(() => setSuccessNotice(null), 4500);
    } catch (err: unknown) {
      console.warn('Publish warning:', err);
      setError(err instanceof Error ? err.message : 'فشلت عملية النشر، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!window.confirm('هل أنت متأكد من إلغاء نشر هذا الموقع؟ سيصبح الرابط غير متاح للزوار.')) {
      return;
    }

    setIsUnpublishing(true);
    setError(null);
    setSuccessNotice(null);

    try {
      await unpublishProject(project.id, cleanSlug, project.publishHistory);

      const updated: ProjectItem = {
        ...project,
        isPublished: false,
        publishedUrl: '',
        publishHistory: [
          ...(project.publishHistory || []),
          {
            id: `unpub_${Date.now()}`,
            publishedAt: new Date().toISOString(),
            publishedUrl: '',
            action: 'unpublish',
            summary: 'تم إلغاء النشر',
          },
        ],
      };

      onProjectUpdated(updated);
      setSuccessNotice('تم إلغاء نشر الموقع بنجاح وأصبح في وضع المسودة.');
      setTimeout(() => setSuccessNotice(null), 3500);
    } catch (err: unknown) {
      console.warn('Unpublish warning:', err);
      setError(err instanceof Error ? err.message : 'فشلت عملية إلغاء النشر.');
    } finally {
      setIsUnpublishing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                isPublished ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">نشر الموقع المباشر (Publish)</h3>
              <p className="text-[11px] text-slate-500">
                إتاحة موقعك للجمهور برابط ويب حقيقي ومستقل
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Status Indicator */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
              isPublished
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <div>
                <p className="text-xs font-bold">
                  {isPublished ? 'الموقع منشور ومتاح للجميع على الإنترنت' : 'الموقع في وضع المسودة (غير منشور)'}
                </p>
                {isPublished && project.publishedAt && (
                  <p className="text-[10px] text-emerald-700 mt-0.5">
                    آخر نشر: {new Date(project.publishedAt).toLocaleString('ar-SA')}
                  </p>
                )}
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                isPublished ? 'bg-emerald-200/80 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isPublished ? 'LIVE' : 'DRAFT'}
            </span>
          </div>

          {/* Success / Error Messages */}
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Public Standalone URL Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>رابط الموقع العام المستقل:</span>
              <span className="text-[10px] font-normal text-slate-400">
                {isPublished ? 'جاهز للمشاركة' : 'سيصبح نشطاً بعد النشر'}
              </span>
            </label>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate select-all">
                {standaloneUrl}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="نسخ الرابط"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>

              {isPublished && (
                <button
                  type="button"
                  onClick={handleOpenLiveSite}
                  className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="فتح الموقع المنشور في نافذة جديدة"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح الموقع</span>
                </button>
              )}
            </div>
          </div>

          {/* Standalone Independence Guarantee */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ميزات استقلالية الموقع المنشور:</span>
            </div>
            <ul className="text-[11px] space-y-1 text-slate-500 list-disc list-inside leading-relaxed pr-1">
              <li>الموقع المنشور صفحة ويب مستقلة تماماً وسريعة التحميل دون الحاجة لفتح سَوّيها.</li>
              <li>أي زائر يملك الرابط يستطيع تصفح الموقع بالكامل من أي متصفح أو جهاز.</li>
              <li>تعديلاتك الراهنة في الاستوديو لا تظهر للمستخدمين إلا عند ضغطك «تحديث النشر».</li>
            </ul>
          </div>

          {/* Publishing Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || isUnpublishing}
              className="w-full sm:flex-1 h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري النشر وتجهيز الرابط...</span>
                </>
              ) : isPublished ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>تحديث النشر (نشر آخر التعديلات)</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>نشر الموقع الآن</span>
                </>
              )}
            </button>

            {isPublished && (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={isPublishing || isUnpublishing}
                className="w-full sm:w-auto h-10 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUnpublishing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>إلغاء النشر</span>
              </button>
            )}
          </div>

          {/* Publish History Log */}
          {project.publishHistory && project.publishHistory.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>سجل عمليات النشر والتحديث ({project.publishHistory.length}):</span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {project.publishHistory
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            entry.action === 'unpublish' ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span className="font-semibold text-slate-800">
                          {entry.action === 'publish'
                            ? 'نشر أولي'
                            : entry.action === 'republish'
                            ? 'تحديث النشر'
                            : 'إلغاء النشر'}
                        </span>
                        {entry.publishedUrl && (
                          <span className="font-mono text-slate-500 truncate max-w-[180px]">
                            {entry.publishedUrl}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(entry.publishedAt).toLocaleString('ar-SA', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
