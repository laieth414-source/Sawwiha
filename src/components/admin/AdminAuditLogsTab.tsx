import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../../types';
import { subscribeToAuditLogs, fetchAuditLogs } from '../../firebase/auditLogService';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  Layers,
  ChevronDown,
  RefreshCw,
  Loader2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const AdminAuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAuditLogs((data) => {
      setLogs(data);
      setLoading(false);
    }, 150);

    return () => unsubscribe();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    const freshLogs = await fetchAuditLogs(150);
    setLogs(freshLogs);
    setLoading(false);
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      log.summary.toLowerCase().includes(q) ||
      log.adminEmail.toLowerCase().includes(q) ||
      (log.targetName && log.targetName.toLowerCase().includes(q)) ||
      (log.targetId && log.targetId.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false;
    }

    return true;
  });

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'plan_change':
        return { label: 'تغيير خطة', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'user_status':
        return { label: 'حالة مستخدم', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'project_delete':
        return { label: 'حذف مشروع', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'project_unpublish':
        return { label: 'حجب نشر', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'feature_flag':
        return { label: 'قواطع ميزات', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ai_config_update':
        return { label: 'محرك AI', bg: 'bg-violet-50 text-violet-700 border-violet-200' };
      case 'settings_update':
        return { label: 'إعدادات المنصة', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'limits_override':
        return { label: 'تخصيص حدود', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      default:
        return { label: action, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">سجل العمليات الإدارية (Audit Trail Log)</h2>
              <p className="text-xs text-slate-500">
                سجل حقيقي غير قابل للتعديل يوثق جميع التغييرات الإدارية الحساسة لمالك المنصة وتأثيرها.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>تحديث السجل</span>
            </button>
            <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
              إجمالي السجلات: {logs.length}
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في تفاصيل السجل، البريد الإداري، أو الكيان المتأثر..."
              className="w-full h-10 pr-10 pl-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">جميع أنواع العمليات</option>
              <option value="plan_change">تغييرات الخطط والترقيات</option>
              <option value="user_status">تعطيل أو تفعيل المستخدمين</option>
              <option value="project_delete">حذف المشاريع</option>
              <option value="project_unpublish">حجب وإلغاء نشر المواقع</option>
              <option value="feature_flag">تعديل قواطع الميزات</option>
              <option value="ai_config_update">إعدادات الذكاء الاصطناعي</option>
              <option value="settings_update">إعدادات المنصة والهوية</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
            <p>جاري مزامنة سجلات التدقيق من Firestore...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">لا توجد عمليات تطابق البحث في السجل.</p>
            <p className="text-[11px] text-slate-400">أي إجراء إداري ينفذه المالك يتم تسجيله هنا تلقائياً.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">التوقيت والتاريخ</th>
                  <th className="py-3 px-4">نوع العملية</th>
                  <th className="py-3 px-4">ملخص الإجراء</th>
                  <th className="py-3 px-4">المسؤول الإداري</th>
                  <th className="py-3 px-4 text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const dateStr = log.timestamp
                    ? new Date(log.timestamp).toLocaleString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-900 max-w-[320px] truncate">
                        {log.summary}
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {log.adminEmail || 'Owner'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>عرض</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Detail Modal for Log Entry */}
      {selectedLog && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-4 sm:p-6 text-right space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">تفاصيل العملية الإدارية الموثقة</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">معرف السجل الفريد:</span>
                <span className="font-mono text-slate-900 font-bold select-all">{selectedLog.id}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">وقت وتاريخ التنفيذ:</span>
                <span className="font-mono text-slate-900 font-bold">
                  {new Date(selectedLog.timestamp).toLocaleString('ar-SA')}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">المسؤول المنفذ:</span>
                <span className="font-mono text-slate-900 font-bold">{selectedLog.adminEmail}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">نوع الكيان المتأثر:</span>
                <span className="font-bold text-slate-900">{selectedLog.targetEntity}</span>
              </div>

              {selectedLog.targetName && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">اسم الكيان:</span>
                  <span className="font-bold text-slate-900">{selectedLog.targetName}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 font-medium block">ملخص الإجراء:</span>
                <p className="font-bold text-slate-900 leading-relaxed">{selectedLog.summary}</p>
              </div>

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-mono text-[10px] block">بيانات العملية الإضافية:</span>
                  <pre className="text-[11px] font-mono whitespace-pre-wrap overflow-x-auto max-h-40 leading-normal">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
