import { Profile, VerificationRequest } from './profile';

// Export all types

// ProfilesDB types
export * from './profiles';

// Re-export all types
export * from './profile';

// Index type exports

export interface User {
  userId: string;
  email: string;
  name?: string;
}

export interface Profile {
  $id: string;
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  skills?: string[];
  roles: ('freelancer' | 'client' | 'admin')[];
  verified?: boolean;
  avatarFileId?: string;
  coverFileId?: string;
  socialLinks?: {
    website?: string;
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export type VerificationType = 'basic' | 'identity' | 'professional' | 'organization';

export interface VerificationRequest {
  $id: string;
  userId: string;
  profileId: string;
  documentType: 'id' | 'passport' | 'license' | 'other';
  documentFileId: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  $id: string;
  title: string;
  description: string;
  skills: string[];
  category?: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  duration?: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  location?: string;
  attachments?: string[];
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'invite';
  clientId: string;
  clientProfileId: string;
  freelancerId?: string;
  freelancerProfileId?: string;
  contractId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Proposal {
  $id: string;
  projectId: string;
  freelancerId: string;
  freelancerProfileId: string;
  coverLetter: string;
  proposedBudget?: number;
  proposedDuration?: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  milestones?: Array<{
    title: string;
    description?: string;
    amount?: number;
  }>;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  updatedAt?: string;
}

export interface Contract {
  $id: string;
  projectId: string;
  proposalId?: string;
  clientId: string;
  clientProfileId: string;
  freelancerId: string;
  freelancerProfileId: string;
  title: string;
  description: string;
  terms: string;
  budget: number;
  duration?: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  milestones?: Array<{
    title: string;
    description?: string;
    amount: number;
    status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'paid';
    dueDate?: string;
  }>;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'disputed';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Payment {
  $id: string;
  contractId: string;
  projectId: string;
  milestoneId?: string;
  clientId: string;
  freelancerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionHash?: string;
  paymentMethod?: 'crypto' | 'escrow' | 'card' | 'bank';
  description?: string;
  createdAt: string;
  completedAt?: string;
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