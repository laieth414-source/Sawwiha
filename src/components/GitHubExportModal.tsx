import React, { useState } from 'react';
import {
  X,
  Github,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Unlock,
  Key,
  FolderGit2,
  ArrowUpRight,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ProjectItem, GitHubRepoInfo } from '../types';
import { exportProjectToGitHub } from '../services/exportService';
import { updateProjectGitHubRepo } from '../firebase/projectService';

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem;
  currentHtml: string;
  onProjectUpdated: (updatedProject: ProjectItem) => void;
}

export const GitHubExportModal: React.FC<GitHubExportModalProps> = ({
  isOpen,
  onClose,
  project,
  currentHtml,
  onProjectUpdated,
}) => {
  const existingRepo = project.githubRepo;

  const [token, setToken] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [repoName, setRepoName] = useState<string>(
    existingRepo?.repoName || (project.slug || project.title || 'my-website').replace(/[^\w-]/g, '-')
  );
  const [description, setDescription] = useState<string>(
    project.description || `موقع ${project.title} تم إنشاؤه عبر منصة سَوّيها`
  );
  const [isPrivate, setIsPrivate] = useState<boolean>(existingRepo ? existingRepo.isPrivate : false);
  const [commitMessage, setCommitMessage] = useState<string>(
    existingRepo ? 'تحديث ملفات الموقع من استوديو سَوّيها' : 'الرفع الأولي لمشروع سَوّيها'
  );
  const [exportMode, setExportMode] = useState<'update' | 'new'>(existingRepo ? 'update' : 'new');

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<GitHubRepoInfo | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('الرجاء إدخال رمز الوصول الشخصي (GitHub Personal Access Token).');
      return;
    }
    if (!repoName.trim()) {
      setError('الرجاء إدخال اسم المستودع.');
      return;
    }

    setIsExporting(true);
    setError(null);
    setSuccessInfo(null);
    setCurrentStep('جاري التحقق من صلاحيات حساب GitHub...');

    try {
      setCurrentStep('جاري إنشاء/فحص المستودع ورفع الملفات...');

      const repoInfo = await exportProjectToGitHub(project, currentHtml, {
        token: token.trim(),
        repoName: repoName.trim(),
        description: description.trim(),
        isPrivate,
        commitMessage: commitMessage.trim(),
      });

      // Save repository connection state in Firestore
      await updateProjectGitHubRepo(project.id, repoInfo);

      const updatedProject: ProjectItem = {
        ...project,
        githubRepo: repoInfo,
      };

      onProjectUpdated(updatedProject);
      setSuccessInfo(repoInfo);
      setCurrentStep('تم اكتمال التصدير بنجاح!');
    } catch (err: unknown) {
      console.warn('GitHub export notice:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'فشلت عملية التصدير إلى GitHub. يرجى التحقق من صحة الرمز والصلاحيات.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">ترحيل المشروع إلى GitHub</h3>
              <p className="text-[11px] text-slate-500">
                تصدير كود المشروع وملفاته الحقيقية إلى مستودع مستقل
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Success State Screen */}
          {successInfo ? (
            <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  تم تصدير المشروع إلى GitHub بنجاح! 🎉
                </h4>
                <p className="text-xs text-slate-500">
                  تم إنشاء/تحديث كافة ملفات الموقع الحقيقية (HTML5, Config, README) على الفرع{' '}
                  <span className="font-mono text-emerald-700 font-bold">{successInfo.defaultBranch}</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-right space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">اسم المستودع:</span>
                  <span className="font-bold font-mono text-slate-800">
                    {successInfo.owner}/{successInfo.repoName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">الخصوصية:</span>
                  <span className="font-semibold text-slate-700">
                    {successInfo.isPrivate ? 'خاص (Private)' : 'عام (Public)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">تاريخ التصدير:</span>
                  <span className="text-slate-600">
                    {new Date(successInfo.lastExportedAt).toLocaleString('ar-SA')}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <a
                  href={successInfo.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <Github className="w-4 h-4" />
                  <span>فتح المستودع على GitHub</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setSuccessInfo(null)}
                  className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  تصدير تحديث جديد
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleExport} className="space-y-4">
              {/* Existing Repo Banner */}
              {existingRepo && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FolderGit2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold">المستودع المربوط: </span>
                      <a
                        href={existingRepo.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-emerald-700 underline font-bold"
                      >
                        {existingRepo.owner}/{existingRepo.repoName}
                      </a>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    آخر تصدير:{' '}
                    {new Date(existingRepo.lastExportedAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              )}

              {/* Mode switch if already connected */}
              {existingRepo && (
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setExportMode('update')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      exportMode === 'update'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    تصدير التحديثات لنفس المستودع
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportMode('new')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      exportMode === 'new'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    إنشاء مستودع جديد آخر
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: GitHub Token */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    <span>رمز الوصول الشخصي لـ GitHub (Token):</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>كيف أحصل عليه؟</span>
                  </button>
                </div>

                {showHelp && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-950 space-y-1.5 leading-relaxed">
                    <p className="font-bold">خطوات الحصول على الرمز مجاناً في دقيقة:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 pr-1">
                      <li>
                        توجه إلى{' '}
                        <a
                          href="https://github.com/settings/tokens/new?scopes=repo"
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 underline font-bold"
                        >
                          إعدادات رموز GitHub (GitHub Tokens)
                        </a>
                        .
                      </li>
                      <li>
                        قم بتوليد الرمز مع تفعيل صلاحية <span className="font-mono font-bold">repo</span>{' '}
                        أو <span className="font-mono font-bold">Contents: Read and write</span>.
                      </li>
                      <li>انسخ الرمز والصقه في الحقل أدناه (يستخدم الرمز للرفع المباشر ولا يتم تخزينه مكشوفاً أبداً).</li>
                    </ol>
                  </div>
                )}

                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    required
                    className="w-full h-10 px-3 pr-9 pl-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono focus:border-emerald-500 focus:outline-hidden transition-all text-left"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showToken ? 'إخفاء الرمز' : 'إظهار الرمز'}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step 2: Repository Name & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">اسم المستودع (Repository Name):</label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    required
                    placeholder="my-sawwiha-site"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono text-left focus:border-emerald-500 focus:outline-hidden transition-all"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">نوع المستودع:</label>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-medium cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      {isPrivate ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{isPrivate ? 'خاص (Private)' : 'عام (Public)'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">انقر للتبديل</span>
                  </button>
                </div>
              </div>

              {/* Commit Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">رسالة التعديل (Commit Message):</label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="تحديث ملفات الموقع عبر منصة سَوّيها"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs focus:border-emerald-500 focus:outline-hidden transition-all"
                />
              </div>

              {/* What will be uploaded */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1 text-xs">
                <p className="font-bold text-slate-800 text-[11px]">الملفات التي سيتم إنشاؤها ورفعها:</p>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-700">
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md">index.html</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md">README.md</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md">package.json</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md">vite.config.js</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md">.gitignore</span>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md">.env.example</span>
                </div>
              </div>

              {/* Current Progress Step */}
              {isExporting && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>{currentStep}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isExporting}
                  className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isExporting}
                  className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري التصدير لـ GitHub...</span>
                    </>
                  ) : existingRepo && exportMode === 'update' ? (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>تصدير التحديثات للمستودع</span>
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      <span>إنشاء وترحيل المستودع</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
