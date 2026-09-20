import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resetPassword } from '../firebase/authService';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalInitialMode,
    closeAuthModal,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    platformSettings,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(authModalInitialMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (authModalInitialMode) {
      setMode(authModalInitialMode);
    }
    setError(null);
    setSuccessMsg(null);
  }, [authModalInitialMode, authModalOpen]);

  if (!authModalOpen) return null;

  const translateFirebaseError = (err: unknown): string => {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes('auth/user-not-found') ||
      message.includes('auth/wrong-password') ||
      message.includes('invalid-credential')
    ) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    }
    if (message.includes('auth/email-already-in-use')) {
      return 'هذا البريد مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة.';
    }
    if (message.includes('auth/weak-password')) {
      return 'كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام.';
    }
    if (message.includes('auth/invalid-email')) {
      return 'صيغة البريد الإلكتروني غير صحيحة.';
    }
    if (message.includes('auth/unauthorized-domain')) {
      return 'النطاق الحالي غير مضاف في قائمة النطاقات المصرح بها (Authorized Domains) في Firebase Console لهذا المشروع.';
    }
    if (message.includes('auth/network-request-failed')) {
      return 'خطأ في الاتصال بالشبكة، يرجى التأكد من اتصال الإنترنت والمحاولة ثانية.';
    }
    if (message.includes('auth/too-many-requests')) {
      return 'تم حظر الطلبات مؤقتاً بسبب المحاولات المتكررة، يرجى الانتظار قليلاً قبل المحاولة.';
    }
    if (message.includes('auth/popup-closed-by-user')) {
      return 'تم إغلاق نافذة تسجيل الدخول عبر Google.';
    }
    return 'تعذر إتمام العملية حالياً، يرجى المحاولة مرة أخرى.';
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      closeAuthModal();
    } catch (err) {
      setError(translateFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError('يرجى إدخال البريد الإلكتروني.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        await resetPassword(cleanEmail);
        setSuccessMsg('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
      } catch (err) {
        setError(translateFirebaseError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setError('كلمة المرور يجب ألا تقل عن 6 أحرف.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(cleanEmail, password);
      } else {
        if (!platformSettings.features.allowUserRegistration) {
          throw new Error('التسجيل الجديد معطّل مؤقتاً للصيانة.');
        }
        await registerWithEmail(cleanEmail, password, displayName.trim() || undefined);
      }
      closeAuthModal();
    } catch (err) {
      setError(translateFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
      dir="rtl"
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-7 relative text-right space-y-5"
      >
        {/* Close Button */}
        <button
          id="auth-modal-close-btn"
          onClick={closeAuthModal}
          className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Header: Logo & Clear Title */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-11 h-11 mx-auto rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shadow-emerald-600/20">
            {platformSettings.logoText || 'سـ'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'login' && 'تسجيل الدخول'}
              {mode === 'register' && 'إنشاء حساب جديد'}
              {mode === 'forgot' && 'استعادة كلمة المرور'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'login' && 'أهلاً بك مجدداً في سَوّيها'}
              {mode === 'register' && 'ابدأ ببناء موقعك الأول مجاناً في دقائق'}
              {mode === 'forgot' && 'أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة'}
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 2. Google Login (For login & register) */}
        {mode !== 'forgot' && (
          <div className="space-y-4">
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>المتابعة بحساب Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200/80 w-full" />
              <span className="bg-white px-3 text-[11px] text-slate-400 shrink-0">أو بالبريد الإلكتروني</span>
            </div>
          </div>
        )}

        {/* 3. Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم الكامل</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="مثال: أحمد العلي"
                  className="w-full h-11 px-3.5 pr-9 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/15 transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 px-3.5 pr-9 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/15 transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">كلمة المرور</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMsg(null);
                      setMode('forgot');
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pr-9 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-600/15 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <span>تسجيل الدخول</span>
            ) : mode === 'register' ? (
              <span>إنشاء الحساب مجاناً</span>
            ) : (
              <span>إرسال رابط الاستعادة</span>
            )}
          </button>
        </form>

        {/* 4. Footer Mode Switcher */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          {mode === 'login' && (
            <p>
              ليس لديك حساب؟{' '}
              <button
                id="switch-to-register-btn"
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode('register');
                }}
                className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
              >
                إنشاء حساب جديد
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              لديك حساب بالفعل؟{' '}
              <button
                id="switch-to-login-btn"
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode('login');
                }}
                className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
              >
                تسجيل الدخول
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              تذكرت كلمة المرور؟{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode('login');
                }}
                className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <span>العودة لتسجيل الدخول</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
