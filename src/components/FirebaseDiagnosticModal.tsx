import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  LogIn,
  LogOut,
  Mail,
  KeyRound,
  ExternalLink,
  Activity,
  Database,
  UserCheck,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { FIREBASE_CONFIG } from '../firebase/config';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseDiagnosticModal: React.FC<DiagnosticModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    userProfile,
    authReady,
    authError,
    clearAuthError,
    firestoreStatus,
    firestoreDetails,
    projectId,
    authDomain,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    checkConnection,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setActionLoading(true);
    setLocalFeedback(null);
    clearAuthError();
    try {
      await loginWithGoogle();
      setLocalFeedback({ type: 'success', text: 'تم تسجيل الدخول بنجاح عبر حساب Google!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLocalFeedback({
        type: 'error',
        text: msg.includes('popup-closed-by-user')
          ? 'تم إغلاق نافذة تسجيل الدخول من قبل المستخدم.'
          : msg.includes('operation-not-allowed')
          ? 'مزود تسجيل الدخول بحساب Google غير مفعّل بعد في Firebase Console.'
          : msg.includes('unauthorized-domain')
          ? 'النطاق الحالي غير مضاف في Authorized Domains في Firebase Authentication.'
          : `خطأ أثناء تسجيل الدخول: ${msg}`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalFeedback({ type: 'error', text: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
      return;
    }
    setActionLoading(true);
    setLocalFeedback(null);
    clearAuthError();
    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
        setLocalFeedback({ type: 'success', text: 'تم تسجيل الدخول بنجاح بالبريد وكلمة المرور!' });
      } else {
        await registerWithEmail(email, password, displayName);
        setLocalFeedback({ type: 'success', text: 'تم إنشاء الحساب وتسجيل الدخول بنجاح!' });
      }
      setEmail('');
      setPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      let arabicErr = msg;
      if (msg.includes('user-not-found') || msg.includes('invalid-credential')) {
        arabicErr = 'البريد الإلكتروني أو كلمة المرور غير صحيحة، أو لم يتم إنشاء الحساب بعد.';
      } else if (msg.includes('email-already-in-use')) {
        arabicErr = 'هذا البريد الإلكتروني مسجل مسبقاً، يرجى اختيار "تسجيل الدخول".';
      } else if (msg.includes('weak-password')) {
        arabicErr = 'كلمة المرور ضعيفة (يجب أن تتكون من 6 خانات على الأقل).';
      } else if (msg.includes('operation-not-allowed')) {
        arabicErr = 'مزود Email/Password غير مفعّل في Firebase Console. يرجى تفعيله من Authentication > Sign-in method.';
      }
      setLocalFeedback({ type: 'error', text: arabicErr });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    setActionLoading(true);
    setLocalFeedback(null);
    try {
      await logout();
      setLocalFeedback({ type: 'success', text: 'تم تسجيل الخروج بنجاح.' });
    } catch (err: unknown) {
      setLocalFeedback({ type: 'error', text: String(err) });
    } finally {
      setActionLoading(false);
    }
  };

  const copyConfigSummary = () => {
    navigator.clipboard.writeText(JSON.stringify(FIREBASE_CONFIG, null, 2));
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                لوحة فحص وتأكيد ربط Firebase
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  {projectId}
                </span>
              </h2>
              <p className="text-xs text-slate-500">فحص فوري ومباشر لخدمات Authentication و Cloud Firestore</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 flex-1">
          {/* Status Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Firebase Project Init */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  تهيئة Firebase
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">مشروع حقيقي معتمد</div>
              <div className="text-[11px] text-slate-500 font-mono truncate">{projectId}</div>
            </div>

            {/* Authentication Ready */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${
                authReady ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span
                  className={`flex items-center gap-1.5 ${authReady ? 'text-emerald-800' : 'text-amber-800'}`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Authentication
                </span>
                {authReady ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                )}
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">
                {user ? 'مستخدم مسجل حالياً' : authReady ? 'جاهز للاستخدام' : 'جارٍ التهيئة...'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {user ? user.email || 'حساب Google' : 'Google + Email/Password'}
              </div>
            </div>

            {/* Cloud Firestore */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${
                firestoreStatus === 'connected'
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : firestoreStatus === 'checking'
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-rose-200 bg-rose-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span
                  className={`flex items-center gap-1.5 ${
                    firestoreStatus === 'connected'
                      ? 'text-emerald-800'
                      : firestoreStatus === 'checking'
                      ? 'text-amber-800'
                      : 'text-rose-800'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  Cloud Firestore
                </span>
                {firestoreStatus === 'connected' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : firestoreStatus === 'checking' ? (
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                )}
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">
                {firestoreStatus === 'connected'
                  ? 'متصل بالخادم الحقيقي'
                  : firestoreStatus === 'checking'
                  ? 'جارٍ الفحص...'
                  : 'تحتاج مراجعة'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {firestoreDetails?.latencyMs ? `${firestoreDetails.latencyMs} ms زمن الاستجابة` : 'طلب مباشر getDoc'}
              </div>
            </div>
          </div>

          {/* Firestore Connection Diagnostic Message */}
          {firestoreDetails && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start gap-2.5">
              <Activity className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{firestoreDetails.message}</div>
                {firestoreDetails.details && (
                  <div className="text-slate-500 mt-0.5">{firestoreDetails.details}</div>
                )}
              </div>
              <button
                onClick={() => checkConnection()}
                disabled={firestoreStatus === 'checking'}
                className="shrink-0 text-xs px-2.5 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 font-medium text-slate-700 inline-flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${firestoreStatus === 'checking' ? 'animate-spin' : ''}`} />
                إعادة الفحص
              </button>
            </div>
          )}

          {/* User Status Bar if Logged in */}
          {user ? (
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                    {(user.displayName || user.email || 'م')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{user.displayName || 'مستخدم سَوّيها'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {userProfile?.role === 'owner' ? 'مالك المنصة' : 'مستخدم نشط'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{user.email}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">UID: {user.uid}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                تسجيل الخروج
              </button>
            </div>
          ) : (
            /* Auth Interaction Box */
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  تجربة وتأكيد طرق تسجيل الدخول المباشرة
                </span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setLocalFeedback(null);
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    دخول
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setLocalFeedback(null);
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    حساب جديد
                  </button>
                </div>
              </div>

              {/* 1. Google Button */}
              <div>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs sm:text-sm shadow-xs transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>تسجيل الدخول السريع بحساب Google</span>
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-xs text-slate-400">أو عبر البريد الإلكتروني</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* 2. Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="مثال: ليث (مالك المنصة)"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="laieth772@gmail.com"
                      className="w-full pl-3 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-left font-mono"
                      dir="ltr"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-left"
                      dir="ltr"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {actionLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : authMode === 'login' ? (
                    <>
                      <LogIn className="w-3.5 h-3.5" />
                      <span>تسجيل الدخول</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>إنشاء حساب وتجربة الربط</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Feedback messages */}
          {(localFeedback || authError) && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                localFeedback?.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
            >
              {localFeedback?.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{localFeedback?.text || authError}</div>
            </div>
          )}

          {/* Verification & Manual Setup Checklist */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              قائمة التحقق الفني والخطوات المطلوبة في Firebase Console:
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>ربط المشروع:</strong> تم تثبيت مشروع <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">{projectId}</code> بنجاح كمرجع وحيد للمشروع.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Cloud Firestore:</strong> تم ربط قاعدة البيانات واستدعاء <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">getDocFromServer</code> لاختبار الاتصال الفعلي مع خوادم Google.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                <span>
                  <strong>تفعيل Sign-in providers:</strong> في حال ظهور خطأ <code>operation-not-allowed</code> عند تسجيل الدخول، تأكد من فتح لوحة Firebase Console &gt; Authentication &gt; Sign-in method وتفعيل:
                  <span className="block mt-1 font-semibold text-slate-800">
                    1. Google Provider &nbsp;&bull;&nbsp; 2. Email/Password Provider
                  </span>
                </span>
              </div>

              <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Authorized Domains:</strong> في حال تجربة Google Sign-in من بيئة المعاينة (iframe أو رابط السحابة)، تأكد من إضافة نطاق الاستضافة في:
                  <br />
                  <code className="text-[11px] font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block mt-1">
                    Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains
                  </code>
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <a
                href={`https://console.firebase.google.com/project/${projectId}/overview`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-medium"
              >
                <span>فتح Firebase Console لمشروع mnasat-sawiha</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={copyConfigSummary}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>نسخ إعدادات Web Config</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>الربط مثبت ومحفوظ ومستعد للمرحلة 1 بعد موافقتك.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
