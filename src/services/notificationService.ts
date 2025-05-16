import BaseService from './baseService';
import { AppwriteService, ID, Query } from './appwriteService';
import { EnvConfig } from '@/config/environment';
import { Notification, ActivityLog } from '@/types/activity';

/**
 * NotificationService - Handles user notifications and activity logs
 * 
 * This service manages the creation, retrieval, and management of
 * user notifications and system activity logs.
 */
class NotificationService extends BaseService {
  constructor(
    protected appwrite: AppwriteService,
    protected config: EnvConfig
  ) {
    super(appwrite, config);
  }

  // Notifications
  async createNotification(data: Omit<Notification, '$id' | '$createdAt' | '$updatedAt'>): Promise<Notification> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<Notification>(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          ID.unique(),
          data
        );
      },
      'createNotification'
    );
  }

  async getNotification(notificationId: string): Promise<Notification | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<Notification>(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          notificationId
        );
      },
      'getNotification'
    );
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<Notification>(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          notificationId,
          { isRead: true, readAt: new Date().toISOString() }
        );
      },
      'markNotificationAsRead'
    );
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    return this.handleRequest(
      async () => {
        const unreadNotifications = await this.getUserUnreadNotifications(userId);
        
        // Update each unread notification
        const updatePromises = unreadNotifications.map(notification => 
          this.markNotificationAsRead(notification.$id)
        );
        
        await Promise.all(updatePromises);
      },
      'markAllNotificationsAsRead'
    );
  }

  async getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<Notification>(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          [
            Query.equal('userId', userId),
            Query.orderDesc('$createdAt'),
            Query.limit(limit)
          ]
        );
      },
      'getUserNotifications'
    );
  }

  async getUserUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<Notification>(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          [
            Query.equal('userId', userId),
            Query.equal('isRead', false),
            Query.orderDesc('$createdAt')
          ]
        );
      },
      'getUserUnreadNotifications'
    );
  }

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

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.handleRequest(
      async () => {
        const notifications = await this.appwrite.listDocuments<Notification>(
          this.config.activity.databaseId,
          this.config.activity.notificationsCollectionId,
          [
            Query.equal('userId', userId),
            Query.equal('isRead', false)
          ]
        );
        
        return notifications.length;
      },
      'getUnreadNotificationCount'
    );
  }

  // Activity Logs
  async createActivityLog(data: Omit<ActivityLog, '$id' | '$createdAt' | '$updatedAt'>): Promise<ActivityLog> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<ActivityLog>(
          this.config.activity.databaseId,
          this.config.activity.logsCollectionId,
          ID.unique(),
          data
        );
      },
      'createActivityLog'
    );
  }

  async getActivityLog(logId: string): Promise<ActivityLog | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<ActivityLog>(
          this.config.activity.databaseId,
          this.config.activity.logsCollectionId,
          logId
        );
      },
      'getActivityLog'
    );
  }

  async getUserActivityLogs(userId: string, limit: number = 20): Promise<ActivityLog[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<ActivityLog>(
          this.config.activity.databaseId,
          this.config.activity.logsCollectionId,
          [
            Query.equal('userId', userId),
            Query.orderDesc('$createdAt'),
            Query.limit(limit)
          ]
        );
      },
      'getUserActivityLogs'
    );
  }

  async getItemActivityLogs(itemId: string, itemType: string): Promise<ActivityLog[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<ActivityLog>(
          this.config.activity.databaseId,
          this.config.activity.logsCollectionId,
          [
            Query.equal('itemId', itemId),
            Query.equal('itemType', itemType),
            Query.orderDesc('$createdAt')
          ]
        );
      },
      'getItemActivityLogs'
    );
  }

  // Helper methods for common notifications
  async notifyJobApplication(jobId: string, jobTitle: string, clientId: string, freelancerId: string, freelancerName: string): Promise<Notification> {
    return this.createNotification({
      userId: clientId,
      type: 'job_application',
      title: 'New Job Application',
      message: `${freelancerName} has applied to your job: "${jobTitle}"`,
      isRead: false,
      itemId: jobId,
      itemType: 'job',
      relatedUserId: freelancerId,
      actions: [
        {
          label: 'View Application',
          url: `/jobs/${jobId}/proposals`
        }
      ]
    });
  }

  async notifyProposalAccepted(proposalId: string, jobId: string, jobTitle: string, clientId: string, clientName: string, freelancerId: string): Promise<Notification> {
    return this.createNotification({
      userId: freelancerId,
      type: 'proposal_accepted',
      title: 'Proposal Accepted',
      message: `${clientName} has accepted your proposal for "${jobTitle}"`,
      isRead: false,
      itemId: proposalId,
      itemType: 'proposal',
      relatedUserId: clientId,
      actions: [
        {
          label: 'View Details',
          url: `/jobs/${jobId}/proposals/${proposalId}`
        }
      ]
    });
  }

  async notifyMilestoneCompleted(milestoneId: string, contractId: string, milestoneTitle: string, clientId: string, freelancerId: string, freelancerName: string): Promise<Notification> {
    return this.createNotification({
      userId: clientId,
      type: 'milestone_completed',
      title: 'Milestone Completed',
      message: `${freelancerName} has marked the milestone "${milestoneTitle}" as completed`,
      isRead: false,
      itemId: milestoneId,
      itemType: 'milestone',
      relatedUserId: freelancerId,
      actions: [
        {
          label: 'Review Submission',
          url: `/contracts/${contractId}/milestones/${milestoneId}`
        }
      ]
    });
  }

  async notifyPaymentReleased(milestoneId: string, contractId: string, amount: number, currency: string, clientId: string, clientName: string, freelancerId: string): Promise<Notification> {
    return this.createNotification({
      userId: freelancerId,
      type: 'payment_released',
      title: 'Payment Released',
      message: `${clientName} has released ${amount} ${currency} for your milestone`,
      isRead: false,
      itemId: milestoneId,
      itemType: 'milestone',
      relatedUserId: clientId,
      actions: [
        {
          label: 'View Details',
          url: `/contracts/${contractId}/milestones/${milestoneId}`
        }
      ]
    });
  }

  async notifyNewMessage(conversationId: string, senderId: string, senderName: string, receiverId: string, preview: string): Promise<Notification> {
    return this.createNotification({
      userId: receiverId,
      type: 'new_message',
      title: 'New Message',
      message: `${senderName}: ${preview}`,
      isRead: false,
      itemId: conversationId,
      itemType: 'conversation',
      relatedUserId: senderId,
      actions: [
        {
          label: 'Reply',
          url: `/messages/${conversationId}`
        }
      ]
    });
  }
}

export default NotificationService;