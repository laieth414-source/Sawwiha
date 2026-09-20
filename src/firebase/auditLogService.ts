import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { AuditLogEntry } from '../types';

const AUDIT_LOGS_COLLECTION = 'audit_logs';

/**
 * Record an immutable administrative action in Firestore.
 * Strictly permitted only for Platform OWNER via firestore.rules.
 * NEVER records passwords, API keys, or raw tokens.
 */
export async function logAdminAction(params: {
  action: AuditLogEntry['action'];
  targetEntity: AuditLogEntry['targetEntity'];
  targetId?: string;
  targetName?: string;
  summary: string;
  details?: Record<string, unknown>;
  adminId: string;
  adminEmail: string;
}): Promise<string> {
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logRef = doc(db, AUDIT_LOGS_COLLECTION, logId);

    const logEntry: AuditLogEntry = {
      id: logId,
      action: params.action,
      adminId: params.adminId,
      adminEmail: params.adminEmail,
      timestamp: new Date().toISOString(),
      targetEntity: params.targetEntity,
      targetId: params.targetId || '',
      targetName: params.targetName || '',
      summary: params.summary,
      details: params.details || {},
    };

    await setDoc(logRef, logEntry);
    return logId;
  } catch (err) {
    console.warn('Failed to record administrative audit log:', err);
    // Non-blocking for UI, but logged to console
    return '';
  }
}

/**
 * Subscribe to real-time stream of audit logs (descending by timestamp)
 */
export function subscribeToAuditLogs(
  callback: (logs: AuditLogEntry[]) => void,
  maxCount: number = 100,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    collection(db, AUDIT_LOGS_COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(maxCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const logs = snapshot.docs.map((d) => d.data() as AuditLogEntry);
      callback(logs);
    },
    (err) => {
      console.warn('Error listening to audit logs:', err);
      if (onError) onError(err);
      callback([]);
    }
  );
}

/**
 * One-time fetch of recent audit logs
 */
export async function fetchAuditLogs(maxCount: number = 100): Promise<AuditLogEntry[]> {
  try {
    const q = query(
      collection(db, AUDIT_LOGS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(maxCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as AuditLogEntry);
  } catch (err) {
    console.warn('Failed to fetch audit logs:', err);
    return [];
  }
}
