import React, { useState } from 'react';
import { PlatformAiEngine } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { logAdminAction } from '../../firebase/auditLogService';
import {
  Cpu,
  Sparkles,
  Sliders,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  RotateCcw,
  Zap,
  MessageSquare,
  Wrench,
} from 'lucide-react';

interface AdminAiSettingsTabProps {
  aiEngine?: PlatformAiEngine;
  onSave: (updatedEngine: PlatformAiEngine) => Promise<void>;
  saving: boolean;
}

export const AdminAiSettingsTab: React.FC<AdminAiSettingsTabProps> = ({
  aiEngine,
  onSave,
  saving,
}) => {
  const { user } = useAuth();

  const defaultEngine: PlatformAiEngine = {
    activeModel: 'gemini-3.1-flash-lite',
    fallbackModel: 'gemini-flash-latest',
    temperature: 0.7,
    maxOutputTokens: 8192,
    systemInstruction:
      'أنت مهندس البرمجيات والخبير البصري في منصة «سَوّيها». تخصصك هو تحويل أفكار المستخدمين إلى مواقع ويب حقيقية متكاملة ذات تصميم عربي وأجنبي احترافي متجاوب باستخدام HTML5 وTailwind CSS مع نصوص واقعية وأيقونات واضحة وتفاعلية عالية.',
    aiBuilderEnabled: true,
    aiEditingEnabled: true,
    aiRepairEnabled: true,
    analyzingStatusText: 'جاري تحليل الفكرة واستخراج الأقسام والهوية البصرية...',
    generatingStatusText: 'جاري كتابة الكود وبناء الواجهات المتقدمة...',
    verifyingStatusText: 'جاري الفحص التلقائي لسلامة الأكواد والتجاوب...',
    safetyLevel: 'standard',
  };

  const [formData, setFormData] = useState<PlatformAiEngine>({
    ...defaultEngine,
    ...(aiEngine || {}),
  });

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(null);
    try {
      await onSave(formData);

      if (user) {
        await logAdminAction({
          action: 'ai_config_update',
          targetEntity: 'ai',
          targetId: 'ai_engine',
          targetName: formData.activeModel,
          summary: `تحديث إعدادات محرك الذكاء الاصطناعي (النموذج: ${formData.activeModel})`,
          details: {
            activeModel: formData.activeModel,
            fallbackModel: formData.fallbackModel,
            temperature: formData.temperature,
            aiBuilderEnabled: formData.aiBuilderEnabled,
            aiEditingEnabled: formData.aiEditingEnabled,
            aiRepairEnabled: formData.aiRepairEnabled,
          },
          adminId: user.uid,
          adminEmail: user.email || 'owner',
        });
      }

      setSavedNotice('تم حفظ إعدادات محرك الذكاء الاصطناعي وتطبيقها فوراً في المنصة.');
      setTimeout(() => setSavedNotice(null), 4000);
    } catch {
      // Error handled by parent
    }
  };

  const handleResetPrompt = () => {
    setFormData((prev) => ({
      ...prev,
      systemInstruction: defaultEngine.systemInstruction,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
      {/* 1. Top Info Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">إعدادات محرك الذكاء الاصطناعي (AI Settings)</h2>
              <p className="text-xs text-slate-500">
                التحكم الكامل في النماذج، تعليمات النظام (System Prompt)، وحالات الميزات ورسائل التفاعل.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ إعدادات AI</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold block">مبدأ الأمان وعدم حفظ المفاتيح السرية (Zero-Leak Principle):</span>
            <span className="text-[11px] text-amber-800 block">
              مفتاح Gemini API السري يعمل خلف خادم Express الآمن عبر متغير البيئة (GEMINI_API_KEY) ولا يُخزن نهائياً في Firestore لحماية ميزانيتك وأمن المنصة. تتحكم هذه اللوحة في معايير الاستدعاء والنصوص التشغيلية فقط.
            </span>
          </div>
        </div>

        {savedNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{savedNotice}</span>
          </div>
        )}
      </div>

      {/* 2. Feature Toggles for AI */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>تفعيل وتعطيل ميزات الذكاء الاصطناعي</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors">
            <div>
              <span className="text-xs font-bold text-slate-800 block">مُولّد المواقع (AI Builder)</span>
              <span className="text-[10px] text-slate-500">إنشاء موقع كامل من وصف الفكرة</span>
            </div>
            <input
              type="checkbox"
              checked={formData.aiBuilderEnabled}
              onChange={(e) => setFormData((p) => ({ ...p, aiBuilderEnabled: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
            />
          </label>

          <label className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors">
            <div>
              <span className="text-xs font-bold text-slate-800 block">تعديل الكود (AI Editing)</span>
              <span className="text-[10px] text-slate-500">محادثة التعديل المباشر داخل الاستوديو</span>
            </div>
            <input
              type="checkbox"
              checked={formData.aiEditingEnabled}
              onChange={(e) => setFormData((p) => ({ ...p, aiEditingEnabled: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
            />
          </label>

          <label className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors">
            <div>
              <span className="text-xs font-bold text-slate-800 block">الفحص والإصلاح (AI Repair)</span>
              <span className="text-[10px] text-slate-500">كشف وتصحيح أخطاء التصميم والكود</span>
            </div>
            <input
              type="checkbox"
              checked={formData.aiRepairEnabled}
              onChange={(e) => setFormData((p) => ({ ...p, aiRepairEnabled: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 3. Models & Generation Parameters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-violet-600" />
          <span>النماذج ومحددات التوليد الفنية</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">النموذج النشط الأساسي:</label>
            <select
              value={formData.activeModel}
              onChange={(e) => setFormData((p) => ({ ...p, activeModel: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
            >
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (الأسرع والأعلى استقراراً - موصى به)</option>
              <option value="gemini-flash-latest">Gemini Flash Latest (النسخة المستقرة)</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">نموذج الاحتياط (Fallback Model):</label>
            <select
              value={formData.fallbackModel}
              onChange={(e) => setFormData((p) => ({ ...p, fallbackModel: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
            >
              <option value="gemini-flash-latest">Gemini Flash Latest</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">درجة الإبداع (Temperature):</label>
              <span className="text-xs font-mono font-bold text-slate-900">{formData.temperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={formData.temperature}
              onChange={(e) => setFormData((p) => ({ ...p, temperature: parseFloat(e.target.value) }))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">الحد الأقصى للرموز (Max Tokens):</label>
              <span className="text-xs font-mono font-bold text-slate-900">{formData.maxOutputTokens}</span>
            </div>
            <select
              value={formData.maxOutputTokens}
              onChange={(e) => setFormData((p) => ({ ...p, maxOutputTokens: parseInt(e.target.value, 10) }))}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
            >
              <option value="4096">4,096 Token (مواقع سريعة وخفيفة)</option>
              <option value="8192">8,192 Token (الافتراضي الموصى به)</option>
              <option value="16384">16,384 Token (تطبيقات وصفحات ضخمة)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. System Prompt Instruction */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>التعليمات البرمجية الموجهة (System Instruction Prompt)</span>
          </h3>
          <button
            type="button"
            onClick={handleResetPrompt}
            className="text-[11px] text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>استعادة النص الأصلي الافتراضي</span>
          </button>
        </div>

        <textarea
          rows={5}
          value={formData.systemInstruction}
          onChange={(e) => setFormData((p) => ({ ...p, systemInstruction: e.target.value }))}
          className="w-full p-3.5 rounded-xl border border-slate-200 text-xs leading-relaxed font-sans bg-slate-50/50 focus:bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>يتحكم هذا الأمر في شخصية وأسلوب كتابة الأكواد والتصميم التي يعتمدها الذكاء الاصطناعي للمستخدمين.</span>
          <span>{formData.systemInstruction.length} حرف</span>
        </div>
      </div>

      {/* 5. Customized UI Status Messages */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>رسائل مراحل التوليد المعروضة للمستخدم</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">مرحلة التحليل والهيكلة:</label>
            <input
              type="text"
              value={formData.analyzingStatusText || ''}
              onChange={(e) => setFormData((p) => ({ ...p, analyzingStatusText: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">مرحلة بناء الكود:</label>
            <input
              type="text"
              value={formData.generatingStatusText || ''}
              onChange={(e) => setFormData((p) => ({ ...p, generatingStatusText: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">مرحلة الفحص والتحقق:</label>
            <input
              type="text"
              value={formData.verifyingStatusText || ''}
              onChange={(e) => setFormData((p) => ({ ...p, verifyingStatusText: e.target.value }))}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
