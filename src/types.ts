export type TabType = 'landing' | 'builder' | 'studio' | 'dashboard' | 'pricing' | 'admin' | 'showcase' | 'doc' | 'roadmap' | 'architecture' | 'admin-matrix' | 'brand';

// ==========================================
// Phase 7: Professionalism & Expansion Types
// ==========================================

export interface ProjectSeo {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  favicon?: string;
  author?: string;
  canonicalUrl?: string;
}

export interface CustomDomainDnsRecord {
  type: 'CNAME' | 'A' | 'TXT';
  host: string;
  value: string;
  status: 'pending' | 'verified';
  description?: string;
}

export interface CustomDomainConfig {
  domain: string;
  status: 'unconfigured' | 'pending_dns' | 'active' | 'failed';
  verified: boolean;
  dnsRecords: CustomDomainDnsRecord[];
  verifiedAt?: string;
  lastCheckedAt?: string;
  error?: string;
  sslStatus?: 'provisioning' | 'active' | 'pending';
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  snapshotCode: string;
  promptTrigger: string;
  type: 'initial_generate' | 'ai_chat_edit' | 'manual_edit' | 'ai_repair' | 'restore';
  createdAt: string;
  components?: SiteComponent[];
  authorEmail?: string;
  versionNumber?: number;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  status?: 'analyzing' | 'modifying' | 'verifying' | 'applied' | 'error';
  summary?: string;
  appliedCodeSnapshot?: string;
}

export interface SiteAnalysis {
  siteType: string;
  targetAudience: string;
  pages: {
    id: string;
    title: string;
    path: string;
    purpose: string;
  }[];
  sections: {
    title: string;
    description: string;
    page: string;
  }[];
  features: string[];
  visualStyle: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    fontStyle: string;
    mood: string;
  };
  suggestedTitle: string;
  suggestedSlug: string;
}

export interface SiteComponent {
  name: string;
  type: string;
  description: string;
}

export interface GeneratedCode {
  html: string;
  pages: {
    id: string;
    title: string;
    path: string;
    htmlContent?: string;
  }[];
  components: SiteComponent[];
  layout: {
    nav: boolean;
    footer: boolean;
    dir: 'rtl' | 'ltr';
  };
  cssFramework: 'tailwind';
}

export interface GenerationLog {
  id: string;
  stage: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'success' | 'error';
}

export interface ProjectItem {
  id: string;
  userId: string;
  ownerEmail: string;
  ownerName: string;
  title: string;
  description: string;
  originalPrompt?: string;
  slug: string;
  category: string;
  status: 'draft' | 'ready';
  analysis?: SiteAnalysis;
  currentCode?: GeneratedCode;
  generationStatus?: 'idle' | 'analyzing' | 'generating' | 'completed' | 'failed';
  generationLogs?: GenerationLog[];
  lastError?: string;
  activeVersionId?: string;
  // Phase 4: Publication & GitHub Integration
  isPublished?: boolean;
  publishedUrl?: string;
  publishedAt?: string;
  publishedCode?: string; // Snapshot of the HTML code when published
  publishHistory?: PublishHistoryEntry[];
  githubRepo?: GitHubRepoInfo;
  // Phase 7: Professionalism & Expansion (Showcase, SEO, Custom Domain)
  showcaseOptIn?: boolean;
  showcaseStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  featuredInShowcase?: boolean;
  showcaseCategory?: string;
  showcaseDescription?: string;
  showcaseOptInAt?: string;
  showcaseApprovedAt?: string;
  customDomain?: CustomDomainConfig;
  seo?: ProjectSeo;
  createdAt: string;
  updatedAt: string;
}

export interface PublishHistoryEntry {
  id: string;
  publishedAt: string;
  publishedUrl: string;
  action: 'publish' | 'republish' | 'unpublish';
  summary?: string;
}

export interface GitHubRepoInfo {
  owner: string;
  repoName: string;
  repoUrl: string;
  isPrivate: boolean;
  lastExportedAt: string;
  defaultBranch: string;
}

