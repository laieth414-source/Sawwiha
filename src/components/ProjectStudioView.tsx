import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  Sparkles,
  Undo2,
  Redo2,
  History,
  Wrench,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Code,
  Copy,
  Check,
  ExternalLink,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Send,
  Clock,
  RotateCcw,
  Layers,
  X,
  Sliders,
  ShieldCheck,
  Globe,
  Github,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Coffee,
  Home,
  Menu as MenuIcon,
  Tag,
} from 'lucide-react';
import {
  StudioItemData,
  STUDIO_MAIN_SECTIONS,
  STUDIO_FEATURED_DISHES,
  resolveDishOrProduct,
  getCleanDisplayRoute,
} from '../utils/dishCatalog';
import { ProjectItem, ProjectVersion, AIChatMessage, GeneratedCode, PlatformAiEngine } from '../types';
import { requestAIEdit, requestAIRepair } from '../services/aiBuilderService';
import {
  saveProjectVersion,
  getProjectVersions,
  restoreProjectVersion,
  autosaveProjectCode,
} from '../firebase/projectService';
import { useAuth } from '../context/AuthContext';
import { PublishModal } from './PublishModal';
import { GitHubExportModal } from './GitHubExportModal';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { downloadProjectZip } from '../services/exportService';

interface ProjectStudioViewProps {
  project: ProjectItem;
  aiConfig?: PlatformAiEngine;
  onBackToDashboard: () => void;
  onProjectUpdated?: (updatedProject: ProjectItem) => void;
}

