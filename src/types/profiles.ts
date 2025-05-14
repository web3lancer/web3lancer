// Types for ProfilesDB collections based on the new schema

import { Models } from "appwrite";

// Enum types
export type ProfileType = 'individual' | 'company' | 'dao';
export type VerificationType = 'kyc' | 'company_registration' | 'domain_ownership';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'resubmit_required';
export type UserRole = 'freelancer' | 'client' | 'moderator' | 'admin';

// Social links structure
export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  facebook?: string;
  discord?: string;
  website?: string;
  [key: string]: string | undefined;
}

// Wallet structure for the wallets field in Profiles
export interface WalletSummary {
  address: string;
  chain: string;
  isPrimary: boolean;
}

// User preferences structure
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notificationSettings?: {
    email?: boolean;
    inApp?: boolean;
    jobAlerts?: boolean;
    messageAlerts?: boolean;
  };
  [key: string]: any;
}

// Profile document structure
export interface Profile extends Models.Document {
  userId: string;
  username: string;
  profileType: ProfileType;
  displayName: string;
  avatarFileId?: string;
  coverImageFileId?: string;
  bio?: string;
  tagline?: string;
  location?: string;
  timezone?: string;
  skills: string[]; // Skill IDs from CoreDB.Skills
  portfolioLink?: string;
  socialLinks?: SocialLinks;
  roles: UserRole[];
  reputationScore: number;
  isVerified: boolean;
  isActive: boolean;
  preferences?: UserPreferences;
  wallets?: WalletSummary[];
}

// Profile verification document structure
export interface ProfileVerification extends Models.Document {
  profileId: string;
  verificationType: VerificationType;
  documentFileIds?: string[];
  status: VerificationStatus;
  notes?: string;
  reviewedAt?: string; // ISO date string
  reviewedBy?: string;
}