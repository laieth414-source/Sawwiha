import React from 'react';
import { Palette, Type, MessageSquare, Check, X, Sparkles } from 'lucide-react';

export const BrandGuideView: React.FC = () => {
  const colors = [
    { name: 'الزمردي الأساسي (Brand Emerald)', hex: '#059669', tailwind: 'emerald-600', role: 'اللون الأيقوني للعلامة، يرمز للإنجاز والذكاء والنمو' },
    { name: 'الزمردي الفاتح التفاعلي', hex: '#10B981', tailwind: 'emerald-500', role: 'أزرار التوليد الرئيسية، حالات النجاح، والتركيز' },
    { name: 'الكربوني الليلي (Deep Canvas)', hex: '#090D16', tailwind: 'slate-950', role: 'شاشات الأستوديو الداكنة، والتباين الاحترافي الفائق' },
    { name: 'الرمادي الناعم (Base Surface)', hex: '#F8FAFC', tailwind: 'slate-50', role: 'الخلفية الرسمية للوحة التحكم وبطاقات العمل' },
    { name: 'الحبر الكحلي (Primary Ink)', hex: '#0F172A', tailwind: 'slate-900', role: 'عناوين الواجهات والنصوص الرئيسية عالية التباين' },
  ];

  const slogans = [
    {
      slogan: '«عندك فكرة؟ سَوّيها.»',
      role: 'الشعار الرئيسي للمنصة (Hero Headline)',
      usage: 'يُستخدم في مقدمة الصفحة الرئيسية، لافتات الترحيب، والحملات الترويجية الأساسية.',
    },
    {
      slogan: '«فكرتك؟ سَوّيها.»',
      role: 'الشعار التفاعلي السريع (Micro-Copy)',
      usage: 'يُستخدم كـ Placeholder داخل حقول إدخال الأوامر النصية وتلميحات الأزرار.',
    },
    {
      slogan: '«اكتب فكرتك وسَوّيها.»',
      role: 'شعار الدعوة للعمل (Call-to-Action)',
      usage: 'يُستخدم على زر التوليد في الاستوديو وشاشات إنشاء موقع جديد.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Brand Identity Intro */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-6 mb-6">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            دليل الهوية البصرية ونظام التصميم
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">
            الهوية البصرية ونبرة النصوص لمنصة «سَوّيها»
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            صُممت الهوية لتكون عملية، تقنية، واثقة، ومباشرة تبتعد عن المبالغات التسويقية وتركّز على سرعة تحويل الفكرة إلى واقع.
          </p>
        </div>

        {/* Colors Palette */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-600" />
            <span>لوحة الألوان الأساسية المعتمدة (Color Palette)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {colors.map((c, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="h-20 w-full" style={{ backgroundColor: c.hex }} />
                <div className="p-3">
                  <div className="font-bold text-slate-900 text-xs">{c.name}</div>
                  <div className="font-mono text-[11px] text-slate-500 mt-0.5">{c.hex}</div>
                  <div className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{c.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Section */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Type className="w-4 h-4 text-emerald-600" />
            <span>منظومة الخطوط المعتمدة (Typography)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-semibold text-emerald-700 block mb-1">الخط العربي الأساسي</span>
              <div className="text-lg font-bold text-slate-900 mb-1">IBM Plex Sans Arabic</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                يمتاز بدقة هندسية عالية ووضوح فائق في أحجام الخط الصغيرة والكبيرة، مما يمنح التطبيق طابعاً تقنياً رصيناً واحترافياً.
              </p>
              <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-800">
                أبجد هوز حطي كلمن — سَوّيها في ثوانٍ معدودة.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-semibold text-emerald-700 block mb-1">الخط اللاتيني والأرقام</span>
              <div className="text-lg font-bold text-slate-900 mb-1">Plus Jakarta Sans & JetBrains Mono</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                مخصص للأرقام ومؤشرات الاستهلاك والمصطلحات البرمجية والكود المولد لضمان مقروئية كاملة.
              </p>
              <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-sm font-mono text-slate-800 dir-ltr">
                Sawwiha AI Builder v1.0.0 — 100% Tailwind CSS
              </div>
            </div>
          </div>
        </div>

        {/* Slogans & Tone of Voice */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>هوية النصوص والشعارات المستوحاة من اسم «سَوّيها»</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {slogans.map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
                <div className="text-base font-bold text-slate-900 mb-1 text-emerald-950">
                  {s.slogan}
                </div>
                <div className="text-xs font-semibold text-emerald-700 mb-1">
                  {s.role}
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {s.usage}
                </div>
              </div>
            ))}
          </div>

          {/* Dos & Don'ts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>قواعد النبرة المعتمدة (Do)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li>• استخدام «سَوّيها» في سياقات تحفيزية واضحة تشجع على الإنجاز.</li>
                <li>• عبارات أزرار صريحة ومباشرة: «سَوّ الموقع الآن»، «حدّث التصميم».</li>
                <li>• رسائل أخطاء مطمئنة تقترح الحل للمستخدم فوراً.</li>
                <li>• تركيز كامل على النتيجة: موقع حقيقي، كود نظيف، ونشر فوري.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-2">
                <X className="w-4 h-4 text-rose-600" />
                <span>المحظورات اللغوية (Don't)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li>• تجنب تكرار كلمة «سَوّيها» في كل جملة وزاوية حتى لا تفقد رونقها.</li>
                <li>• الابتعاد عن المصطلحات التسويقية المبتذلة ("ثورة خارقة"، "سحر الذكاء").</li>
                <li>• تجنب الرسائل التقنية الجافة أو كود الأخطاء الخام أمام الزائر.</li>
                <li>• تجنب النصوص الوهمية مثل Lorem Ipsum واستبدالها بنصوص واقعية عربية.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
