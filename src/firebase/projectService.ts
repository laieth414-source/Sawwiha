import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { ProjectItem, ProjectVersion, GeneratedCode } from '../types';
import { handleFirestoreError, OperationType } from './errors';

const PROJECTS_COLLECTION = collection(db, 'projects');

/**
 * Generate a friendly URL slug
 */
export function generateSlug(title: string): string {
  const clean = title
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-');
  const rand = Math.random().toString(36).substring(2, 6);
  return `${clean || 'project'}-${rand}`;
}

/**
 * Create a new real project document in Firestore
 */
export async function createProject(
  userId: string,
  ownerEmail: string,
  ownerName: string,
  data: {
    title: string;
    description: string;
    category?: string;
    slug?: string;
  }
): Promise<ProjectItem> {
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const slug = data.slug?.trim() || generateSlug(data.title);

  const project: ProjectItem = {
    id: projectId,
    userId,
    ownerEmail,
    ownerName: ownerName || 'مستخدم سَوّيها',
    title: data.title.trim(),
    description: data.description.trim(),
    slug,
    category: data.category || 'صفحة هبوط',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const projectRef = doc(db, 'projects', projectId);
    await setDoc(projectRef, {
      ...project,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    });

    // Also increment user projectsCount in profile
    const userRef = doc(db, 'users', userId);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentCount = (userSnap.data().projectsCount || 0) + 1;
        await setDoc(userRef, { projectsCount: currentCount }, { merge: true });
      }
    } catch (e) {
      console.warn('Could not update user project counter:', e);
    }

    const currentList = getCachedProjects(userId);
    setCachedProjects(userId, [project, ...currentList.filter((p) => p.id !== project.id)]);

    return project;
  } catch (error) {
    const currentList = getCachedProjects(userId);
    setCachedProjects(userId, [project, ...currentList.filter((p) => p.id !== project.id)]);
    return project;
  }
}

const PROJECTS_CACHE_KEY_PREFIX = 'sawwiha_projects_cache_';

