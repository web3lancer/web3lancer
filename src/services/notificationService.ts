import { AppwriteService, ID, Query } from './appwriteService';
import { EnvService } from './envService';
import { Notification, AuditLog } from '@/types/activity';

/**
 * Notification Service for managing user notifications and system audit logs
 * Follows best practices from Cross-Cutting Concerns section
 */
class NotificationService {
  private databaseId: string;
  private notificationsCollectionId: string;
  private auditLogsCollectionId: string;
  
  constructor(
    private appwrite: AppwriteService,
    private env: EnvService<'activity'>
  ) {
    this.databaseId = this.env.databaseId;
    this.notificationsCollectionId = this.env.get('collectionUserNotifications');
    this.auditLogsCollectionId = this.env.get('collectionAuditLogs');
  }

  // Notifications
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    metadata?: any;
  }): Promise<Notification> {
    return this.appwrite.createDocument<Notification>(
      this.databaseId,
      this.notificationsCollectionId,
      ID.unique(),
      {
        ...data,
        isRead: false,
        createdAt: new Date().toISOString()
      }
    );
  }

  async getNotification(notificationId: string): Promise<Notification | null> {
    return this.appwrite.getDocument<Notification>(
      this.databaseId,
      this.notificationsCollectionId,
      notificationId
    );
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    return this.appwrite.updateDocument<Notification>(
      this.databaseId,
      this.notificationsCollectionId,
      notificationId,
      { isRead: true }
    );
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    // This would be more efficiently done with a batched update operation
    // For Appwrite, consider using a server-side function for better performance
    const notifications = await this.getUserUnreadNotifications(userId);
    
    for (const notification of notifications) {
      await this.markNotificationAsRead(notification.$id);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return this.appwrite.deleteDocument(
      this.databaseId,
      this.notificationsCollectionId,
      notificationId
    );
  }

  async getUserNotifications(userId: string, limit = 20, offset = 0): Promise<Notification[]> {
    return this.appwrite.listDocuments<Notification>(
      this.databaseId,
      this.notificationsCollectionId,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );
  }

  async getUserUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.appwrite.listDocuments<Notification>(
      this.databaseId,
      this.notificationsCollectionId,
      [
        Query.equal('userId', userId),
        Query.equal('isRead', false),
        Query.orderDesc('createdAt')
      ]
    );
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const response = await this.appwrite.listDocuments(
      this.databaseId,
      this.notificationsCollectionId,
      [
        Query.equal('userId', userId),
        Query.equal('isRead', false),
        Query.limit(0) // Just get the count, not the documents
      ]
    );
    
    return response.length;
  }

  // Audit Logs
  async createAuditLog(data: {
    userId: string;
    action: string;
    entityId?: string;
    entityType?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    return this.appwrite.createDocument<AuditLog>(
      this.databaseId,
      this.auditLogsCollectionId,
      ID.unique(),
      {
        ...data,
        timestamp: new Date().toISOString()
      }
    );
  }

  async getAuditLog(logId: string): Promise<AuditLog | null> {
    return this.appwrite.getDocument<AuditLog>(
      this.databaseId,
      this.auditLogsCollectionId,
      logId
    );
  }

  async listAuditLogs(queries: string[] = []): Promise<AuditLog[]> {
    return this.appwrite.listDocuments<AuditLog>(
      this.databaseId,
      this.auditLogsCollectionId,
      queries
    );
  }

  async getUserAuditLogs(userId: string, limit = 100, offset = 0): Promise<AuditLog[]> {
    return this.appwrite.listDocuments<AuditLog>(
      this.databaseId,
      this.auditLogsCollectionId,
      [
        Query.equal('userId', userId),
        Query.orderDesc('timestamp'),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );
  }

  async getEntityAuditLogs(entityId: string, entityType: string): Promise<AuditLog[]> {
    return this.appwrite.listDocuments<AuditLog>(
      this.databaseId,
      this.auditLogsCollectionId,
      [
        Query.equal('entityId', entityId),
        Query.equal('entityType', entityType),
        Query.orderDesc('timestamp')
      ]
    );
  }

  // Helper method to create commonly used notifications
  async createJobProposalNotification(clientId: string, freelancerId: string, jobId: string, jobTitle: string): Promise<Notification> {
    return this.createNotification({
      userId: clientId,
      type: 'job_proposal',
      title: 'New Proposal Received',
      message: `You have received a new proposal for your job: ${jobTitle}`,
      relatedEntityId: jobId,
      relatedEntityType: 'job',
      metadata: {
        freelancerId
      }
    });
  }

  async createProposalAcceptedNotification(freelancerId: string, jobId: string, jobTitle: string): Promise<Notification> {
    return this.createNotification({
      userId: freelancerId,
      type: 'proposal_accepted',
      title: 'Proposal Accepted',
      message: `Your proposal for job "${jobTitle}" has been accepted!`,
      relatedEntityId: jobId,
      relatedEntityType: 'job'
    });
  }

  async createMilestoneCompletedNotification(clientId: string, contractId: string, milestoneName: string): Promise<Notification> {
    return this.createNotification({
      userId: clientId,
      type: 'milestone_completed',
      title: 'Milestone Completed',
      message: `The milestone "${milestoneName}" has been marked as completed and is ready for your review.`,
      relatedEntityId: contractId,
      relatedEntityType: 'contract',
      metadata: {
        milestoneName
      }
    });
  }

  async createPaymentReleasedNotification(freelancerId: string, amount: string, currency: string, contractId: string): Promise<Notification> {
    return this.createNotification({
      userId: freelancerId,
      type: 'payment_released',
      title: 'Payment Released',
      message: `A payment of ${amount} ${currency} has been released to you.`,
      relatedEntityId: contractId,
      relatedEntityType: 'contract',
      metadata: {
        amount,
        currency
      }
    });
  }

  async createNewMessageNotification(receiverId: string, senderId: string, senderName: string, chatId: string): Promise<Notification> {
    return this.createNotification({
      userId: receiverId,
      type: 'new_message',
      title: 'New Message',
      message: `You have received a new message from ${senderName}.`,
      relatedEntityId: chatId,
      relatedEntityType: 'chat',
      metadata: {
        senderId,
        senderName
      }
    });
  }
}

export default NotificationService;