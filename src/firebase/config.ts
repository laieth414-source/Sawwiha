import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCG1AOGxGCNqsdZIIVJPSaBbknu8-AL8s8',
  authDomain: 'mnasat-sawiha.firebaseapp.com',
  projectId: 'mnasat-sawiha',
  storageBucket: 'mnasat-sawiha.firebasestorage.app',
  messagingSenderId: '55084153830',
  appId: '1:55084153830:web:f4daf0e0e0716c74727427',
};

// Initialize Firebase once
export const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
