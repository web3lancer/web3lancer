import { AppwriteDocument } from '@/services/appwriteService';

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
export interface Notification extends AppwriteDocument {
  userId: string; // User ID who receives the notification
  title: string;
  message: string;
  type: string; // 'job_application', 'message', 'payment', etc.
  isRead: boolean;
  readAt?: string; // ISO date string when notification was read
  referenceType?: string; // 'job', 'contract', 'message', etc.
  referenceId?: string; // ID of the reference object
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actions?: NotificationAction[];
  expiresAt?: string; // ISO date string for when notification expires
  metadata?: Record<string, any>;
}

/**
 * Notification Action
 * Represents an action button that can be displayed with a notification
 */
export interface NotificationAction {
  label: string;
  url: string;
  type?: 'primary' | 'secondary' | 'danger';
  metadata?: Record<string, any>;
}

/**
 * Activity Log
 * Records user actions on the platform
 */
export interface ActivityLog extends AppwriteDocument {
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
 * Reminder
 * Scheduled reminders for users
 */
export interface Reminder extends AppwriteDocument {
  userId: string; // User who will receive the reminder
  title: string;
  message: string;
  reminderDate: string; // ISO date string
  isCompleted: boolean;
  isRecurring: boolean;
  recurringPattern?: string; // cron expression for recurring reminders
  priority: 'low' | 'normal' | 'high';
  category: string; // 'job', 'payment', 'personal', etc.
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

/**
 * User Recent Activity
 * Summary of recent user activities for display
 */
export interface UserRecentActivity extends AppwriteDocument {
  userId: string;
  activities: {
    type: string;
    title: string;
    description?: string;
    timestamp: string;
    icon?: string;
    link?: string;
  }[];
  lastUpdated: string; // ISO date string
}

/**
 * Newsletter Subscription
 */
export interface NewsletterSubscription extends AppwriteDocument {
  email: string;
  name?: string;
  userId?: string;
  isSubscribed: boolean;
  subscribedAt: string; // ISO date string
  unsubscribedAt?: string; // ISO date string
  categories: string[]; // 'product_updates', 'jobs', 'tips', etc.
  lastEmailSent?: string; // ISO date string
  metadata?: Record<string, any>;
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
