import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlatformPlan } from '../types';
import {
  createPlan,
  updatePlan,
  setDefaultPlan,
  deletePlan,
  seedDefaultPlansIfEmpty,
} from '../firebase/plansService';
import {
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Star,
  CheckCircle2,
  Layers,
  Save,
  RotateCcw,
  Loader2,
} from 'lucide-react';

export const AdminPlansManager: React.FC = () => {
  const { user, allPlans, isOwner } = useAuth();

  const [editingPlan, setEditingPlan] = useState<PlatformPlan | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State for editing or creating
  const [formData, setFormData] = useState<Partial<PlatformPlan>>({
    name: '',
    slug: '',
    badge: '',
    price: 0,
    currency: '$',
    billingPeriod: 'monthly',
    description: '',
    featuresList: [],
    features: {
      canUseAI: true,
      canUseAIEdit: true,
      canUseAIRepair: true,
      canPublish: true,
      canExportGitHub: false,
      canDownloadZip: true,
      removeWatermark: false,
      customDomainAllowed: false,
      prioritySupport: false,
    },
    limits: {
      maxProjects: 5,
      maxMonthlyAiGenerations: 20,
      maxMonthlyAiEdits: 50,
      maxMonthlyAiRepairs: 20,
      maxPublishedSites: 2,
      maxMonthlyGithubExports: 0,
    },
    isDefault: false,
    isActive: true,
    sortOrder: allPlans.length + 1,
    highlighted: false,
    ctaText: 'ترقية الخطة',
  });

  const [featureInput, setFeatureInput] = useState('');

  if (!isOwner) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-right">
        صلاحية غير كافية: هذا القسم متاح لمالك المنصة فقط.
      </div>
    );
  }

  const handleStartCreate = () => {
    setEditingPlan(null);
    setIsCreating(true);
    setFormData({
      name: '',
      slug: '',
      badge: '',
      price: 0,
      currency: '$',
      billingPeriod: 'monthly',
      description: '',
      featuresList: [
        'إنشاء مواقع إلكترونية متكاملة بالذكاء الاصطناعي',
        'تنزيل حزم كود نظيفة بصيغة ZIP',
        'نشر مباشر برابط فوري',
      ],
      features: {
        canUseAI: true,
        canUseAIEdit: true,
        canUseAIRepair: true,
        canPublish: true,
        canExportGitHub: false,
        canDownloadZip: true,
        removeWatermark: false,
        customDomainAllowed: false,
        prioritySupport: false,
      },
      limits: {
        maxProjects: 5,
        maxMonthlyAiGenerations: 20,
        maxMonthlyAiEdits: 50,
        maxMonthlyAiRepairs: 20,
        maxPublishedSites: 2,
        maxMonthlyGithubExports: 0,
      },
      isDefault: false,
      isActive: true,
      sortOrder: allPlans.length + 1,
      highlighted: false,
      ctaText: 'ترقية الخطة',
    });
    setStatusMsg(null);
  };

  const handleStartEdit = (plan: PlatformPlan) => {
    setIsCreating(false);
    setEditingPlan(plan);
    setFormData(JSON.parse(JSON.stringify(plan)));
    setStatusMsg(null);
  };

  const handleCancelForm = () => {
    setEditingPlan(null);
    setIsCreating(false);
    setStatusMsg(null);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      featuresList: [...(prev.featuresList || []), featureInput.trim()],
    }));
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      featuresList: (prev.featuresList || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.name?.trim() || !formData.slug?.trim()) {
      setStatusMsg({ type: 'error', text: 'يرجى إدخال اسم الخطة والمعرف (Slug) بشكل صحيح.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      if (isCreating) {
        await createPlan(
          formData as Omit<PlatformPlan, 'id' | 'createdAt' | 'updatedAt'>,
          user.uid
        );
        setStatusMsg({ type: 'success', text: 'تمت إضافة الخطة الجديدة بنجاح إلى Firestore.' });
        setIsCreating(false);
      } else if (editingPlan) {
        await updatePlan(editingPlan.id, formData, user.uid);
        setStatusMsg({ type: 'success', text: 'تم تحديث بيانات الخطة بنجاح في Firestore.' });
        setEditingPlan(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: 'error', text: `فشل الحفظ: ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (planId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await setDefaultPlan(planId, user.uid);
      setStatusMsg({ type: 'success', text: 'تم تعيين الخطة كخطة افتراضية للنظام.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'فشل تعيين الخطة الافتراضية.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الخطة؟')) return;
    setLoading(true);
    try {
      const res = await deletePlan(planId);
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'تم حذف الخطة بأمان.' });
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'تعذر حذف الخطة.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'فشل حذف الخطة.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>إدارة الخطط والأسعار (Plans & Pricing)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            التحكم الكامل في الخطط، الأسعار، المزايا، وحدود الاستخدام المحفوظة في Firestore.
          </p>
        </div>

        {!isCreating && !editingPlan && (
          <button
            type="button"
            onClick={handleStartCreate}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خطة جديدة</span>
          </button>
        )}
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
          <button
            onClick={() => setStatusMsg(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor / Form Modal / Inline */}
      {(isCreating || editingPlan) && (
        <form onSubmit={handleSavePlan} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              {isCreating ? 'إضافة خطة جديدة' : `تعديل الخطة: ${editingPlan?.name}`}
            </h3>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1 rounded-lg hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الخطة *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: المحترف (Pro)"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المعرف الفريد (Slug) *</label>
              <input
                type="text"
                required
                disabled={!isCreating}
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().trim() })}
                placeholder="مثال: pro أو business"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">شارة الخطة (Badge)</label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="مثال: الأكثر طلباً"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">السعر *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price ?? 0}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">العملة ورمزها</label>
              <input
                type="text"
                value={formData.currency || '$'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">دورة الفوترة</label>
              <select
                value={formData.billingPeriod || 'monthly'}
                onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value as any })}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="free">مجانية (Free)</option>
                <option value="monthly">شهرياً (Monthly)</option>
                <option value="yearly">سنوياً (Yearly)</option>
                <option value="one_time">دفعة واحدة (One-time)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">وصف الخطة</label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="وصف مختصر ومحفز لمزايا الخطة..."
            />
          </div>

          {/* Dynamic Limits (Number inputs: -1 = unlimited) */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>حدود الاستخدام (أدخل -1 لغير محدود)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">أقصى عدد مشاريع</label>
                <input
                  type="number"
                  value={formData.limits?.maxProjects ?? 3}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limits: { ...formData.limits!, maxProjects: parseInt(e.target.value) },
                    })
                  }
                  className="w-full h-8 px-2 text-xs border rounded-lg bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">توليد AI شهرياً</label>
                <input
                  type="number"
                  value={formData.limits?.maxMonthlyAiGenerations ?? 10}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limits: { ...formData.limits!, maxMonthlyAiGenerations: parseInt(e.target.value) },
                    })
                  }
                  className="w-full h-8 px-2 text-xs border rounded-lg bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">تعديلات AI شهرياً</label>
                <input
                  type="number"
                  value={formData.limits?.maxMonthlyAiEdits ?? 30}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limits: { ...formData.limits!, maxMonthlyAiEdits: parseInt(e.target.value) },
                    })
                  }
                  className="w-full h-8 px-2 text-xs border rounded-lg bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">إصلاحات AI Repair</label>
                <input
                  type="number"
                  value={formData.limits?.maxMonthlyAiRepairs ?? 10}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limits: { ...formData.limits!, maxMonthlyAiRepairs: parseInt(e.target.value) },
                    })
                  }
                  className="w-full h-8 px-2 text-xs border rounded-lg bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">مواقع منشورة حية</label>
                <input
                  type="number"
                  value={formData.limits?.maxPublishedSites ?? 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limits: { ...formData.limits!, maxPublishedSites: parseInt(e.target.value) },
                    })
                  }
                  className="w-full h-8 px-2 text-xs border rounded-lg bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">تصدير GitHub شهرياً</label>
                <input
                  type="number"
                  value={formData.limits?.maxMonthlyGithubExports ?? 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limits: { ...formData.limits!, maxMonthlyGithubExports: parseInt(e.target.value) },
                    })
                  }
                  className="w-full h-8 px-2 text-xs border rounded-lg bg-slate-50 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900">ميزات الخطة (Feature Flags)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features?.canUseAI ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features!, canUseAI: e.target.checked },
                    })
                  }
                  className="rounded text-emerald-600"
                />
                <span>توليد المواقع بالذكاء الاصطناعي</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features?.canUseAIEdit ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features!, canUseAIEdit: e.target.checked },
                    })
                  }
                  className="rounded text-emerald-600"
                />
                <span>المساعد الذكي (AI Chat Companion)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features?.canUseAIRepair ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features!, canUseAIRepair: e.target.checked },
                    })
                  }
                  className="rounded text-emerald-600"
                />
                <span>الإصلاح التلقائي للكود (AI Repair)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features?.canPublish ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features!, canPublish: e.target.checked },
                    })
                  }
                  className="rounded text-emerald-600"
                />
                <span>نشر المواقع الحية</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features?.canExportGitHub ?? false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features!, canExportGitHub: e.target.checked },
                    })
                  }
                  className="rounded text-emerald-600"
                />
                <span>تصدير لمستودع GitHub</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features?.canDownloadZip ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features!, canDownloadZip: e.target.checked },
                    })
                  }
                  className="rounded text-emerald-600"
                />
                <span>تنزيل حزمة ZIP</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features?.removeWatermark ?? false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features!, removeWatermark: e.target.checked },
                    })
                  }
                  className="rounded text-emerald-600"
                />
                <span>إزالة علامة وشعار المنصة</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features?.customDomainAllowed ?? false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features!, customDomainAllowed: e.target.checked },
                    })
                  }
                  className="rounded text-emerald-600"
                />
                <span>ربط دومين مخصص (Custom Domain)</span>
              </label>
            </div>
          </div>

          {/* Features Bullets List */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900">نقاط المزايا المعروضة في صفحة الأسعار</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                placeholder="أضف ميزة جديدة..."
                className="flex-1 h-8 px-3 text-xs border rounded-lg bg-slate-50"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="h-8 px-3 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900"
              >
                إضافة
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {formData.featuresList?.map((feat, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(i)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCancelForm}
              className="h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isCreating ? 'حفظ الخطة الجديدة' : 'تحديث الخطة'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Plans List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">الخطة</th>
                <th className="py-3.5 px-4">السعر</th>
                <th className="py-3.5 px-4">أقصى مشاريع</th>
                <th className="py-3.5 px-4">AI توليد شهرياً</th>
                <th className="py-3.5 px-4">تصدير GitHub</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{plan.name}</span>
                      {plan.isDefault && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          افتراضية
                        </span>
                      )}
                      {plan.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">slug: {plan.slug}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {plan.currency}{plan.price} / {plan.billingPeriod}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {plan.limits.maxProjects === -1 ? 'غير محدود' : plan.limits.maxProjects}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {plan.limits.maxMonthlyAiGenerations === -1 ? 'غير محدود' : plan.limits.maxMonthlyAiGenerations}
                  </td>

                  <td className="py-3.5 px-4">
                    {plan.features.canExportGitHub ? (
                      <span className="text-emerald-700 font-semibold">مفعل</span>
                    ) : (
                      <span className="text-slate-400">معطل</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        plan.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {plan.isActive ? 'نشطة' : 'معطلة'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-left">
                    <div className="inline-flex items-center gap-1">
                      {!plan.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(plan.id)}
                          title="تعيين كخطة افتراضية"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartEdit(plan)}
                        title="تعديل الخطة"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {!plan.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan.id)}
                          title="حذف الخطة"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
