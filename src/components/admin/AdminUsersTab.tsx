import React, { useState } from 'react';
import { UserProfile, ProjectItem, PlatformPlan, UserCustomLimitsOverride } from '../../types';
import { adminSetUserStatus, adminSetUserPlanAndLimits } from '../../firebase/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Users,
  Shield,
  UserCheck,
  UserX,
  CreditCard,
  Sliders,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Loader2,
  Calendar,
  Eye,
  Lock,
} from 'lucide-react';

interface AdminUsersTabProps {
  users: UserProfile[];
  projects: ProjectItem[];
  plans: PlatformPlan[];
  loading: boolean;
  onRefresh?: () => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  projects,
  plans,
  loading,
}) => {
  const { user: currentAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Plan & Limits State
  const [editPlanId, setEditPlanId] = useState<string>('plan_free');
  const [overrideProjects, setOverrideProjects] = useState<string>('');
  const [overrideAi, setOverrideAi] = useState<string>('');
  const [overridePublished, setOverridePublished] = useState<string>('');
  const [overrideNotes, setOverrideNotes] = useState<string>('');

  // Confirmation Modal for Suspend/Activate
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    open: boolean;
    user: UserProfile | null;
    targetStatus: 'active' | 'suspended';
    reason: string;
  }>({
    open: false,
    user: null,
    targetStatus: 'suspended',
    reason: '',
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      u.uid.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter !== 'all') {
      const isSuspended = u.status === 'suspended';
      if (statusFilter === 'suspended' && !isSuspended) return false;
      if (statusFilter === 'active' && isSuspended) return false;
    }

    if (planFilter !== 'all') {
      const userPlan = u.planId || 'plan_free';
      if (userPlan !== planFilter) return false;
    }

    return true;
  });

  const handleOpenUserDetail = (u: UserProfile) => {
    setSelectedUser(u);
    setEditPlanId(u.planId || 'plan_free');
    setOverrideProjects(u.customLimits?.maxProjects !== undefined ? String(u.customLimits.maxProjects) : '');
    setOverrideAi(u.customLimits?.maxMonthlyAiGenerations !== undefined ? String(u.customLimits.maxMonthlyAiGenerations) : '');
    setOverridePublished(u.customLimits?.maxPublishedSites !== undefined ? String(u.customLimits.maxPublishedSites) : '');
    setOverrideNotes(u.customLimits?.notes || '');
    setActionNotice(null);
  };

  const handleSavePlanAndLimits = async () => {
    if (!selectedUser || !currentAdmin) return;
    setIsProcessing(true);
    setActionNotice(null);

    try {
      const selectedPlanObj = plans.find((p) => p.id === editPlanId);
      const planSlug = selectedPlanObj ? selectedPlanObj.id.replace('plan_', '') : 'free';

      const customLimits: UserCustomLimitsOverride = {};
      if (overrideProjects.trim()) customLimits.maxProjects = Number(overrideProjects);
      if (overrideAi.trim()) customLimits.maxMonthlyAiGenerations = Number(overrideAi);
      if (overridePublished.trim()) customLimits.maxPublishedSites = Number(overridePublished);
      if (overrideNotes.trim()) customLimits.notes = overrideNotes.trim();

      await adminSetUserPlanAndLimits({
        adminUid: currentAdmin.uid,
        adminEmail: currentAdmin.email || 'owner',
        targetUser: selectedUser,
        planId: editPlanId,
        planSlug,
        customLimits: Object.keys(customLimits).length > 0 ? customLimits : undefined,
        notes: overrideNotes,
      });

      // Update local copy
      setSelectedUser((prev) =>
        prev
          ? {
              ...prev,
              planId: editPlanId,
              planSlug,
              customLimits: Object.keys(customLimits).length > 0 ? customLimits : undefined,
            }
          : null
      );

      setActionNotice({ type: 'success', text: 'تم تحديث خطة المستخدم والحدود الاستثنائية وتدوين العملية في سجل التدقيق بنجاح.' });
    } catch (err: unknown) {
      setActionNotice({ type: 'error', text: err instanceof Error ? err.message : 'فشل تحديث خطة المستخدم' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteStatusChange = async () => {
    const { user: target, targetStatus, reason } = confirmStatusModal;
    if (!target || !currentAdmin) return;

    setIsProcessing(true);
    try {
      await adminSetUserStatus({
        adminUid: currentAdmin.uid,
        adminEmail: currentAdmin.email || 'owner',
        targetUser: target,
        newStatus: targetStatus,
        reason,
      });

      // Update selectedUser if open
      if (selectedUser && selectedUser.uid === target.uid) {
        setSelectedUser((prev) => (prev ? { ...prev, status: targetStatus } : null));
      }

      setConfirmStatusModal({ open: false, user: null, targetStatus: 'suspended', reason: '' });
      setActionNotice({
        type: 'success',
        text: targetStatus === 'suspended' ? 'تم تعطيل الحساب بنجاح وتسجيل الإجراء في سجل التدقيق.' : 'تم تفعيل الحساب بنجاح.',
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'تعذر تغيير حالة الحساب');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Header & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">إدارة المستخدمين والحسابات</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة جميع حسابات المنصة، تعديل الخطط الممنوحة، وإدارة الصلاحيات والحدود الاستثنائية.
            </p>
          </div>
          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            إجمالي: {users.length} مستخدم
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم أو البريد الإلكتروني أو المعرّف (UID)..."
              className="w-full h-10 pr-10 pl-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">الحسابات النشطة فقط</option>
              <option value="suspended">الحسابات المعطلة فقط</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">جميع الخطط</option>
              <option value="plan_free">الخطة المجانية (Free)</option>
              <option value="plan_pro">خطة المحترفين (Pro)</option>
              <option value="plan_business">خطة الشركات (Business)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
            <p>جاري تحميل قائمة المستخدمين من Firestore...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">لم يتم العثور على أي مستخدم يطابق معايير البحث.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">المستخدم</th>
                  <th className="py-3 px-4">البريد الإلكتروني</th>
                  <th className="py-3 px-4">الدور</th>
                  <th className="py-3 px-4">الخطة الحالية</th>
                  <th className="py-3 px-4">حالة الحساب</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isOwnerAccount = u.role === 'owner' || u.email === 'laieth772@gmail.com';
                  const isSuspended = u.status === 'suspended';
                  const planId = u.planId || 'plan_free';
                  const planName =
                    planId === 'plan_pro'
                      ? 'Pro'
                      : planId === 'plan_business'
                      ? 'Business'
                      : 'Free';

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (u.displayName || u.email || 'م')[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[140px]">
                              {u.displayName || 'مستخدم بدون اسم'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {u.uid.substring(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                        {u.email || '—'}
                      </td>

                      <td className="py-3 px-4">
                        {isOwnerAccount ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                            <Shield className="w-3 h-3 text-amber-600" />
                            <span>مالك المنصة</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 font-medium">مستخدم عادي</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            planId === 'plan_pro'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : planId === 'plan_business'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {planName}
                          {u.customLimits && <span className="mr-1 text-amber-600 text-[10px]">(تخصيص)</span>}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <UserX className="w-3 h-3" />
                            <span>معطل</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <UserCheck className="w-3 h-3" />
                            <span>نشط</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenUserDetail(u)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all text-xs cursor-pointer shadow-2xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>إدارة الحساب</span>
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

      {/* 3. User Detail & Limits Drawer/Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-4 sm:p-6 text-right space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                  {selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (selectedUser.displayName || selectedUser.email || 'م')[0].toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{selectedUser.displayName || 'مستخدم سَوّيها'}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-mono truncate">{selectedUser.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-base font-bold flex items-center justify-center cursor-pointer shrink-0"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            {actionNotice && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  actionNotice.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {actionNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{actionNotice.text}</span>
              </div>
            )}

            {/* Account Status Toggle Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 block">حالة الحساب</span>
                <span className="text-[11px] text-slate-500">
                  {selectedUser.status === 'suspended' ? 'الحساب معطل حالياً ولا يستطيع إنشاء مواقع.' : 'الحساب نشط ويستطيع الوصول الكامل لمنصة سَوّيها.'}
                </span>
              </div>

              {selectedUser.role !== 'owner' && (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmStatusModal({
                      open: true,
                      user: selectedUser,
                      targetStatus: selectedUser.status === 'suspended' ? 'active' : 'suspended',
                      reason: '',
                    })
                  }
                  className={`w-full sm:w-auto px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    selectedUser.status === 'suspended'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  {selectedUser.status === 'suspended' ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                </button>
              )}
            </div>

            {/* Plan Modification Section */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>تعيين الخطة والحدود الاستثنائية</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">الخطة الأساسية:</label>
                  <select
                    value={editPlanId}
                    onChange={(e) => setEditPlanId(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.price === 0 ? 'مجانية' : `${p.price} ر.س`})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">حد المشاريع الاستثنائي:</label>
                  <input
                    type="number"
                    value={overrideProjects}
                    onChange={(e) => setOverrideProjects(e.target.value)}
                    placeholder="اتركه فارغاً للاعتماد على الخطة"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">حد توليد الذكاء الاصطناعي:</label>
                  <input
                    type="number"
                    value={overrideAi}
                    onChange={(e) => setOverrideAi(e.target.value)}
                    placeholder="اتركه فارغاً للاعتماد على الخطة"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">حد المواقع المنشورة:</label>
                  <input
                    type="number"
                    value={overridePublished}
                    onChange={(e) => setOverridePublished(e.target.value)}
                    placeholder="اتركه فارغاً للاعتماد على الخطة"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ملاحظات الترقية / الاستثناء:</label>
                <input
                  type="text"
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="سبب منح الترقية أو الحدود المخصصة (لأغراض التدقيق الداخلي)"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSavePlanAndLimits}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ التعديلات في Firestore</span>
                </button>
              </div>
            </div>

            {/* User Projects List */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderKanban className="w-4 h-4 text-blue-600" />
                  <span>مشاريع المستخدم ({projects.filter((p) => p.userId === selectedUser.uid).length})</span>
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {projects.filter((p) => p.userId === selectedUser.uid).length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">لا توجد مشاريع منشأة لهذا المستخدم بعد.</p>
                ) : (
                  projects
                    .filter((p) => p.userId === selectedUser.uid)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block">{p.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.slug}</span>
                        </div>
                        {p.isPublished && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                            منشور لايف
                          </span>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Confirmation Dialog for Hazardous Status Action */}
      {confirmStatusModal.open && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-right space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                {confirmStatusModal.targetStatus === 'suspended' ? 'تأكيد تعطيل حساب المستخدم' : 'تأكيد تفعيل الحساب'}
              </h3>
              <p className="text-xs text-slate-500">
                {confirmStatusModal.targetStatus === 'suspended'
                  ? `هل أنت متأكد من تعطيل حساب (${confirmStatusModal.user?.email})؟ سيتم منعه من إنشاء أو تعديل المشاريع.`
                  : `هل ترغب في إعادة تفعيل حساب (${confirmStatusModal.user?.email})؟`}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">سبب الإجراء (لسجل التدقيق):</label>
              <input
                type="text"
                value={confirmStatusModal.reason}
                onChange={(e) => setConfirmStatusModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="اكتب سبب هذا الإجراء..."
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setConfirmStatusModal({ open: false, user: null, targetStatus: 'suspended', reason: '' })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleExecuteStatusChange}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-2xs transition-all cursor-pointer ${
                  confirmStatusModal.targetStatus === 'suspended' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isProcessing ? 'جاري التنفيذ...' : 'تأكيد الإجراء وتدوينه'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