export interface GitHubExportOptions {
  token: string;
  repoName: string;
  description?: string;
  isPrivate: boolean;
  commitMessage?: string;
  branch?: string;
}

export interface PlatformAnnouncement {
  enabled: boolean;
  text: string;
  type: 'info' | 'success' | 'warning';
  linkUrl?: string;
  linkText?: string;
}

export interface PlatformAlert {
  enabled: boolean;
  text: string;
  type: 'warning' | 'error' | 'info';
}

export interface PlatformFeatures {
  allowUserRegistration: boolean;
  allowProjectCreation: boolean;
  allowProjectRename: boolean;
  allowProjectDelete: boolean;
  maintenanceMode: boolean;
}

export interface FeatureFlags {
  aiBuilder: boolean;
  aiEditing: boolean;
  aiRepair: boolean;
  publish: boolean;
  githubExport: boolean;
  zipDownload: boolean;
  userRegistration: boolean;
  projectCreation: boolean;
  maintenanceMode: boolean;
  customDomains: boolean;
  templatesLibrary: boolean;
  showcase: boolean;
  community: boolean;
  seoTools: boolean;
}

export interface PlatformAiEngine {
  activeModel: string;
  fallbackModel: string;
  temperature: number;
  maxOutputTokens: number;
  systemInstruction: string;
  aiBuilderEnabled: boolean;
  aiEditingEnabled: boolean;
  aiRepairEnabled: boolean;
  analyzingStatusText?: string;
  generatingStatusText?: string;
  verifyingStatusText?: string;
  safetyLevel?: 'standard' | 'strict' | 'lenient';
}

export interface PlatformLimits {
  freeMaxProjects: number;
  freeMonthlyGenerations: number;
  showPoweredByWatermark: boolean;
}

export interface PlatformSettings {
  platformName: string;
  platformTagline: string;
  platformDescription: string;
  logoText: string;
  logoColor: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'indigo';
  logoImageUrl?: string;
  heroCtaText: string;
  heroSubtitleText?: string;
  welcomeMessage?: string;
  announcement: PlatformAnnouncement;
  alert: PlatformAlert;
  features: PlatformFeatures;
  featureFlags?: FeatureFlags;
  aiEngine?: PlatformAiEngine;
  limits?: PlatformLimits;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AuditLogEntry {
  id: string;
  action:
    | 'plan_change'
    | 'user_status'
    | 'settings_update'
    | 'feature_flag'
    | 'project_delete'
    | 'project_unpublish'
    | 'ai_config_update'
    | 'limits_override'
    | 'showcase_moderation'
    | 'domain_config'
    | 'seo_update';
  adminId: string;
  adminEmail: string;
  timestamp: string;
  targetEntity: 'user' | 'project' | 'plan' | 'settings' | 'ai' | 'feature_flags' | 'showcase' | 'domain';
  targetId?: string;
  targetName?: string;
  summary: string;
  details?: Record<string, unknown>;
}

export interface AdminOverviewStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalAiGenerations: number;
  plansDistribution: Record<string, number>;
  servicesStatus: {
    firebaseAuth: 'operational' | 'degraded' | 'offline';
    firestore: 'operational' | 'degraded' | 'offline';
    geminiApi: 'operational' | 'degraded' | 'offline';
  };
  recentAlerts: {
    id: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }[];
}

export interface RoadmapPhase {
  id: number;
  title: string;
  subtitle: string;
  status: 'active' | 'upcoming' | 'planned';
  deliverables: string[];
  keyPrinciple: string;
}

export interface AdminSettingItem {
  category: string;
  field: string;
  description: string;
  dynamicValueType: string;
  noCodeBenefit: string;
}

export interface ArchitectureNode {
  title: string;
  tech: string;
  role: string;
  zeroBudgetTier: string;
  iconName: string;
}

// ==========================================
// Phase 5: Plans, Subscriptions & Monetization
// ==========================================

export interface PlanFeatures {
  canUseAI: boolean;
  canUseAIEdit: boolean;
  canUseAIRepair: boolean;
  canPublish: boolean;
  canExportGitHub: boolean;
  canDownloadZip: boolean;
  removeWatermark: boolean;
  customDomainAllowed: boolean;
  prioritySupport: boolean;
}

