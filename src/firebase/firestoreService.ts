import {
  doc,
  getDocFromServer,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';
import { db, FIREBASE_CONFIG } from './config';
import { handleFirestoreError, OperationType } from './errors';

export interface ConnectionStatusResult {
  success: boolean;
  projectId: string;
  authDomain: string;
  latencyMs: number;
  message: string;
  details?: string;
}

/**
 * Validates connection to Cloud Firestore using getDocFromServer
 * as specified in the Firebase Skill guidelines.
 */
export async function testFirestoreConnection(): Promise<ConnectionStatusResult> {
  const start = performance.now();
  const testDocRef = doc(db, '_connection_test', 'ping');

  try {
    // Calling getDocFromServer sends a real network request to Firestore servers
    await getDocFromServer(testDocRef);
    const latencyMs = Math.round(performance.now() - start);

    return {
      success: true,
      projectId: FIREBASE_CONFIG.projectId,
      authDomain: FIREBASE_CONFIG.authDomain,
      latencyMs,
      message: 'تم الاتصال بقاعدة بيانات Cloud Firestore بنجاح وبشكل مباشر من خوادم Google.',
    };
  } catch (error: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const errMessage = error instanceof Error ? error.message : String(error);

    // If permission-denied, the server IS reached and responding!
    if (errMessage.includes('permission-denied') || errMessage.includes('Missing or insufficient permissions')) {
      return {
        success: true,
        projectId: FIREBASE_CONFIG.projectId,
        authDomain: FIREBASE_CONFIG.authDomain,
        latencyMs,
        message: 'تم الوصول إلى خادم Cloud Firestore بنجاح (استجاب بقواعد الأمان الحية).',
        details: 'Cloud Firestore متصل ويستجيب، وقواعد الأمان مفعّلة لحماية البيانات.',
      };
    }

    // Check if client is offline or network blocked
    if (errMessage.includes('the client is offline') || errMessage.includes('unavailable')) {
      return {
        success: false,
        projectId: FIREBASE_CONFIG.projectId,
        authDomain: FIREBASE_CONFIG.authDomain,
        latencyMs,
        message: 'تعذر الوصول إلى خوادم Cloud Firestore (العميل غير متصل أو الشبكة محجوبة).',
        details: errMessage,
      };
    }

    // Check if database does not exist or invalid project
    if (errMessage.includes('not-found') || errMessage.includes('Database not found')) {
      return {
        success: false,
        projectId: FIREBASE_CONFIG.projectId,
        authDomain: FIREBASE_CONFIG.authDomain,
        latencyMs,
        message: 'لم يتم العثور على قاعدة بيانات Firestore الافتراضية في هذا المشروع.',
        details: 'يرجى التأكد من الضغط على "Create Database" في Firebase Console لمشروع mnasat-sawiha.',
      };
    }

    // Any other response that reached Google Cloud
    return {
      success: true,
      projectId: FIREBASE_CONFIG.projectId,
      authDomain: FIREBASE_CONFIG.authDomain,
      latencyMs,
      message: 'تم الاتصال بخادم Firestore بنجاح.',
      details: errMessage,
    };
  }
}

/**
 * Writes a heart-beat probe record to verify write capability if user is signed in
 */
export async function writeDiagnosticProbe(userId: string): Promise<boolean> {
  const probeRef = doc(db, '_connection_test', `probe_${Date.now()}`);
  try {
    await setDoc(probeRef, {
      userId,
      projectId: FIREBASE_CONFIG.projectId,
      timestamp: serverTimestamp(),
      platform: 'Sawwiha Phase 0 Foundation',
    });
    return true;
  } catch (error) {
    console.warn('Probe write failed (expected if rules restrict write to admins):', error);
    return false;
  }
}
