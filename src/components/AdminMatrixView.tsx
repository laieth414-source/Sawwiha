import React, { useState } from 'react';
import { Sliders, Shield, Database, Cpu, DollarSign, Bell, Megaphone, Terminal } from 'lucide-react';
import { AdminSettingItem } from '../types';

export const AdminMatrixView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const adminSettings: AdminSettingItem[] = [
    {
      category: 'ai',
      field: 'aiEngine.activeModel',
      description: 'اختيار طراز الذكاء الاصطناعي النشط (مثل gemini-2.5-flash أو gemini-2.5-pro)',
      dynamicValueType: 'string (Dropdown selector)',
      noCodeBenefit: 'التبديل الفوري بين الطرازات السريعة أو المتقدمة دون إعادة نشر الكود أو توقف الخدمة.',
    },
    {
      category: 'ai',
      field: 'aiEngine.systemInstruction',
      description: 'التعليمات التأسيسية الشاملة وموجهات التصميم (System Prompt & Master Rules)',
      dynamicValueType: 'text (Rich Markdown Editor)',
      noCodeBenefit: 'تعديل أسلوب الأكواد البرمجية، الألوان الافتراضية، ومكتبات التصميم المعتمدة في ثوانٍ.',
    },
    {
      category: 'ai',
      field: 'aiEngine.temperature & maxTokens',
      description: 'درجة حرارة الإبداع وحدود الرموز المخرجة لكل طلب بناء',
      dynamicValueType: 'numbers (Sliders)',
      noCodeBenefit: 'معايرة دقة الكود وسرعة التوليد وتفادي إسهاب النصوص الزائد برمجياً.',
    },
    {
      category: 'plans',
      field: 'plans[].priceMonthly & priceYearly',
      description: 'تسعير الاشتراكات والخطط الشهرية والسنوية والعملة المعروضة',
      dynamicValueType: 'number & string currency',
      noCodeBenefit: 'إطلاق عروض وتخفيضات موسمية أو تعديل الأسعار بنقرة واحدة.',
    },
    {
      category: 'plans',
      field: 'plans[].limits (maxProjects, maxGenerations)',
      description: 'الحدود الرقمية المفروضة على كل باقة (عدد المشاريع، رصيد رسائل الذكاء الاصطناعي)',
      dynamicValueType: 'integer inputs',
      noCodeBenefit: 'حماية الميزانية الصفرية وتعديل الحصص فوراً استجابة لمعدل الاستهلاك دون تعديل برمجيات الحساب.',
    },
    {
      category: 'features',
      field: 'plans[].features.allowGithubExport',
      description: 'تفعيل أو تعطيل ميزة التصدير المباشر لـ GitHub حسب نوع الباقة',
      dynamicValueType: 'boolean toggle',
      noCodeBenefit: 'جعل التصدير ميزة حصرية للباقات المدفوعة أو فتحها للجميع كعرض ترويجي مؤقت.',
    },
    {
      category: 'features',
      field: 'plans[].features.allowNetlifyExport',
      description: 'تفعيل أو تعطيل النشر السحابي التلقائي إلى Netlify',
      dynamicValueType: 'boolean toggle',
      noCodeBenefit: 'التحكم التام في إتاحة مزودي الاستضافة الخارجية.',
    },
    {
      category: 'monetization',
      field: 'branding.showPoweredByWatermark',
      description: 'إظهار أو إخفاء شارة «صُنع بواسطة سَوّيها» في تذييل المواقع المنشورة',
      dynamicValueType: 'boolean per plan',
      noCodeBenefit: 'نشر العلامة التجارية في الخطط المجانية كرافد تسويقي ومنح مستخدمي Pro خيار إخفائها.',
    },
    {
      category: 'ads',
      field: 'adSlots.footerBannerContent',
      description: 'محتوى ونصوص وروابط الإعلانات أو الشركاء في المواقع المجانية',
      dynamicValueType: 'object (HTML/Text + Sponsor Link)',
      noCodeBenefit: 'إدارة وتفعيل عقود الرعاية أو إعلانات المنصة دون لمس كود الواجهات.',
    },
    {
      category: 'cms',
      field: 'announcementBanner',
      description: 'شريط التنبيهات والإعلانات العام في أعلى المنصة مع زر الإجراء واللون',
      dynamicValueType: 'object (enabled, text, link, color)',
      noCodeBenefit: 'إشعار كافة المستخدمين بالتحديثات أو أعمال الصيانة الدورية دون أي تعديل كود.',
    },
    {
      category: 'users',
      field: 'users[uid].role & status',
      description: 'ترقية المستخدمين لأدوار الإدارة أو تعليق وحظر الحسابات المسيئة',
      dynamicValueType: 'select (user, admin, owner, suspended)',
      noCodeBenefit: 'إدارة مجتمع المنصة وحماية الموارد من الحسابات الوهمية أو الاستخدام الضار.',
    },
    {
      category: 'security',
      field: 'platform.maintenanceMode & emergencyAiKillSwitch',
      description: 'وضع الصيانة الشامل ومفتاح طوارئ إيقاف الذكاء الاصطناعي',
      dynamicValueType: 'boolean toggle with instant effect',
      noCodeBenefit: 'عزل المنظومة فورياً عند حدوث ضغط غير متوقع على الحصص دون الحاجة لإيقاف خادم Cloud Run.',
    },
  ];

  const categories = [
    { id: 'all', label: 'الكل (12 إعداد)', icon: Sliders },
    { id: 'ai', label: 'محرك الذكاء الاصطناعي', icon: Cpu },
    { id: 'plans', label: 'الخطط والأسعار والحدود', icon: DollarSign },
    { id: 'features', label: 'مفاتيح الميزات (Feature Flags)', icon: Shield },
    { id: 'ads', label: 'الإعلانات والرعايات', icon: Megaphone },
    { id: 'cms', label: 'التنبيهات والمحتوى', icon: Bell },
    { id: 'security', label: 'الأمان وحالات الطوارئ', icon: Terminal },
  ];

  const filtered = selectedCategory === 'all'
    ? adminSettings
    : adminSettings.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full mb-2">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>المبدأ الهندسي الصارم لمنصة «سَوّيها»</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            مصفوفة تحكم المالك الشاملة (No-Code Admin Control Matrix)
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-4xl leading-relaxed">
            تمت هندسة معمارية البيانات لتكون جميع الإعدادات الحاكمة مستندة إلى وثيقة التكوين المركزية
            <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-800 dir-ltr">
              settings/platform_config
            </code>
            في Firestore، بحيث يدير المالك المنظومة بنسبة 100% دون كتابة أو تعديل سطر برمجي واحد في الإدارة اليومية.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Table / Cards */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {item.field}
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    {item.dynamicValueType}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                  {item.description}
                </h3>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600 bg-slate-50/50 p-2 rounded-lg">
                <Sliders className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">ميزة الإدارة بدون كود: </span>
                  {item.noCodeBenefit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
