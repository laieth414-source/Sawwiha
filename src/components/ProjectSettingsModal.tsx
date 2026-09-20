import React, { useState } from 'react';
import {
  X,
  Globe,
  Search,
  Share2,
  FileText,
  Check,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Shield,
  CheckCircle2,
  RefreshCw,
  Copy,
  Info,
} from 'lucide-react';
import { ProjectItem, ProjectSeo, CustomDomainConfig } from '../types';
import { updateProjectDoc } from '../firebase/projectService';
import { useAuth } from '../context/AuthContext';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem;
  onProjectUpdated: (updated: ProjectItem) => void;
}

type SettingsTab = 'showcase' | 'seo' | 'domain' | 'sitemap';

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  project,
  onProjectUpdated,
}) => {
  const { platformSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('showcase');

  // Showcase state
  const [showcaseOptIn, setShowcaseOptIn] = useState<boolean>(project.showcaseOptIn || false);
  const [showcaseCategory, setShowcaseCategory] = useState<string>(project.showcaseCategory || project.category || 'صفحة هبوط');
  const [showcaseDescription, setShowcaseDescription] = useState<string>(project.showcaseDescription || project.description || '');

  // SEO state
  const [seoTitle, setSeoTitle] = useState<string>(project.seo?.title || project.title || '');
  const [seoDescription, setSeoDescription] = useState<string>(project.seo?.description || project.description || '');
  const [seoKeywords, setSeoKeywords] = useState<string>(project.seo?.keywords || '');
  const [ogImage, setOgImage] = useState<string>(project.seo?.ogImage || '');
  const [favicon, setFavicon] = useState<string>(project.seo?.favicon || '');

  // Custom Domain state
  const [customDomainName, setCustomDomainName] = useState<string>(project.customDomain?.domain || '');
  const [isVerifyingDns, setIsVerifyingDns] = useState<boolean>(false);
  const [dnsCheckResult, setDnsCheckResult] = useState<{
    success: boolean;
    message: string;
    details?: string[];
  } | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const cleanSlug = project.slug || project.id;
  const publishedBaseUrl = project.publishedUrl || `${origin}/s/${cleanSlug}`;
  const sitemapUrl = `${origin}/s/${cleanSlug}/sitemap.xml`;
  const robotsUrl = `${origin}/s/${cleanSlug}/robots.txt`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveNotice(null);

    try {
      const updatedSeo: ProjectSeo = {
        title: seoTitle.trim(),
        description: seoDescription.trim(),
        keywords: seoKeywords.trim(),
        ogTitle: seoTitle.trim(),
        ogDescription: seoDescription.trim(),
        ogImage: ogImage.trim(),
        favicon: favicon.trim(),
        canonicalUrl: project.publishedUrl || `${origin}/s/${cleanSlug}`,
      };

      // Handle showcase status transition
      let newShowcaseStatus = project.showcaseStatus || 'none';
      if (showcaseOptIn) {
        if (newShowcaseStatus === 'none' || !newShowcaseStatus) {
          newShowcaseStatus = 'pending';
        }
      } else {
        newShowcaseStatus = 'none';
      }

      // Handle Custom Domain state
      const cleanDomain = customDomainName.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      let updatedDomainConfig: CustomDomainConfig | undefined = project.customDomain;

      if (cleanDomain) {
        updatedDomainConfig = {
          domain: cleanDomain,
          status: project.customDomain?.domain === cleanDomain ? (project.customDomain?.status || 'pending_dns') : 'pending_dns',
          verified: project.customDomain?.domain === cleanDomain ? Boolean(project.customDomain?.verified) : false,
          dnsRecords: [
            {
              type: 'CNAME',
              host: cleanDomain.startsWith('www.') ? 'www' : '@',
              value: typeof window !== 'undefined' ? window.location.hostname : 'cname.sawwiha.app',
              status: 'pending',
              description: 'توجيه نطاقك إلى خوادم سَوّيها السحابية',
            },
            {
              type: 'TXT',
              host: '_sawwiha-verify',
              value: `sawwiha-site-verification=${project.id}`,
              status: 'pending',
              description: 'إثبات ملكية النطاق الأمني',
            },
          ],
          lastCheckedAt: new Date().toISOString(),
        };
      } else if (!cleanDomain && project.customDomain) {
        updatedDomainConfig = undefined;
      }

      const updates: Partial<ProjectItem> = {
        showcaseOptIn,
        showcaseStatus: newShowcaseStatus,
        showcaseCategory,
        showcaseDescription: showcaseDescription.trim(),
        showcaseOptInAt: showcaseOptIn ? (project.showcaseOptInAt || new Date().toISOString()) : undefined,
        seo: updatedSeo,
        customDomain: updatedDomainConfig,
        updatedAt: new Date().toISOString(),
      };

      await updateProjectDoc(project.id, updates);

      const mergedProject: ProjectItem = {
        ...project,
        ...updates,
      };

      onProjectUpdated(mergedProject);
      setSaveNotice('تم حفظ وتحديث إعدادات المشروع بنجاح! ✨');
      setTimeout(() => setSaveNotice(null), 3500);
    } catch (err: any) {
      console.error('Failed to save project settings:', err);
      alert('حدث خطأ أثناء حفظ الإعدادات: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyDns = async () => {
    const cleanDomain = customDomainName.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!cleanDomain) {
      setDnsCheckResult({
        success: false,
        message: 'الرجاء إدخال اسم النطاق أولاً قبل التحقق.',
      });
      return;
    }

    setIsVerifyingDns(true);
    setDnsCheckResult(null);

    try {
      const res = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: cleanDomain,
          projectId: project.id,
        }),
      });

      const data = await res.json();
      setDnsCheckResult({
        success: Boolean(data.verified),
        message: data.message || (data.verified ? 'تم التحقق من النطاق بنجاح!' : 'لم يتم العثور على سجلات DNS المطلوبة بعد.'),
        details: data.details,
      });

      if (data.verified) {
        const updatedConfig: CustomDomainConfig = {
          domain: cleanDomain,
          status: 'active',
          verified: true,
          verifiedAt: new Date().toISOString(),
          lastCheckedAt: new Date().toISOString(),
          dnsRecords: [
            {
              type: 'CNAME',
              host: cleanDomain.startsWith('www.') ? 'www' : '@',
              value: typeof window !== 'undefined' ? window.location.hostname : 'cname.sawwiha.app',
              status: 'verified',
            },
            {
              type: 'TXT',
              host: '_sawwiha-verify',
              value: `sawwiha-site-verification=${project.id}`,
              status: 'verified',
            },
          ],
        };

        await updateProjectDoc(project.id, {
          customDomain: updatedConfig,
        });

        onProjectUpdated({
          ...project,
          customDomain: updatedConfig,
        });
      }
    } catch (err: any) {
      setDnsCheckResult({
        success: false,
        message: 'تعذر إتمام فحص DNS حالياً: ' + (err.message || 'خطأ في الاتصال بالخادم'),
      });
    } finally {
      setIsVerifyingDns(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none font-sans" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                إعدادات المشروع الاحترافية
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {project.title} &bull; المعرض، السيو، والنطاق المخصص
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-white px-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('showcase')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'showcase'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة المعرض (Showcase)</span>
            {showcaseOptIn && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'seo'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>السيو وبطاقات المشاركة (SEO)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('domain')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'domain'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>النطاق المخصص (Domain)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sitemap')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'sitemap'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ملفات الأرشفة (Sitemap / Robots)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {saveNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveNotice}</span>
            </div>
          )}

          {/* TAB 1: SHOWCASE & COMMUNITY */}
          {activeTab === 'showcase' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl flex items-start gap-3.5">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-emerald-950">ضمان الخصوصية والشفافية التامة:</p>
                  <p className="text-emerald-800 leading-relaxed">
                    الافتراضي لأي مشروع هو <strong>خاص بنسبة 100%</strong>. عند اختيار المشاركة في المعرض، لن يظهر سوى اسم المشروع، الوصف، ورابط المعاينة المستقل. لن تظهر أية مفاتيح API، ولا بيانات Firebase، ولا بريدك الإلكتروني الشخصي.
                  </p>
                </div>
              </div>

              {/* Opt-in Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    عرض مشروعي في معرض المواقع والمجتمع
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    اسمح لمستخدمي المنصة وزوارها باكتشاف موقعك والاستلهام منه
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showcaseOptIn}
                    onChange={(e) => setShowcaseOptIn(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {showcaseOptIn && (
                <div className="p-4.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">حالة العرض في المعرض:</span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        project.showcaseStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : project.showcaseStatus === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {project.showcaseStatus === 'approved'
                        ? 'معتمد ومعروض بالمعرض 🎉'
                        : project.showcaseStatus === 'rejected'
                        ? 'مرفوض أو محجوب'
                        : 'قيد مراجعة الإدارة (Pending)'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      تصنيف الموقع في المعرض:
                    </label>
                    <select
                      value={showcaseCategory}
                      onChange={(e) => setShowcaseCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      <option value="صفحة هبوط">صفحة هبوط (Landing Page)</option>
                      <option value="متجر إلكتروني">متجر إلكتروني (E-commerce)</option>
                      <option value="معرض أعمال وسيرة">معرض أعمال وسيرة شخصية (Portfolio)</option>
                      <option value="مطعم ومقهى">مطعم ومقهى (Restaurant & Cafe)</option>
                      <option value="شركة وخدمات">شركة وخدمات أعمال (Business & Services)</option>
                      <option value="مدونة ومحتوى">مدونة ومحتوى (Blog & Media)</option>
                      <option value="فعالية ومؤتمر">فعالية ومؤتمر (Event)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      وصف مختصر للموقع في بطاقة المعرض:
                    </label>
                    <textarea
                      rows={2}
                      value={showcaseDescription}
                      onChange={(e) => setShowcaseDescription(e.target.value)}
                      placeholder="أدخل نبذة مختصرة عن نشاط الموقع وأبرز مميزاته..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SEO & SOCIAL CARDS */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      عنوان الصفحة في محركات البحث (Page Title):
                    </label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="مثال: مطعم النرجس | أشهى المأكولات والمشاوي الفاخرة"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">يُفضل أن يكون بين 40 إلى 60 حرفاً.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      وصف الميتا (Meta Description):
                    </label>
                    <textarea
                      rows={3}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="وصف جذاب يوضح قيمة الموقع والخدمات للزوار عند البحث في Google..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">يُفضل أن يكون بين 120 إلى 160 حرفاً.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      الكلمات المفتاحية (Keywords - مفصولة بفواصل):
                    </label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="مطعم, مشاوي, توصيل طلبات, بغداد, حجز طاولات"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      صورة المشاركة الاجتماعية (Open Graph Image URL):
                    </label>
                    <input
                      type="url"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      أيقونة التبويب (Favicon URL):
                    </label>
                    <input
                      type="url"
                      value={favicon}
                      onChange={(e) => setFavicon(e.target.value)}
                      placeholder="https://example.com/favicon.ico"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Previews Column */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-600" />
                    <span>معاينة حية لنتائج بحث Google:</span>
                  </h4>
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1 text-right" dir="rtl">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                      <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{publishedBaseUrl}</span>
                    </div>
                    <h5 className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer truncate">
                      {seoTitle || project.title || 'عنوان الموقع'}
                    </h5>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {seoDescription || project.description || 'وصف الموقع سيظهر هنا في محركات البحث لجذب الزوار.'}
                    </p>
                  </div>

                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 pt-2">
                    <Share2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>معاينة بطاقة المشاركة الاجتماعية (WhatsApp / X / FB):</span>
                  </h4>
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                    {ogImage ? (
                      <img src={ogImage} alt="OG Banner" className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-24 bg-gradient-to-r from-emerald-600 to-teal-800 flex items-center justify-center text-white text-xs font-bold">
                        صورة بطاقة المشاركة الاجتماعية
                      </div>
                    )}
                    <div className="p-3 space-y-1 text-right" dir="rtl">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        {typeof window !== 'undefined' ? window.location.hostname : 'sawwiha.app'}
                      </span>
                      <h6 className="text-xs font-bold text-slate-900 truncate">
                        {seoTitle || project.title}
                      </h6>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {seoDescription || project.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM DOMAINS */}
          {activeTab === 'domain' && (
            <div className="space-y-5">
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 space-y-1">
                  <p className="font-bold">كيف يعمل النطاق المخصص في سَوّيها؟</p>
                  <p className="leading-relaxed">
                    يمكنك ربط دومين خاص تملكه (مثل <code>mybrand.com</code> أو <code>www.mybrand.com</code>) ليعرض موقعك مباشرة. يتم التحقق عبر إضافة سجلات DNS لدى مزود النطاقات الخاص بك (مثل GoDaddy أو Namecheap أو Cloudflare).
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  اسم النطاق المخصص الخاص بك:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDomainName}
                    onChange={(e) => setCustomDomainName(e.target.value)}
                    placeholder="example.com أو www.example.com"
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyDns}
                    disabled={isVerifyingDns || !customDomainName.trim()}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    {isVerifyingDns ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الفحص...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>فحص سجلات DNS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {dnsCheckResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    dnsCheckResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {dnsCheckResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>{dnsCheckResult.message}</span>
                  </div>
                  {dnsCheckResult.details && (
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700 pt-1">
                      {dnsCheckResult.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* DNS Instructions Table */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-800">
                  سجلات DNS المطلوبة في لوحة تحكم مزود النطاق:
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-right" dir="rtl">
                    <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">نوع السجل (Type)</th>
                        <th className="py-2.5 px-3">الاسم / المضيف (Host)</th>
                        <th className="py-2.5 px-3">القيمة / الهدف (Value)</th>
                        <th className="py-2.5 px-3">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-800 font-mono text-[11px]">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">CNAME</td>
                        <td className="py-2.5 px-3">@ أو www</td>
                        <td className="py-2.5 px-3 text-slate-600 flex items-center justify-between gap-2">
                          <span>{typeof window !== 'undefined' ? window.location.hostname : 'cname.sawwiha.app'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(typeof window !== 'undefined' ? window.location.hostname : 'cname.sawwiha.app', 'cname-val')}
                            className="text-slate-400 hover:text-slate-700"
                            title="نسخ"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-slate-100 text-slate-600">
                            {project.customDomain?.verified ? 'موثق' : 'مطلوب'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-blue-700">TXT</td>
                        <td className="py-2.5 px-3">_sawwiha-verify</td>
                        <td className="py-2.5 px-3 text-slate-600 flex items-center justify-between gap-2">
                          <span>sawwiha-site-verification={project.id}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(`sawwiha-site-verification=${project.id}`, 'txt-val')}
                            className="text-slate-400 hover:text-slate-700"
                            title="نسخ"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-slate-100 text-slate-600">
                            {project.customDomain?.verified ? 'موثق' : 'إثبات ملكية'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SITEMAP & ROBOTS */}
          {activeTab === 'sitemap' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1 text-slate-700">
                <p className="font-bold text-slate-900">ملفات الأرشفة التلقائية:</p>
                <p className="leading-relaxed">
                  تقوم منصة «سَوّيها» بإنشاء ملفات <code>sitemap.xml</code> و <code>robots.txt</code> حقيقية وديناميكية لموقعك المنشور فورياً لضمان فهرسة صفحاتك بسرعة في Google ومحركات البحث العالمية.
                </p>
              </div>

              {/* Sitemap.xml Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">ملف خريطة الموقع (sitemap.xml):</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                    نشط وديناميكي
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={sitemapUrl}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(sitemapUrl, 'sitemap')}
                    className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedLink === 'sitemap' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink === 'sitemap' ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(sitemapUrl, '_blank')}
                    className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح</span>
                  </button>
                </div>
              </div>

              {/* Robots.txt Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">ملف توجيه الزواحف (robots.txt):</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
                    نشط وديناميكي
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={robotsUrl}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(robotsUrl, 'robots')}
                    className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedLink === 'robots' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink === 'robots' ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(robotsUrl, '_blank')}
                    className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            إغلاق
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