export interface PlanLimits {
  maxProjects: number;              // -1 for unlimited
  maxMonthlyAiGenerations: number;  // -1 for unlimited
  maxMonthlyAiEdits: number;        // -1 for unlimited
  maxMonthlyAiRepairs: number;      // -1 for unlimited
  maxPublishedSites: number;        // -1 for unlimited
  maxMonthlyGithubExports: number;  // -1 for unlimited
}

export interface PlatformPlan {
  id: string;                       // e.g. 'plan_free', 'plan_pro', 'plan_business'
  name: string;                     // 'المبتدئ (Free)', 'المحترف (Pro)', 'الشركات (Business)'
  slug: string;                     // 'free', 'pro', 'business'
  badge?: string;                   // 'الأكثر شعبية', 'الأفضل للشركات'
  price: number;                    // 0, 19, 49
  currency: string;                 // '$'
  billingPeriod: 'free' | 'monthly' | 'yearly';
  description: string;
  featuresList: string[];           // Display bullet points
  features: PlanFeatures;
  limits: PlanLimits;
  isDefault: boolean;               // New users default to this
  isActive: boolean;                // Visible for selection
  sortOrder: number;
  highlighted?: boolean;
  ctaText?: string;                 // 'ابدأ مجاناً', 'ترقية إلى Pro'
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planSlug: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired';
  startDate: string;
  endDate?: string | null;
  provider: 'free' | 'manual_owner_grant' | 'stripe' | 'other';
  subscriptionId?: string | null;
  notes?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface UserUsageRecord {
  userId: string;
  currentMonth: string;             // 'YYYY-MM'
  projectsCount: number;
  monthlyAiGenerationsCount: number;
  monthlyAiEditsCount: number;
  monthlyAiRepairsCount: number;
  publishedSitesCount: number;
  githubExportsCount: number;
  lastActivityAt: string;
}

export interface UserCustomLimitsOverride {
  maxProjects?: number;
  maxMonthlyAiGenerations?: number;
  maxMonthlyAiEdits?: number;
  maxMonthlyAiRepairs?: number;
  maxPublishedSites?: number;
  maxMonthlyGithubExports?: number;
  notes?: string;
}

export type LimitAction =
  | 'create_project'
  | 'ai_generate'
  | 'ai_edit'
  | 'ai_repair'
  | 'publish_site'
  | 'github_export'
  | 'download_zip';

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
  planName: string;
  action: LimitAction;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'owner' | 'user';
  status: 'active' | 'suspended';
  planId?: string;
  planSlug?: string;
  subscription?: UserSubscription | null;
  customLimits?: UserCustomLimitsOverride;
  createdAt?: unknown;
  lastLoginAt?: unknown;
}

// ==========================================
// Subscription Voucher Codes System
// ==========================================

export type VoucherCodeStatus = 'unused' | 'redeemed' | 'cancelled';

export interface SubscriptionVoucherCode {
  id: string;                      // Document ID in Firestore (e.g. `code_${code}`)
  code: string;                    // Random uppercase unique code (e.g. `SW-PRO-7X9K-M2L4`)
  planId: string;                  // Plan ID (e.g. `plan_pro`)
  planName: string;                // Plan display name
  planSlug: string;                // Plan slug (e.g. `pro`, `business`)
  durationMonths: number;          // Subscription duration in months (1, 3, 6, 12, etc.)
  durationLabel: string;           // E.g. 'شهر واحد (30 يوماً)', 'سنة كاملة'
  status: VoucherCodeStatus;       // 'unused' | 'redeemed' | 'cancelled'
  createdAt: string;               // ISO date string
  createdBy: string;               // Owner UID or Email
  redeemedBy?: string | null;      // User UID who redeemed the code
  redeemedByEmail?: string | null; // User Email who redeemed the code
  redeemedAt?: string | null;      // ISO date of redemption
  expiresAt?: string | null;       // ISO date of expiration after redemption
  notes?: string | null;           // Optional administrative note
}


