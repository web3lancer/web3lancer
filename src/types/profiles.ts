// Types for ProfilesDB collections based on the new schema

import { Models } from "appwrite";

// Enum types
export type ProfileType = 'individual' | 'company' | 'dao';
export type VerificationType = 'kyc' | 'company_registration' | 'domain_ownership' | 'social_account';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'requires_more_info';
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

// Corresponds to ProfilesDB/user_profiles
export interface UserProfile {
  $id: string; // Appwrite document ID, should be same as Appwrite User ID for simplicity if possible, or a unique profile ID.
  $createdAt: string;
  $updatedAt: string;
  userId: string; // Appwrite User ID ($id from account.get())
  email: string; // Should be unique, indexed
  username?: string; // User-chosen unique username, indexed
  profileType: 'individual' | 'company' | 'dao';
  name: string; // Publicly visible name
  avatarFileId?: string; // Storage File ID (Profiles Bucket - profile_avatars)
  coverImageFileId?: string; // Storage File ID (Profiles Bucket - cover_images)
  bio?: string; // Max 1000 chars
  tagline?: string; // Max 255 chars
  location?: string;
  timezone?: string; // e.g., 'America/New_York'
  skills?: string[]; // Array of Skill.$id from CoreDB, indexed
  portfolioLink?: string; // URL to an external portfolio or website
  socialLinks?: Record<string, string>; // e.g., { twitter: "url", linkedin: "url" }
  roles: string[]; // Platform roles (e.g., 'freelancer', 'client', 'moderator', 'admin'), indexed
  reputationScore: number; // Default: 0
  isVerified: boolean; // Default: false, indexed
  isActive: boolean; // Default: true, indexed (for soft deletes or deactivation)
  preferences?: Record<string, any>; // User-specific preferences (e.g., theme, notification settings)
  wallets?: UserWalletSummary[]; // Array of associated wallet summaries (denormalized for quick display)
  lastSeenAt?: string; // ISO Datetime
  profileCompletion?: number; // Percentage 0-100
  languagesSpoken?: string[];
  companyDetails?: CompanySpecificDetails; // If profileType is 'company'
  daoDetails?: DAOSpecificDetails; // If profileType is 'dao'
}

// Summary of a wallet for embedding in UserProfile.wallets
export interface UserWalletSummary {
  address: string;
  chain: string;
  isPrimary?: boolean;
  nickname?: string;
}

// Details specific to Company profiles
export interface CompanySpecificDetails {
  companyName?: string; // Might be redundant if UserProfile.name is used
  registrationNumber?: string;
  industry?: string;
  website?: string;
  companySize?: string; // e.g., '1-10 employees', '11-50 employees'
  foundedDate?: string; // ISO Date
  contactEmail?: string; // Public contact email for the company
}

// Details specific to DAO profiles
export interface DAOSpecificDetails {
  daoName?: string; // Might be redundant if UserProfile.name is used
  proposalProcessLink?: string;
  votingMechanism?: string;
  tokenAddress?: string;
  treasuryAddress?: string;
}

// Corresponds to ProfilesDB/profile_verifications
export interface ProfileVerification {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  profileId: string; // References UserProfile.$id
  verificationType: VerificationType;
  status: VerificationStatus;
  documentFileIds?: string[]; // Storage File IDs from verification_documents_private bucket
  rejectionReason?: string;
  reviewedBy?: string; // Profile.$id of the admin who reviewed
  reviewedAt?: string; // ISO Datetime
  submittedData?: Record<string, any>; // e.g., details submitted for verification
}