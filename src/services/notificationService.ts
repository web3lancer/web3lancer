import { AppwriteService } from './appwriteService';
import {
  ACTIVITY_DATABASE_ID,
  USER_NOTIFICATIONS_COLLECTION_ID
} from '@/lib/env';
import { UserNotification } from '@/types/activity';
import { ID, Query } from 'appwrite';

class NotificationService {
  private databaseId: string;
  private notificationsCollectionId: string;

  constructor(private appwrite: AppwriteService) {
    this.databaseId = ACTIVITY_DATABASE_ID;
    this.notificationsCollectionId = USER_NOTIFICATIONS_COLLECTION_ID;
  }

  async createNotification(data: Omit<UserNotification, '$id' | '$createdAt' | '$updatedAt' | 'isRead' | 'readAt'>): Promise<UserNotification | null> {
    try {
      const notificationData = { ...data, isRead: false };
      return this.appwrite.createDocument<UserNotification>(
        this.databaseId, 
        this.notificationsCollectionId, 
        ID.unique(), 
        notificationData
      );
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  }

  async getUserNotifications(recipientId: string, limit: number = 20, offset: number = 0): Promise<UserNotification[]> {
    try {
      const response = await this.appwrite.listDocuments<{ documents: UserNotification[] }>(
        this.databaseId,
        this.notificationsCollectionId,
        [
          Query.equal('recipientId', recipientId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      return [];
    }
  }

  async getUnreadNotificationsCount(recipientId: string): Promise<number> {
    try {
      const response = await this.appwrite.listDocuments<{ documents: UserNotification[], total: number }>(
        this.databaseId,
        this.notificationsCollectionId,
        [
          Query.equal('recipientId', recipientId),
          Query.equal('isRead', false),
          Query.limit(1)
        ]
      );
      return response.total;
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
      return 0;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<UserNotification | null> {
    try {
      return this.appwrite.updateDocument<UserNotification>(
        this.databaseId,
        this.notificationsCollectionId,
        notificationId,
        { isRead: true, readAt: new Date().toISOString() }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return null;
    }
  }

  async markAllNotificationsAsRead(recipientId: string): Promise<void> {
    try {
      const unreadNotifications = await this.getUserNotifications(
        recipientId, 
        100, 
        0
      );
      
      const unreadIds = unreadNotifications
        .filter(notification => !notification.isRead)
        .map(notification => notification.$id);
      
      // Mark each notification as read
      for (const id of unreadIds) {
        await this.markNotificationAsRead(id);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await this.appwrite.deleteDocument(
        this.databaseId,
        this.notificationsCollectionId,
        notificationId
      );
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }
}

export default NotificationService;