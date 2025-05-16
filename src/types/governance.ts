// filepath: /home/nathfavour/Documents/code/web3lancer/web3lancer/src/types/governance.ts

/**
 * Types for Disputes and Governance
 */

export interface Dispute {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  contractId: string;
  creatorId: string;
  respondentId: string;
  reason: string;
  description: string;
  evidenceFileIds?: string[];
  requestedResolution: string;
  status: 'pending_review' | 'under_review' | 'open' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  votingStartsAt?: string;
  votingEndsAt?: string;
  resolution?: string;
}

export interface DisputeVote {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  disputeId: string;
  voterId: string;
  vote: 'for_creator' | 'for_respondent' | 'abstain';
  reason?: string;
  votedAt: string;
}

export interface Proposal {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  creatorId: string;
  title: string;
  description: string;
  proposalType: 'feature' | 'policy' | 'improvement' | 'other';
  details: any;
  status: 'draft' | 'open' | 'voting' | 'approved' | 'rejected' | 'implemented';
  createdAt: string;
  updatedAt: string;
  votingStartsAt?: string;
  votingEndsAt?: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  outcome?: 'passed' | 'failed';
  implementationDetails?: string;
  implementedAt?: string;
}

// Notification related types
export interface Notification {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  recipientId: string; // UserProfile.$id
  senderId?: string; // UserProfile.$id if applicable
  type: 'message' | 'proposal' | 'contract' | 'payment' | 'dispute' | 'system' | 'connection' | 'other';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string; // URL to navigate to when clicked
  relatedId?: string; // ID of related entity
  relatedType?: string; // Type of related entity
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

// Core data types
export interface SystemSetting {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  key: string;
  value: string;
  description?: string;
  isPublic: boolean; // Whether this setting is accessible to non-admin users
  category: 'general' | 'security' | 'financial' | 'content' | 'governance' | 'other';
}

export interface SystemMetric {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  metric: string;
  value: number;
  date: string; // The date this metric was recorded
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface SystemAuditLog {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  actorId?: string; // UserProfile.$id if applicable
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}
