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

  try {
    const existingSnap = await getDoc(userRef);
    if (existingSnap.exists()) {
      const data = existingSnap.data() as UserProfile;
      const finalRole: 'owner' | 'user' = isOwnerUser ? 'owner' : (data.role || 'user');
      
      // If owner, enforce the unchangeable "مالك — غير محدود" plan
      const planId = isOwnerUser ? 'plan_owner_unlimited' : (data.planId || 'plan_free');
      const planSlug = isOwnerUser ? 'owner_unlimited' : (data.planSlug || 'free');

      const ownerSub = isOwnerUser
        ? {
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
          }
        : data.subscription;

      await setDoc(
        userRef,
        {
          lastLoginAt: serverTimestamp(),
          displayName: user.displayName || data.displayName || (isOwnerUser ? 'مالك سَوّيها' : 'مستخدم سَوّيها'),
          photoURL: user.photoURL || data.photoURL || null,
          role: finalRole,
          status: data.status || 'active',
          planId,
          planSlug,
          ...(ownerSub ? { subscription: ownerSub } : {}),
        },
        { merge: true }
      );
      return {
        ...data,
        role: finalRole,
        status: data.status || 'active',
        planId,
        planSlug,
        subscription: ownerSub,
        displayName: user.displayName || data.displayName || (isOwnerUser ? 'مالك سَوّيها' : 'مستخدم سَوّيها'),
        lastLoginAt: new Date().toISOString(),
      };
    } else {
      const ownerSub = isOwnerUser
        ? {
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
          }
        : undefined;

      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || (isOwnerUser ? 'مالك سَوّيها' : 'مستخدم سَوّيها'),
        photoURL: user.photoURL || null,
        role: isOwnerUser ? 'owner' : 'user',
        status: 'active',
        planId: isOwnerUser ? 'plan_owner_unlimited' : 'plan_free',
        planSlug: isOwnerUser ? 'owner_unlimited' : 'free',
        subscription: ownerSub,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    console.warn('Could not sync user profile to Firestore (using fallback auth record):', error);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'مستخدم سَوّيها',
      photoURL: user.photoURL || null,
      role: isOwnerUser ? 'owner' : 'user',
      status: 'active',
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
