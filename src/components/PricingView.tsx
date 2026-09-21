import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlatformPlan, SubscriptionVoucherCode, UserSubscription } from '../types';
import { redeemSubscriptionVoucherCode } from '../firebase/voucherService';
import {
  Sparkles,
  Check,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  Zap,
  HelpCircle,
  Layers,
  Settings,
  FolderGit2,
  Globe2,
  FileCode2,
  Ticket,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react';

interface PricingViewProps {
  onNavigateToBuilder?: () => void;
  onNavigateToAdmin?: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  onNavigateToBuilder,
  onNavigateToAdmin,
}) => {
  const {
    user,
    allPlans,
    currentPlan,
    isOwner,
    openAuthModal,
    openUpgradeModal,
    userUsage,
    refreshUserProfile,
  } = useAuth();

  // Voucher redemption state
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<{
    plan: PlatformPlan;
    code: SubscriptionVoucherCode;
    subscription: UserSubscription;
  } | null>(null);

  const activePlans = (allPlans || []).filter((p) => p.isActive);

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCodeInput.trim()) return;

    if (!user) {
      openAuthModal('login');
      return;
    }

    setRedeemLoading(true);
    setRedeemError(null);

    try {
      const result = await redeemSubscriptionVoucherCode({
        rawCode: voucherCodeInput.trim(),
        userId: user.uid,
        userEmail: user.email || 'user@sawwiha.local',
      });

      await refreshUserProfile({
        planId: result.plan.id,
        planSlug: result.plan.slug,
        subscription: result.subscription,
      });

      setRedeemSuccess(result);
      setVoucherCodeInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء تفعيل الكود.';
      setRedeemError(msg);
    } finally {
      setRedeemLoading(false);
    }
  };

  const handlePlanAction = (plan: PlatformPlan) => {
    if (!user) {
      openAuthModal('register');
      return;
    }

    if (plan.id === currentPlan.id) {
      if (onNavigateToBuilder) {
        onNavigateToBuilder();
      }
      return;
    }

    openUpgradeModal(plan);
  };

  const faqs = [
    {
      q: 'هل يمكنني استخدام المنصة مجاناً وبناء مواقع حقيقية؟',
      a: 'نعم بالتأكيد! الخطة المجانية تتيح لك إنشاء حتى 3 مواقع حقيقية بالذكاء الاصطناعي وتعديلها ونشرها وتنزيل الكود النظيف كاملاً بدون أي رسوم خفية.',
    },
    {
      q: 'هل كود الموقع الذي أصممه ملكي بنسبة 100%؟',
      a: 'نعم بالكامل! لا يوجد أي احتكار (Vendor Lock-in). يمكنك تنزيل ملف ZIP بضغطة واحدة أو تصديره إلى GitHub واستضافته على أي خادم تحبه.',
    },
    {
      q: 'كيف يتم احتساب حدود الذكاء الاصطناعي الشهرية؟',
      a: 'تتجدد عمليات التوليد والتعديل الذكي تلقائياً بداية كل شهر تقويمي. يمكنك متابعة استهلاكك المباشر في أي لحظة من لوحة التحكم.',
    },
    {
      q: 'ما الفرق بين خطة Pro وخطة Business؟',
      a: 'خطة Pro صممت للمطورين المستقلين الذين يحتاجون تصدير GitHub وإزالة الشعار، بينما خطة Business توفر مشاريع وعمليات توليد غير محدودة ودعماً فائقاً للشركات والوكالات.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-16 text-right" dir="rtl">
      {/* Top Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>خطط مرنة وواضحة تناسب طموحك</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          اختر الخطة المناسبة <span className="text-emerald-600">لمشروعك القادم</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          ابدأ مجاناً، وابنِ مواقع إلكترونية عصرية تفاعلية بالذكاء الاصطناعي في ثوانٍ. جميع الخطط تشمل ملكية الكود الكاملة وتنزيل ZIP مجاناً.
        </p>

        {/* Owner Quick Edit Link */}
        {isOwner && onNavigateToAdmin && (
          <div className="pt-2">
            <button
              onClick={onNavigateToAdmin}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              <span>إدارة وتعديل الأسعار والخطط (لوحة المالك)</span>
            </button>
          </div>
        )}
      </div>

      {/* User Current Plan Status Notice (if authenticated) */}
      {user && (
        <div className="max-w-3xl mx-auto p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">خطتك النشطة حالياً:</span>
                <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  {currentPlan.name}
                </span>
                {isOwner && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    غير محدود
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                المشاريع المستهلكة: {isOwner ? '0' : (userUsage?.projectsCount || 0)} من {isOwner || currentPlan.limits.maxProjects === -1 ? 'غير محدود' : currentPlan.limits.maxProjects}
              </p>
            </div>
          </div>

          <div className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            حالة الاشتراك: {isOwner ? 'غير محدود' : 'نشط'}
          </div>
        </div>
      )}

      {/* Subscription Voucher Code Redemption Card */}
      <div
        id="voucher-redemption-card"
        className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-right"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">لديك كود اشتراك؟</h3>
              <p className="text-xs text-slate-500">
                أدخل كود الاشتراك الممنوح لك لترقية خطتك وتفعيل الميزات فوراً.
              </p>
            </div>
          </div>
        </div>

        {/* Success Feedback Display */}
        {redeemSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>تم تفعيل اشتراكك بنجاح</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-emerald-200/60">
              <div>
                <span className="text-emerald-700/80 block text-[11px]">اسم الخطة</span>
                <span className="font-bold text-slate-900">{redeemSuccess.plan.name}</span>
              </div>
              <div>
                <span className="text-emerald-700/80 block text-[11px]">تاريخ البداية</span>
                <span className="font-bold text-slate-900">
                  {redeemSuccess.subscription.startDate ? String(redeemSuccess.subscription.startDate).slice(0, 10) : '—'}
                </span>
              </div>
              <div>
                <span className="text-emerald-700/80 block text-[11px]">تاريخ الانتهاء</span>
                <span className="font-bold text-slate-900">
                  {redeemSuccess.subscription.endDate ? String(redeemSuccess.subscription.endDate).slice(0, 10) : 'غير محدد'}
                </span>
              </div>
              <div>
                <span className="text-emerald-700/80 block text-[11px]">حالة الاشتراك</span>
                <span className="inline-block font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                  نشط ومُفعل
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setRedeemSuccess(null)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
              >
                إغلاق التنبيه
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {redeemError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{redeemError}</span>
            </div>
            <button
              onClick={() => setRedeemError(null)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Voucher Input Form */}
        <form onSubmit={handleRedeemVoucher} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <input
              id="voucher-code-input"
              type="text"
              value={voucherCodeInput}
              onChange={(e) => {
                setVoucherCodeInput(e.target.value);
                if (redeemError) setRedeemError(null);
              }}
              placeholder="أدخل كود الاشتراك"
              className="w-full h-11 px-4 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:font-sans placeholder:normal-case text-slate-900 font-bold tracking-wider"
              disabled={redeemLoading}
            />
          </div>

          <button
            id="redeem-voucher-btn"
            type="submit"
            disabled={redeemLoading || !voucherCodeInput.trim()}
            className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {redeemLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جارِ تفعيل الكود...</span>
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4" />
                <span>تفعيل الكود</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Dynamic Pricing Cards Grid */}
      {activePlans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">لا توجد خطط أسعار معروضة حالياً</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            يتم تحديث الباقات الدورية من قِبل إدارة المنصة. يمكنك مواصلة العمل على مشاريعك واستخدام المنصة بحرية.
          </p>
          {onNavigateToBuilder && (
            <button
              type="button"
              onClick={onNavigateToBuilder}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              ابدأ بناء موقعك
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {activePlans.map((plan) => {
          const isCurrent = user && plan.id === currentPlan.id;
          const isPro = plan.highlighted || plan.slug === 'pro';

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl p-7 flex flex-col justify-between transition-all duration-200 ${
                isPro
                  ? 'border-2 border-emerald-600 shadow-lg shadow-emerald-600/10 ring-1 ring-emerald-600/20'
                  : 'border border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Top Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-emerald-600 text-white shadow-xs">
                  {plan.badge}
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3.5 left-6 px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white shadow-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>خطتك الحالية</span>
                </div>
              )}

              {/* Plan Header */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-slate-100 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                    {plan.currency}{plan.price}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    / {plan.billingPeriod === 'monthly' ? 'شهرياً' : plan.billingPeriod === 'yearly' ? 'سنوياً' : 'مجاناً'}
                  </span>
                </div>

                {/* Key Limits Box */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2 text-xs">
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
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500">تصدير GitHub:</span>
                    <strong className="font-semibold text-slate-900">
                      {plan.features.canExportGitHub ? 'متاح ومفعل' : 'غير متوفر'}
                    </strong>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="space-y-2.5 pt-2">
                  <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                    المزايا المتضمنة:
                  </p>
                  <ul className="space-y-2">
                    {plan.featuresList.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-normal">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handlePlanAction(plan)}
                  className={`w-full h-11 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
                      : isPro
                      ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>خطتك الحالية (ابدأ البناء)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{plan.ctaText || (plan.price === 0 ? 'ابدأ مجاناً' : 'ترقية الخطة')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Feature Comparison Matrix Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>حرية برمجية مطلقة</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
            كودك ملكك في كل الخطط — بدون قيود
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            سواء كنت في الخطة المجانية أو الاحترافية، ستحصل دائماً على كود نقي ومرتب (HTML + Tailwind + React) يمكنك استضافته في أي مكان أو بيعه أو تسليمه لعملائك دون أي التزامات.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>الأسئلة الشائعة</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">كل ما تحتاج معرفته عن الأسعار</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">{faq.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
