import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionVoucherCode, PlatformPlan } from '../../types';
import {
  subscribeToSubscriptionCodes,
  createSubscriptionVoucherCodes,
  cancelSubscriptionVoucherCode,
  exportSubscriptionCodesToCSV,
} from '../../firebase/voucherService';
import {
  Ticket,
  Plus,
  Copy,
  Check,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  X,
  Loader2,
  Trash2,
  ShieldCheck,
  Sparkles,
  Eye,
  Share2,
  ExternalLink,
} from 'lucide-react';

interface AdminVoucherCodesTabProps {
  plans: PlatformPlan[];
}

export const AdminVoucherCodesTab: React.FC<AdminVoucherCodesTabProps> = ({ plans }) => {
  const { user, isOwner } = useAuth();

  const [codes, setCodes] = useState<SubscriptionVoucherCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unused' | 'redeemed' | 'cancelled'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Generator form state
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [codesCount, setCodesCount] = useState<number>(1);
  const [generatorNotes, setGeneratorNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Copy feedback tracking (codeId -> boolean)
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  // View & Copy Modal state
  const [selectedCodeForModal, setSelectedCodeForModal] = useState<SubscriptionVoucherCode | null>(null);
  const [copiedModalCode, setCopiedModalCode] = useState<boolean>(false);
  const [copiedModalLink, setCopiedModalLink] = useState<boolean>(false);

  // Recently generated batch state
  const [recentlyGeneratedCodes, setRecentlyGeneratedCodes] = useState<SubscriptionVoucherCode[]>([]);
  const [copiedRecentAll, setCopiedRecentAll] = useState<boolean>(false);

  // Real-time codes subscription
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToSubscriptionCodes((fetchedCodes) => {
      setCodes(fetchedCodes);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Initialize selectedPlanId to first active paid plan
  useEffect(() => {
    if (!selectedPlanId && plans.length > 0) {
      const proPlan = plans.find((p) => p.slug === 'pro' || p.id === 'plan_pro') || plans[0];
      setSelectedPlanId(proPlan.id);
    }
  }, [plans, selectedPlanId]);

  // Copy handler
  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedMap((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.warn('Notice copying code to clipboard:', err);
    }
  };

  const handleCopyModalCode = async () => {
    if (!selectedCodeForModal) return;
    try {
      await navigator.clipboard.writeText(selectedCodeForModal.code);
      setCopiedModalCode(true);
      setTimeout(() => setCopiedModalCode(false), 2000);
    } catch (err) {
      console.warn('Notice copying modal code:', err);
    }
  };

  const handleCopyModalLink = async () => {
    if (!selectedCodeForModal) return;
    const origin = window.location.origin;
    const link = `${origin}/?voucher=${encodeURIComponent(selectedCodeForModal.code)}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedModalLink(true);
      setTimeout(() => setCopiedModalLink(false), 2000);
    } catch (err) {
      console.warn('Notice copying modal link:', err);
    }
  };

  const handleCopyAllRecent = async () => {
    if (recentlyGeneratedCodes.length === 0) return;
    const allText = recentlyGeneratedCodes
      .map((c) => `${c.code} (${c.planName} - ${c.durationLabel})`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(allText);
      setCopiedRecentAll(true);
      setTimeout(() => setCopiedRecentAll(false), 2500);
    } catch (err) {
      console.warn('Notice copying all recent:', err);
    }
  };

  // Generate codes handler
  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isOwner) return;

    if (!selectedPlanId) {
      setActionNotice({ type: 'error', text: 'يرجى اختيار الخطة أولاً.' });
      return;
    }

    setIsGenerating(true);
    setActionNotice(null);

    try {
      const created = await createSubscriptionVoucherCodes({
        planId: selectedPlanId,
        durationMonths: Number(durationMonths),
        count: Number(codesCount),
        adminUid: user.uid,
        adminEmail: user.email || 'owner@sawwiha.local',
        notes: generatorNotes.trim(),
      });

      setRecentlyGeneratedCodes(created);
      setActionNotice({
        type: 'success',
        text: `تم بنجاح توليد وحفظ ${created.length} كود اشتراك جديد في Firestore.`,
      });
      setGeneratorNotes('');
      setCodesCount(1);

      // Auto-open modal if single code was generated for immediate viewing & copying
      if (created.length === 1) {
        setSelectedCodeForModal(created[0]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء توليد الأكواد.';
      setActionNotice({ type: 'error', text: msg });
    } finally {
      setIsGenerating(false);
    }
  };

  // Cancel code handler
  const handleCancelCode = async (codeItem: SubscriptionVoucherCode) => {
    if (!user || !isOwner) return;

    const confirmed = window.confirm(
      `هل أنت متأكد من رغبتك في إلغاء كود الاشتراك (${codeItem.code})؟ لن يتمكن أي مستخدم من تفعيله بعد ذلك.`
    );
    if (!confirmed) return;

    try {
      await cancelSubscriptionVoucherCode(
        codeItem.id,
        user.uid,
        user.email || 'owner@sawwiha.local'
      );
      setActionNotice({
        type: 'success',
        text: `تم إلغاء كود الاشتراك (${codeItem.code}) بنجاح.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل إلغاء الكود.';
      setActionNotice({ type: 'error', text: msg });
    }
  };

  // Export CSV handler
  const handleExportCSV = () => {
    if (codes.length === 0) return;
    const csvContent = exportSubscriptionCodesToCSV(filteredCodes);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sawwiha_subscription_codes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered list
  const filteredCodes = useMemo(() => {
    return codes.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.code.toLowerCase().includes(q) ||
        item.planName.toLowerCase().includes(q) ||
        (item.redeemedByEmail && item.redeemedByEmail.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesPlan = planFilter === 'all' || item.planId === planFilter || item.planSlug === planFilter;

      return matchesQuery && matchesStatus && matchesPlan;
    });
  }, [codes, searchQuery, statusFilter, planFilter]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = codes.length;
    const unused = codes.filter((c) => c.status === 'unused').length;
    const redeemed = codes.filter((c) => c.status === 'redeemed').length;
    const cancelled = codes.filter((c) => c.status === 'cancelled').length;
    return { total, unused, redeemed, cancelled };
  }, [codes]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <Ticket className="w-3.5 h-3.5" />
            <span>نظام أكواد الاشتراكات الرسمي (Subscription Voucher Codes)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            إدارة وتوليد أكواد الاشتراكات
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            توليد أكواد تفعيل عشوائية ومحمية في Firestore، وتعيين الخطة والمدة الزمنية لكل كود، ومتابعة الأكواد المستخدمة والمتاحة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={codes.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير CSV ({filteredCodes.length})</span>
          </button>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionNotice.text}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500">إجمالي الأكواد</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">مسجلة في Firestore</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-700">أكواد متاحة (Unused)</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{stats.unused}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">جاهزة للتوزيع والتفعيل</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-indigo-700">مُفعلة (Redeemed)</div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{stats.redeemed}</div>
          <div className="text-[10px] text-indigo-600 mt-0.5">مستخدمة من المشتركين</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400">ملغاة (Cancelled)</div>
          <div className="text-2xl font-black text-slate-500 mt-1">{stats.cancelled}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">تم إيقاف صلاحيتها</div>
        </div>
      </div>

      {/* Code Generator Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">توليد أكواد اشتراك جديدة</h3>
            <p className="text-xs text-slate-500">اختر الخطة والمدة وعدد الأكواد ليتم إنشاؤها وحفظها مباشرة في قاعدة البيانات.</p>
          </div>
        </div>

        <form onSubmit={handleGenerateCodes} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Plan Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الخطة المرتبطة بالكود:
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.price}{p.currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                مدة الاشتراك:
              </label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
              >
                <option value={1}>شهر واحد (30 يوماً)</option>
                <option value={3}>3 أشهر (90 يوماً)</option>
                <option value={6}>6 أشهر (180 يوماً)</option>
                <option value={12}>سنة كاملة (365 يوماً)</option>
                <option value={24}>سنتان (730 يوماً)</option>
              </select>
            </div>

            {/* Count Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عدد الأكواد المطلوبة:
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={codesCount}
                onChange={(e) => setCodesCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">من 1 إلى 50 كود في الدفعة الواحدة</span>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ملاحظة إدارية داخلية (اختياري):
            </label>
            <input
              type="text"
              value={generatorNotes}
              onChange={(e) => setGeneratorNotes(e.target.value)}
              placeholder="مثال: حملة إطلاق المنصة، هدية شريك، عرض خاص لعملاء تويتر..."
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارِ توليد الأكواد وحفظها في Firestore...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>توليد {codesCount} كود اشتراك</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recently Generated Codes Quick Showcase Banner */}
      {recentlyGeneratedCodes.length > 0 && (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-4" dir="rtl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-200/70 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  تم توليد {recentlyGeneratedCodes.length} كود اشتراك بنجاح!
                </h3>
                <p className="text-[11px] text-emerald-700">
                  يمكنك عرض ونسخ أي كود مباشرة لمشاركته مع العميل أو تفعيله فوراً.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {recentlyGeneratedCodes.length > 1 && (
                <button
                  type="button"
                  onClick={handleCopyAllRecent}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedRecentAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRecentAll ? 'تم نسخ جميع الأكواد' : 'نسخ كافة الأكواد'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setRecentlyGeneratedCodes([])}
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-200/60 transition-colors cursor-pointer"
                title="إخفاء هذا الإشعار"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentlyGeneratedCodes.map((rc) => (
              <div
                key={rc.id}
                className="bg-white border border-emerald-200 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 shadow-2xs hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-800">{rc.planName}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                    {rc.durationLabel}
                  </span>
                </div>

                <div className="font-mono text-sm font-bold text-slate-900 tracking-wider bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-center select-all">
                  {rc.code}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCodeForModal(rc)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>عرض ونسخ الكود</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(rc.code, rc.id)}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      copiedMap[rc.id]
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title="نسخ سريع"
                  >
                    {copiedMap[rc.id] ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Codes Table and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالكود، الخطة، أو بريد المستخدم..."
              className="w-full h-10 pr-9 pl-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Filter Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>الحالة:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700 font-medium"
            >
              <option value="all">كافة الحالات ({codes.length})</option>
              <option value="unused">متاح (Unused) ({stats.unused})</option>
              <option value="redeemed">مُفعل (Redeemed) ({stats.redeemed})</option>
              <option value="cancelled">ملغى (Cancelled) ({stats.cancelled})</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700 font-medium"
            >
              <option value="all">كافة الخطط</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span>جارِ تحميل أكواد الاشتراكات من Firestore...</span>
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            {codes.length === 0
              ? 'لم يتم إنشاء أي أكواد اشتراك بعد. استخدم النموذج أعلاه لتوليد أول دفعة.'
              : 'لا توجد أكواد مطابقة لمعايير البحث الحالية.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">الكود</th>
                  <th className="py-3 px-4">الخطة المرتبطة</th>
                  <th className="py-3 px-4">المدة</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">تاريخ الإنشاء</th>
                  <th className="py-3 px-4">بيانات التفعيل</th>
                  <th className="py-3 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCodes.map((c) => {
                  const isCopied = copiedMap[c.id];

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Code string with Copy Button */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 tracking-wider select-all text-xs">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(c.code, c.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-white text-slate-500 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                            }`}
                            title="نسخ الكود"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {c.notes && (
                          <span className="text-[10px] text-slate-400 block mt-1 font-sans truncate max-w-xs">
                            {c.notes}
                          </span>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-1">
                          <span>{c.planName}</span>
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{c.durationLabel}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {c.status === 'unused' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>متاح (Unused)</span>
                          </span>
                        ) : c.status === 'redeemed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>مُفعل ومستخدم</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            <X className="w-3 h-3 text-slate-400" />
                            <span>ملغى</span>
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <div>{c.createdAt.slice(0, 10)}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{c.createdBy}</div>
                      </td>

                      {/* Redeemed details */}
                      <td className="py-3.5 px-4 text-[11px]">
                        {c.status === 'redeemed' ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800 flex items-center gap-1 truncate max-w-[180px]">
                              <User className="w-3 h-3 text-indigo-500 shrink-0" />
                              <span>{c.redeemedByEmail || c.redeemedBy || 'مستخدم'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              تفعيل: {c.redeemedAt?.slice(0, 10) || '—'}
                            </div>
                            {c.expiresAt && (
                              <div className="text-[10px] text-amber-700 font-semibold">
                                ينتهي: {c.expiresAt.slice(0, 10)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedCodeForModal(c)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                            title="عرض ونسخ الكود"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>عرض ونسخ الكود</span>
                          </button>

                          {c.status === 'unused' && (
                            <button
                              type="button"
                              onClick={() => handleCancelCode(c)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                              title="إلغاء الكود"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>إلغاء</span>
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

      {/* Dedicated View & Copy Code Modal */}
      {selectedCodeForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">عرض وتفاصيل كود الاشتراك</h3>
                  <p className="text-[11px] text-slate-500">جاهز للنسخ والمشاركة المباشرة مع العميل</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCodeForModal(null);
                  setCopiedModalCode(false);
                  setCopiedModalLink(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Plan & Duration Badges */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
                    {selectedCodeForModal.planName}
                  </span>
                  <span className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedCodeForModal.durationLabel}</span>
                  </span>
                </div>

                <div>
                  {selectedCodeForModal.status === 'unused' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>كود متاح وغير مستخدم</span>
                    </span>
                  ) : selectedCodeForModal.status === 'redeemed' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>مُفعل ومستخدم</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                      <X className="w-3.5 h-3.5 text-slate-400" />
                      <span>كود ملغى</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Big Code Display Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 text-center relative overflow-hidden shadow-inner border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1 font-medium">كود الاشتراك الترويجي (اضغط لنسخه)</div>
                <div className="font-mono text-2xl font-black tracking-widest text-emerald-400 select-all my-2">
                  {selectedCodeForModal.code}
                </div>

                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyModalCode}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                      copiedModalCode
                        ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    }`}
                  >
                    {copiedModalCode ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تم نسخ الكود بنجاح!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ الكود الآن</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Activation Link */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  رابط التفعيل المباشر للعميل:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?voucher=${encodeURIComponent(selectedCodeForModal.code)}`}
                    className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-mono select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyModalLink}
                    className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedModalLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  عند فتح العميل لهذا الرابط، يتم وضع الكود في خانة الترقية مباشرة.
                </p>
              </div>

              {/* Metadata Details Table */}
              <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs bg-slate-50/60">
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-slate-500">تاريخ الإنشاء:</span>
                  <span className="font-semibold text-slate-800">{new Date(selectedCodeForModal.createdAt).toLocaleString('ar-SA')}</span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-slate-500">أنشئ بواسطة:</span>
                  <span className="font-mono text-slate-800 text-[11px]">{selectedCodeForModal.createdBy}</span>
                </div>
                {selectedCodeForModal.status === 'redeemed' && (
                  <>
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-slate-500">المستخدم الذي قام بالتفعيل:</span>
                      <span className="font-semibold text-indigo-700">{selectedCodeForModal.redeemedByEmail || selectedCodeForModal.redeemedBy}</span>
                    </div>
                    {selectedCodeForModal.redeemedAt && (
                      <div className="p-2.5 flex items-center justify-between">
                        <span className="text-slate-500">تاريخ التفعيل:</span>
                        <span className="font-semibold text-slate-800">{new Date(selectedCodeForModal.redeemedAt).toLocaleString('ar-SA')}</span>
                      </div>
                    )}
                    {selectedCodeForModal.expiresAt && (
                      <div className="p-2.5 flex items-center justify-between">
                        <span className="text-slate-500">تاريخ انتهاء الاشتراك:</span>
                        <span className="font-bold text-amber-700">{new Date(selectedCodeForModal.expiresAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                  </>
                )}
                {selectedCodeForModal.notes && (
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="text-slate-500">ملاحظة داخلية:</span>
                    <span className="text-slate-800 font-medium">{selectedCodeForModal.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyModalCode}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                {copiedModalCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedModalCode ? 'تم نسخ الكود!' : 'نسخ الكود'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCodeForModal(null);
                  setCopiedModalCode(false);
                  setCopiedModalLink(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
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
