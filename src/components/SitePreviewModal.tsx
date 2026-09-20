import React, { useState } from 'react';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { ProjectItem } from '../types';

interface SitePreviewModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onOpenInBuilder: (project: ProjectItem) => void;
}

export const SitePreviewModal: React.FC<SitePreviewModalProps> = ({
  project,
  onClose,
  onOpenInBuilder,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState<boolean>(false);

  if (!project) return null;

  const html = project.currentCode?.html || '';

  const handleCopy = () => {
    if (!html) return;
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenFullscreen = () => {
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150" dir="rtl">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              {project.title.substring(0, 1) || 'سـ'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">{project.title}</h3>
              <p className="text-[11px] text-slate-500">معاينة الموقع — {project.category}</p>
            </div>
          </div>

          {/* Viewport Toggles */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setViewport('desktop')}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-all ${
                viewport === 'desktop' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>كمبيوتر</span>
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-all ${
                viewport === 'tablet' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>تابلت</span>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-all ${
                viewport === 'mobile' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>جوال</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenInBuilder(project);
              }}
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تطوير في الاستوديو</span>
            </button>

            <button
              onClick={handleOpenFullscreen}
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs transition-colors cursor-pointer"
              title="فتح في نافذة كاملة"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs transition-colors cursor-pointer"
              title="نسخ الكود"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Preview Area */}
        <div className="flex-1 bg-slate-900/5 p-3 sm:p-4 flex items-center justify-center overflow-hidden">
          {html ? (
            <div
              className={`transition-all duration-300 bg-white rounded-xl shadow-lg border border-slate-300/80 overflow-hidden h-full ${
                viewport === 'desktop'
                  ? 'w-full'
                  : viewport === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[375px]'
              }`}
            >
              <iframe
                title={project.title}
                srcDoc={html}
                sandbox="allow-scripts allow-forms allow-same-origin"
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl border border-slate-200/80 max-w-sm">
              <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-2.5" />
              <h4 className="font-bold text-slate-900 text-base mb-1">لم يتم توليد كود لهذا المشروع بعد</h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                المشروع محفوظ كمسودة. يمكنك تشغيل منشئ المواقع الآن لتوليد تصميم متكامل له.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenInBuilder(project);
                }}
                className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs cursor-pointer"
              >
                توليد الموقع بالذكاء الاصطناعي الآن
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
