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

// Activity related types
export interface Notification {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string; // UserProfile.$id of the notification recipient
  type: string; // e.g., 'job_application', 'message', 'milestone_completed', etc.
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string; // ISO Date string
  itemId?: string; // ID of related item
  itemType?: string; // Type of related item
  relatedUserId?: string; // UserProfile.$id of user related to this notification
  actions?: {
    label: string;
    url: string;
  }[];
  expiresAt?: string; // ISO Date string
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  isSystem?: boolean; // Whether this is a system notification vs user-specific
}

export interface ActivityLog {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string; // UserProfile.$id of the user who performed the action
  action: string; // e.g., 'create_job', 'submit_proposal', 'complete_milestone', etc.
  description: string;
  itemId?: string; // ID of related item
  itemType?: string; // Type of related item
  metadata?: { [key: string]: any }; // Additional contextual data
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
  };
  isSystem?: boolean; // Whether this is a system-initiated action
}

export interface SystemNotification {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  message: string;
  type: 'announcement' | 'maintenance' | 'warning' | 'update' | 'other';
  isActive: boolean;
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  targetUserGroups?: string[]; // e.g., 'all', 'freelancers', 'clients', etc.
  targetUserIds?: string[]; // Specific UserProfile.$id values
  dismissible: boolean;
  actions?: {
    label: string;
    url: string;
  }[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdById: string; // UserProfile.$id of admin
}
