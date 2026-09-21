import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlatformPlan, SubscriptionVoucherCode, UserSubscription } from '../types';
import { adminAssignUserPlan } from '../firebase/plansService';
import { redeemSubscriptionVoucherCode } from '../firebase/voucherService';
import {
  Sparkles,
  CheckCircle2,
  X,
  CreditCard,
  Mail,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ExternalLink,
  Ticket,
} from 'lucide-react';

interface UpgradeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlan: PlatformPlan | null;
}

export const UpgradeRequestModal: React.FC<UpgradeRequestModalProps> = ({
  isOpen,
  onClose,
  targetPlan,
}) => {
  const { user, userProfile, isOwner, openAuthModal, refreshUserProfile } = useAuth();
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ownerActivating, setOwnerActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);

  // Voucher redemption state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<{
    plan: PlatformPlan;
    code: SubscriptionVoucherCode;
    subscription: UserSubscription;
  } | null>(null);

  if (!isOpen || !targetPlan) return null;

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    if (!user) {
      onClose();
      openAuthModal('login');
      return;
    }

    setVoucherLoading(true);
    setVoucherError(null);
    try {
      const res = await redeemSubscriptionVoucherCode({
        rawCode: voucherCode.trim(),
        userId: user.uid,
        userEmail: user.email || 'user',
      });
      await refreshUserProfile({
        planId: res.plan.id,
        planSlug: res.plan.slug,
        subscription: res.subscription,
      });
      setVoucherSuccess(res);
      setVoucherCode('');
      setTimeout(() => {
        onClose();
      }, 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تفعيل الكود.';
      setVoucherError(msg);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleOwnerDirectActivate = async () => {
    if (!user || !isOwner) return;
    setOwnerActivating(true);
    try {
      await adminAssignUserPlan({
        userId: user.uid,
        userEmail: user.email || 'laieth772@gmail.com',
        planId: targetPlan.id,
        adminUid: user.uid,
        notes: `تفعيل ذاتي مباشر لمالك المنصة: ${targetPlan.name}`,
      });
      setActivationSuccess(true);
      setTimeout(() => {
        setActivationSuccess(false);
        onClose();
      }, 2000);
    } catch (e) {
      console.warn('Owner activation notice:', e);
    } finally {
      setOwnerActivating(false);
    }
  };

  const handleUserRequest = () => {
    if (!user) {
      onClose();
      openAuthModal('login');
      return;
    }
    setRequested(true);
  };

  const mailtoUrl = `mailto:laieth772@gmail.com?subject=${encodeURIComponent(
    `طلب ترقية إلى خطة ${targetPlan.name} - منصة سَوّيها`
  )}&body=${encodeURIComponent(
    `مرحباً إدارة سَوّيها،\n\nأود الترقية إلى خطة: ${targetPlan.name} (${targetPlan.price}${targetPlan.currency}/${targetPlan.billingPeriod}).\n\nبيانات حسابي:\n- البريد الإلكتروني: ${user?.email || ''}\n- معرف المستخدم (UID): ${user?.uid || ''}\n\nيرجى تزويدي بطرق الدفع المتاحة لتفعيل الاشتراك.\n\nشكراً لكم!`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity" dir="rtl">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5 text-right animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              <span>ترقية الخطة</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              الترقية إلى {targetPlan.name}
            </h3>
            <p className="text-xs text-slate-500">
              استمتع بإمكانيات غير محدودة وتصدير احترافي لمواقعك
            </p>
          </div>
        </div>

        {/* Plan Summary Box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-baseline justify-between border-b border-slate-200/80 pb-2">
            <div>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {targetPlan.currency}{targetPlan.price}
              </span>
              <span className="text-xs text-slate-500 mr-1">
                / {targetPlan.billingPeriod === 'monthly' ? 'شهرياً' : targetPlan.billingPeriod === 'yearly' ? 'سنوياً' : 'مجاناً'}
              </span>
            </div>
            {targetPlan.badge && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {targetPlan.badge}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {targetPlan.description}
          </p>

          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-bold text-slate-700">أبرز المزايا المتضمنة:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {(targetPlan.featuresList || []).slice(0, 6).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Voucher Code Redemption Option */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Ticket className="w-4 h-4 text-emerald-600" />
            <span>لديك كود اشتراك؟</span>
          </div>

          {voucherSuccess ? (
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-semibold space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تم تفعيل اشتراكك بنجاح! ({voucherSuccess.plan.name})</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                ينتهي الاشتراك في: {voucherSuccess.subscription.endDate ? String(voucherSuccess.subscription.endDate).slice(0, 10) : 'غير محدد'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleRedeemVoucher} className="space-y-2">
              {voucherError && (
                <div className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{voucherError}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value);
                    if (voucherError) setVoucherError(null);
                  }}
                  placeholder="أدخل كود الاشتراك"
                  className="flex-1 h-9 px-3 text-xs font-mono uppercase bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:font-sans placeholder:normal-case font-bold"
                  disabled={voucherLoading}
                />
                <button
                  type="submit"
                  disabled={voucherLoading || !voucherCode.trim()}
                  className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {voucherLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Ticket className="w-3.5 h-3.5" />
                  )}
                  <span>تفعيل الكود</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Real Billing Notice */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5 text-amber-950">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <CreditCard className="w-4 h-4 text-amber-700 shrink-0" />
            <span>معلومات تفعيل الاشتراك</span>
          </div>
          <p className="text-[11px] text-amber-900/90 leading-relaxed">
            المنصة تدعم الدفع الآمن. ريثما يتم إطلاق بوابة الدفع الآلي الرسمية بالكامل (Stripe / Local Gateway)، يتم تفعيل الاشتراكات عبر تأكيد مباشر مع إدارة المنصة أو تفعيل إداري فوري من المالك.
          </p>
        </div>

        {/* Owner Direct One-Click Activation */}
        {isOwner && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>صلاحية المالك (Owner Override)</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              بصفتك مالك المنصة، يمكنك تفعيل خطة <strong>{targetPlan.name}</strong> لحسابك فوراً بنقرة واحدة لتجربة كافة الميزات.
            </p>
            <button
              type="button"
              onClick={handleOwnerDirectActivate}
              disabled={ownerActivating}
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {ownerActivating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>{activationSuccess ? 'تم التفعيل بنجاح!' : 'تفعيل الخطة لحسابي الآن (Owner)'}</span>
            </button>
          </div>
        )}

        {/* Normal User Request Confirmation */}
        {!isOwner && requested ? (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">تم تسجيل اهتمامك بالترقية!</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                اضغط على الزر أدناه لإرسال رسالة مباشرة إلى بريد مالك المنصة لتفعيل اشتراكك فورياً.
              </p>
            </div>
            <a
              href={mailtoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>إرسال بريد طلب التفعيل (laieth772@gmail.com)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        ) : !isOwner ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleUserRequest}
              className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>طلب الترقية الآن</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
