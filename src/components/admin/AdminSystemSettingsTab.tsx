import React, { useState } from 'react';
import { PlatformFeatures, PlatformLimits } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { logAdminAction } from '../../firebase/auditLogService';
import { testFirestoreConnection, ConnectionStatusResult } from '../../firebase/firestoreService';
import {
  Settings,
  Sliders,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Database,
  Activity,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

interface AdminSystemSettingsTabProps {
  features: PlatformFeatures;
  limits?: PlatformLimits;
  onSave: (data: { features: PlatformFeatures; limits?: PlatformLimits }) => Promise<void>;
  saving: boolean;
}

export const AdminSystemSettingsTab: React.FC<AdminSystemSettingsTabProps> = ({
  features,
  limits,
  onSave,
  saving,
}) => {
  const { user } = useAuth();

  const [featuresData, setFeaturesData] = useState<PlatformFeatures>({
    allowUserRegistration: features?.allowUserRegistration ?? true,
    allowProjectCreation: features?.allowProjectCreation ?? true,
    allowProjectRename: features?.allowProjectRename ?? true,
    allowProjectDelete: features?.allowProjectDelete ?? true,
    maintenanceMode: features?.maintenanceMode ?? false,
  });

  const [limitsData, setLimitsData] = useState<PlatformLimits>({
    freeMaxProjects: limits?.freeMaxProjects ?? 5,
    freeMonthlyGenerations: limits?.freeMonthlyGenerations ?? 30,
    showPoweredByWatermark: limits?.showPoweredByWatermark ?? true,
  });

  const [notice, setNotice] = useState<string | null>(null);

  // Diagnostic Test State
  const [testingDb, setTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<ConnectionStatusResult | null>(null);

  const handleRunDiagnostic = async () => {
    setTestingDb(true);
    setDbTestResult(null);
    try {
      const res = await testFirestoreConnection();
      setDbTestResult(res);
    } catch {
      // Handled
    } finally {
      setTestingDb(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    try {
      await onSave({
        features: featuresData,
        limits: limitsData,
      });

      if (user) {
        await logAdminAction({
          action: 'settings_update',
          targetEntity: 'settings',
          targetId: 'system_settings',
          targetName: 'إعدادات النظام العامة',
          summary: `تحديث إعدادات النظام العامة وحدود الحسابات الافتراضية`,
          details: {
            features: featuresData,
            limits: limitsData,
          },
          adminId: user.uid,
          adminEmail: user.email || 'owner',
        });
      }

      setNotice('تم حفظ إعدادات النظام وتحديث قيود المنصة بنجاح.');
      setTimeout(() => setNotice(null), 4000);
    } catch {
      // Handled by parent
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-right" dir="rtl">
      {/* 1. Header & Save */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">إعدادات النظام العامة (System Controls)</h2>
              <p className="text-xs text-slate-500">
                التحكم بالصيانة، التسجيل، صلاحيات حذف المشاريع، وحدود الحسابات الافتراضية وفحص الاتصال.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ إعدادات النظام</span>
          </button>
        </div>

        {notice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notice}</span>
          </div>
        )}
      </div>

      {/* 2. Platform Feature Restrictions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <span>قيود وعمليات المستخدمين العامة</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 block">السماح بتسجيل مستخدمين جدد</span>
              <span className="text-[10px] text-slate-500">فتح أو قفل إنشاء حسابات جديدة</span>
            </div>
            <input
              type="checkbox"
              checked={featuresData.allowUserRegistration}
              onChange={(e) => setFeaturesData((p) => ({ ...p, allowUserRegistration: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
            />
          </label>

          <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 block">السماح بإنشاء مشاريع جديدة</span>
              <span className="text-[10px] text-slate-500">تمكين زر إنشاء موقع جديد</span>
            </div>
            <input
              type="checkbox"
              checked={featuresData.allowProjectCreation}
              onChange={(e) => setFeaturesData((p) => ({ ...p, allowProjectCreation: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
            />
          </label>

          <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 block">السماح بإعادة تسمية المشاريع</span>
              <span className="text-[10px] text-slate-500">تعديل اسم المشروع من قبل المالك</span>
            </div>
            <input
              type="checkbox"
              checked={featuresData.allowProjectRename}
              onChange={(e) => setFeaturesData((p) => ({ ...p, allowProjectRename: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
            />
          </label>

          <label className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 block">السماح بحذف المشاريع</span>
              <span className="text-[10px] text-slate-500">تمكين المستخدمين من حذف مشاريعهم</span>
            </div>
            <input
              type="checkbox"
              checked={featuresData.allowProjectDelete}
              onChange={(e) => setFeaturesData((p) => ({ ...p, allowProjectDelete: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 3. Platform Limits Defaults */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-600" />
          <span>الحدود الافتراضية للخطة المجانية (Default Limits)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">الحد الأقصى للمشاريع المجانية:</label>
            <input
              type="number"
              min="1"
              max="50"
              value={limitsData.freeMaxProjects}
              onChange={(e) => setLimitsData((p) => ({ ...p, freeMaxProjects: parseInt(e.target.value, 10) || 5 }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">عمليات الذكاء الاصطناعي الشهرية:</label>
            <input
              type="number"
              min="1"
              max="200"
              value={limitsData.freeMonthlyGenerations}
              onChange={(e) => setLimitsData((p) => ({ ...p, freeMonthlyGenerations: parseInt(e.target.value, 10) || 30 }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={limitsData.showPoweredByWatermark}
                onChange={(e) => setLimitsData((p) => ({ ...p, showPoweredByWatermark: e.target.checked }))}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-800">إظهار شارة صنع بواسطة سَوّيها</span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. Live Firestore Diagnostic Probe */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>فحص الاتصال التشغيلي بقاعدة البيانات (Diagnostics)</span>
          </h3>

          <button
            type="button"
            onClick={handleRunDiagnostic}
            disabled={testingDb}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            {testingDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
            <span>إجراء اختبار حقيقي الآن</span>
          </button>
        </div>

        {dbTestResult ? (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 ${
              dbTestResult.connected
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {dbTestResult.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-semibold">{dbTestResult.message}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              زمن الاستجابة: {dbTestResult.latencyMs}ms
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            اضغط على الزر أعلاه لإرسال نبضة اختبار حقيقية لـ Cloud Firestore والتحقق من صلاحيات القراءة والكتابة وزمن الاستجابة.
          </p>
        )}
      </div>
    </form>
  );
};
