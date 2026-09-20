import React, { useState } from 'react';
import { PlatformSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { logAdminAction } from '../../firebase/auditLogService';
import {
  Palette,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Type,
  Layout,
  Eye,
  ArrowLeft,
} from 'lucide-react';

interface AdminIdentityTabProps {
  settings: PlatformSettings;
  onSave: (updatedSettings: Partial<PlatformSettings>) => Promise<void>;
  saving: boolean;
}

export const AdminIdentityTab: React.FC<AdminIdentityTabProps> = ({
  settings,
  onSave,
  saving,
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    platformName: settings.platformName || 'سَوّيها',
    platformTagline: settings.platformTagline || 'عندك فكرة؟ سَوّيها.',
    platformDescription:
      settings.platformDescription ||
      'المنصة العربية الرائدة لتحويل الأفكار إلى مواقع ويب حقيقية ومشاريع متكاملة.',
    logoText: settings.logoText || 'سـ',
    logoColor: settings.logoColor || 'emerald',
    logoImageUrl: settings.logoImageUrl || '',
    heroCtaText: settings.heroCtaText || 'سَوّ مشروعك الآن',
    heroSubtitleText: settings.heroSubtitleText || 'ابنِ موقعك الإلكتروني بالذكاء الاصطناعي في ثوانٍ مع نشر مباشر وكود نظيف.',
    welcomeMessage: settings.welcomeMessage || 'أهلاً بك في منصة سَوّيها الذكية!',
  });

  const [notice, setNotice] = useState<string | null>(null);

  const colors: { id: PlatformSettings['logoColor']; name: string; bg: string; text: string }[] = [
    { id: 'emerald', name: 'زمردي (Emerald)', bg: 'bg-emerald-600', text: 'text-emerald-600' },
    { id: 'blue', name: 'أزرق (Ocean Blue)', bg: 'bg-blue-600', text: 'text-blue-600' },
    { id: 'violet', name: 'بنفسجي (Royal Violet)', bg: 'bg-violet-600', text: 'text-violet-600' },
    { id: 'amber', name: 'كهرماني (Warm Amber)', bg: 'bg-amber-500', text: 'text-amber-500' },
    { id: 'rose', name: 'وردي (Ruby Rose)', bg: 'bg-rose-600', text: 'text-rose-600' },
    { id: 'indigo', name: 'نيلي (Deep Indigo)', bg: 'bg-indigo-600', text: 'text-indigo-600' },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    try {
      await onSave(formData);

      if (user) {
        await logAdminAction({
          action: 'settings_update',
          targetEntity: 'settings',
          targetId: 'identity',
          targetName: 'هوية المنصة',
          summary: `تحديث هوية المنصة والبصرية (الاسم: ${formData.platformName})`,
          details: { ...formData },
          adminId: user.uid,
          adminEmail: user.email || 'owner',
        });
      }

      setNotice('تم حفظ وتحديث هوية المنصة بنجاح وتحديث واجهات الموقع تلقائياً.');
      setTimeout(() => setNotice(null), 4000);
    } catch {
      // Handled by parent
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-right" dir="rtl">
      {/* 1. Header & Save */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">هوية المنصة والبصرية (Branding & Identity)</h2>
              <p className="text-xs text-slate-500">
                تعديل اسم المنصة، الشعار، الألوان الرئيسية، ونصوص الترحيب وأزرار الدعوة للإجراء (No-Code Branding).
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ الهوية</span>
          </button>
        </div>

        {notice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notice}</span>
          </div>
        )}
      </div>

      {/* 2. Platform Names & Descriptions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Type className="w-4 h-4 text-emerald-600" />
          <span>الاسم والنصوص التعريفية الأساسية</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">اسم المنصة:</label>
            <input
              type="text"
              value={formData.platformName}
              onChange={(e) => setFormData((p) => ({ ...p, platformName: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">الشعار اللفظي (Tagline):</label>
            <input
              type="text"
              value={formData.platformTagline}
              onChange={(e) => setFormData((p) => ({ ...p, platformTagline: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">الوصف العام للمنصة:</label>
            <textarea
              rows={2}
              value={formData.platformDescription}
              onChange={(e) => setFormData((p) => ({ ...p, platformDescription: e.target.value }))}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* 3. Logo & Visual Colors */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Palette className="w-4 h-4 text-violet-600" />
          <span>الشعار ونظام الألوان</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">رمز أيقونة الشعار (Logo Badge Text):</label>
            <input
              type="text"
              maxLength={4}
              value={formData.logoText}
              onChange={(e) => setFormData((p) => ({ ...p, logoText: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="سـ"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">حرف أو رمزان يظهران في الشارة العلوية للمنصة</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">رابط صورة الشعار (Logo Image URL):</label>
            <input
              type="url"
              value={formData.logoImageUrl}
              onChange={(e) => setFormData((p) => ({ ...p, logoImageUrl: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 font-mono"
              placeholder="https://example.com/logo.svg (اختياري)"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">رابط صورة بصيغة HTTPS يتم استخدامها كشعار</span>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-2">اللون الرئيسي المميز للمنصة (Theme Accent Color):</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, logoColor: c.id }))}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                    formData.logoColor === c.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${c.bg} shrink-0`} />
                  <span className="text-xs font-bold">{c.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Call-To-Action & Hero Texts */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Layout className="w-4 h-4 text-blue-600" />
          <span>نصوص شريط الدعوة والواجهة الرئيسية (CTA & Greetings)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">نص زر الإجراء الرئيسي (Hero CTA):</label>
            <input
              type="text"
              value={formData.heroCtaText}
              onChange={(e) => setFormData((p) => ({ ...p, heroCtaText: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">رسالة الترحيب للمستخدمين:</label>
            <input
              type="text"
              value={formData.welcomeMessage}
              onChange={(e) => setFormData((p) => ({ ...p, welcomeMessage: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">النص الفرعي للواجهة الرئيسية (Hero Subtitle):</label>
            <input
              type="text"
              value={formData.heroSubtitleText}
              onChange={(e) => setFormData((p) => ({ ...p, heroSubtitleText: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 5. Live Brand Preview */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>معاينة حية للمظهر الجديد</span>
          </span>
          <span className="text-[10px] text-slate-500">Live Preview</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shadow-sm">
            {formData.logoImageUrl ? (
              <img src={formData.logoImageUrl} alt="Logo" className="w-6 h-6 object-contain" />
            ) : (
              formData.logoText
            )}
          </div>
          <div>
            <h4 className="text-base font-bold text-white">{formData.platformName}</h4>
            <p className="text-xs text-slate-400">{formData.platformTagline}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
          <p className="text-xs text-slate-200 leading-relaxed">{formData.heroSubtitleText}</p>
          <div className="pt-2">
            <button
              type="button"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5"
            >
              <span>{formData.heroCtaText}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
