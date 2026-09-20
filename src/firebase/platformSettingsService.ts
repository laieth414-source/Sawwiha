import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { PlatformSettings } from '../types';
import { handleFirestoreError, OperationType } from './errors';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'سَوّيها',
  platformTagline: 'عندك فكرة؟ سَوّيها.',
  platformDescription: 'المنصة العربية الرائدة لتحويل الأفكار إلى مواقع ويب حقيقية ومشاريع متكاملة.',
  logoText: 'سـ',
  logoColor: 'emerald',
  heroCtaText: 'سَوّ مشروعك الآن',
  announcement: {
    enabled: true,
    text: '🎉 مرحباً بك في منصة «سَوّيها» — تم تفعيل المرحلة 1: أساس البناء بنجاح!',
    type: 'success',
    linkText: 'اكتشف المزيد',
    linkUrl: '#',
  },
  alert: {
    enabled: false,
    text: 'تنبيه: سيتم إجراء ترقية سريعة لقواعد البيانات اليوم الساعة 12:00 ليلاً.',
    type: 'warning',
  },
  features: {
    allowUserRegistration: true,
    allowProjectCreation: true,
    allowProjectRename: true,
    allowProjectDelete: true,
    maintenanceMode: false,
  },
  featureFlags: {
    aiBuilder: true,
    aiEditing: true,
    aiRepair: true,
    publish: true,
    githubExport: true,
    zipDownload: true,
    userRegistration: true,
    projectCreation: true,
    maintenanceMode: false,
    customDomains: true,
    templatesLibrary: true,
    showcase: true,
    community: true,
    seoTools: true,
  },
  aiEngine: {
    activeModel: 'gemini-3.1-flash-lite',
    fallbackModel: 'gemini-flash-latest',
    temperature: 0.7,
    maxOutputTokens: 8192,
    systemInstruction:
      'أنت مهندس البرمجيات والخبير البصري في منصة «سَوّيها». تخصصك هو تحويل أفكار المستخدمين إلى مواقع ويب حقيقية متكاملة ذات تصميم عربي وأجنبي احترافي متجاوب باستخدام HTML5 وTailwind CSS مع نصوص واقعية وأيقونات واضحة وتفاعلية عالية.',
    aiBuilderEnabled: true,
    aiEditingEnabled: true,
    aiRepairEnabled: true,
    analyzingStatusText: 'جاري تحليل المتطلبات وهيكلة أقسام الموقع...',
    generatingStatusText: 'جاري كتابة الكود النظيف وتصميم الواجهة...',
    verifyingStatusText: 'جاري فحص التجاوب وجودة الوسوم والمكونات...',
    safetyLevel: 'standard',
  },
  limits: {
    freeMaxProjects: 5,
    freeMonthlyGenerations: 30,
    showPoweredByWatermark: true,
  },
};

const SETTINGS_DOC_REF = doc(db, 'settings', 'platform_config');

/**
 * Fetch platform settings once or return default fallback
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const snap = await getDoc(SETTINGS_DOC_REF);
    if (snap.exists()) {
      return { ...DEFAULT_PLATFORM_SETTINGS, ...snap.data() } as PlatformSettings;
    }
    return DEFAULT_PLATFORM_SETTINGS;
  } catch (error) {
    console.warn('Using default platform settings (could not read from Firestore):', error);
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

/**
 * Real-time listener for platform settings
 */
export function subscribeToPlatformSettings(
  onUpdate: (settings: PlatformSettings) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    SETTINGS_DOC_REF,
    (snap) => {
      if (snap.exists()) {
        onUpdate({ ...DEFAULT_PLATFORM_SETTINGS, ...snap.data() } as PlatformSettings);
      } else {
        onUpdate(DEFAULT_PLATFORM_SETTINGS);
      }
    },
    (err) => {
      console.warn('Error in settings snapshot listener:', err);
      if (onError) onError(err);
      onUpdate(DEFAULT_PLATFORM_SETTINGS);
    }
  );
}

/**
 * Update platform settings (Restricted to OWNER via security rules)
 */
export async function savePlatformSettings(
  settings: Partial<PlatformSettings>,
  adminUid: string
): Promise<void> {
  try {
    await setDoc(
      SETTINGS_DOC_REF,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUid,
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not save platform settings to Firestore:', error);
  }
}
