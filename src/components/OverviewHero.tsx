import React from 'react';
import { Sparkles, Layers, Sliders, ShieldCheck, ArrowLeft, CheckCircle, Database, Cpu, Globe, Rocket } from 'lucide-react';
import { TabType } from '../types';

interface OverviewHeroProps {
  onNavigate: (tab: TabType) => void;
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>مشروع «سَوّيها» — منصة إنشاء المواقع بالذكاء الاصطناعي</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            عندك فكرة؟ <span className="text-emerald-600">سَوّيها.</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            مرحباً بك في وثيقة وبوابة <strong>المرحلة 0: التخطيط والتأسيس</strong>. تم إنجاز التوثيق المعماري، وتحديد هيكل البيانات، ومصفوفة تحكم المالك الديناميكية، وخارطة المراحل الثمانية لتكون الأساس الراسخ للمراحل القادمة.
          </p>

          {/* Strict Principle Card */}
          <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white flex items-start gap-3 text-xs sm:text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-400 block mb-0.5">المبدأ الهندسي الصارم:</span>
              أي إعداد أو وظيفة يمكن منطقيًا جعلها قابلة للتحكم من لوحة Admin يجب تصميمها منذ البداية بطريقة تسمح بذلك، حتى لا يحتاج مالك المنصة إلى تعديل الكود لإدارتها اليومية.
            </div>
          </div>

          {/* Real Firebase Connection Badge */}
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="font-bold">مشروع Firebase الحقيقي مثبت:</span>
              <code className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 font-semibold text-emerald-800">
                mnasat-sawiha
              </code>
              <span className="text-emerald-700 hidden sm:inline">— جاهز لـ Authentication و Cloud Firestore</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
              اتصال مباشر
            </span>
          </div>

          {/* Quick Action Navigation */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              id="hero-go-doc-btn"
              onClick={() => onNavigate('doc')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-xs"
            >
              <span>قراءة الوثيقة التأسيسية الشاملة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              id="hero-go-roadmap-btn"
              onClick={() => onNavigate('roadmap')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-600" />
              <span>خارطة المراحل الثمانية</span>
            </button>

            <button
              id="hero-go-admin-btn"
              onClick={() => onNavigate('admin-matrix')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>مصفوفة تحكم المالك No-Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Stage 0 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
            01
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">الوثيقة التأسيسية المعتمدة</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            وثيقة شاملة من 21 بنداً تغطي كل تفصيلة هندسية وتجربة مستخدم وقواعد حماية.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm mb-3">
            02
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">لوحة تحكم كاملة للمالك</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            تصميم ديناميكي في Firestore يتيح التحكم بالأسعار، النماذج، والحدود دون لمس الكود.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm mb-3">
            03
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">استراتيجية الميزانية الصفرية</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            بناء المنصة بالكامل اعتماداً على الباقات المجانية لـ Firebase وGemini وNetlify وGitHub.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
            04
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">هوية بصرية ونصوص واثقة</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            لوحة ألوان زمردية راقية، خطوط IBM Plex Sans Arabic، ونبرة تحفيزية احترافية بدون ابتذال.
          </p>
        </div>
      </div>

      {/* User Journey Linear Stepper */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              رحلة وتجربة المستخدم المخططة (End-to-End Journey)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              كيف سينتقل المستخدم من الفكرة المجردة إلى موقع حي منشور في أقل من دقيقة
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            سلسلة خطية متكاملة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { step: '1', title: 'كتابة الفكرة', desc: '«عندك فكرة؟ سَوّيها.» إدخال النص في حقل بسيط.' },
            { step: '2', title: 'التوليد الذكي', desc: 'معالجة Gemini Flash وبث الكود HTML + Tailwind حياً.' },
            { step: '3', title: 'المعاينة الحية', desc: 'عرض الموقع داخل إطار معزول مع مبدل الشاشات.' },
            { step: '4', title: 'المحادثة والتعديل', desc: 'طلب أي تعديلات بلهجة طبيعية مع حفظ النسخ.' },
            { step: '5', title: 'النشر والتصدير', desc: 'رابط مباشر، مستودع GitHub، أو تحميل ملف ZIP.' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 relative">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-2">
                {item.step}
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">{item.title}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
