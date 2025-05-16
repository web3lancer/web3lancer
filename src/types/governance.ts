// filepath: /home/nathfavour/Documents/code/web3lancer/web3lancer/src/types/governance.ts

/**
 * Types for Disputes and Governance
 */

export interface Dispute {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  description: string;
  initiatorId: string; // UserProfile.$id of the user who created the dispute
  respondentId: string; // UserProfile.$id of the user the dispute is against
  relatedItemId: string; // ID of related object (JobContract.$id, JobMilestone.$id, etc.)
  relatedItemType: 'contract' | 'milestone' | 'review' | 'payment' | 'other';
  status: 'pending' | 'under_review' | 'escalated' | 'resolved' | 'closed' | 'cancelled';
  resolution?: string;
  resolutionDetails?: string;
  resolutionDate?: string; // ISO Date string
  assignedModeratorId?: string; // UserProfile.$id of admin/moderator
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachmentFileIds?: string[]; // Storage File IDs for evidence
  comments?: {
    userId: string;
    message: string;
    timestamp: string; // ISO Date string
    isPrivate: boolean; // If true, only visible to moderators
  }[];
  timeline?: {
    action: string;
    timestamp: string; // ISO Date string
    userId?: string;
    note?: string;
  }[];
  resolution_type?: 'in_favor_of_initiator' | 'in_favor_of_respondent' | 'compromise' | 'no_action';
  votes?: {
    voterId: string;
    vote: 'initiator' | 'respondent' | 'neutral';
    timestamp: string; // ISO Date string
  }[];
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

// Governance related types
export interface GovernanceProposal {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  description: string;
  authorId: string; // UserProfile.$id
  proposalType: 'platform_change' | 'fee_change' | 'feature_request' | 'policy_change' | 'other';
  status: 'draft' | 'pending' | 'active' | 'passed' | 'rejected' | 'implemented';
  votingStartDate?: string; // ISO Date string
  votingEndDate?: string; // ISO Date string
  minimumVotes?: number;
  requiredMajority?: number; // e.g., 0.67 for 2/3 majority
  voteCount?: {
    yes: number;
    no: number;
    abstain: number;
  };
  details?: string;
  attachmentFileIds?: string[]; // Storage File IDs
  implementationDate?: string; // ISO Date string
  implementationDetails?: string;
  tags?: string[];
}

export interface GovernanceVote {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  proposalId: string; // GovernanceProposal.$id
  voterId: string; // UserProfile.$id
  vote: 'yes' | 'no' | 'abstain';
  weight?: number; // For weighted voting if implemented
  reason?: string;
  timestamp: string; // ISO Date string
  isAnonymous?: boolean;
}

export interface PlatformPolicy {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  description: string;
  policyType: 'terms_of_service' | 'privacy_policy' | 'community_guidelines' | 'fee_structure' | 'other';
  content: string;
  version: string;
  isActive: boolean;
  effectiveDate: string; // ISO Date string
  previousVersionId?: string; // PlatformPolicy.$id of previous version
  approvedById: string; // UserProfile.$id of admin
  changeLog?: string;
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
