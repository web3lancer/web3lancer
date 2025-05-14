import { Profile, VerificationRequest } from './profile';

// Export all types

// ProfilesDB types
export * from './profiles';

// Re-export all types
export * from './profile';

// Index type exports

export interface Profile {
  $id: string;
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  profileType: 'individual' | 'organization';
  roles: string[];
  reputationScore: number;
  isVerified: boolean;
  isActive: boolean;
  avatarFileId?: string;
  coverImageFileId?: string;
  socialLinks?: Record<string, string>;
  skills?: string[];
  location?: string;
  languages?: string[];
  verificationLevel?: 'none' | 'basic' | 'advanced' | 'expert';
  createdAt?: string;
  updatedAt?: string;
}

export type VerificationType = 'basic' | 'identity' | 'professional' | 'organization';

export interface VerificationRequest {
  $id: string;
  profileId: string;
  userId: string;
  verificationType: VerificationType;
  status: 'pending' | 'approved' | 'rejected';
  documentIds: string[];
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  $id: string;
  clientId: string;
  title: string;
  description: string;
  skills: string[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  duration?: {
    value: number;
    unit: 'hour' | 'day' | 'week' | 'month';
  };
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'canceled';
  visibility: 'public' | 'private' | 'invite_only';
  attachments?: string[];
  category?: string;
  location?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Proposal {
  $id: string;
  projectId: string;
  freelancerId: string;
  coverLetter: string;
  price: {
    amount: number;
    currency: string;
  };
  duration?: {
    value: number;
    unit: 'hour' | 'day' | 'week' | 'month';
  };
  attachments?: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  milestones?: Milestone[];
  createdAt: string;
  updatedAt?: string;
}

export interface Milestone {
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  dueDate?: string;
  completedAt?: string;
  approvedAt?: string;
}

export interface Review {
  $id: string;
  projectId: string;
  reviewerId: string;
  recipientId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  $id: string;
  channelId: string;
  senderId: string;
  content: string;
  attachments?: string[];
  readBy: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentTransaction {
  $id: string;
  projectId: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'milestone' | 'escrow' | 'refund' | 'withdrawal';
  description?: string;
  transactionHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Notification {
  $id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
  readAt?: string;
}

export interface Skill {
  $id: string;
  name: string;
  category: string;
  subCategory?: string;
  popularity: number;
}

export interface Category {
  $id: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface UserSettings {
  $id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  currencyPreference: string;
}