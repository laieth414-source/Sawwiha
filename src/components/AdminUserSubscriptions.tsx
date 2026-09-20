import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, PlatformPlan, UserCustomLimitsOverride } from '../types';
import {
  adminGetAllUsers,
  adminAssignUserPlan,
  adminRevertUserToFree,
  adminSetUserCustomLimits,
} from '../firebase/plansService';
import {
  Users,
  ShieldCheck,
  Search,
  Sparkles,
  Edit2,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Save,
  Check,
} from 'lucide-react';

export const AdminUserSubscriptions: React.FC = () => {
  const { user, isOwner, allPlans } = useAuth();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upgrade / Assign Plan Dialog
  const [assignModalUser, setAssignModalUser] = useState<UserProfile | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_pro');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [assignNotes, setAssignNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Custom Limits Override Dialog
  const [customLimitsUser, setCustomLimitsUser] = useState<UserProfile | null>(null);
  const [customLimitsForm, setCustomLimitsForm] = useState<UserCustomLimitsOverride>({
    maxProjects: 10,
    maxMonthlyAiGenerations: 50,
    maxMonthlyAiEdits: 100,
    maxMonthlyAiRepairs: 50,
    maxPublishedSites: 5,
    maxMonthlyGithubExports: 20,
    notes: 'ترقية حدود خاصة من المالك',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await adminGetAllUsers();
      setUsersList(list);
    } catch (e) {
      console.warn('Notice loading users for admin:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      loadUsers();
    }
  }, [isOwner]);

  if (!isOwner) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-right">
        صلاحية غير كافية: هذا القسم متاح لمالك المنصة فقط.
      </div>
    );
  }

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.uid && u.uid.toLowerCase().includes(q)) ||
      (u.planSlug && u.planSlug.toLowerCase().includes(q))
    );
  });

  const handleOpenAssignModal = (targetUser: UserProfile) => {
    setAssignModalUser(targetUser);
    setSelectedPlanId(targetUser.planId || 'plan_pro');
    setDurationDays(30);
    setAssignNotes('ترقية إدارية مباشرة');
    setStatusMsg(null);
  };

  const handleExecuteAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !assignModalUser) return;
    setSubmitting(true);
    try {
      await adminAssignUserPlan({
        userId: assignModalUser.uid,
        userEmail: assignModalUser.email || '',
        planId: selectedPlanId,
        adminUid: user.uid,
        durationDays: durationDays > 0 ? durationDays : undefined,
        notes: assignNotes,
      });
      setStatusMsg({ type: 'success', text: `تم تحديث خطة المستخدم (${assignModalUser.email || assignModalUser.displayName}) بنجاح.` });
      setAssignModalUser(null);
      await loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: 'error', text: `فشل تعيين الخطة: ${msg}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevertToFree = async (targetUser: UserProfile) => {
    if (!user) return;
    if (!window.confirm(`هل أنت متأكد من إرجاع المستخدم (${targetUser.email || targetUser.displayName}) إلى الخطة المجانية؟`)) return;

    setLoading(true);
    try {
      await adminRevertUserToFree(targetUser.uid, user.uid);
      setStatusMsg({ type: 'success', text: `تم إرجاع المستخدم (${targetUser.email || targetUser.displayName}) إلى الخطة المجانية بنجاح.` });
      await loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: 'error', text: `فشل الإرجاع: ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCustomLimits = (targetUser: UserProfile) => {
    setCustomLimitsUser(targetUser);
    const existing = targetUser.customLimits;
    setCustomLimitsForm({
      maxProjects: existing?.maxProjects ?? 10,
      maxMonthlyAiGenerations: existing?.maxMonthlyAiGenerations ?? 50,
      maxMonthlyAiEdits: existing?.maxMonthlyAiEdits ?? 100,
      maxMonthlyAiRepairs: existing?.maxMonthlyAiRepairs ?? 50,
      maxPublishedSites: existing?.maxPublishedSites ?? 5,
      maxMonthlyGithubExports: existing?.maxMonthlyGithubExports ?? 20,
      notes: existing?.notes || 'زيادة حدود مخصصة من المالك',
    });
    setStatusMsg(null);
  };

  const handleSaveCustomLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !customLimitsUser) return;
    setSubmitting(true);
    try {
      await adminSetUserCustomLimits(customLimitsUser.uid, customLimitsForm, user.uid);
      setStatusMsg({ type: 'success', text: `تم حفظ الحدود المخصصة للمستخدم بنجاح.` });
      setCustomLimitsUser(null);
      await loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: 'error', text: `فشل حفظ الحدود: ${msg}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearCustomLimits = async (targetUser: UserProfile) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await adminSetUserCustomLimits(targetUser.uid, null, user.uid);
      setStatusMsg({ type: 'success', text: 'تمت إزالة الحدود المخصصة والرجوع لحدود الخطة الأساسية.' });
      setCustomLimitsUser(null);
      await loadUsers();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'فشل إزالة الحدود المخصصة.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>إدارة اشتراكات المستخدمين (Admin Overrides)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            صلاحية المالك المباشرة لترقية وتعديل اشتراكات وحدود أي مستخدم في النظام بصورة فورية.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالبريد أو الاسم..."
            className="w-full h-9 pr-9 pl-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Status Notice */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span>جارِ تحميل قائمة المستخدمين من Firestore...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            لا توجد سجلات مستخدمين مطابقة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">المستخدم</th>
                  <th className="py-3.5 px-4">الخطة الحالية</th>
                  <th className="py-3.5 px-4">تاريخ الانتهاء</th>
                  <th className="py-3.5 px-4">حدود مخصصة</th>
                  <th className="py-3.5 px-4 text-left">إجراءات المالك</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const currentPlan = allPlans.find((p) => p.id === u.planId || p.slug === u.planSlug) || allPlans[0];
                  const hasCustom = !!u.customLimits;
                  const isOwnerAccount = u.role === 'owner' || u.email === 'laieth772@gmail.com';

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{u.displayName || 'مستخدم سَوّيها'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email || u.uid}</div>
                        {isOwnerAccount && (
                          <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                            مالك المنصة
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800">
                          {currentPlan?.name || u.planSlug || 'مجانية'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {u.subscription?.endDate
                          ? new Date(u.subscription.endDate).toLocaleDateString('ar-SA')
                          : 'مفتوح (غير محدد)'}
                      </td>

                      <td className="py-3.5 px-4">
                        {hasCustom ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            مخصصة (Override)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">حدود الخطة</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-left">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Assign/Upgrade Plan */}
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(u)}
                            className="h-7 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>تغيير الخطة</span>
                          </button>

                          {/* Custom Limits */}
                          <button
                            type="button"
                            onClick={() => handleOpenCustomLimits(u)}
                            className="h-7 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            title="تعديل الحدود المخصصة"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>حدود خاصة</span>
                          </button>

                          {/* Revert to Free if paid */}
                          {u.planSlug && u.planSlug !== 'free' && (
                            <button
                              type="button"
                              onClick={() => handleRevertToFree(u)}
                              className="h-7 px-2 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              title="إرجاع للمجانية"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>إلغاء الاشتراك</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign / Change Plan Modal */}
      {assignModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-right animate-in fade-in zoom-in-95">
            <button
              onClick={() => setAssignModalUser(null)}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                تغيير خطة المستخدم (Admin Grant)
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              المستخدم: <strong>{assignModalUser.email || assignModalUser.displayName}</strong>
            </p>

            <form onSubmit={handleExecuteAssignPlan} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر الخطة المطلوبة</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {allPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.currency}{p.price} / {p.billingPeriod})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مدة التفعيل بالأيام (0 أو أقل = بدون تاريخ انتهاء)
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الإدارة</label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="سبب الترقية أو تفاصيل الاتفاق..."
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalUser(null)}
                  className="h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>تأكيد تفعيل الخطة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Limits Override Modal */}
      {customLimitsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-right animate-in fade-in zoom-in-95">
            <button
              onClick={() => setCustomLimitsUser(null)}
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                تخصيص حدود استثنائية (Custom Limits Override)
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              تمنح هذه الميزة المستخدم حدوداً أعلى دون تغيير خطته الأساسية: <strong>{customLimitsUser.email || customLimitsUser.displayName}</strong>
            </p>

            <form onSubmit={handleSaveCustomLimits} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">أقصى عدد مشاريع</label>
                  <input
                    type="number"
                    value={customLimitsForm.maxProjects ?? 10}
                    onChange={(e) =>
                      setCustomLimitsForm({ ...customLimitsForm, maxProjects: parseInt(e.target.value) })
                    }
                    className="w-full h-8 px-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">توليد AI شهرياً</label>
                  <input
                    type="number"
                    value={customLimitsForm.maxMonthlyAiGenerations ?? 50}
                    onChange={(e) =>
                      setCustomLimitsForm({
                        ...customLimitsForm,
                        maxMonthlyAiGenerations: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-8 px-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">تعديلات AI شهرياً</label>
                  <input
                    type="number"
                    value={customLimitsForm.maxMonthlyAiEdits ?? 100}
                    onChange={(e) =>
                      setCustomLimitsForm({
                        ...customLimitsForm,
                        maxMonthlyAiEdits: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-8 px-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">إصلاحات AI Repair</label>
                  <input
                    type="number"
                    value={customLimitsForm.maxMonthlyAiRepairs ?? 50}
                    onChange={(e) =>
                      setCustomLimitsForm({
                        ...customLimitsForm,
                        maxMonthlyAiRepairs: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-8 px-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">مواقع منشورة حية</label>
                  <input
                    type="number"
                    value={customLimitsForm.maxPublishedSites ?? 5}
                    onChange={(e) =>
                      setCustomLimitsForm({
                        ...customLimitsForm,
                        maxPublishedSites: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-8 px-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">تصدير GitHub شهرياً</label>
                  <input
                    type="number"
                    value={customLimitsForm.maxMonthlyGithubExports ?? 20}
                    onChange={(e) =>
                      setCustomLimitsForm({
                        ...customLimitsForm,
                        maxMonthlyGithubExports: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-8 px-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات التخصيص</label>
                <input
                  type="text"
                  value={customLimitsForm.notes || ''}
                  onChange={(e) => setCustomLimitsForm({ ...customLimitsForm, notes: e.target.value })}
                  placeholder="سبب منح هذه الحدود الاستثنائية..."
                  className="w-full h-8 px-3 text-xs border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {customLimitsUser.customLimits && (
                  <button
                    type="button"
                    onClick={() => handleClearCustomLimits(customLimitsUser)}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold"
                  >
                    إلغاء التخصيص والرجوع للأصل
                  </button>
                )}

                <div className="flex items-center gap-2 mr-auto">
                  <button
                    type="button"
                    onClick={() => setCustomLimitsUser(null)}
                    className="h-8 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>حفظ الحدود المخصصة</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
