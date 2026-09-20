import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Shield, CheckCircle2, Sparkles, CreditCard, Zap } from 'lucide-react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
}) => {
  const { user, userProfile, isOwner, currentPlan } = useAuth();

  if (!isOpen || !user) return null;

  return (
    <div
      id="account-settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir="rtl"
    >
      <div
        id="account-settings-card"
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden text-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">إعدادات الحساب</h3>
              <p className="text-[11px] text-slate-500">معلومات حسابك الشخصي</p>
            </div>
          </div>
          <button
            id="account-modal-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* User Profile Summary */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-2xs shrink-0">
              {(userProfile?.displayName || user.displayName || user.email || 'س')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-900 text-xs truncate">
                  {userProfile?.displayName || user.displayName || 'مستخدم سَوّيها'}
                </h4>
                {isOwner && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                    المالك
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                نوع الحساب
              </span>
              <span className="font-semibold text-slate-800">
                {isOwner ? 'حساب المالك (Admin)' : 'مستخدم قياسي'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                حالة الحساب
              </span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                نشط وموثق
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                خطة الاشتراك
              </span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {currentPlan.name}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-slate-400" />
                حدود الاستخدام
              </span>
              <span className="font-medium text-emerald-700 text-[11px]">
                {isOwner || currentPlan.limits.maxProjects === -1
                  ? 'مشاريع ومواقع غير محدودة'
                  : `${currentPlan.limits.maxProjects} مشاريع`}
              </span>
            </div>
          </div>

          {/* If Owner: shortcut to Admin Control Center */}
          {isOwner && onOpenAdmin && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="w-full h-10 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>مركز تحكم الإدارة (Admin Panel)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
