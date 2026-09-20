import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  Monitor,
  Smartphone,
  Zap,
  Globe2,
  Code2,
  Utensils,
  ShoppingBag,
  Briefcase,
  Building2,
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Settings,
} from 'lucide-react';

interface LandingHeroViewProps {
  onNavigateToDashboard: () => void;
  onNavigateToBuilder?: (prompt?: string) => void;
  onNavigateToShowcase?: () => void;
  onNavigateToPricing?: () => void;
  onAdminLoginClick?: () => void;
}

export const LandingHeroView: React.FC<LandingHeroViewProps> = ({
  onNavigateToDashboard,
  onNavigateToBuilder,
  onNavigateToShowcase,
  onNavigateToPricing,
  onAdminLoginClick,
}) => {
  const {
    user,
    allPlans,
    currentPlan,
    isOwner,
    openAuthModal,
    openUpgradeModal,
    platformSettings,
  } = useAuth();
  const [ideaPrompt, setIdeaPrompt] = useState('');

  // Active plans only for public visitors/home page
  const activePlans = (allPlans || []).filter((p) => p.isActive);

  const handleStartIdea = (customText?: string) => {
    const text = customText || ideaPrompt;
    if (onNavigateToBuilder) {
      onNavigateToBuilder(text.trim());
    } else if (!user) {
      openAuthModal('register');
    } else {
      onNavigateToDashboard();
    }
  };

  const inspirationPresets = [
    {
      title: 'مطعم ومقهى عراقي',
      prompt: 'أريد موقع لمطعم عراقي حديث يقدم أطباقاً تقليدية بلمسة عصرية، مع قائمة طعام وحجز طاولات وأزرار واتساب.',
      icon: Utensils,
    },
    {
      title: 'متجر عطور وبخور',
      prompt: 'متجر عطور شرقية وبخور فاخر بتصميم هادئ ومينيمالي، مع استعراض المنتجات وسلة مشتريات وتواصل سريع.',
      icon: ShoppingBag,
    },
    {
      title: 'معرض أعمال مصمم',
      prompt: 'معرض أعمال شخصي لمصمم واجهات رقمية ومطور ويب لعرض المشاريع المنجزة ونموذج استشارة عمل.',
      icon: Briefcase,
    },
    {
      title: 'شركة استشارات وتقنية',
      prompt: 'موقع تعريفي لشركة استشارات رقمية وحلول برمجية مع استعراض الخدمات، باقات الأسعار، وآراء العملاء.',
      icon: Building2,
    },
  ];

  return (
    <div className="space-y-20 py-4 text-right" dir="rtl">
      {/* 1. HERO SECTION */}
      <section className="max-w-4xl mx-auto px-4 pt-8 pb-4 text-center space-y-6">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>منصة إنشاء المواقع بالذكاء الاصطناعي</span>
        </div>

        {/* Main Brand Core Message */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.2]">
            عندك فكرة؟ <span className="text-emerald-600">سَوّيها.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            حوّل أفكارك إلى مواقع إلكترونية متكاملة وتفاعلية في دقائق معدودة. بدون برمجة، بدون تعقيد، وبدعم كامل للغة العربية.
          </p>
        </div>

        {/* Interactive Central Idea Box */}
        <div className="max-w-2xl mx-auto bg-white p-3 rounded-2xl border border-slate-200 hover:border-emerald-500/80 focus-within:border-emerald-600 focus-within:ring-3 focus-within:ring-emerald-600/10 shadow-xs transition-all text-right">
          <textarea
            id="hero-idea-input"
            rows={3}
            value={ideaPrompt}
            onChange={(e) => setIdeaPrompt(e.target.value)}
            placeholder="شنو فكرة موقعك؟ (مثال: أريد موقع لمطعم عراقي حديث يقدم حجز طاولات وقائمة طعام وأزرار تواصل...)"
            className="w-full px-2 py-1.5 bg-transparent text-sm sm:text-base focus:outline-none text-slate-900 placeholder:text-slate-400 resize-none leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
            <span className="text-xs text-slate-400 hidden sm:inline-block pr-1">
              اكتب فكرتك بأي لهجة وكلمات بسيطة
            </span>
            <button
              id="hero-generate-btn"
              type="button"
              onClick={() => handleStartIdea()}
              className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>سَوّيها الآن</span>
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </button>
          </div>
        </div>

        {/* Quick Inspiration Pills */}
        <div className="space-y-2 pt-1">
          <p className="text-xs text-slate-400 font-medium">أفكار سريعة للتجربة بنقرة واحدة:</p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            {inspirationPresets.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIdeaPrompt(item.prompt);
                    handleStartIdea(item.prompt);
                  }}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200/60 text-slate-700 text-xs font-medium transition-all cursor-pointer"
                >
                  <IconComp className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 pt-3">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>معاينة فورية متجاوبة</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>عربية أصيلة 100%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تصدير وحفظ سحابي</span>
          </span>
        </div>

        {/* Admin Login Clear Button */}
        {onAdminLoginClick && (
          <div className="pt-2 flex items-center justify-center">
            <button
              id="hero-btn-admin-login"
              type="button"
              onClick={onAdminLoginClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white/95 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:border-slate-300"
              title="دخول لوحة إدارة المنصة (للمالك)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>دخول الإدارة</span>
            </button>
          </div>
        )}
      </section>

      {/* 2. WHAT SAWWIMA DOES (ماذا تفعل سَوّيها) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ماذا تفعل سَوّيها؟</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                من فكرة بكلماتك البسيطة إلى موقع كامل جاهز للنشر
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                بدل قضاء أسابيع بين كتابة التصاميم والبحث عن مبرمجين، «سَوّيها» تفهم ما يحتاجه مشروعك، تخطط الصفحات المناسبة، وتكتب كوداً متجاوباً وعصرياً يعمل بسلاسة على الهاتف وشاشات الكمبيوتر.
              </p>

              <div className="pt-2 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                    ✓
                  </div>
                  <span>تحليل ذكي لجمهور وفكرة مشروعك</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                    ✓
                  </div>
                  <span>هيكل صفحات كامل مع نصوص وأزرار اتصال تفاعلية</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                    ✓
                  </div>
                  <span>إمكانية معاينة الكود وتعديله وتطويره بالذكاء الاصطناعي</span>
                </div>
              </div>
            </div>

            {/* Right Visual Preview Simulation */}
            <div className="lg:col-span-7">
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                {/* Browser top chrome */}
                <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-0.5 rounded border border-slate-800">
                    sawwiha.app/preview/restaurant-demo
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Simulated Webpage Interface */}
                <div className="p-5 bg-slate-950 space-y-4 text-right select-none">
                  {/* Mock Navbar */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                        د
                      </div>
                      <span className="font-bold text-white text-xs">مطعم ومقهى دجلة</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                      <span className="text-white font-medium">الرئيسية</span>
                      <span>قائمة الطعام</span>
                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-medium text-[10px]">
                        طلب سريع
                      </span>
                    </div>
                  </div>

                  {/* Mock Hero */}
                  <div className="py-2 space-y-1.5 text-center max-w-sm mx-auto">
                    <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                      مأكولات عراقية أصيلة بلمسة حديثة
                    </span>
                    <h3 className="text-base font-bold text-white">طعم الأصالة في قلب بغداد</h3>
                    <p className="text-[11px] text-slate-400">
                      استمتع بأشهى المشاوي والأطباق التقليدية مع جلسات عائلية مميزة.
                    </p>
                    <div className="pt-1 flex justify-center gap-2">
                      <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium">
                        احجز طاولتك
                      </span>
                      <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium">
                        المنيو
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (كيف تعمل) */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-semibold bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200/80">
            <span>خطوات بسيطة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">كيف تعمل «سَوّيها»؟</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            ثلاث خطوات فقط تفصل بين فكرتك في رأسك وبين موقع إلكتروني يعمل فعلياً.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2.5 text-right">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-base flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">صِف فكرتك بكلماتك</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              اكتب نوع الموقع، الخدمات التي تقدمها، وما تريده داخل الموقع بلهجتك الطبيعية دون أي تعقيدات تقنية.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2.5 text-right">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-base flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">الذكاء الاصطناعي يبني</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              يحلل المحرك فكرتك، يخطط الأقسام والصفحات، ويكتب الكود البرمجي الكامل والمتجاوب في ثوانٍ معدودة.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2.5 text-right">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-base flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">عاين وانطلق للعالم</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              اختبر موقعك على الكمبيوتر والهاتف، اطلب تعديلات إضافية، وانسخ الكود أو احفظه بمشاريعك السحابية.
            </p>
          </div>
        </div>
      </section>

      {/* 4. EXAMPLES & SHOWCASE (أمثلة ومعاينات المواقع) */}
      <section id="examples" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-semibold bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200/80">
            <span>نماذج حقيقية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">مواقع تم إنشاؤها عبر «سَوّيها»</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            تصفح نماذج لمختلف القطاعات، وانقر على أي نموذج لتجربته وتعديله مباشرة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Example 1 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                  مطاعم وضيافة
                </span>
                <span className="text-xs text-slate-400">متجاوب</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">مطعم دجلة للمأكولات الحديثة</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                موقع مخصص للمطاعم مع قائمة وجبات تفاعلية، نموذج لحجز الطاولات، أزرار اتصال وواتساب مباشر، وتوافق مع أجهزة الجوال.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">جاهز للتخصيص</span>
              <button
                type="button"
                onClick={() => handleStartIdea('أريد موقع لمطعم عراقي حديث يقدم أطباقاً تقليدية بقائمة طعام وحجز طاولة.')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>سَوّي مثل هذا الموقع</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Example 2 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                  تجارة إلكترونية
                </span>
                <span className="text-xs text-slate-400">سلة وطلب</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">متجر مسك للعطور والبخور</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                واجهة متجر راقية لاستعراض باقات العطور، تصنيفات المنتجات، وتسهيل عملية الطلب عبر رسائل الواتساب مع حساب الأسعار.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">جاهز للتخصيص</span>
              <button
                type="button"
                onClick={() => handleStartIdea('متجر عطور شرقية وبخور فاخر بتصميم هادئ ومينيمالي وسلة مشتريات وتواصل.')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>سَوّي مثل هذا الموقع</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Example 3 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                  معرض أعمال شخصي
                </span>
                <span className="text-xs text-slate-400">بورتفوليو</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">استوديو مصمم واجهات ومطور ويب</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                معرض أعمال احترافي يبرز الأعمال السابقة، المهارات، شهادات العملاء، ونموذج سهل لطلب المشاريع والاستشارات.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">جاهز للتخصيص</span>
              <button
                type="button"
                onClick={() => handleStartIdea('معرض أعمال شخصي لمصمم ومطور واجهات لعرض المشاريع وسيرة المهارات.')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>سَوّي مثل هذا الموقع</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Example 4 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/80">
                  شركات ومؤسسات
                </span>
                <span className="text-xs text-slate-400">خدمات</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">شركة الرائد للاستشارات</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                موقع تعريفي لشركة استشارية يعرض رسالة الشركة، حلول الأعمال، جدول الأسعار، ونموذج حجز جلسة استشارية أولى.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">جاهز للتخصيص</span>
              <button
                type="button"
                onClick={() => handleStartIdea('موقع تعريفي لشركة استشارات رقمية وتقنية مع استعراض الخدمات وباقات الأسعار.')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>سَوّي مثل هذا الموقع</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Link to community showcase */}
        {onNavigateToShowcase && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onNavigateToShowcase}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 text-sm font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>استكشف المزيد في معرض ومجتمع المواقع العام</span>
              <ChevronLeft className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        )}
      </section>

      {/* 5. KEY FEATURES (المزايا الأساسية) */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-semibold bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200/80">
            <span>لماذا سَوّيها؟</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">مزايا صُممت لتناسب احتياجك</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            تجربة عربية أصيلة تجعل إطلاق موقعك سهلاً وسريعاً دون حواجز تقنية.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2 text-right">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">عربية أصيلة 100%</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              دعم كامل ومتقن للاتجاه من اليمين لليسار (RTL)، خطوط عربية جميلة، ونصوص واقعية تناسب بيئتنا وثقافتنا.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2 text-right">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">متجاوب لجميع الشاشات</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              كل موقع يتم إنشاؤه يتميز بتجاوب تلقائي تام مع الهواتف الذكية والأجهزة اللوحية وشاشات الكمبيوتر المكتبية.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2 text-right">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">سرعة فائقة في البناء</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              وفر أسابيع من الانتظار ومئات الدولارات. احصل على موقع متكامل في دقائق، وعدّل عليه بسهولة وقتما تشاء.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-2 text-right">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">تحكم كامل بالكود البرمجي</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              كود HTML5 و Tailwind CSS نظيف، يمكنك نسخه واستضافته على أي خادم تريده بدون أي قيود أو احتكار.
            </p>
          </div>
        </div>
      </section>

      {/* 6. REAL PLANS & PRICING (الخطط والأسعار من Firestore) */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-semibold bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200/80">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>باقات مرنة وواضحة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            الخطط والأسعار
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            اختر الخطة المناسبة لطموحك وحجم مشاريعك. ابدأ مجاناً بدون بطاقة دفع، وتوسّع وقتما تشاء.
          </p>

          {/* Owner Quick Edit Link */}
          {isOwner && onAdminLoginClick && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onAdminLoginClick}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
              >
                <Settings className="w-3 h-3 text-emerald-600" />
                <span>إدارة وتعديل الأسعار (لوحة الإدارة)</span>
              </button>
            </div>
          )}
        </div>

        {/* Real Plans Cards Grid or Respectful Empty State */}
        {activePlans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">لا توجد خطط أسعار متاحة حالياً</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              تجري إدارة المنصة تحديثات دورية على باقات الاشتراك. يمكنك البدء فوراً بإنشاء مواقعك وتجربة المنصة مجاناً.
            </p>
            <button
              type="button"
              onClick={() => handleStartIdea()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              ابدأ بإنشاء موقعك مجاناً
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {activePlans.map((plan) => {
              const isCurrent = user && plan.id === currentPlan.id;
              const isHighlighted = plan.highlighted || plan.slug === 'pro';

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 ${
                    isHighlighted
                      ? 'border-2 border-emerald-600 shadow-lg shadow-emerald-600/10 ring-1 ring-emerald-600/20'
                      : 'border border-slate-200/90 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-emerald-600 text-white shadow-2xs">
                      {plan.badge}
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white shadow-2xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>خطتك الحالية</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">{plan.name}</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed min-h-[36px]">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price Display */}
                    <div className="pt-2 border-t border-slate-100 flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                        {plan.currency}{plan.price}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        / {plan.billingPeriod === 'monthly' ? 'شهرياً' : plan.billingPeriod === 'yearly' ? 'سنوياً' : 'مجاناً'}
                      </span>
                    </div>

                    {/* Key Limits Box */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500">عدد المشاريع:</span>
                        <strong className="font-semibold text-slate-900">
                          {plan.limits.maxProjects === -1 ? 'غير محدود' : `${plan.limits.maxProjects} مشاريع`}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500">توليد الذكاء الاصطناعي:</span>
                        <strong className="font-semibold text-slate-900">
                          {plan.limits.maxMonthlyAiGenerations === -1 ? 'غير محدود' : `${plan.limits.maxMonthlyAiGenerations} شهرياً`}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500">تعديلات AI Chat:</span>
                        <strong className="font-semibold text-slate-900">
                          {plan.limits.maxMonthlyAiEdits === -1 ? 'غير محدود' : `${plan.limits.maxMonthlyAiEdits} شهرياً`}
                        </strong>
                      </div>
                    </div>

                    {/* Key Features List */}
                    <div className="space-y-2 pt-2">
                      <p className="text-xs font-semibold text-slate-700">أهم المزايا:</p>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {(plan.featuresList || []).slice(0, 7).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-6 mt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          openAuthModal('register');
                        } else if (isCurrent) {
                          if (onNavigateToBuilder) onNavigateToBuilder();
                          else onNavigateToDashboard();
                        } else {
                          openUpgradeModal(plan);
                        }
                      }}
                      className={`w-full h-11 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isHighlighted
                          ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-2xs'
                          : isCurrent
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                      }`}
                    >
                      <span>
                        {!user
                          ? plan.price === 0
                            ? 'ابدأ مجاناً'
                            : 'سجّل واختر الخطة'
                          : isCurrent
                          ? 'خطتك النشطة حالياً'
                          : plan.ctaText || 'ترقية لهذه الخطة'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-xl text-center space-y-5 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ابدأ رحلتك اليوم</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              عندك فكرة؟ لا تنتظر.. سَوّيها اليوم.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              انضم للرياديين وأصحاب المشاريع الذين حوّلوا أفكارهم إلى مواقع إلكترونية في دقائق.
            </p>
          </div>

          <div className="pt-2 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleStartIdea()}
              className="w-full sm:w-auto h-11 px-7 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>أنشئ موقعك مجاناً الآن</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (user) {
                  onNavigateToDashboard();
                } else {
                  openAuthModal('login');
                }
              }}
              className="w-full sm:w-auto h-11 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              {user ? 'مشاريعي' : 'تسجيل الدخول'}
            </button>
          </div>
        </div>
      </section>

      {/* 8. SAAS FOOTER */}
      <footer className="border-t border-slate-200/80 pt-8 pb-8 text-xs text-slate-500 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              سـ
            </div>
            <span className="font-bold text-slate-900">{platformSettings.platformName || 'سَوّيها'}</span>
            <span>— منصة إنشاء المواقع بالذكاء الاصطناعي</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              كيف تعمل
            </a>
            <a href="#features" className="hover:text-slate-900 transition-colors">
              المزايا
            </a>
            <a href="#examples" className="hover:text-slate-900 transition-colors">
              نماذج المواقع
            </a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">
              الأسعار والخطط
            </a>
            {onAdminLoginClick && (
              <button
                id="footer-btn-admin-login"
                type="button"
                onClick={onAdminLoginClick}
                className="hover:text-slate-900 text-slate-600 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                title="دخول لوحة إدارة المنصة للمالك"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>دخول الإدارة</span>
              </button>
            )}
            <button
              onClick={() => {
                if (user) onNavigateToDashboard();
                else openAuthModal('login');
              }}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              مشاريعي
            </button>
          </div>
        </div>

        <div className="text-center md:text-right text-[11px] text-slate-400 mt-5 pt-4 border-t border-slate-100">
          جميع الحقوق محفوظة لمنصة سَوّيها (Sawwiha) © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};
