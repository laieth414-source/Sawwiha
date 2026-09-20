import React, { useState } from 'react';
import { PlatformAnnouncement, PlatformAlert } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { logAdminAction } from '../../firebase/auditLogService';
import {
  Megaphone,
  Bell,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  ExternalLink,
  Eye,
} from 'lucide-react';

interface AdminAnnouncementsTabProps {
  announcement: PlatformAnnouncement;
  alert: PlatformAlert;
  onSave: (data: { announcement: PlatformAnnouncement; alert: PlatformAlert }) => Promise<void>;
  saving: boolean;
}

export const AdminAnnouncementsTab: React.FC<AdminAnnouncementsTabProps> = ({
  announcement,
  alert,
  onSave,
  saving,
}) => {
  const { user } = useAuth();

  const [announcementData, setAnnouncementData] = useState<PlatformAnnouncement>({
    enabled: announcement?.enabled ?? true,
    text: announcement?.text ?? '🎉 مرحباً بك في منصة «سَوّيها»!',
    type: announcement?.type ?? 'success',
    linkText: announcement?.linkText ?? 'اكتشف المزيد',
    linkUrl: announcement?.linkUrl ?? '#',
  });

  const [alertData, setAlertData] = useState<PlatformAlert>({
    enabled: alert?.enabled ?? false,
    text: alert?.text ?? 'تنبيه: سيتم إجراء ترقية سريعة للنظام قريباً.',
    type: alert?.type ?? 'warning',
  });

  const [notice, setNotice] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    try {
      await onSave({
        announcement: announcementData,
        alert: alertData,
      });

      if (user) {
        await logAdminAction({
          action: 'settings_update',
          targetEntity: 'settings',
          targetId: 'announcements',
          targetName: 'الإعلانات والتنبيهات',
          summary: `تحديث شريط الإعلانات والتنبيهات العامة للمنصة`,
          details: {
            announcement: announcementData,
            alert: alertData,
          },
          adminId: user.uid,
          adminEmail: user.email || 'owner',
        });
      }

      setNotice('تم حفظ وتحديث الإعلانات والتنبيهات بنجاح وتطبيقها على واجهة الموقع.');
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
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">إدارة الإعلانات والتنبيهات العامة</h2>
              <p className="text-xs text-slate-500">
                التحكم في شريط الإعلان العلوي وتنبيهات الطوارئ وتحديثات المنصة التي تظهر لجميع الزوار.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ الإعلانات والتنبيهات</span>
          </button>
        </div>

        {notice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notice}</span>
          </div>
        )}
      </div>

      {/* 2. Top Announcement Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-emerald-600" />
            <span>شريط الإعلانات العلوي (Announcement Bar)</span>
          </h3>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
            <span>تفعيل الشريط</span>
            <input
              type="checkbox"
              checked={announcementData.enabled}
              onChange={(e) => setAnnouncementData((p) => ({ ...p, enabled: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8">
            <label className="text-xs font-semibold text-slate-700 block mb-1">نص الإعلان:</label>
            <input
              type="text"
              value={announcementData.text}
              onChange={(e) => setAnnouncementData((p) => ({ ...p, text: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
              placeholder="اكتب رسالة الإعلان هنا..."
            />
          </div>

          <div className="sm:col-span-4">
            <label className="text-xs font-semibold text-slate-700 block mb-1">نوع الشريط البصري:</label>
            <select
              value={announcementData.type}
              onChange={(e) => setAnnouncementData((p) => ({ ...p, type: e.target.value as any }))}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
            >
              <option value="success">نجاح / إيجابي (أخضر)</option>
              <option value="info">إعلامي / أزرق</option>
              <option value="warning">تنبيه / كهرماني</option>
            </select>
          </div>

          <div className="sm:col-span-6">
            <label className="text-xs font-semibold text-slate-700 block mb-1">نص زر الرابط:</label>
            <input
              type="text"
              value={announcementData.linkText || ''}
              onChange={(e) => setAnnouncementData((p) => ({ ...p, linkText: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
              placeholder="مثال: اكتشف المزيد"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="text-xs font-semibold text-slate-700 block mb-1">رابط الوجهة (URL):</label>
            <input
              type="text"
              value={announcementData.linkUrl || ''}
              onChange={(e) => setAnnouncementData((p) => ({ ...p, linkUrl: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 font-mono"
              placeholder="https://... أو #"
            />
          </div>
        </div>

        {/* Live Announcement Preview */}
        {announcementData.enabled && (
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>معاينة شريط الإعلان:</span>
            </span>
            <div
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 ${
                announcementData.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : announcementData.type === 'warning'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <span>{announcementData.text}</span>
              {announcementData.linkText && (
                <span className="text-[11px] font-bold underline cursor-pointer">
                  {announcementData.linkText}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. System Alert Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>شريط التنبيهات المهمة والصيانة (System Alert)</span>
          </h3>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
            <span>تفعيل التنبيه</span>
            <input
              type="checkbox"
              checked={alertData.enabled}
              onChange={(e) => setAlertData((p) => ({ ...p, enabled: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8">
            <label className="text-xs font-semibold text-slate-700 block mb-1">نص التنبيه:</label>
            <input
              type="text"
              value={alertData.text}
              onChange={(e) => setAlertData((p) => ({ ...p, text: e.target.value }))}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
              placeholder="اكتب نص التنبيه أو الصيانة..."
            />
          </div>

          <div className="sm:col-span-4">
            <label className="text-xs font-semibold text-slate-700 block mb-1">مستوى التنبيه:</label>
            <select
              value={alertData.type}
              onChange={(e) => setAlertData((p) => ({ ...p, type: e.target.value as any }))}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
            >
              <option value="warning">تحذير / صيانة مجدولة (أصفر)</option>
              <option value="error">عاجل / توقف جزئي (أحمر)</option>
              <option value="info">إرشادي (أزرق)</option>
            </select>
          </div>
        </div>

        {/* Live Alert Preview */}
        {alertData.enabled && (
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>معاينة تنبيه النظام:</span>
            </span>
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                alertData.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-900'
                  : alertData.type === 'warning'
                  ? 'bg-amber-50 border border-amber-200 text-amber-950'
                  : 'bg-blue-50 border border-blue-200 text-blue-900'
              }`}
            >
              {alertData.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : alertData.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{alertData.text}</span>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
