import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Code,
  Eye,
  Layers,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Save,
  ChevronDown,
  ChevronUp,
  Sliders,
  Utensils,
  ShoppingBag,
  Briefcase,
  Building2,
  Coffee,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  ProjectItem,
  SiteAnalysis,
  GeneratedCode,
  GenerationLog,
} from '../types';
import { requestAIAnalysis, requestAIGeneration } from '../services/aiBuilderService';
import {
  createProjectWithAIState,
  updateProjectGenerationState,
  saveProjectVersion,
} from '../firebase/projectService';

interface AIWebsiteBuilderViewProps {
  initialPrompt?: string;
  initialProject?: ProjectItem | null;
  onNavigateToDashboard: () => void;
  onOpenStudio?: (project: ProjectItem) => void;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type ViewTab = 'preview' | 'code' | 'structure';

export const AIWebsiteBuilderView: React.FC<AIWebsiteBuilderViewProps> = ({
  initialPrompt = '',
  initialProject = null,
  onNavigateToDashboard,
  onOpenStudio,
}) => {
  const {
    user,
    openAuthModal,
    platformSettings,
    userProfile,
    checkActionLimit,
    recordActionUsage,
    showPlanLimitNotice,
  } = useAuth();

  // Primary States
  const [prompt, setPrompt] = useState<string>(initialPrompt || initialProject?.originalPrompt || '');
  const [currentProject, setCurrentProject] = useState<ProjectItem | null>(initialProject);
  const [stage, setStage] = useState<'idle' | 'analyzing' | 'generating' | 'completed' | 'failed'>(
    initialProject?.currentCode?.html
      ? 'completed'
      : 'idle'
  );

  // Analysis & Generated Code
  const [analysis, setAnalysis] = useState<SiteAnalysis | null>(initialProject?.analysis || null);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(initialProject?.currentCode || null);
  const [logs, setLogs] = useState<GenerationLog[]>(initialProject?.generationLogs || []);
  const [errorMessage, setErrorMessage] = useState<string>(initialProject?.lastError || '');

  // Progress message state for friendly UX
  const [currentProgressStep, setCurrentProgressStep] = useState<number>(1);

  // UI Controls
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [viewTab, setViewTab] = useState<ViewTab>('preview');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showEditDrawer, setShowEditDrawer] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string>('');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Inspiration Presets
  const promptPresets = [
    {
      title: 'مطعم عراقي حديث',
      text: 'أريد موقع لمطعم عراقي حديث يقدم أطباقاً تقليدية بقائمة طعام وحجز طاولات وأزرار واتساب.',
      icon: Utensils,
    },
    {
      title: 'متجر عطور شرقية',
      text: 'متجر عطور شرقية وبخور فاخر بتصميم هادئ ومينيمالي وسلة مشتريات وتواصل سريع.',
      icon: ShoppingBag,
    },
    {
      title: 'معرض أعمال مصمم',
      text: 'معرض أعمال شخصي لمصمم واجهات ومطور ويب لعرض المشاريع المنجزة ونموذج استشارة.',
      icon: Briefcase,
    },
    {
      title: 'شركة استشارات رقمية',
      text: 'موقع تعريفي لشركة استشارات وحلول تقنية مع استعراض الخدمات، باقات الأسعار، وآراء العملاء.',
      icon: Building2,
    },
    {
      title: 'مقهى وقهوة مختصة',
      text: 'مقهى ومحمصة قهوة مختصة مع قائمة المشروبات وأجواء المكان وساعات العمل.',
      icon: Coffee,
    },
  ];

