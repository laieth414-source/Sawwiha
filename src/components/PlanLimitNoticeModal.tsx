import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  ArrowUpRight,
  X,
  Sparkles,
  CheckCircle2,
  FolderGit2,
  Globe2,
  Cpu,
  Layers,
  Archive,
} from 'lucide-react';
import { LimitAction } from '../types';

interface PlanLimitNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPricing: () => void;
}

export const PlanLimitNoticeModal: React.FC<PlanLimitNoticeModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPricing,
}) => {
  const { limitNoticeData, currentPlan, openUpgradeModal } = useAuth();

  if (!isOpen || !limitNoticeData) return null;

  const getActionDetails = (action: LimitAction) => {
    switch (action) {
      case 'create_project':
        return {
          title: 'حد عدد المشاريع',
          icon: FolderGit2,
          color: 'text-amber-600 bg-amber-50',
          desc: 'لقد استنفدت الحد الأقصى للمشاريع المسموح بها في خطتك الحالية.',
        };
      case 'ai_generate':
        return {
          title: 'حد توليد المواقع بالذكاء الاصطناعي',
          icon: Sparkles,
          color: 'text-violet-600 bg-violet-50',
          desc: 'لقد بلغت الحد الشهري المتاح لتوليد المواقع الجديدة بالذكاء الاصطناعي.',
        };
      case 'ai_edit':
        return {
          title: 'حد التعديل بالذكاء الاصطناعي',
          icon: Cpu,
          color: 'text-emerald-600 bg-emerald-50',
          desc: 'وصلت للحد الأقصى لرسائل وتعديلات المساعد الذكي (AI Chat Companion).',
        };
      case 'ai_repair':
        return {
          title: 'حد الإصلاح الذكي للكود',
          icon: Cpu,
          color: 'text-blue-600 bg-blue-50',
          desc: 'استنفدت عدد عمليات الإصلاح الذكي التلقائي للكود في خطتك.',
        };
      case 'publish_site':
        return {
          title: 'حد نشر المواقع الحية',
          icon: Globe2,
          color: 'text-emerald-600 bg-emerald-50',
          desc: 'وصلت للحد الأقصى لعدد المواقع المنشورة حية في نفس الوقت.',
        };
      case 'github_export':
        return {
          title: 'ميزة تصدير GitHub',
          icon: FolderGit2,
          color: 'text-slate-800 bg-slate-100',
          desc: 'تصدير الكود لمستودعات GitHub يتطلب الترقية إلى خطة Pro أو أعلى.',
        };
      case 'download_zip':
        return {
          title: 'تنزيل حزمة ZIP البرمجية',
          icon: Archive,
          color: 'text-indigo-600 bg-indigo-50',
          desc: 'تنزيل الكود المصدري الكامل بصيغة ZIP متاح لمشتركي خطة Pro وما فوق.',
        };
      default:
        return {
          title: 'حدود الخطة',
          icon: Layers,
          color: 'text-amber-600 bg-amber-50',
          desc: 'هذه الميزة تتجاوز الحدود المتاحة في خطتك الحالية.',
        };
    }
  };

  const details = getActionDetails(limitNoticeData.action);
  const Icon = details.icon;

  const handleUpgradeClick = () => {
    onClose();
    onNavigateToPricing();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity" dir="rtl">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5 text-right animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with warm warning badge */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${details.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-900">
              <AlertTriangle className="w-3 h-3 text-amber-700" />
              <span>وصلت للحد المتاح في خطتك</span>
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {details.title}
            </h3>
          </div>
        </div>

        {/* Explanation Message */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
          <p className="text-slate-700 font-medium leading-relaxed">
            {limitNoticeData.reason || details.desc}
          </p>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>الخطة الحالية: <strong className="text-slate-900">{limitNoticeData.planName || currentPlan.name}</strong></span>
            {limitNoticeData.limit > 0 && (
              <span>الاستهلاك: <strong className="text-emerald-700 font-mono">{limitNoticeData.current} / {limitNoticeData.limit}</strong></span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>

          <button
            type="button"
            onClick={handleUpgradeClick}
            className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>عرض الخطط والترقية</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
