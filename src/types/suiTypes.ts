// Type definitions for Sui Move contracts

// User Profile Types
export interface UserProfile {
  id: string;
  owner: string;
  username: string;
  email: string;
  bio: string;
  skills: string[];
  portfolioLinks: string[];
  hourlyRate: number;
  totalEarnings: number;
  projectsCompleted: number;
  reputationScore: number;
  totalReviews: number;
  isVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProfileParams {
  username: string;
  email: string;
  bio: string;
  hourlyRate: number;
}

export interface UpdateProfileParams {
  bio: string;
  hourlyRate: number;
}

// Project Types
export interface Milestone {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: number;
  deadline: number;
  submittedAt: number;
  approvedAt: number;
}

export interface Project {
  id: string;
  client: string;
  freelancer: string;
  title: string;
  description: string;
  totalBudget: number;
  escrowBalance: number;
  milestones: Milestone[];
  status: number;
  createdAt: number;
  startedAt: number;
  completedAt: number;
  disputeReason: string;
}

export interface CreateProjectParams {
  title: string;
  description: string;
  budget: number;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    deadline: number;
  }>;
}

// Review and Reputation Types
export interface Review {
  id: string;
  projectId: string;
  reviewer: string;
  reviewee: string;
  rating: number;
  comment: string;
  skillsRating: number;
  communicationRating: number;
  timelinessRating: number;
  qualityRating: number;
  isClientReview: boolean;
  createdAt: number;
  isDisputed: boolean;
  disputeReason: string;
}

export interface SubmitReviewParams {
  projectId: string;
  reviewee: string;
  rating: number;
  comment: string;
  skillsRating: number;
  communicationRating: number;
  timelinessRating: number;
  qualityRating: number;
  isClientReview: boolean;
}

export interface ReputationBadge {
  id: string;
  owner: string;
  badgeType: string;
  level: number;
  earnedAt: number;
  criteriaMet: string;
}

export interface SkillVerification {
  id: string;
  user: string;
  skill: string;
  verifier: string;
  verificationType: string;
  evidenceUrl: string;
  verifiedAt: number;
  expiryDate: number;
}

// Messaging Types
export interface Message {
  id: number;
  sender: string;
  content: string;
  messageType: number;
  fileUrl: string;
  timestamp: number;
  isRead: boolean;
  replyTo: number;
}

export interface Conversation {
  id: string;
  participants: string[];
  projectId: string;
  messages: Message[];
  lastMessageTime: number;
  createdAt: number;
  isArchived: boolean;
  unreadCount: number[];
}

export interface Notification {
  id: string;
  recipient: string;
  sender: string;
  title: string;
  content: string;
  notificationType: number;
  relatedId: string;
  isRead: boolean;
  createdAt: number;
  actionUrl: string;
}

export interface SendMessageParams {
  content: string;
  messageType: number;
  fileUrl?: string;
  replyTo?: number;
}

export interface CreateNotificationParams {
  recipient: string;
  title: string;
  content: string;
  notificationType: number;
  relatedId: string;
  actionUrl: string;
}

// Registry Types
export interface ProfileRegistry {
  id: string;
  totalProfiles: number;
  verifiedProfiles: number;
}

export interface ProjectRegistry {
  id: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  disputedProjects: number;
  platformFeeRate: number;
  platformBalance: number;
}

export interface ReputationRegistry {
  id: string;
  totalReviews: number;
  totalBadgesIssued: number;
  averagePlatformRating: number;
}

export interface MessagingRegistry {
  id: string;
  totalConversations: number;
  totalMessages: number;
  totalNotifications: number;
}

// Transaction Types
export interface TransactionResult {
  success: boolean;
  result?: any;
  error?: string;
  txDigest?: string;
  objectChanges?: any[];
}

export interface SuiServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  txDigest?: string;
}

// Event Types (mirroring Move events)
export interface ProfileCreatedEvent {
  profileId: string;
  owner: string;
  username: string;
  timestamp: number;
}

export interface ProjectCreatedEvent {
  projectId: string;
  client: string;
  title: string;
  budget: number;
  timestamp: number;
}

export interface MilestoneSubmittedEvent {
  projectId: string;
  milestoneId: number;
  freelancer: string;
  timestamp: number;
}

export interface ReviewSubmittedEvent {
  reviewId: string;
  projectId: string;
  reviewer: string;
  reviewee: string;
  rating: number;
  timestamp: number;
}

export interface MessageSentEvent {
  conversationId: string;
  messageId: number;
  sender: string;
  recipient: string;
  timestamp: number;
}

// Error Types
export interface SuiContractError {
  code: number;
  message: string;
  details?: any;
}

// Utility Types
export type Address = string;
export type ObjectId = string;
export type TxDigest = string;