  // If initialPrompt was provided from landing page
  useEffect(() => {
    if (initialPrompt && !generatedCode && stage === 'idle') {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Log append helper
  const addLog = (message: string, stageName: string, status: 'pending' | 'success' | 'error') => {
    const newLog: GenerationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      stage: stageName,
      message,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      status,
    };
    setLogs((prev) => [...prev, newLog]);
    return newLog;
  };

  // FULL SEAMLESS BUILD FLOW: Analyze -> Immediately Generate Site Code
  const handleFullBuild = async (textToUse?: string) => {
    const text = (textToUse || prompt).trim();
    if (!text) {
      setErrorMessage('يرجى كتابة فكرة موقعك أولاً.');
      return;
    }

    if (!user) {
      openAuthModal('login');
      return;
    }

    // Phase 5: Check limits before starting expensive generation or creating project
    const isNewProject = !currentProject;
    if (isNewProject) {
      const projCheck = checkActionLimit('projects');
      if (!projCheck.allowed) {
        showPlanLimitNotice('projects');
        return;
      }
    }

    const aiCheck = checkActionLimit('aiGenerations');
    if (!aiCheck.allowed) {
      showPlanLimitNotice('aiGenerations');
      return;
    }

    setErrorMessage('');
    setStage('analyzing');
    setCurrentProgressStep(1);

    try {
      // Step 1: Analyze prompt
      const aiConfig = platformSettings.aiEngine;
      const analyzedResult = await requestAIAnalysis(text, aiConfig);
      setAnalysis(analyzedResult);

      // Save or create Firestore project document
      let projId = currentProject?.id || `proj_${Date.now()}`;
      let activeProj = currentProject;
      let firestoreProjectCreated = !!currentProject;

      if (!activeProj) {
        try {
          activeProj = await createProjectWithAIState(
            user.uid,
            user.email || '',
            user.displayName || userProfile?.displayName || 'مستخدم سَوّيها',
            {
              title: analyzedResult.suggestedTitle || text.substring(0, 28),
              description: text,
              originalPrompt: text,
              category: analyzedResult.siteType,
            }
          );
          setCurrentProject(activeProj);
          projId = activeProj.id;
          firestoreProjectCreated = true;
        } catch (dbErr) {
          console.warn('Could not create Firestore project immediately, using local project state:', dbErr);
          activeProj = {
            id: projId,
            userId: user.uid,
            ownerEmail: user.email || '',
            ownerName: user.displayName || userProfile?.displayName || 'مستخدم سَوّيها',
            title: analyzedResult.suggestedTitle || text.substring(0, 28),
            description: text,
            slug: 'website',
            category: analyzedResult.siteType,
            status: 'draft',
            generationStatus: 'analyzing',
            generationLogs: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCurrentProject(activeProj);
          firestoreProjectCreated = false;
        }
      }

      if (firestoreProjectCreated) {
        try {
          await updateProjectGenerationState(projId, {
            analysis: analyzedResult,
            generationStatus: 'analyzing',
          });
        } catch (errState) {
          console.warn('Initial project state update warning:', errState);
        }
      }

      // Step 2 & 3: Immediately trigger Generation for smooth SaaS UX
      setStage('generating');
      setCurrentProgressStep(2);

      // Brief pause for visual progress indicator
      await new Promise((r) => setTimeout(r, 600));
      setCurrentProgressStep(3);

      const code = await requestAIGeneration(text, analyzedResult, aiConfig);
      setGeneratedCode(code);

      // Update Firestore or local state with completed state
      if (firestoreProjectCreated) {
        try {
          await updateProjectGenerationState(projId, {
            currentCode: code,
            analysis: analyzedResult,
            status: 'ready',
            generationStatus: 'completed',
          });
        } catch (errState) {
          console.warn('Completed project state update warning:', errState);
        }

        // Save initial Version Snapshot in Firestore
        try {
          await saveProjectVersion(projId, {
            snapshotCode: code.html,
            promptTrigger: 'الإنشاء الأولي للموقع عبر محرك سَوّيها الذكي',
            type: 'initial_generate',
            authorEmail: user?.email || undefined,
          });
        } catch (verErr) {
          console.warn('Initial version save warning:', verErr);
        }
      }

      // Update currentProject in local memory
      setCurrentProject((prev) =>
        prev
          ? {
              ...prev,
              currentCode: code,
              analysis: analyzedResult,
              status: 'ready',
              generationStatus: 'completed',
            }
          : null
      );

      // Phase 5: Record usage in Firestore
      try {
        if (isNewProject) {
          await recordActionUsage('projects');
        }
        await recordActionUsage('aiGenerations');
      } catch (usageErr) {
        console.warn('Record usage warning:', usageErr);
      }

      setStage('completed');
      setShowEditDrawer(false);
    } catch (err: unknown) {
      console.warn('Build attempt error:', err);
      let errText = 'حدث خطأ أثناء بناء الموقع. يرجى المحاولة مرة أخرى.';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.error) {
            if (typeof parsed.error === 'string' && parsed.error.includes('Missing or insufficient permissions')) {
              errText = 'تم تحديث صلاحيات قواعد البيانات، يرجى إعادة المحاولة الآن.';
            } else {
              errText = String(parsed.error);
            }
          } else {
            errText = err.message;
          }
        } catch {
          errText = err.message;
        }
      }
      setErrorMessage(errText);
      setStage('failed');

      if (currentProject) {
        try {
          await updateProjectGenerationState(currentProject.id, {
            generationStatus: 'failed',
            lastError: errText,
          });
        } catch {
          // ignore background update error
        }
      }
    }
  };