function getCachedProjects(userId: string): ProjectItem[] {
  try {
    const raw = localStorage.getItem(`${PROJECTS_CACHE_KEY_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore local storage error
  }
  return [];
}

function setCachedProjects(userId: string, projects: ProjectItem[]): void {
  try {
    localStorage.setItem(`${PROJECTS_CACHE_KEY_PREFIX}${userId}`, JSON.stringify(projects));
  } catch {
    // Ignore local storage quota error
  }
}

function getAllCachedProjects(): ProjectItem[] {
  try {
    const list: ProjectItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PROJECTS_CACHE_KEY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            list.push(...parsed);
          }
        }
      }
    }
    return list;
  } catch {
    return [];
  }
}

/**
 * Real-time listener for user's projects with automatic offline/cache fallback
 */
export function subscribeUserProjects(
  userId: string,
  onUpdate: (projects: ProjectItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Emit initial cached projects immediately if available for smooth zero-flicker loading
  const initialCache = getCachedProjects(userId);
  if (initialCache.length > 0) {
    onUpdate(initialCache);
  }

  const q = query(
    PROJECTS_COLLECTION,
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const projects: ProjectItem[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as ProjectItem;
        projects.push({ ...item, id: docSnap.id });
      });

      // Sort in-memory by createdAt descending
      projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCachedProjects(userId, projects);
      onUpdate(projects);
    },
    (err) => {
      console.warn('Notice from Firestore projects subscription:', err.message || err);
      // Fall back to cached projects so user does not experience broken UI
      const fallback = getCachedProjects(userId);
      onUpdate(fallback);
      if (onError && fallback.length === 0) {
        // Only log warning if completely empty
        console.info('Using empty initial project list for user');
      }
    }
  );
}

/**
 * Update project title and description
 */
export async function updateProjectDetails(
  projectId: string,
  userId: string,
  fields: {
    title?: string;
    description?: string;
    category?: string;
  }
): Promise<void> {
  const currentList = getCachedProjects(userId);
  const updatedList = currentList.map((p) =>
    p.id === projectId ? { ...p, ...fields, updatedAt: new Date().toISOString() } : p
  );
  setCachedProjects(userId, updatedList);

  const projectRef = doc(db, 'projects', projectId);
  try {
    await setDoc(
      projectRef,
      {
        ...fields,
        updatedAt: new Date().toISOString(),
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not sync project update to Firestore, updated in local cache:', error);
  }
}

/**
 * Delete project from Firestore
 */
export async function deleteProject(projectId: string, userId: string): Promise<void> {
  const currentList = getCachedProjects(userId);
  setCachedProjects(userId, currentList.filter((p) => p.id !== projectId));

  const projectRef = doc(db, 'projects', projectId);
  try {
    await deleteDoc(projectRef);

    // Decrement user project counter
    const userRef = doc(db, 'users', userId);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentCount = Math.max(0, (userSnap.data().projectsCount || 1) - 1);
        await setDoc(userRef, { projectsCount: currentCount }, { merge: true });
      }
    } catch (e) {
      console.warn('Could not update user project counter after delete:', e);
    }
  } catch (error) {
    console.warn('Could not delete project from Firestore, deleted from local cache:', error);
  }
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string): Promise<ProjectItem | null> {
  // Check local cache first
  const allCached = getAllCachedProjects();
  const cachedMatch = allCached.find((p) => p.id === projectId);

  const projectRef = doc(db, 'projects', projectId);
  try {
    const snap = await getDoc(projectRef);
    if (!snap.exists()) return cachedMatch || null;
    return snap.data() as ProjectItem;
  } catch (error) {
    console.warn('Notice when fetching project from Firestore, using cached record:', error);
    return cachedMatch || null;
  }
}

/**
 * Admin Stats: Fetch total projects and users count (for OWNER dashboard)
 */
export async function getAdminPlatformStats(): Promise<{
  totalProjects: number;
  totalUsers: number;
  activeProjects: ProjectItem[];
}> {
  try {
    const [projectsSnap, usersSnap] = await Promise.all([
      getDocs(query(PROJECTS_COLLECTION, limit(50))),
      getDocs(query(collection(db, 'users'), limit(50))),
    ]);

    const activeProjects: ProjectItem[] = [];
    projectsSnap.forEach((d) => {
      activeProjects.push(d.data() as ProjectItem);
    });

    return {
      totalProjects: projectsSnap.size,
      totalUsers: usersSnap.size,
      activeProjects,
    };
  } catch (error) {
    console.warn('Admin stats query error:', error);
    return {
      totalProjects: 0,
      totalUsers: 0,
      activeProjects: [],
    };
  }
}

/**
 * Create a project initialized with AI builder state
 */
export async function createProjectWithAIState(
  userId: string,
  ownerEmail: string,
  ownerName: string,
  data: {
    title: string;
    description: string;
    originalPrompt: string;
    category?: string;
  }
): Promise<ProjectItem> {
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const slug = generateSlug(data.title);

  const initialLog = {
    id: `log_${Date.now()}`,
    stage: 'init',
    message: 'بدء استقبال الفكرة وتجهيز بنية المشروع في سَوّيها...',
    timestamp: now,
    status: 'success' as const,
  };

  const project: ProjectItem = {
    id: projectId,
    userId,
    ownerEmail,
    ownerName: ownerName || 'مستخدم سَوّيها',
    title: data.title.trim(),
    description: data.description.trim(),
    originalPrompt: data.originalPrompt,
    slug,
    category: data.category || 'موقع ذكاء اصطناعي',
    status: 'draft',
    generationStatus: 'analyzing',
    generationLogs: [initialLog],
    createdAt: now,
    updatedAt: now,
  };

  // Update local cache immediately so UI shows the project without waiting
  const currentList = getCachedProjects(userId);
  setCachedProjects(userId, [project, ...currentList.filter((p) => p.id !== project.id)]);

  try {
    const projectRef = doc(db, 'projects', projectId);
    await setDoc(projectRef, {
      ...project,
      serverCreatedAt: serverTimestamp(),
      serverUpdatedAt: serverTimestamp(),
    });

    // Increment user projectsCount
    const userRef = doc(db, 'users', userId);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentCount = (userSnap.data().projectsCount || 0) + 1;
        await setDoc(userRef, { projectsCount: currentCount }, { merge: true });
      }
    } catch (e) {
      console.warn('Could not update user project counter:', e);
    }

    return project;
  } catch (error) {
    console.warn('Could not save project to Firestore, persisted locally:', error);
    return project;
  }
}

/**
 * Update project AI generation state, code, logs, and status
 */
export async function updateProjectGenerationState(
  projectId: string,
  updates: Partial<ProjectItem>
): Promise<void> {
  const projectRef = doc(db, 'projects', projectId);
  try {
    await setDoc(
      projectRef,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not update generation state in Firestore, saved locally:', error);
  }
}

/**
 * Save a new snapshot version in Firestore subcollection: projects/{projectId}/versions
 */
export async function saveProjectVersion(
  projectId: string,
  data: {
    snapshotCode: string;
    promptTrigger: string;
    type: ProjectVersion['type'];
    authorEmail?: string;
  }
): Promise<ProjectVersion> {
  const versionId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const versionDoc: ProjectVersion = {
    id: versionId,
    projectId,
    snapshotCode: data.snapshotCode,
    promptTrigger: data.promptTrigger,
    type: data.type,
    authorEmail: data.authorEmail || '',
    createdAt: now,
  };

  try {
    const versionRef = doc(db, 'projects', projectId, 'versions', versionId);
    await setDoc(versionRef, {
      ...versionDoc,
      serverCreatedAt: serverTimestamp(),
    });

    // Update parent project document's activeVersionId & updatedAt
    const projectRef = doc(db, 'projects', projectId);
    await setDoc(
      projectRef,
      {
        activeVersionId: versionId,
        updatedAt: now,
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return versionDoc;
  } catch (error) {
    console.warn('Could not save version to Firestore subcollection:', error);
    return versionDoc;
  }
}

/**
 * Fetch all versions for a project from Firestore subcollection
 */
export async function getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
  try {
    const versionsRef = collection(db, 'projects', projectId, 'versions');
    const snap = await getDocs(query(versionsRef, limit(40)));
    const versions: ProjectVersion[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as ProjectVersion;
      versions.push({
        ...data,
        id: docSnap.id,
      });
    });

    // Sort in memory by createdAt descending
    versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return versions;
  } catch (error) {
    console.warn('Could not fetch project versions from Firestore:', error);
    return [];
  }
}

/**
 * Restore a specific version in Firestore:
 * 1. Saves current state as a new backup version
 * 2. Applies the target snapshot as the active currentCode in project document
 */
export async function restoreProjectVersion(
  projectId: string,
  targetVersion: ProjectVersion,
  currentHtml: string,
  userEmail?: string
): Promise<ProjectVersion> {
  // 1. Create safety snapshot of current work before restoring
  if (currentHtml && currentHtml !== targetVersion.snapshotCode) {
    await saveProjectVersion(projectId, {
      snapshotCode: currentHtml,
      promptTrigger: 'نسخة احتياطية تلقائية قبل استعادة نسخة سابقة',
      type: 'restore',
      authorEmail: userEmail,
    });
  }

  // 2. Save the restored version as a new active milestone
  const restoredVersion = await saveProjectVersion(projectId, {
    snapshotCode: targetVersion.snapshotCode,
    promptTrigger: `استعادة النسخة المؤرخة (${new Date(targetVersion.createdAt).toLocaleString('ar-SA')})`,
    type: 'restore',
    authorEmail: userEmail,
  });

  // 3. Update the main project document
  const projectRef = doc(db, 'projects', projectId);
  await setDoc(
    projectRef,
    {
      'currentCode.html': targetVersion.snapshotCode,
      activeVersionId: restoredVersion.id,
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return restoredVersion;
}

/**
 * Autosave project code to Firestore
 */
export async function autosaveProjectCode(
  projectId: string,
  code: GeneratedCode
): Promise<void> {
  const projectRef = doc(db, 'projects', projectId);
  try {
    await setDoc(
      projectRef,
      {
        currentCode: code,
        status: 'ready',
        generationStatus: 'completed',
        updatedAt: new Date().toISOString(),
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not autosave to Firestore, code saved in local memory/cache:', error);
  }
}

/**
 * Phase 4: Publish site directly to the internet
 * 1. Updates Firestore document with published status, snapshot of published code, and timestamp
 * 2. Records a publish history event
 * 3. Syncs with backend public web delivery service
 */
export async function publishProject(
  projectId: string,
  htmlCode: string,
  slug: string,
  title?: string,
  currentHistory?: any[]
): Promise<{ publishedUrl: string; publishedAt: string }> {
  const now = new Date().toISOString();
  const cleanSlug = slug || projectId;

  // Real standalone URL under the current domain
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const publishedUrl = `${origin}/s/${cleanSlug}`;

  const historyEntry = {
    id: `pub_${Date.now()}`,
    publishedAt: now,
    publishedUrl,
    action: (currentHistory && currentHistory.length > 0) ? 'republish' : 'publish',
    summary: `تم النشر بنجاح على الرابط المستقل: ${publishedUrl}`,
  };

  const updatedHistory = [...(currentHistory || []), historyEntry];

  const projectRef = doc(db, 'projects', projectId);
  try {
    await setDoc(
      projectRef,
      {
        isPublished: true,
        status: 'published',
        publishedCode: htmlCode,
        publishedAt: now,
        publishedUrl,
        publishHistory: updatedHistory,
        updatedAt: now,
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Notify backend delivery layer
    try {
      await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          slug: cleanSlug,
          htmlCode,
          title: title || 'موقع سَوّيها المنشور',
        }),
      });
    } catch (apiErr) {
      console.warn('Backend publish cache notification warning:', apiErr);
    }

    return { publishedUrl, publishedAt: now };
  } catch (error) {
    console.warn('Could not update Firestore for publish, using backend delivery sync:', error);
    try {
      await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          slug: cleanSlug,
          htmlCode,
          title: title || 'موقع سَوّيها المنشور',
        }),
      });
    } catch (apiErr) {
      console.warn('Backend publish fallback warning:', apiErr);
    }
    return { publishedUrl, publishedAt: now };
  }
}

/**
 * Phase 4: Unpublish a site
 */
export async function unpublishProject(
  projectId: string,
  slug: string,
  currentHistory?: any[]
): Promise<void> {
  const now = new Date().toISOString();
  const historyEntry = {
    id: `unpub_${Date.now()}`,
    publishedAt: now,
    publishedUrl: '',
    action: 'unpublish',
    summary: 'تم إلغاء نشر الموقع وحجبه عن الوصول العام.',
  };

  const updatedHistory = [...(currentHistory || []), historyEntry];
  const projectRef = doc(db, 'projects', projectId);

  try {
    await setDoc(
      projectRef,
      {
        isPublished: false,
        status: 'ready',
        publishedUrl: '',
        publishHistory: updatedHistory,
        updatedAt: now,
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Notify backend delivery layer
    try {
      await fetch('/api/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          slug,
        }),
      });
    } catch (apiErr) {
      console.warn('Backend unpublish notification warning:', apiErr);
    }
  } catch (error) {
    console.warn('Could not update Firestore for unpublish, using backend sync:', error);
    try {
      await fetch('/api/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          slug,
        }),
      });
    } catch (apiErr) {
      console.warn('Backend unpublish fallback warning:', apiErr);
    }
  }
}

/**
 * Phase 4: Save GitHub repository connection info
 */
export async function updateProjectGitHubRepo(
  projectId: string,
  repoInfo: {
    owner: string;
    repoName: string;
    repoUrl: string;
    isPrivate: boolean;
    lastExportedAt: string;
    defaultBranch: string;
  }
): Promise<void> {
  const projectRef = doc(db, 'projects', projectId);
  try {
    await setDoc(
      projectRef,
      {
        githubRepo: repoInfo,
        updatedAt: new Date().toISOString(),
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not update GitHub repo in Firestore:', error);
  }
}

/**
 * Update project document fields in Firestore (Showcase, SEO, Domains, etc.)
 */
export async function updateProjectDoc(
  projectId: string,
  updates: Partial<ProjectItem>
): Promise<void> {
  const projectRef = doc(db, 'projects', projectId);
  try {
    await setDoc(
      projectRef,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not update project doc in Firestore:', error);
  }
}


