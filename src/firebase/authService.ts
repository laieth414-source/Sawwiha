import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { UserSubscription, UserCustomLimitsOverride, UserProfile } from '../types';
export type { UserProfile };

export const PLATFORM_OWNER_EMAIL = 'laieth772@gmail.com';
export const PLATFORM_OWNER_UID = 'C0Kdkaq8hoMfRwuK6BEY1iLcFjK2';

export function isPlatformOwner(user: User | null, profile?: UserProfile | null): boolean {
  if (user?.email && user.email.toLowerCase() === PLATFORM_OWNER_EMAIL.toLowerCase()) return true;
  if (user?.uid === PLATFORM_OWNER_UID) return true;
  if (profile?.email && profile.email.toLowerCase() === PLATFORM_OWNER_EMAIL.toLowerCase()) return true;
  if (profile?.uid === PLATFORM_OWNER_UID) return true;
  if (profile?.role === 'owner') return true;
  return false;
}

/**
 * Sync user profile with Cloud Firestore upon successful sign-in
 */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const isOwnerUser = isPlatformOwner(user, null);

  // 1. Check local backup subscription first
  let localSub: UserSubscription | null = null;
  try {
    const raw = localStorage.getItem(`sawwiha_active_sub_${user.uid}`);
    if (raw) {
      localSub = JSON.parse(raw);
    }
  } catch {}

  // 2. Fetch server-persisted user profile & subscription
  let serverProfile: any = null;
  let serverSub: UserSubscription | null = null;
  try {
    const res = await fetch(`/api/user/profile/${user.uid}`);
    if (res.ok) {
      const sJson = await res.json();
      serverProfile = sJson.profile;
      serverSub = sJson.subscription;
    }
  } catch (err) {
    console.warn('Notice querying server profile:', err);
  }

  try {
    let existingData: UserProfile | null = null;
    try {
      const existingSnap = await getDoc(userRef);
      if (existingSnap.exists()) {
        existingData = existingSnap.data() as UserProfile;
      }
    } catch (firestoreErr) {
      console.warn('Notice reading user profile from Firestore:', firestoreErr);
    }

    const data = existingData || serverProfile || {};
    const finalRole: 'owner' | 'user' = isOwnerUser ? 'owner' : (data.role || 'user');

    // 3. Resolve active subscription
    let resolvedSub: UserSubscription | null = null;

    if (isOwnerUser) {
      resolvedSub = {
        id: `sub_owner_${user.uid}`,
        userId: user.uid,
        userEmail: user.email || PLATFORM_OWNER_EMAIL,
        planId: 'plan_owner_unlimited',
        planSlug: 'owner_unlimited',
        planName: 'مالك — غير محدود',
        status: 'active' as const,
        startDate: new Date().toISOString(),
        endDate: null,
        provider: 'manual_owner_grant' as const,
        notes: 'خطة المالك غير المحدودة الرسمية للمنصة',
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid,
      };
    } else {
      // Prioritize freshest valid subscription
      const candidates = [data.subscription, serverSub, localSub].filter(Boolean) as UserSubscription[];
      for (const cand of candidates) {
        if (cand && cand.status === 'active' && cand.planId) {
          if (cand.endDate && new Date(cand.endDate).getTime() < Date.now()) {
            cand.status = 'expired';
          } else {
            resolvedSub = cand;
            break;
          }
        }
      }
    }

    const planId = isOwnerUser
      ? 'plan_owner_unlimited'
      : (resolvedSub?.planId || data.planId || 'plan_free');
    const planSlug = isOwnerUser
      ? 'owner_unlimited'
      : (resolvedSub?.planSlug || data.planSlug || 'free');

    const updatedProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || data.displayName || (isOwnerUser ? 'مالك سَوّيها' : 'مستخدم سَوّيها'),
      photoURL: user.photoURL || data.photoURL || null,
      role: finalRole,
      status: data.status || 'active',
      planId,
      planSlug,
      subscription: resolvedSub,
      createdAt: data.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // 4. Try updating Firestore profile
    try {
      await setDoc(
        userRef,
        {
          ...updatedProfile,
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (setDocErr) {
      console.warn('Notice updating Firestore user document:', setDocErr);
    }

    // 5. Sync to server API
    try {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });
    } catch {}

    // 6. Update local backup if subscription exists
    if (resolvedSub) {
      try {
        localStorage.setItem(`sawwiha_active_sub_${user.uid}`, JSON.stringify(resolvedSub));
      } catch {}
    }

    return updatedProfile;
  } catch (error) {
    console.warn('Could not sync user profile to Firestore (using fallback record):', error);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'مستخدم سَوّيها',
      photoURL: user.photoURL || null,
      role: isOwnerUser ? 'owner' : 'user',
      status: 'active',
      planId: isOwnerUser ? 'plan_owner_unlimited' : (serverSub?.planId || localSub?.planId || 'plan_free'),
      planSlug: isOwnerUser ? 'owner_unlimited' : (serverSub?.planSlug || localSub?.planSlug || 'free'),
      subscription: isOwnerUser ? null : (serverSub || localSub),
    };
  }
}

/**
 * Sign in using Google popup
 */
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await syncUserProfile(result.user);
  return result.user;
}

/**
 * Sign in using Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  await syncUserProfile(result.user);
  return result.user;
}

/**
 * Register a new user using Email and Password
 */
export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName) {
    try {
      await updateProfile(result.user, { displayName });
    } catch (e) {
      console.warn('Profile name update error:', e);
    }
  }
  await syncUserProfile(result.user);
  return result.user;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