  const handleCopyHtml = () => {
    if (!generatedCode?.html) return;
    navigator.clipboard.writeText(generatedCode.html);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleOpenFullscreen = () => {
    if (!generatedCode?.html) return;
    const blob = new Blob([generatedCode.html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleSaveToFirestore = async () => {
    if (!currentProject || !generatedCode) return;
    setIsSaving(true);
    try {
      await updateProjectGenerationState(currentProject.id, {
        currentCode: generatedCode,
        analysis: analysis || undefined,
        status: 'ready',
        generationStatus: 'completed',
      });
      setSaveSuccessNotice('تم حفظ موقعك في مشاريعك السحابية بنجاح.');
      setTimeout(() => setSaveSuccessNotice(''), 3500);
    } catch (e: unknown) {
      setErrorMessage(e instanceof Error ? e.message : 'فشل الحفظ في السحابة.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 text-right" dir="rtl">
      {/* 1. TOP FRIENDLY SAAS PROMPT AREA (When creating or editing) */}
      {(stage === 'idle' || stage === 'failed' || showEditDrawer) && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6 text-right">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>منشئ المواقع الذكي</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              شنو تريد تسوي؟
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl font-normal leading-relaxed">
              اكتب فكرة موقعك بالتفصيل أو بكلمات بسيطة، وسَوّيها راح تبنيه لك بالكامل في دقائق.
            </p>
          </div>

          {/* Prompt Textarea */}
          <div className="space-y-3">
            <div className="relative bg-slate-50/50 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all p-3 sm:p-4">
              <textarea
                id="ai-builder-main-input"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="مثال: أريد موقع لمطعم عراقي حديث يقدم حجز طاولات وقائمة أطعمة وأزرار تواصل وواتساب..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/70 mt-2">
                <span className="text-xs text-slate-400 hidden sm:inline-block">
                  اكتب بأي لهجة، والمحرك سيتولى تحويل الفكرة إلى موقع حقيقي متكامل
                </span>

                <button
                  id="btn-builder-submit"
                  type="button"
                  onClick={() => handleFullBuild()}
                  disabled={!prompt.trim()}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>سَوّيها</span>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                </button>
              </div>
            </div>

            {/* Quick Inspiration Presets */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-slate-400 block">أفكار جاهزة للتجربة الفورية:</span>
              <div className="flex flex-wrap gap-2">
                {promptPresets.map((preset, idx) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPrompt(preset.text);
                        handleFullBuild(preset.text);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200/70 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{preset.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Close drawer button if in completed view */}
          {stage === 'completed' && showEditDrawer && (
            <div className="pt-2 text-left">
              <button
                type="button"
                onClick={() => setShowEditDrawer(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
              >
                إخفاء صندوق التعديل والعودة للمعاينة
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-xs text-rose-700 underline font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* 2. FRIENDLY PROGRESS VIEW (No technical jargon) */}
      {(stage === 'analyzing' || stage === 'generating') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-10 sm:p-14 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">سَوّيها تبني موقعك الآن...</h2>
            <p className="text-sm text-slate-500">
              يرجى الانتظار ثوانٍ معدودة، نقوم بتجهيز الصفحات والألوان والتصميم المتجاوب.
            </p>
          </div>

          {/* Non-technical 3-step progress checklist */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-right space-y-3 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentProgressStep >= 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {currentProgressStep > 1 ? '✓' : '1'}
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentProgressStep >= 1 ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}
              >
                قراءة وتحليل فكرة موقعك وجمهورك...
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentProgressStep >= 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {currentProgressStep > 2 ? '✓' : '2'}
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentProgressStep >= 2 ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}
              >
                تصميم الأقسام والهيكل والألوان المتناسقة...
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentProgressStep >= 3
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentProgressStep >= 3 ? 'text-emerald-700 font-bold animate-pulse' : 'text-slate-400'
                }`}
              >
                تجهيز الكود المتجاوب ومعاينة الموقع...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. COMPLETED VIEW: PREVIEW & WORKSPACE */}
      {stage === 'completed' && generatedCode && (
        <div className="space-y-4">
          {/* Save Success Notice */}
          {saveSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessNotice}</span>
            </div>
          )}

          {/* Top Controls Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Title & Category Info */}
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-slate-900 text-base sm:text-lg">
                    {analysis?.suggestedTitle || currentProject?.title || 'الموقع المنشأ'}
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {analysis?.siteType || currentProject?.category || 'موقع متجاوب'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-md">
                  {prompt.substring(0, 75)}...
                </p>
              </div>
            </div>

            {/* Viewport Devices */}
            <div className="flex items-center justify-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-center">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewport === 'desktop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="كمبيوتر"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">كمبيوتر</span>
              </button>

              <button
                type="button"
                onClick={() => setViewport('tablet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewport === 'tablet' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="تابلت"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تابلت</span>
              </button>

              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewport === 'mobile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="جوال"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">جوال</span>
              </button>
            </div>

            {/* Tab Switcher & Quick Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewTab === 'preview' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>المعاينة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewTab('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewTab === 'code' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>الكود</span>
                </button>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={() => {
                  if (viewTab !== 'code') setViewTab('code');
                  handleCopyHtml();
                }}
                className="p-2 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="عرض ونسخ الكود"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedCode ? 'تم النسخ!' : 'عرض ونسخ الكود'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenFullscreen}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="فتح في نافذة كاملة"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">نافذة كاملة</span>
              </button>

              {onOpenStudio && currentProject && (
                <button
                  type="button"
                  onClick={() => {
                    if (currentProject) {
                      onOpenStudio({
                        ...currentProject,
                        currentCode: generatedCode,
                      });
                    }
                  }}
                  className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="فتح الموقع في استوديو التحرير الكامل (المرحلة 3)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  <span>استوديو التحرير (Studio)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowEditDrawer(!showEditDrawer)}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>تعديل الفكرة</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToFirestore}
                disabled={isSaving}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
              </button>
            </div>
          </div>

          {/* MAIN PREVIEW / CODE DISPLAY */}
          {viewTab === 'preview' && (
            <div className="bg-slate-100/70 rounded-3xl border border-slate-200/90 p-4 sm:p-6 min-h-[700px] flex items-center justify-center overflow-hidden">
              <div
                className={`transition-all duration-300 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden ${
                  viewport === 'desktop'
                    ? 'w-full h-[740px]'
                    : viewport === 'tablet'
                    ? 'w-[768px] h-[740px]'
                    : 'w-[375px] h-[680px]'
                }`}
              >
                {/* Browser bar mockup */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-500 font-mono truncate max-w-[260px]">
                    https://sawwiha.app/preview/{currentProject?.slug || 'my-site'}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    موقع حي
                  </span>
                </div>

                {/* Sandboxed iframe running the real generated site */}
                <iframe
                  ref={iframeRef}
                  title="المعاينة الحية للموقع"
                  srcDoc={generatedCode.html}
                  sandbox="allow-scripts allow-forms allow-same-origin"
                  className="w-full h-[calc(100%-41px)] border-0"
                />
              </div>
            </div>
          )}

          {viewTab === 'code' && (
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 text-left" dir="ltr">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3" dir="rtl">
                <span className="text-xs font-mono text-emerald-400 font-bold">index.html (HTML5 + Tailwind CSS)</span>
                <button
                  onClick={handleCopyHtml}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'تم النسخ' : 'نسخ الكود الكامل'}</span>
                </button>
              </div>
              <pre className="text-xs text-slate-300 font-mono overflow-x-auto max-h-[600px] p-2 leading-relaxed selection:bg-emerald-600 selection:text-white">
                <code>{generatedCode.html}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
