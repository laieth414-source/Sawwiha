import React, { useState } from 'react';
import { FeatureFlags } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { logAdminAction } from '../../firebase/auditLogService';
import {
  ToggleLeft,
  ToggleRight,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Globe,
  Github,
  Download,
  Users,
  FolderPlus,
  AlertTriangle,
  Layers,
  Sliders,
} from 'lucide-react';

interface AdminFeatureFlagsTabProps {
  featureFlags?: FeatureFlags;
  onSave: (flags: FeatureFlags) => Promise<void>;
  saving: boolean;
}

export const AdminFeatureFlagsTab: React.FC<AdminFeatureFlagsTabProps> = ({
  featureFlags,
  onSave,
  saving,
}) => {
  const { user } = useAuth();

  const defaultFlags: FeatureFlags = {
    aiBuilder: true,
    aiEditing: true,
    aiRepair: true,
    publish: true,
    githubExport: true,
    zipDownload: true,
    userRegistration: true,
    projectCreation: true,
    maintenanceMode: false,
    customDomains: true,
    templatesLibrary: true,
    showcase: true,
    community: true,
    seoTools: true,
  };

  const [flags, setFlags] = useState<FeatureFlags>({
    ...defaultFlags,
    ...(featureFlags || {}),
  });

  const [notice, setNotice] = useState<string | null>(null);

  const toggleFlag = (key: keyof FeatureFlags) => {
    setFlags((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setNotice(null);
    try {
      await onSave(flags);

      if (user) {
        await logAdminAction({
          action: 'feature_flag',
          targetEntity: 'feature_flags',
          targetId: 'platform_flags',
          targetName: 'قواطع الميزات (Feature Flags)',
          summary: `تحديث قواطع الميزات ومفاتيح التشغيل للمنصة`,
          details: { ...flags },
          adminId: user.uid,
          adminEmail: user.email || 'owner',
        });
      }

      setNotice('تم حفظ قواطع الميزات بنجاح، التغييرات سارية على واجهات المنصة فوراً.');
      setTimeout(() => setNotice(null), 4000);
    } catch {
      // Handled by parent
    }
  };

  const flagItems: {
    key: keyof FeatureFlags;
    title: string;
    description: string;
    category: 'ai' | 'distribution' | 'platform';
    icon: React.FC<{ className?: string }>;
    danger?: boolean;
  }[] = [
    {
      key: 'aiBuilder',
      title: 'مُولّد المواقع بالذكاء الاصطناعي (AI Builder)',
      description: 'السماح للمستخدمين بإنشاء وتوليد كود المواقع عبر وصف الفكرة الأولي.',
      category: 'ai',
      icon: Sparkles,
    },
    {
      key: 'aiEditing',
      title: 'محادثة تعديل الكود (AI Studio Editing)',
      description: 'تمكين المحادثة الذكية لتعديل وإضافة أقسام داخل الاستوديو.',
      category: 'ai',
      icon: Sparkles,
    },
    {
      key: 'aiRepair',
      title: 'الفحص والإصلاح الذكي (AI Repair)',
      description: 'أداة الفحص البصري التلقائي للأخطاء وتصحيح التجاوب والوسوم.',
      category: 'ai',
      icon: Sparkles,
    },
    {
      key: 'publish',
      title: 'النشر المباشر السحابي (Live Publishing)',
      description: 'إتاحة نشر المواقع بروابط مستقلة سريعة للجمهور.',
      category: 'distribution',
      icon: Globe,
    },
    {
      key: 'githubExport',
      title: 'تصدير ومزامنة GitHub',
      description: 'تصدير الكود المصدري وربطه بمستودع GitHub مباشرة.',
      category: 'distribution',
      icon: Github,
    },
    {
      key: 'zipDownload',
      title: 'تنزيل حزمة المشروع (Download ZIP)',
      description: 'تجهيز وتنزيل ملف الكود HTML والملفات كاملة في أرشيف مضغوط.',
      category: 'distribution',
      icon: Download,
    },
    {
      key: 'showcase',
      title: 'معرض المواقع العام (Showcase Gallery)',
      description: 'إتاحة تصفح ومشاركة المواقع المعتمدة في المعرض العام للمجتمع.',
      category: 'distribution',
      icon: Sparkles,
    },
    {
      key: 'customDomains',
      title: 'ربط النطاقات المخصصة (Custom Domains)',
      description: 'إتاحة إعداد وفحص سجلات DNS لربط نطاقات خاصة بمشاريع المستخدمين.',
      category: 'distribution',
      icon: Globe,
    },
    {
      key: 'seoTools',
      title: 'أدوات السيو وبطاقات المشاركة (SEO Tools)',
      description: 'تخصيص وسوم الميتا، عناوين البحث، بطاقات OpenGraph، وملفات robots/sitemap.',
      category: 'distribution',
      icon: Layers,
    },
    {
      key: 'userRegistration',
      title: 'السماح بتسجيل حسابات جديدة',
      description: 'فتح أو إغلاق إمكانية إنشاء حسابات جديدة للزوار.',
      category: 'platform',
      icon: Users,
    },
    {
      key: 'projectCreation',
      title: 'السماح بإنشاء مشاريع جديدة',
      description: 'تمكين المستخدمين الحاليين من بدء مشاريع ويب جديدة.',
      category: 'platform',
      icon: FolderPlus,
    },
    {
      key: 'maintenanceMode',
      title: 'وضع الصيانة العام (Maintenance Mode)',
      description: 'تحويل المنصة إلى صفحة صيانة مؤقتة لجميع الزوار باستثناء المالك.',
      category: 'platform',
      icon: AlertTriangle,
      danger: true,
    },
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Header & Save */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">إدارة قواطع الميزات (Feature Flags)</h2>
              <p className="text-xs text-slate-500">
                تشغيل أو إيقاف أي ميزة برمجية في المنصة لحظياً بدون لمس الكود البرمجي (No-Code Feature Management).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ قواطع الميزات</span>
          </button>
        </div>

        {notice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notice}</span>
          </div>
        )}
      </div>

      {/* 2. Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flagItems.map((item) => {
          const Icon = item.icon;
          const isEnabled = flags[item.key];

          return (
            <div
              key={item.key}
              onClick={() => toggleFlag(item.key)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                isEnabled
                  ? item.danger
                    ? 'bg-rose-50/50 border-rose-300 hover:bg-rose-50'
                    : 'bg-white border-emerald-200/80 shadow-2xs hover:border-emerald-300'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70 opacity-80'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isEnabled
                        ? item.danger
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed pr-9">{item.description}</p>
              </div>

              <div className="shrink-0 pt-0.5">
                <span
                  className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    isEnabled
                      ? item.danger
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isEnabled ? 'مفعلة' : 'معطلة'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
