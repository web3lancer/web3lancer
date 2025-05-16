// filepath: /home/nathfavour/Documents/code/web3lancer/web3lancer/src/types/activity.ts

/**
 * Represents a notification for a user.
 * Corresponds to the `user_notifications` collection in `ActivityDB`.
 */
export interface UserNotification {
  $id: string; // Appwrite document ID
  $createdAt: string;
  // $updatedAt is primarily for isRead and readAt updates
  $updatedAt: string; 
  recipientId: string; // Profile ID of the user receiving the notification
  type: NotificationType; // Enum defining the kind of notification
  title: string; // Short title for the notification
  message: string; // Detailed message
  link?: string; // URL to navigate to when the notification is clicked
  isRead: boolean; // Default: false
  readAt?: string; // ISO Datetime when the notification was marked as read
  actorId?: string; // Profile ID of the user who triggered the notification (optional)
  entityId?: string; // ID of the related entity (e.g., Job.$id, Proposal.$id, Message.$id)
  entityType?: string; // Type of the related entity (e.g., 'job', 'proposal', 'message')
}

// Example enum for Notification Types - expand as needed
export type NotificationType =
  | 'new_message'
  | 'proposal_update' // submitted, accepted, rejected
  | 'job_status_change' // in-progress, completed, cancelled
  | 'contract_action' // created, milestone_due, milestone_approved, payment_released
  | 'new_follower'
  | 'post_interaction' // like, comment on your post
  | 'mention' // user mentioned in a post or comment
  | 'review_reminder'
  | 'dispute_update'
  | 'platform_announcement'
  | 'wallet_update' // deposit, withdrawal
  | 'verification_status'; // profile verification approved/rejected

/**
 * Represents an audit log entry for significant system or user actions.
 * Corresponds to the `audit_logs` collection in `ActivityDB`.
 * (Primarily for admin/system use, not typically exposed directly to users)
 */
export interface AuditLog {
  $id: string; // Appwrite document ID
  $createdAt: string; // Timestamp of the logged action
  actorId?: string; // Profile ID of the user performing the action (if applicable)
  actorType?: 'user' | 'system' | 'admin';
  action: string; // Description of the action performed (e.g., 'user_login', 'job_created', 'settings_updated')
  targetEntityId?: string; // ID of the entity that was affected
  targetEntityType?: string; // Type of the entity affected (e.g., 'profile', 'job', 'contract')
  ipAddress?: string; // IP address of the actor
  userAgent?: string; // User agent string of the actor
  details?: Record<string, any>; // Additional JSON details about the event
  status: 'success' | 'failure'; // Outcome of the action
  failureReason?: string; // If the action failed
}
