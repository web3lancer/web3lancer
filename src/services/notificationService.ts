import BaseService from './baseService';
import { AppwriteService, ID, Query, AppwriteDocument } from './appwriteService';
import { EnvConfig } from '@/config/environment';

// Define local interfaces to avoid namespace conflicts
interface NotificationModel extends AppwriteDocument {
  userId: string; // User ID who receives the notification
  title: string;
  message: string;
  type: string; // 'job_application', 'message', 'payment', etc.
  isRead: boolean;
  readAt?: string; // ISO date string when notification was read
  referenceType?: string; // 'job', 'contract', 'message', etc.
  referenceId?: string; // ID of the reference object
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actions?: {
    label: string;
    url: string;
    type?: 'primary' | 'secondary' | 'danger';
    metadata?: Record<string, any>;
  }[];
  expiresAt?: string; // ISO date string for when notification expires
  metadata?: Record<string, any>;
}

interface ActivityLogModel extends AppwriteDocument {
  userId: string; // User who performed the action
  action: string; // The action that was performed
  timestamp: string; // ISO date string
  details?: string;
  ip?: string;
  userAgent?: string;
  resourceType?: string; // 'job', 'contract', 'payment', etc.
  resourceId?: string; // ID of the resource
  metadata?: Record<string, any>;
}

/**
 * NotificationService
 * 
 * Manages user notifications and activity logs
 */
class NotificationService extends BaseService {
  constructor(
    protected appwrite: AppwriteService,
    protected config: EnvConfig
  ) {
    super(appwrite, config);
  }

