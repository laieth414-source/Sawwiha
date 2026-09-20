import { SiteAnalysis, GeneratedCode, PlatformAiEngine } from '../types';

export interface AIAnalysisResponse {
  success: boolean;
  analysis: SiteAnalysis;
  error?: string;
}

export interface AIGenerateResponse {
  success: boolean;
  code: GeneratedCode;
  error?: string;
}

function formatAiServiceErrorMessage(errorData: any, status: number, defaultMsg: string): string {
  let raw = errorData?.error || errorData?.message || defaultMsg;
  if (typeof raw === 'object') {
    raw = raw.message || JSON.stringify(raw);
  }
  const str = String(raw);
  if (str.includes('503') || str.includes('high demand') || str.includes('UNAVAILABLE') || status === 503) {
    return 'محرك الذكاء الاصطناعي يواجه ضغطاً مؤقتاً في الطلبات، جاري التوليد وإعادة المحاولة تلقائياً.';
  }
  if (str.includes('429') || str.includes('RESOURCE_EXHAUSTED') || status === 429) {
    return 'تم الوصول للحد المؤقت لطلبات الذكاء الاصطناعي، يرجى الانتظار لثوانٍ وإعادة المحاولة.';
  }
  return str;
}

/**
 * Call server-side AI Analysis endpoint
 */
export async function requestAIAnalysis(
  prompt: string,
  aiConfig?: PlatformAiEngine
): Promise<SiteAnalysis> {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aiConfig,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(formatAiServiceErrorMessage(errorData, response.status, `خطأ في استجابة الخادم (${response.status})`));
  }

  const data: AIAnalysisResponse = await response.json();
  if (!data.success || !data.analysis) {
    throw new Error(formatAiServiceErrorMessage(data, 200, 'لم يتم استلام تحليل صالح من محرك الذكاء الاصطناعي.'));
  }

  return data.analysis;
}

/**
 * Call server-side AI Website Generation endpoint
 */
export async function requestAIGeneration(
  prompt: string,
  analysis: SiteAnalysis,
  aiConfig?: PlatformAiEngine
): Promise<GeneratedCode> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      analysis,
      aiConfig,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(formatAiServiceErrorMessage(errorData, response.status, `خطأ في استجابة خادم التوليد (${response.status})`));
  }

  const data: AIGenerateResponse = await response.json();
  if (!data.success || !data.code || !data.code.html) {
    throw new Error(formatAiServiceErrorMessage(data, 200, 'لم يتم استلام كود موقع صالح من خادم الذكاء الاصطناعي.'));
  }

  return data.code;
}

export interface AIEditResponse {
  success: boolean;
  html: string;
  summary: string;
  error?: string;
}

export interface AIRepairResponse {
  success: boolean;
  html: string;
  fixedIssues: string[];
  error?: string;
}

/**
 * Call server-side AI Website Edit endpoint (Studio Phase 3)
 */
export async function requestAIEdit(params: {
  instruction: string;
  currentHtml: string;
  projectContext: {
    title: string;
    originalPrompt?: string;
    siteType?: string;
  };
  aiConfig?: PlatformAiEngine;
}): Promise<{ html: string; summary: string }> {
  const response = await fetch('/api/ai/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(formatAiServiceErrorMessage(errorData, response.status, `خطأ في استجابة خادم التعديل (${response.status})`));
  }

  const data: AIEditResponse = await response.json();
  if (!data.success || !data.html) {
    throw new Error(formatAiServiceErrorMessage(data, 200, 'لم يتم استلام كود معدل صالح من محرك الذكاء الاصطناعي.'));
  }

  return { html: data.html, summary: data.summary || 'تم التعديل بنجاح.' };
}

/**
 * Call server-side AI Website Repair endpoint (Studio Phase 3)
 */
export async function requestAIRepair(params: {
  currentHtml: string;
  issueDescription?: string;
  aiConfig?: PlatformAiEngine;
}): Promise<{ html: string; fixedIssues: string[] }> {
  const response = await fetch('/api/ai/repair', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(formatAiServiceErrorMessage(errorData, response.status, `خطأ في استجابة خادم الإصلاح (${response.status})`));
  }

  const data: AIRepairResponse = await response.json();
  if (!data.success || !data.html) {
    throw new Error(formatAiServiceErrorMessage(data, 200, 'لم يتم استلام كود تم إصلاحه من محرك الذكاء الاصطناعي.'));
  }

  return { html: data.html, fixedIssues: data.fixedIssues || [] };
}

