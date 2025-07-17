// filepath: /home/nathfavour/Documents/code/web3lancer/web3lancer/src/services/activityService.ts
import { AppwriteService } from '@/services/appwriteService';
import {
    ACTIVITY_DATABASE_ID,
    USER_NOTIFICATIONS_COLLECTION_ID,
    AUDIT_LOGS_COLLECTION_ID
} from '@/lib/env';
import { UserNotification, AuditLog } from '@/types/activity';
import { ID, Query } from 'appwrite';

class ActivityService {
    private databaseId: string;
    private notificationsCollectionId: string;
    private auditLogsCollectionId: string;

    constructor(private appwrite: AppwriteService) {
        this.databaseId = ACTIVITY_DATABASE_ID;
        this.notificationsCollectionId = USER_NOTIFICATIONS_COLLECTION_ID;
        this.auditLogsCollectionId = AUDIT_LOGS_COLLECTION_ID;
    }

    // User Notifications
    async createNotification(data: Omit<UserNotification, '$id' | '$createdAt' | '$updatedAt' | 'isRead' | 'readAt'>): Promise<UserNotification> {
        const notificationData = { ...data, isRead: false };
        return this.appwrite.createDocument<UserNotification>(this.databaseId, this.notificationsCollectionId, ID.unique(), notificationData);
    }

    async getNotification(notificationId: string): Promise<UserNotification | null> {
        return this.appwrite.getDocument<UserNotification>(this.databaseId, this.notificationsCollectionId, notificationId);
    }

    async listUserNotifications(recipientId: string, queries: string[] = []): Promise<UserNotification[]> {
        const userQueries = [Query.equal('recipientId', recipientId), ...queries, Query.orderDesc('$createdAt')];
        const response = await this.appwrite.listDocuments<{ documents: UserNotification[] }>(this.databaseId, this.notificationsCollectionId, userQueries);
        return response.documents;
    }
    
    async getUnreadNotificationsCount(recipientId: string): Promise<number> {
        const queries = [
            Query.equal('recipientId', recipientId),
            Query.equal('isRead', false),
            Query.limit(1) // We only need the total count, not the documents themselves for this specific call if Appwrite returns total.
                           // If Appwrite's listDocuments doesn't directly return total for a limited query,
                           // you might need to fetch more and count, or use a function.
                           // For now, assuming listDocuments provides a 'total' or we count documents.
        ];
        const response = await this.appwrite.listDocuments<{ documents: UserNotification[], total: number }>(this.databaseId, this.notificationsCollectionId, queries);
        return response.total; // Or response.documents.length if total isn't directly available for count queries.
    }


    async markNotificationAsRead(notificationId: string): Promise<UserNotification> {
        return this.appwrite.updateDocument<UserNotification>(this.databaseId, this.notificationsCollectionId, notificationId, { isRead: true, readAt: new Date().toISOString() });
    }

    async markAllNotificationsAsRead(recipientId: string): Promise<void> {
        // This operation can be heavy. It's often better to do this in batches or via an Appwrite Function.
        // For client-side, fetch unread notifications and update them one by one or in batches.
        // Appwrite doesn't support batch updates on documents based on a query directly from client SDKs for safety.
        // A function would be: list unread -> loop and update.
        const unreadNotifications = await this.listUserNotifications(recipientId, [Query.equal('isRead', false)]);
        for (const notification of unreadNotifications) {
            await this.markNotificationAsRead(notification.$id);
        }
        // Consider returning a summary of updated notifications.
    }
    
    async deleteNotification(notificationId: string): Promise<void> {
        return this.appwrite.deleteDocument(this.databaseId, this.notificationsCollectionId, notificationId);
    }


    // Audit Logs (typically created by backend/functions, read by admins)
    async createAuditLog(data: Omit<AuditLog, '$id' | '$createdAt'>): Promise<AuditLog> {
        // This should ideally be called from a secure environment (e.g., Appwrite Function)
        return this.appwrite.createDocument<AuditLog>(this.databaseId, this.auditLogsCollectionId, ID.unique(), data);
    }

    async listAuditLogs(queries: string[] = []): Promise<AuditLog[]> {
        // Access to this should be restricted to admins
        const response = await this.appwrite.listDocuments<{ documents: AuditLog[] }>(this.databaseId, this.auditLogsCollectionId, queries);
        return response.documents;
    }
}

export default ActivityService;