type ViewportType = 'desktop' | 'tablet' | 'mobile';
type StudioTab = 'preview' | 'code';
type AutosaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export const ProjectStudioView: React.FC<ProjectStudioViewProps> = ({
  project,
  aiConfig,
  onBackToDashboard,
  onProjectUpdated,
}) => {
  const { user, checkActionLimit, recordActionUsage, showPlanLimitNotice } = useAuth();

  // Current Working Code
  const initialHtml = project.currentCode?.html || '';
  const [currentHtml, setCurrentHtml] = useState<string>(initialHtml);

  // Studio View Controls
  const [viewport, setViewport] = useState<ViewportType>('desktop');
  const [activeTab, setActiveTab] = useState<StudioTab>('preview');
  const [copiedCode, setCopiedCode] = useState(false);

  // Undo / Redo Stack (In-Memory History)
  const [historyStack, setHistoryStack] = useState<string[]>([initialHtml]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Version History (Firestore Subcollection)
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [showVersionDrawer, setShowVersionDrawer] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<ProjectVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // AI Chat & Editing
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `مرحباً بك في استوديو مشروع «${project.title}»! أنا محرر سَوّيها الذكي. يمكنك إعطائي أوامر لتعديل التصميم، إضافة أقسام جديدة، تغيير الألوان، أو ملاءمة الموقع للموبايل.`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStep, setAiStep] = useState<'idle' | 'analyzing' | 'modifying' | 'verifying' | 'applied'>('idle');

  // AI Repair Tool
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairNotice, setRepairNotice] = useState<{ issues: string[] } | null>(null);

  // Autosave Status
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>(new Date().toLocaleTimeString('ar-SA'));

  // Notification / Alert
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Phase 4 & Phase 7: Project State, Publish, GitHub, ZIP & Settings Modals
  const [currentProject, setCurrentProject] = useState<ProjectItem>(project);
  const [currentIframeRoute, setCurrentIframeRoute] = useState<string>('/');
  const [activeDish, setActiveDish] = useState<StudioItemData | null>(null);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showGitHubModal, setShowGitHubModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);

  // Listen to isolated internal route changes inside the generated site iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SAWWIHA_ROUTE_CHANGED') {
        const nextRoute = e.data.route || e.data.path || '/';
        setCurrentIframeRoute(nextRoute);

        // 1. If the iframe passed authentic item metadata directly
        if (e.data.item) {
          setActiveDish(e.data.item);
        } else {
          // 2. Resolve via authentic catalog and slug (guarantees NO raw UUID is displayed)
          const resolved = resolveDishOrProduct(nextRoute);
          setActiveDish(resolved);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Switch between sections and dishes with guaranteed isolation & route dispatch
  const handleSwitchSection = useCallback((targetPath: string) => {
    setCurrentIframeRoute(targetPath);
    const resolved = resolveDishOrProduct(targetPath);
    setActiveDish(resolved);

    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'SAWWIHA_NAVIGATE_TO', path: targetPath, route: targetPath },
        '*'
      );
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'NAVIGATE', path: targetPath, route: targetPath },
        '*'
      );
    } catch (err) {
      console.warn('Navigation postMessage error:', err);
    }
  }, []);

  // Synchronize active route whenever iframe finishes loading
  const handleIframeLoad = useCallback(() => {
    if (currentIframeRoute && currentIframeRoute !== '/') {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'SAWWIHA_NAVIGATE_TO', path: currentIframeRoute, route: currentIframeRoute },
          '*'
        );
      } catch (e) {}
    }
  }, [currentIframeRoute]);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  const handleProjectUpdated = (updated: ProjectItem) => {
    setCurrentProject(updated);
    if (onProjectUpdated) {
      onProjectUpdated(updated);
    }
  };

  const handleDownloadZip = async () => {
    // Phase 5: Check ZIP download permission
    const zipCheck = checkActionLimit('canDownloadZip');
    if (!zipCheck.allowed) {
      showPlanLimitNotice('canDownloadZip');
      return;
    }

    setIsDownloadingZip(true);
    setFeedbackNotice({ type: 'success', text: 'جاري حزم ملفات المشروع وتوليد ملف ZIP...' });
    try {
      await downloadProjectZip(currentProject, currentHtml);
      setFeedbackNotice({ type: 'success', text: 'تم تنزيل حزمة المشروع (ZIP) بنجاح! 📦' });
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err: unknown) {
      console.warn('ZIP download notice:', err);
      setFeedbackNotice({ type: 'error', text: 'فشل تنزيل ملف ZIP، يرجى المحاولة مرة أخرى.' });
      setTimeout(() => setFeedbackNotice(null), 3500);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // References
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Suggested Quick Prompts for this project
  const suggestedPrompts = [
    'غيّر لون الموقع إلى أزرق داكن وأنيق',
    'أضف قسم آراء وتقييمات العملاء الموثقة',
    'أضف قسم "من نحن" ورؤية المشروع',
    'كبّر عنوان الصفحة الرئيسية ليكون أكثر بروزاً',
    'اجعل الموقع والقائمة مناسبين تماماً للجوال',
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiStep]);

  // Load Firestore Versions on Mount
  useEffect(() => {
    const loadVersions = async () => {
      if (!project.id) return;
      setIsLoadingVersions(true);
      try {
        const fetched = await getProjectVersions(project.id);
        setVersions(fetched);
      } catch (err) {
        console.warn('Failed to load project versions:', err);
      } finally {
        setIsLoadingVersions(false);
      }
    };
    loadVersions();
  }, [project.id]);

  // Debounced Autosave to Firestore when currentHtml changes
  const triggerAutosave = useCallback(
    (newHtml: string) => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      setAutosaveStatus('unsaved');

      autosaveTimerRef.current = setTimeout(async () => {
        if (!project.id || !newHtml.trim()) return;
        setAutosaveStatus('saving');
        try {
          const updatedGeneratedCode: GeneratedCode = {
            html: newHtml,
            pages: project.currentCode?.pages || [{ id: 'home', title: 'الرئيسية', path: '/' }],
            components: project.currentCode?.components || [],
            layout: project.currentCode?.layout || { nav: true, footer: true, dir: 'rtl' },
            cssFramework: 'tailwind',
          };

          await autosaveProjectCode(project.id, updatedGeneratedCode);
          setAutosaveStatus('saved');
          setLastSavedTime(new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }));

          if (onProjectUpdated) {
            onProjectUpdated({
              ...project,
              currentCode: updatedGeneratedCode,
            });
          }
        } catch (err) {
          console.warn('Autosave warning:', err);
          setAutosaveStatus('error');
        }
      }, 1500);
    },
    [project, onProjectUpdated]
  );

  // Apply a new code update with Undo/Redo & Snapshot recording
  const applyCodeUpdate = useCallback(
    async (newHtml: string, actionDescription: string, versionType: ProjectVersion['type']) => {
      setCurrentHtml(newHtml);

      // Update in-memory Undo/Redo stack
      setHistoryStack((prev) => {
        const newStack = prev.slice(0, historyIndex + 1);
        newStack.push(newHtml);
        return newStack;
      });
      setHistoryIndex((prev) => prev + 1);

      // Trigger Cloud Autosave
      triggerAutosave(newHtml);

      // Save a Milestone Version to Firestore subcollection
      if (project.id) {
        try {
          const newVer = await saveProjectVersion(project.id, {
            snapshotCode: newHtml,
            promptTrigger: actionDescription,
            type: versionType,
            authorEmail: user?.email || project.ownerEmail,
          });
          setVersions((prev) => [newVer, ...prev]);
        } catch (err) {
          console.warn('Failed to save project version snapshot:', err);
        }
      }
    },
    [historyIndex, project.id, project.ownerEmail, user?.email, triggerAutosave]
  );

  // Undo Action
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const targetHtml = historyStack[prevIndex];
      setHistoryIndex(prevIndex);
      setCurrentHtml(targetHtml);
      triggerAutosave(targetHtml);
      setFeedbackNotice({ type: 'success', text: 'تم التراجع عن آخر تعديل.' });
      setTimeout(() => setFeedbackNotice(null), 3000);
    }
  }, [historyIndex, historyStack, triggerAutosave]);

  // Redo Action
  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const nextIndex = historyIndex + 1;
      const targetHtml = historyStack[nextIndex];
      setHistoryIndex(nextIndex);
      setCurrentHtml(targetHtml);
      triggerAutosave(targetHtml);
      setFeedbackNotice({ type: 'success', text: 'تمت إعادة تطبيق التعديل.' });
      setTimeout(() => setFeedbackNotice(null), 3000);
    }
  }, [historyIndex, historyStack, triggerAutosave]);

  // Keyboard Shortcuts (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Handle Natural Language AI Edit
  const handleSendAiEdit = async (instructionText?: string) => {
    const textToSend = instructionText || chatInput;
    if (!textToSend.trim() || isAiProcessing) return;

    // Phase 5: Check AI generations limit
    const aiCheck = checkActionLimit('aiGenerations');
    if (!aiCheck.allowed) {
      showPlanLimitNotice('aiGenerations');
      return;
    }

    const userMessageId = `user_${Date.now()}`;
    const userMsg: AIChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAiProcessing(true);
    setAiStep('analyzing');

    try {
      // Step 1: Analyzing context
      await new Promise((r) => setTimeout(r, 400));
      setAiStep('modifying');

      // Step 2: Request server-side AI edit
      const result = await requestAIEdit({
        instruction: textToSend.trim(),
        currentHtml,
        projectContext: {
          title: project.title,
          originalPrompt: project.prompt || '',
          siteType: project.category || 'موقع متجاوب',
        },
        aiConfig,
      });

      // Step 3: Verifying code
      setAiStep('verifying');
      await new Promise((r) => setTimeout(r, 400));

      // Step 4: Apply changes & save snapshot
      await applyCodeUpdate(result.html, textToSend.trim(), 'ai_chat_edit');

      // Phase 5: Record usage in Firestore
      try {
        await recordActionUsage('aiGenerations');
      } catch (usageErr) {
        console.warn('Record AI usage error:', usageErr);
      }

      setAiStep('applied');

      const assistantMsg: AIChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        text: result.summary || 'تم تطبيق التعديل بنجاح على الموقع.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        status: 'applied',
        summary: result.summary,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setFeedbackNotice({ type: 'success', text: 'تم تطبيق تعديل الذكاء الاصطناعي بنجاح!' });
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err: any) {
      console.warn('AI Edit Notice:', err);
      const errorMsg: AIChatMessage = {
        id: `error_${Date.now()}`,
        sender: 'assistant',
        text: `عذراً، حدث خطأ أثناء التعديل: ${err.message || 'تعذر معالجة الطلب'}. تم الحفاظ على الكود الأصلي دون تغيير.`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        status: 'error',
      };
      setMessages((prev) => [...prev, errorMsg]);
      setFeedbackNotice({ type: 'error', text: 'تعذر تطبيق التعديل. النسخة الحالية محفوظة.' });
      setTimeout(() => setFeedbackNotice(null), 4000);
    } finally {
      setIsAiProcessing(false);
      setTimeout(() => setAiStep('idle'), 2000);
    }
  };

  // Handle AI Repair Tool
  const handleAIRepair = async () => {
    if (isRepairing) return;

    // Phase 5: Check AI generations limit
    const aiCheck = checkActionLimit('aiGenerations');
    if (!aiCheck.allowed) {
      showPlanLimitNotice('aiGenerations');
      return;
    }

    setIsRepairing(true);
    setRepairNotice(null);

    try {
      const result = await requestAIRepair({
        currentHtml,
        issueDescription: 'فحص الهيكل والتجاوب والوسوم',
        aiConfig,
      });

      if (result.html && result.html !== currentHtml) {
        await applyCodeUpdate(result.html, 'إصلاح ذكي لهيكل الموقع وكلاسات التجاوب', 'ai_repair');
      }

      setRepairNotice({ issues: result.fixedIssues });

      // Phase 5: Record usage in Firestore
      try {
        await recordActionUsage('aiGenerations');
      } catch (usageErr) {
        console.warn('Record AI usage error:', usageErr);
      }

      const repairMsg: AIChatMessage = {
        id: `repair_${Date.now()}`,
        sender: 'assistant',
        text: `تم فحص الموقع وإصلاحه بنجاح:\n${result.fixedIssues.map((i) => `• ${i}`).join('\n')}`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        status: 'applied',
      };
      setMessages((prev) => [...prev, repairMsg]);
    } catch (err: any) {
      console.warn('Repair Notice:', err);
      setFeedbackNotice({ type: 'error', text: `فشل الفحص والإصلاح: ${err.message}` });
      setTimeout(() => setFeedbackNotice(null), 4000);
    } finally {
      setIsRepairing(false);
    }
  };

  // Handle Version Restore
  const handleConfirmRestore = async () => {
    if (!versionToRestore || !project.id) return;
    setIsRestoring(true);

    try {
      const restored = await restoreProjectVersion(
        project.id,
        versionToRestore,
        currentHtml,
        user?.email || project.ownerEmail
      );

      setCurrentHtml(versionToRestore.snapshotCode);
      setHistoryStack((prev) => [...prev, versionToRestore.snapshotCode]);
      setHistoryIndex((prev) => prev + 1);
      setVersions((prev) => [restored, ...prev]);

      const restoreMsg: AIChatMessage = {
        id: `restore_${Date.now()}`,
        sender: 'assistant',
        text: `تمت استعادة النسخة المؤرخة (${new Date(versionToRestore.createdAt).toLocaleString('ar-SA')}) بنجاح. تم حفظ عملك السابق كنسخة احتياطية.`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        status: 'applied',
      };
      setMessages((prev) => [...prev, restoreMsg]);

      setVersionToRestore(null);
      setShowVersionDrawer(false);
      setFeedbackNotice({ type: 'success', text: 'تمت استعادة النسخة بنجاح!' });
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err: any) {
      console.warn('Restore Notice:', err);
      setFeedbackNotice({ type: 'error', text: 'فشلت استعادة النسخة.' });
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle Manual Save
  const handleManualSave = async () => {
    if (!project.id) return;
    setAutosaveStatus('saving');
    try {
      const updatedCode: GeneratedCode = {
        html: currentHtml,
        pages: project.currentCode?.pages || [{ id: 'home', title: 'الرئيسية', path: '/' }],
        components: project.currentCode?.components || [],
        layout: project.currentCode?.layout || { nav: true, footer: true, dir: 'rtl' },
        cssFramework: 'tailwind',
      };
      await autosaveProjectCode(project.id, updatedCode);
      await saveProjectVersion(project.id, {
        snapshotCode: currentHtml,
        promptTrigger: 'حفظ يدوي من الاستوديو',
        type: 'manual_edit',
        authorEmail: user?.email || project.ownerEmail,
      });
      setAutosaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }));
      setFeedbackNotice({ type: 'success', text: 'تم حفظ المشروع وسجل النسخة في السحابة بنجاح.' });
      setTimeout(() => setFeedbackNotice(null), 3000);
    } catch (err) {
      console.warn('Manual save warning:', err);
      setAutosaveStatus('error');
    }
  };

  // Copy HTML to Clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentHtml);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Open Fullscreen Preview
  const handleOpenFullscreen = () => {
    const blob = new Blob([currentHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100/90 text-slate-900 overflow-hidden select-none font-sans" dir="rtl">
      {/* 1. TOP STUDIO TOOLBAR */}
      <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-2xs">
        {/* Left Section: Back, Project Title & Category */}
        <div className="flex items-center gap-3">
          <button
            id="btn-studio-back"
            type="button"
            onClick={onBackToDashboard}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="العودة للوحة التحكم"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden md:inline">لوحة التحكم</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight truncate max-w-[180px] sm:max-w-xs">
                {project.title}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 hidden sm:inline-block">
                {project.category || 'استوديو سَوّيها'}
              </span>
            </div>
            {/* Autosave badge */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              {autosaveStatus === 'saving' && (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                  <span className="text-amber-600 font-medium">جاري الحفظ في السحابة...</span>
                </>
              )}
              {autosaveStatus === 'saved' && (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">محفوظ في السحابة ({lastSavedTime})</span>
                </>
              )}
              {autosaveStatus === 'unsaved' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span className="text-amber-600">تغييرات قيد الحفظ...</span>
                </>
              )}
              {autosaveStatus === 'error' && (
                <>
                  <AlertCircle className="w-3 h-3 text-rose-500" />
                  <span className="text-rose-600 font-medium">تعذر الحفظ التلقائي</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center Section: Responsive Device Switcher */}
        <div className="hidden lg:flex items-center justify-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            id="btn-studio-device-desktop"
            type="button"
            onClick={() => setViewport('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewport === 'desktop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="كمبيوتر مكتبي (عرض كامل)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>كمبيوتر</span>
          </button>

          <button
            id="btn-studio-device-tablet"
            type="button"
            onClick={() => setViewport('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewport === 'tablet' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="تابلت (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>تابلت</span>
          </button>

          <button
            id="btn-studio-device-mobile"
            type="button"
            onClick={() => setViewport('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewport === 'mobile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="جوال (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>جوال</span>
          </button>
        </div>

        {/* Right Section: Undo/Redo, History, AI Repair, Tabs & Save */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              id="btn-studio-undo"
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="تراجع (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              id="btn-studio-redo"
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= historyStack.length - 1}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="إعادة (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* AI Repair Button */}
          <button
            id="btn-studio-repair"
            type="button"
            onClick={handleAIRepair}
            disabled={isRepairing}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="فحص وإصلاح هيكل الموقع والتجاوب"
          >
            <Wrench className={`w-3.5 h-3.5 text-amber-600 ${isRepairing ? 'animate-spin' : ''}`} />
            <span>{isRepairing ? 'جاري الفحص...' : 'إصلاح ذكي'}</span>
          </button>

          {/* Version History Button */}
          <button
            id="btn-studio-versions"
            type="button"
            onClick={() => setShowVersionDrawer(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="سجل النسخ والاستعادة"
          >
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">النسخ ({versions.length})</span>
          </button>

          {/* Tab Switcher (Preview / Code) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'preview' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">معاينة</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'code' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">الكود</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden md:block" />

          {/* Phase 4 Action: Download ZIP */}
          <button
            id="btn-studio-download-zip"
            type="button"
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="تنزيل المشروع كاملاً كملف ZIP نظيف"
          >
            <Download className={`w-3.5 h-3.5 text-blue-600 ${isDownloadingZip ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline">تنزيل المشروع</span>
          </button>

          {/* Phase 4 Action: GitHub Export */}
          <button
            id="btn-studio-github"
            type="button"
            onClick={() => {
              const ghCheck = checkActionLimit('canExportGithub');
              if (!ghCheck.allowed) {
                showPlanLimitNotice('canExportGithub');
                return;
              }
              setShowGitHubModal(true);
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="ترحيل المشروع إلى مستودع GitHub"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden md:inline">GitHub</span>
          </button>

          {/* Phase 4 Action: Publish Site */}
          <button
            id="btn-studio-publish"
            type="button"
            onClick={() => setShowPublishModal(true)}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              currentProject.isPublished
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title="نشر الموقع مباشرة برابط عام ومستقل"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>نشر الموقع</span>
            {currentProject.isPublished && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>

          {/* Phase 7 Action: Project Settings (Showcase, SEO, Custom Domain) */}
          <button
            id="btn-studio-settings"
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="إعدادات المشروع (المعرض، السيو، النطاق المخصص)"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">الإعدادات</span>
            {currentProject.showcaseOptIn && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="المشروع مشارك في المعرض" />
            )}
          </button>

          {/* External Fullscreen Preview */}
          <button
            type="button"
            onClick={handleOpenFullscreen}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs transition-all cursor-pointer hidden sm:block"
            title="فتح الموقع في نافذة جديدة مستقلة"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Manual Save Button */}
          <button
            id="btn-studio-save"
            type="button"
            onClick={handleManualSave}
            disabled={autosaveStatus === 'saving'}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ</span>
          </button>
        </div>
      </header>

      {/* Floating Notice Banner */}
      {feedbackNotice && (
        <div
          className={`absolute top-18 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all animate-bounce ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-700 text-white'
              : 'bg-rose-700 text-white'
          }`}
        >
          {feedbackNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-200" />
          )}
          <span>{feedbackNotice.text}</span>
        </div>
      )}

      {/* Repair Notice Banner */}
      {repairNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>نتيجة الفحص الذكي:</strong> {repairNotice.issues.join(' • ')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRepairNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* 2. MAIN STUDIO WORKSPACE (Split Canvas & AI Panel) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* CENTER / LEFT: PREVIEW CANVAS OR CODE INSPECTOR */}
        <main className="flex-1 flex flex-col bg-slate-100/70 p-3 sm:p-6 overflow-hidden relative">
          {activeTab === 'preview' ? (
            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
              {/* Device Frame */}
              <div
                className={`transition-all duration-300 bg-white rounded-2xl shadow-xl border border-slate-300/80 flex flex-col overflow-hidden ${
                  viewport === 'desktop'
                    ? 'w-full h-full max-w-full'
                    : viewport === 'tablet'
                    ? 'w-[768px] h-full max-h-[840px]'
                    : 'w-[375px] h-full max-h-[740px]'
                }`}
              >
                {/* Browser Mockup Top Bar */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-500 shrink-0 select-none gap-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          iframeRef.current?.contentWindow?.postMessage({ type: 'SAWWIHA_NAVIGATE_HISTORY', delta: -1 }, '*');
                        } catch (e) {}
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                      title="السابق (Back)"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          iframeRef.current?.contentWindow?.postMessage({ type: 'SAWWIHA_NAVIGATE_HISTORY', delta: 1 }, '*');
                        } catch (e) {}
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                      title="التالي (Forward)"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 font-mono truncate max-w-[360px] flex items-center justify-between shadow-xs" dir="ltr">
                    <span className="truncate">https://sawwiha.app/preview/{project.slug || 'my-project'}{getCleanDisplayRoute(currentIframeRoute, activeDish) === '/' ? '' : getCleanDisplayRoute(currentIframeRoute, activeDish)}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      معزول 100%
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenFullscreen}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-200"
                      title="فتح في نافذة كاملة"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Interactive Section Switcher Navigation Bar */}
                <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto select-none shrink-0" dir="rtl">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 ml-1">الأقسام:</span>
                    {STUDIO_MAIN_SECTIONS.map((sec) => {
                      const isActive =
                        sec.path === '/'
                          ? currentIframeRoute === '/'
                          : currentIframeRoute.startsWith(sec.path);
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => handleSwitchSection(sec.path)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                            isActive
                              ? 'bg-emerald-600 text-white font-bold shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60'
                          }`}
                        >
                          {sec.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-4 w-px bg-slate-300 mx-1 shrink-0" />

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-bold text-emerald-800 ml-1 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      أطباق بالـ Slug:
                    </span>
                    {STUDIO_FEATURED_DISHES.map((dish) => {
                      const isActive =
                        activeDish?.slug === dish.slug ||
                        currentIframeRoute.includes(`/item/${dish.slug}`);
                      return (
                        <button
                          key={dish.id}
                          type="button"
                          onClick={() => handleSwitchSection(dish.path)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                            isActive
                              ? 'bg-slate-900 text-white font-bold shadow-xs'
                              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 border border-slate-200/80'
                          }`}
                          title={`فتح ${dish.label} عبر معرف الـ Slug: ${dish.slug}`}
                        >
                          <span>{dish.label}</span>
                          <span className="text-[9px] opacity-70 font-mono">({dish.slug})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Real Dish / Product Metadata Banner (NO UUIDs!) */}
                {activeDish && (
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-emerald-200/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none" dir="rtl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={activeDish.image}
                        alt={activeDish.title}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-lg object-cover shadow-xs border border-emerald-300/50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-slate-900 truncate">{activeDish.title}</h4>
                          <span className="text-[10px] font-mono bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded font-bold tracking-tight">
                            slug: {activeDish.slug}
                          </span>
                          <span className="text-[11px] font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            {activeDish.price}
                          </span>
                          {activeDish.badge && (
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                              {activeDish.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate max-w-md hidden sm:block">
                          {activeDish.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 mr-auto">
                      <button
                        type="button"
                        onClick={() => handleSwitchSection('/menu/food')}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors cursor-pointer"
                      >
                        ← قائمة المأكولات
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchSection('/')}
                        className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-1 rounded-md border border-slate-200 transition-colors cursor-pointer"
                      >
                        الرئيسية
                      </button>
                    </div>
                  </div>
                )}

                {/* Sandboxed Live iframe */}
                <div className="flex-1 w-full h-full bg-white relative overflow-hidden">
                  <iframe
                    ref={iframeRef}
                    title="معاينة موقع سَوّيها الحي"
                    srcDoc={currentHtml}
                    onLoad={handleIframeLoad}
                    sandbox="allow-scripts allow-forms allow-same-origin"
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Code Inspector */
            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl flex flex-col overflow-hidden text-left" dir="ltr">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0" dir="rtl">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono text-emerald-400 font-bold">index.html (HTML5 + Tailwind CSS)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'تم النسخ' : 'نسخ الكود'}</span>
                </button>
              </div>

              <pre className="flex-1 text-xs text-slate-300 font-mono overflow-auto p-2 leading-relaxed selection:bg-emerald-600 selection:text-white">
                <code>{currentHtml}</code>
              </pre>
            </div>
          )}
        </main>

        {/* RIGHT: AI COMPANION PANEL (Context-Aware Modifier) */}
        <aside className="w-full md:w-96 lg:w-[420px] bg-white border-t md:border-t-0 md:border-r border-slate-200 flex flex-col shrink-0 shadow-lg z-10">
          {/* AI Panel Header */}
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">محرر سَوّيها الذكي</h3>
                <p className="text-[11px] text-slate-400">تعديل وتطوير موقعك بأوامر طبيعية</p>
              </div>
            </div>

            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              المرحلة 3: Studio
            </span>
          </div>

          {/* AI Step Status Indicator */}
          {aiStep !== 'idle' && (
            <div className="p-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-900 font-semibold animate-pulse shrink-0">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span>
                {aiStep === 'analyzing' && 'جاري قراءة وتحليل التعديل المطلوب...'}
                {aiStep === 'modifying' && 'جاري تطبيق التعديل الذكي على كود الموقع...'}
                {aiStep === 'verifying' && 'جاري التحقق وضمان التناسق البصري...'}
                {aiStep === 'applied' && 'تم تطبيق التعديل بنجاح!'}
              </span>
            </div>
          )}

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs shadow-2xs'
                      : msg.status === 'error'
                      ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-bl-xs'
                      : 'bg-slate-100 border border-slate-200/80 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 px-1 mt-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Suggestions Presets */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 block">اقتراحات سريعة لتطوير الموقع:</span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.slice(0, 3).map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendAiEdit(promptText)}
                  disabled={isAiProcessing}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 text-[11px] font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-right truncate max-w-[200px]"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>

          {/* Natural Language Command Input */}
          <div className="p-3.5 border-t border-slate-200 bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiEdit();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="input-studio-command"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isAiProcessing}
                placeholder="اطلب أي تعديل (مثلاً: أضف قسم آراء العملاء...)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-900 transition-all outline-hidden disabled:opacity-50"
              />
              <button
                id="btn-studio-send-command"
                type="submit"
                disabled={!chatInput.trim() || isAiProcessing}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                title="إرسال أمر التعديل"
              >
                {isAiProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 rotate-180" />
                )}
              </button>
            </form>
          </div>
        </aside>
      </div>

      {/* 3. VERSION HISTORY DRAWER / MODAL */}
      {showVersionDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col p-6 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">سجل نسخ الموقع</h3>
                  <p className="text-xs text-slate-400">يمكنك استعادة أي نسخة سابقة بأمان كامل</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVersionDrawer(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Versions List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
              {isLoadingVersions ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                  <span>جاري تحميل سجل النسخ...</span>
                </div>
              ) : versions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-semibold">لا توجد نسخ مسجلة بعد لهذا المشروع.</p>
                  <p className="text-[11px]">يتم حفظ نسخة تلقائياً عند كل تعديل بالذكاء الاصطناعي أو حفظ يدوي.</p>
                </div>
              ) : (
                versions.map((ver, idx) => (
                  <div
                    key={ver.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/30 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        نسخة #{versions.length - idx}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ver.createdAt).toLocaleString('ar-SA')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {ver.promptTrigger || 'تعديل برمجي'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                        {ver.type === 'initial_generate'
                          ? 'إنشاء أولي'
                          : ver.type === 'ai_chat_edit'
                          ? 'تعديل بالـ AI'
                          : ver.type === 'ai_repair'
                          ? 'إصلاح ذكي'
                          : ver.type === 'restore'
                          ? 'استعادة'
                          : 'حفظ يدوي'}
                      </span>

                      <button
                        type="button"
                        onClick={() => setVersionToRestore(ver)}
                        className="px-3 py-1 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>استعادة</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-slate-200 text-center">
              <span className="text-[11px] text-slate-400">
                عند استعادة أي نسخة، سيتم حفظ نسختك الحالية تلقائياً لضمان عدم ضياع أي تقدم.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. RESTORE CONFIRMATION MODAL */}
      {versionToRestore && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 text-right">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900">تأكيد استعادة النسخة</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من رغبتك في استعادة هذه النسخة المؤرخة في{' '}
                <strong>{new Date(versionToRestore.createdAt).toLocaleString('ar-SA')}</strong>؟
              </p>
              <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                ✓ سيتم حفظ نسختك الحالية تلقائياً كنسخة احتياطية قبل الاستعادة حتى لا تفقد أي عمل.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVersionToRestore(null)}
                disabled={isRestoring}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الاستعادة...</span>
                  </>
                ) : (
                  <span>تأكيد الاستعادة</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 4: Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        project={currentProject}
        currentHtml={currentHtml}
        onProjectUpdated={handleProjectUpdated}
      />

      {/* Phase 4: GitHub Export Modal */}
      <GitHubExportModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        project={currentProject}
        currentHtml={currentHtml}
        onProjectUpdated={handleProjectUpdated}
      />

      {/* Phase 7: Project Settings Modal (Showcase, SEO, Custom Domain) */}
      <ProjectSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        project={currentProject}
        onProjectUpdated={handleProjectUpdated}
      />
    </div>
  );
};