  /**
   * Get a user's notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 10,
    includeRead: boolean = false
  ): Promise<NotificationModel[]> {
    return this.handleRequest(
      async () => {
        const queries = [
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ];

        if (!includeRead) {
          queries.push(Query.equal('isRead', false));
        }

        return await this.appwrite.listDocuments<NotificationModel>(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          queries
        );
      },
      'getUserNotifications'
    );
  }

  /**
   * Get a single notification by ID
   */
  async getNotification(notificationId: string): Promise<NotificationModel> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<NotificationModel>(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          notificationId
        );
      },
      'getNotification'
    );
  }

  /**
   * Create a new notification for a user
   */
  async createNotification(
    notification: Omit<NotificationModel, '$id' | '$createdAt' | '$updatedAt'>
  ): Promise<NotificationModel> {
    return this.handleRequest(
      async () => {
        const now = new Date().toISOString();
        
        return await this.appwrite.createDocument<NotificationModel>(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          ID.unique(),
          {
            ...notification,
            isRead: notification.isRead ?? false,
            createdAt: now
          }
        );
      },
      'createNotification'
    );
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<NotificationModel> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<NotificationModel>(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          notificationId,
          {
            isRead: true,
            readAt: new Date().toISOString()
          }
        );
      },
      'markNotificationAsRead'
    );
  }

  /**
   * Mark all notifications for a user as read
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    return this.handleRequest(
      async () => {
        // Get all unread notifications
        const unreadNotifications = await this.appwrite.listDocuments<NotificationModel>(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          [
            Query.equal('userId', userId),
            Query.equal('isRead', false)
          ]
        );

        // Mark each as read
        const now = new Date().toISOString();
        const updatePromises = unreadNotifications.map((notification: NotificationModel) => 
          this.appwrite.updateDocument(
            this.config.activity.databaseId,
            this.config.activity.notificationsCollectionId,
            notification.$id,
            {
              isRead: true,
              readAt: now
            }
          )
        );

        await Promise.all(updatePromises);
      },
      'markAllNotificationsAsRead'
    );
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    return this.handleRequest(
      async () => {
        await this.appwrite.deleteDocument(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          notificationId
        );
      },
      'deleteNotification'
    );
  }

  /**
   * Get the count of unread notifications for a user
   */
  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.handleRequest(
      async () => {
        const unreadNotifications = await this.appwrite.listDocuments<NotificationModel>(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          [
            Query.equal('userId', userId),
            Query.equal('isRead', false)
          ]
        );

        return unreadNotifications.length;
      },
      'getUnreadNotificationCount'
    );
  }

  /**
   * Send a notification to multiple users
   */
  async sendBulkNotification(
    userIds: string[],
    notificationTemplate: Omit<NotificationModel, '$id' | '$createdAt' | '$updatedAt' | 'userId'>
  ): Promise<void> {
    return this.handleRequest(
      async () => {
        const now = new Date().toISOString();
        const notificationPromises = userIds.map((userId: string) => 
          this.appwrite.createDocument(
            this.config.activity.databaseId,
            this.config.activity.notificationsCollectionId,
            ID.unique(),
            {
              ...notificationTemplate,
              userId,
              isRead: false,
              createdAt: now
            }
          )
        );

        await Promise.all(notificationPromises);
      },
      'sendBulkNotification'
    );
  }

  /**
   * Log a user activity
   */
  async logActivity(
    activityData: Omit<ActivityLogModel, '$id' | '$createdAt' | '$updatedAt'>
  ): Promise<ActivityLogModel> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<ActivityLogModel>(
          this.config.activity.databaseId,
          this.config.activity.logsCollectionId,
          ID.unique(),
          {
            ...activityData,
            timestamp: activityData.timestamp || new Date().toISOString()
          }
        );
      },
      'logActivity'
    );
  }

  /**
   * Get user activity logs
   */
  async getUserActivityLogs(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ActivityLogModel[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<ActivityLogModel>(
          this.config.activity.databaseId,
          this.config.activity.logsCollectionId,
          [
            Query.equal('userId', userId),
            Query.orderDesc('timestamp'),
            Query.limit(limit),
            Query.offset(offset)
          ]
        );
      },
      'getUserActivityLogs'
    );
  }

  /**
   * Create a notification for contract milestones
   */
  async createMilestoneNotification(
    userId: string,
    milestoneId: string,
    contractId: string,
    title: string,
    message: string,
    type: 'milestone_completed' | 'milestone_approved' | 'milestone_rejected'
  ): Promise<NotificationModel> {
    return this.handleRequest(
      async () => {
        return await this.createNotification({
          userId,
          title,
          message,
          type,
          isRead: false,
          priority: 'high',
          referenceType: 'milestone',
          referenceId: milestoneId,
          actions: [
            {
              label: 'View Contract',
              url: `/contracts/${contractId}`,
              type: 'primary'
            },
            {
              label: 'View Milestone',
              url: `/contracts/${contractId}/milestones/${milestoneId}`,
              type: 'secondary'
            }
          ],
          metadata: {
            contractId
          }
        });
      },
      'createMilestoneNotification'
    );
  }

  /**
   * Create a notification for payment events
   */
  async createPaymentNotification(
    userId: string,
    paymentId: string,
    amount: number,
    currency: string,
    title: string,
    message: string,
    type: 'payment_sent' | 'payment_received' | 'payment_released' | 'payment_refunded'
  ): Promise<NotificationModel> {
    return this.handleRequest(
      async () => {
        return await this.createNotification({
          userId,
          title,
          message,
          type,
          isRead: false,
          priority: 'high',
          referenceType: 'payment',
          referenceId: paymentId,
          actions: [
            {
              label: 'View Payment',
              url: `/payments/${paymentId}`,
              type: 'primary'
            }
          ],
          metadata: {
            amount,
            currency
          }
        });
      },
      'createPaymentNotification'
    );
  }

  /**
   * Create a notification for new messages
   */
  async createMessageNotification(
    userId: string,
    senderName: string,
    senderId: string,
    messageId: string,
    conversationId: string,
    messageText: string
  ): Promise<NotificationModel> {
    return this.handleRequest(
      async () => {
        return await this.createNotification({
          userId,
          title: `New message from ${senderName}`,
          message: messageText.length > 100 ? `${messageText.substring(0, 100)}...` : messageText,
          type: 'new_message',
          isRead: false,
          priority: 'normal',
          referenceType: 'message',
          referenceId: messageId,
          actions: [
            {
              label: 'Reply',
              url: `/messages/${conversationId}`,
              type: 'primary'
            },
            {
              label: 'View Profile',
              url: `/profile/${senderId}`,
              type: 'secondary'
            }
          ],
          metadata: {
            senderId,
            senderName,
            conversationId
          }
        });
      },
      'createMessageNotification'
    );
  }

  /**
   * List notifications with query strings (for backward compatibility)
   * This method converts string queries to proper Query objects
   */
  async listNotifications(queryStrings: string[]): Promise<NotificationModel[]> {
    return this.handleRequest(
      async () => {
        // Convert string queries to proper Query objects
        const queries: any[] = [];
        
        for (const queryStr of queryStrings) {
          // Parse the query string and convert to proper Query object
          if (queryStr.includes('Query.equal("recipientId"') || queryStr.includes('Query.equal("userId"')) {
            // Extract the user ID from the query string
            const match = queryStr.match(/Query\.equal\("(?:recipientId|userId)",\s*"([^"]+)"\)/);
            if (match) {
              const userId = match[1];
              // First try with userId field
              queries.push(Query.equal('userId', userId));
              // If the database actually has a toUserId array field, we'll need to use Query.contains
              // But for now, let's try the direct approach
            }
          } else if (queryStr.includes('Query.orderDesc("$createdAt")')) {
            queries.push(Query.orderDesc('$createdAt'));
          } else if (queryStr.includes('Query.limit(')) {
            const match = queryStr.match(/Query\.limit\((\d+)\)/);
            if (match) {
              queries.push(Query.limit(parseInt(match[1])));
            }
          }
          // Add other query type conversions as needed
        }

        // Try the query with userId first
        try {
          return await this.appwrite.listDocuments<NotificationModel>(
            this.config.activity.databaseId,
            this.config.activity.notificationsCollectionId,
            queries
          );
        } catch (error: any) {
          // If the error mentions toUserId being an array, try with Query.contains
          if (error.message && error.message.includes('toUserId') && error.message.includes('array')) {
            console.log('Detected toUserId array field, trying with Query.contains');
            
            // Rebuild queries with array handling
            const arrayQueries: any[] = [];
            for (const queryStr of queryStrings) {
              if (queryStr.includes('Query.equal("recipientId"') || queryStr.includes('Query.equal("userId"')) {
                const match = queryStr.match(/Query\.equal\("(?:recipientId|userId)",\s*"([^"]+)"\)/);
                if (match) {
                  const userId = match[1];
                  // Use Query.contains for array field toUserId
                  arrayQueries.push(Query.contains('toUserId', userId));
                }
              } else if (queryStr.includes('Query.orderDesc("$createdAt")')) {
                arrayQueries.push(Query.orderDesc('$createdAt'));
              } else if (queryStr.includes('Query.limit(')) {
                const match = queryStr.match(/Query\.limit\((\d+)\)/);
                if (match) {
                  arrayQueries.push(Query.limit(parseInt(match[1])));
                }
              }
            }
            
            return await this.appwrite.listDocuments<NotificationModel>(
              this.config.activity.databaseId,
              this.config.activity.notificationsCollectionId,
              arrayQueries
            );
          }
          
          // Re-throw if it's a different error
          throw error;
        }
      },
      'listNotifications'
    );
  }
}

// Use a named export instead of default export
export { NotificationService };

export default NotificationService;