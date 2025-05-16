// filepath: /home/nathfavour/Documents/code/web3lancer/web3lancer/src/types/activity.ts

/**
 * Types for the Activity database
 */

export interface UserNotification {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: any;
  createdAt: string;
}

export interface AuditLog {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  action: string;
  entityId?: string;
  entityType?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// Additional types for notification patterns
export type NotificationType = 
  | 'job_proposal'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'contract_started'
  | 'milestone_completed'
  | 'milestone_approved'
  | 'milestone_rejected'
  | 'payment_released'
  | 'contract_completed'
  | 'review_received'
  | 'dispute_created'
  | 'dispute_updated'
  | 'new_message'
  | 'friend_request'
  | 'system_announcement';

export interface NotificationContent {
  title: string;
  message: string;
  metadata?: any;
}
