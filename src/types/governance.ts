// filepath: /home/nathfavour/Documents/code/web3lancer/web3lancer/src/types/governance.ts

/**
 * Represents a dispute filed for a contract.
 * Corresponds to the `contract_disputes` collection in `GovernanceDB`.
 */
export interface Dispute {
  $id: string; // Appwrite document ID
  $createdAt: string;
  $updatedAt: string;
  creatorId: string; // UserProfile.$id
  respondentId: string; // UserProfile.$id
  relatedId: string; // Can be contractId, proposalId, etc.
  relatedType: 'contract' | 'proposal' | 'payment' | 'other';
  title: string;
  description: string;
  evidence?: string[]; // Array of file IDs or URLs
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: string;
  resolutionDate?: string;
  assignedToId?: string; // Admin/moderator assigned to the case
}

/**
 * Represents a vote cast on a dispute or a platform proposal.
 * Corresponds to the `dispute_votes` (or `governance_votes`) collection in `GovernanceDB`.
 */
export interface GovernanceVote {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  proposalId: string; // GovernanceProposal.$id
  voterId: string; // UserProfile.$id
  vote: 'for' | 'against' | 'abstain';
  comment?: string;
}

/**
 * Represents a proposal for changes to the platform itself.
 * Corresponds to the `platform_proposals` collection in `GovernanceDB`.
 */
export interface GovernanceProposal {
  $id: string; // Appwrite document ID
  $createdAt: string;
  $updatedAt: string;
  authorId: string; // UserProfile.$id
  title: string;
  description: string;
  category: 'platform_policy' | 'fee_structure' | 'feature_request' | 'other';
  status: 'draft' | 'active' | 'voting' | 'approved' | 'rejected' | 'implemented';
  votingStartDate?: string;
  votingEndDate?: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  implementationDate?: string;
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
