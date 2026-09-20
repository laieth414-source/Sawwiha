import React, { useState } from 'react';
import { CheckCircle2, Clock, Calendar, ArrowLeft, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { RoadmapPhase } from '../types';

export const RoadmapView: React.FC = () => {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

  const phases: RoadmapPhase[] = [
    {
      id: 0,
      title: 'المرحلة 0: التخطيط والتأسيس',
      subtitle: 'هندسة المعمارية، مصفوفة الإدارة الشاملة، والوثيقة التأسيسية (الحالية)',
      status: 'active',
      keyPrinciple: 'أي وظيفة أو إعداد يمكن منطقياً التحكم به من لوحة الإدارة يجب تصميمه ديناميكياً منذ البداية.',
      deliverables: [
        'إعداد الوثيقة التأسيسية الشاملة SAWWIHA_FOUNDATION.md واعتمادها كمرجع صارم.',
        'تصميم رحلة المستخدم الكاملة من تسجيل الدخول إلى التوليد والنشر والتصدير.',
        'صياغة الهوية البصرية (الزمردي، الكربوني النقي) وخطوط IBM Plex Sans Arabic.',
        'وضع نبرة النصوص المشتقة من «سَوّيها» («عندك فكرة؟ سَوّيها.») بحرفية ودون ابتذال.',
        'هندسة معمارية قواعد البيانات وقواعد أمان Firestore ومجموعات platform_config وusers وprojects وplans.',
        'تحديد مصفوفة التحكم للمالك (Admin Control Center) لضمان إدارة المنصة دون لمس الكود.',
        'صياغة استراتيجية الميزانية الصفرية (Zero-Budget Strategy) باستغلال الباقات المجانية.',
      ],
    },
    {
      id: 1,
      title: 'المرحلة 1: أساس المنصة (Platform Core Shell)',
      subtitle: 'البنية الأساسية، نظام المصادقة، واللوحة الشخصية',
      status: 'upcoming',
      keyPrinciple: 'هيكل بيانات متين ونظام مستخدمين محكم عبر Firebase Auth وFirestore.',
      deliverables: [
        'تأسيس واجهة الصفحة الرئيسية (Landing Page) وبوابة تسجيل الدخول والتسجيل.',
        'تكامل Firebase Authentication (بريد إلكتروني، كلمة مرور، وحساب Google).',
        'تطبيق نموذج الصلاحيات (RBAC) وأدوار المستخدمين (Owner, Admin, Pro, Free).',
        'بناء لوحة المستخدم (Dashboard) مع شبكة المشاريع وحالة الاستهلاك والاشتراك.',
        'ربط مستند إعدادات المنصة الديناميكي settings/platform_config بالواجهة.',
      ],
    },
    {
      id: 2,
      title: 'المرحلة 2: محرك بناء المواقع (AI Website Builder)',
      subtitle: 'تحويل الأفكار النصية إلى مواقع متكاملة عبر Gemini API',
      status: 'planned',
      keyPrinciple: 'كود HTML5 نقي ومتجاوب مع Tailwind CSS وأيقونات SVG بدون كسر.',
      deliverables: [
        'ربط محرك Gemini API خادمياً بصيغة آمنة مع دعم الدفق الحي (Streaming).',
        'صياغة الـ Master Prompt لتوليد مواقع عربية وإنجليزية عالية الدقة والجمال.',
        'بناء معالج الأخطاء ومطهر الكود التلقائي (Code Sanitizer) لإزالة شوائب الـ Markdown.',
        'دعم التوليد الفوري للمحتوى الحقيقي المناسب لنوع النشاط بدون لوريم إيبسوم.',
      ],
    },
    {
      id: 3,
      title: 'المرحلة 3: استوديو التحرير التفاعلي (Studio + Editor)',
      subtitle: 'المعاينة الحية، المساعد الحواري، وسجل التعديلات والإصلاح الذكي',
      status: 'planned',
      keyPrinciple: 'بيئة عرض معزولة (Sandboxed Iframe) ومحادثة جانبية سياقية لإجراء أي تعديل.',
      deliverables: [
        'بناء شاشة الاستوديو المتجاوبة مع مبدل الشاشات (مكتبي / تابلت / جوال).',
        'المساعد الحواري الذكي (AI Chat Modifier) لتعديل أي عنصر أو قسم في الموقع.',
        'تطبيق نظام سجل النسخ (Version History) مع إمكانية التراجع والتقدم اللحظي (Undo/Redo).',
        'تفعيل ميزة مضاعفة المشروع (Duplicate Project) لتجربة تعديلات بديلة.',
        'زر الإصلاح الذكي (AI Auto-Repair) لتشخيص ومعالجة أي خطأ في الكود برمجياً.',
      ],
    },
    {
      id: 4,
      title: 'المرحلة 4: النشر والتصدير (Publish + GitHub + Download)',
      subtitle: 'محركات إطلاق المواقع والملكية الكاملة للكود للمستخدم',
      status: 'planned',
      keyPrinciple: 'لا احتكار (Zero Vendor Lock-in): الكود يملكه المستخدم ويعمل في أي مكان.',
      deliverables: [
        'إطلاق محرك النشر الفوري برابط فريد (sawwiha.app/sites/:slug).',
        'توليد وتحميل حزمة الكود البرمجي الكامل كملف ZIP بضغطة زر واحدة.',
        'تكامل GitHub OAuth لتصدير الموقع كمستودع مستقل لحساب المستخدم.',
        'تكامل النشر المباشر السحابي على Netlify مع دعم إضافات مستقبلية (Vercel).',
      ],
    },
    {
      id: 5,
      title: 'المرحلة 5: الخطط والاشتراكات (Plans + Monetization)',
      subtitle: 'نظام إدارة الخطط الرقمية والحدود المفروضة ديناميكياً',
      status: 'planned',
      keyPrinciple: 'التحكم التام في أسعار وميزات وحدود كل باقة من لوحة المالك دون لمس الكود.',
      deliverables: [
        'تفعيل مصفوفة الحدود الرقمية لكل باقة (عدد المشاريع، رصيد رسائل الذكاء الاصطناعي).',
        'شاشات ترقية الحساب وجدول مقارنة الخطط المرن.',
        'ربط مؤقت لبوابات الدفع الإلكتروني أو الترقية اليدوية من قبل المالك.',
        'شعار «صُنع بواسطة سَوّيها» المشروط بالخطة المجانية وقابلية إزالته للمحترفين.',
      ],
    },
    {
      id: 6,
      title: 'المرحلة 6: لوحة تحكم المالك المتقدمة (Advanced Admin)',
      subtitle: 'مركز القيادة والتحكم الشامل بجميع مفاصل المنصة No-Code Hub',
      status: 'planned',
      keyPrinciple: 'تمكين المالك من إدارة وتخصيص كل باراميتر في النظام لحظياً وبكل استقلالية.',
      deliverables: [
        'محرر موجهات ونماذج الذكاء الاصطناعي (AI Models & Prompt Manager).',
        'محرر الخطط والأسعار والحدود والميزات (Plans & Limits Manager).',
        'نظام إدارة المستخدمين، الأدوار، وتجميد الحسابات (User CRM & Ban Controls).',
        'إدارة الإعلانات والشارات وشريط التنبيهات العام (Announcements & Ad Slots).',
        'مفتاح وضع الصيانة الفوري ومفتاح طوارئ إيقاف الذكاء الاصطناعي (Kill-Switch).',
        'لوحة التحليلات والإحصائيات الحية لأداء المنظومة.',
      ],
    },
    {
      id: 7,
      title: 'المرحلة 7: الاحتراف والتوسع (Professional Polish & Scale)',
      subtitle: 'القوالب الجاهزة، المتجر المجتمعي، والدومينات المخصصة',
      status: 'planned',
      keyPrinciple: 'تحويل سَوّيها إلى بيئة متكاملة تدعم المبدعين والوكالات وتتوسع ذاتياً.',
      deliverables: [
        'معرض القوالب الجاهزة المعتمدة للأعمال المختلفة مع ميزة الاستنساخ بنقرة واحدة.',
        'بنية متجر المجتمع (Templates Marketplace) لمشاركة وتداول القوالب.',
        'دعم ربط النطاقات المخصصة (Custom Domains) للمواقع المنشورة.',
        'مولد السيو التلقائي (Auto SEO & Social Meta Generator) لكل موقع منشور.',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-fit mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>خارطة طريق التطوير المتسلسل للمشروع</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              خارطة المراحل الثمانية لمنصة «سَوّيها»
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              تم تقسيم المشروع إلى 8 مراحل مدروسة بعناية لضمان البناء الرصين خطوة بخطوة بدءاً من التأسيس الصارم وحتى التوسع الاحترافي.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="text-xs text-slate-500">المرحلة الجارية</div>
              <div className="text-sm font-bold text-slate-900">المرحلة 0: التخطيط والتأسيس</div>
            </div>
          </div>
        </div>

        {/* Phases Accordion / Timeline */}
        <div className="mt-8 space-y-4">
          {phases.map((phase) => {
            const isExpanded = expandedPhase === phase.id;
            const isActive = phase.status === 'active';
            const isUpcoming = phase.status === 'upcoming';

            return (
              <div
                key={phase.id}
                id={`phase-card-${phase.id}`}
                className={`border rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                    : isUpcoming
                    ? 'border-blue-200 bg-blue-50/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : isUpcoming
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {phase.id}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">
                          {phase.title}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            المرحلة الحالية المعتمدة
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            المرحلة القادمة
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{phase.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                      {phase.deliverables.length} مخرجات أساسية
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-sm">
                    {/* Key Principle */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-700 mb-4 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">المبدأ الأساسي للمرحلة: </span>
                        {phase.keyPrinciple}
                      </div>
                    </div>

                    <h4 className="font-semibold text-slate-900 mb-2.5 text-xs text-slate-500 uppercase tracking-wider">
                      المخرجات والتسليمات المعتمدة:
                    </h4>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {phase.deliverables.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isActive ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
