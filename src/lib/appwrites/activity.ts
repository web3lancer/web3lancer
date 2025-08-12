import {
  databases,
  ID,
} from '@/lib/appwrites/client';
import {
  COL,
  DB,
} from '@/lib/appwrites/constants';
import type * as AppwriteTypes from '@/types/appwrite.d';

// --- Notifications ---
export async function createNotification(data: Partial<AppwriteTypes.Notifications>) {
  return databases.createDocument<AppwriteTypes.Notifications>(DB.ACTIVITY, COL.NOTIFICATIONS, ID.unique(), data);
}
export async function listNotifications(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Notifications>(DB.ACTIVITY, COL.NOTIFICATIONS, queries);
}

// --- Audit Logs ---
export async function createAuditLog(data: Partial<AppwriteTypes.AuditLogs>) {
  return databases.createDocument<AppwriteTypes.AuditLogs>(DB.ACTIVITY, COL.AUDIT_LOGS, ID.unique(), data);
}
export async function listAuditLogs(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.AuditLogs>(DB.ACTIVITY, COL.AUDIT_LOGS, queries);
}
