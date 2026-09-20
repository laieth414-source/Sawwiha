import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, UserCheck, ShieldCheck, LogIn, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { FirebaseDiagnosticModal } from './FirebaseDiagnosticModal';

export const FirebaseHeaderStatus: React.FC = () => {
  const { user, firestoreStatus, authReady, projectId } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Firebase Project & Firestore Connection Pill */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs group"
          title="انقر لفتح لوحة فحص واختبار اتصال Firebase"
        >
          <span className="relative flex h-2 w-2">
            {firestoreStatus === 'connected' ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : firestoreStatus === 'checking' ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 animate-pulse"></span>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            )}
          </span>

          <Database className="w-3.5 h-3.5 text-amber-600" />
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-900 hidden sm:inline">{projectId}</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200 hidden md:inline">
              {firestoreStatus === 'connected' ? 'Firestore متصل' : 'جارٍ الفحص...'}
            </span>
          </div>
        </button>

        {/* User / Sign-in Quick Trigger */}
        <button
          onClick={() => setModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            user
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          {user ? (
            <>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span>فحص وتسجيل الدخول</span>
            </>
          )}
        </button>
      </div>

      <FirebaseDiagnosticModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
