import { AppwriteService } from './appwriteService';
import { ACTIVITY_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID } from '@/lib/env';
import { Notification } from '@/types/governance';
import { ID, Query } from 'appwrite';

class NotificationService {
  private databaseId: string;
  private notificationsCollectionId: string;

  constructor(private appwrite: AppwriteService) {
    this.databaseId = ACTIVITY_DATABASE_ID;
    this.notificationsCollectionId = NOTIFICATIONS_COLLECTION_ID;
  }

  // Create a new notification
  async createNotification(data: Omit<Notification, '$id' | '$createdAt' | '$updatedAt'>): Promise<Notification> {
    return this.appwrite.createDocument<Notification>(
      this.databaseId,
      this.notificationsCollectionId,
      ID.unique(),
      data
    );
  }

  // Get a specific notification
  async getNotification(notificationId: string): Promise<Notification | null> {
    return this.appwrite.getDocument<Notification>(
      this.databaseId,
      this.notificationsCollectionId,
      notificationId
    );
  }

  // List notifications with optional filters
  async listNotifications(queries: string[] = []): Promise<Notification[]> {
    return this.appwrite.listDocuments<Notification>(
      this.databaseId,
      this.notificationsCollectionId,
      queries
    );
  }

  // Get user's unread notifications
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.appwrite.listDocuments<Notification>(
      this.databaseId,
      this.notificationsCollectionId,
      [
        Query.equal('recipientId', userId),
        Query.equal('isRead', false),
        Query.orderDesc('$createdAt')
      ]
    );
  }

  // Mark a notification as read
  async markAsRead(notificationId: string): Promise<Notification> {
    return this.appwrite.updateDocument<Notification>(
      this.databaseId,
      this.notificationsCollectionId,
      notificationId,
      { isRead: true }
    );
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    const unreadNotifications = await this.getUnreadNotifications(userId);
    
    const updatePromises = unreadNotifications.map(notification => 
      this.markAsRead(notification.$id)
    );
    
    await Promise.all(updatePromises);
  }

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<void> {
    return this.appwrite.deleteDocument(
      this.databaseId,
      this.notificationsCollectionId,
      notificationId
    );
  }

  // Send a notification to multiple recipients
  async sendBatchNotifications(
    recipientIds: string[],
    type: Notification['type'],
    title: string,
    message: string,
    options: Partial<Notification> = {}
  ): Promise<void> {
    const createPromises = recipientIds.map(recipientId => 
      this.createNotification({
        recipientId,
        type,
        title,
        message,
        isRead: false,
        ...options
      })
    );
    
    await Promise.all(createPromises);
  }
}

export default NotificationService;