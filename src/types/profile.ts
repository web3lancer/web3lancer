// Types related to user profiles

export type ProfileType = 'individual' | 'company' | 'dao';
export type UserRole = 'freelancer' | 'client' | 'admin';
export type VerificationType = 'kyc' | 'company_registration' | 'domain_ownership';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'resubmit_required';

export interface SocialLinks {
  [key: string]: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  discord?: string;
  telegram?: string;
}

export interface Profile {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  
  // User identification
  userId: string;
  username: string;
  displayName: string;
  profileType: ProfileType;
  
  // Profile data
  bio?: string;
  tagline?: string;
  skills?: string[];
  location?: string;
  timezone?: string;
  
  // Roles and verification
  roles: UserRole[];
  isVerified: boolean;
  reputationScore: number;
  
  // Media
  avatarFileId?: string;
  coverImageFileId?: string;
  
  // External links
  portfolioLink?: string;
  socialLinks: SocialLinks;
  
  // Status
  isActive: boolean;
  
  // Additional company/DAO specific fields
  companySize?: number;
  foundedYear?: number;
  registrationId?: string;
}

// Verification request type
export interface VerificationRequest {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  
  profileId: string;
  userId: string;
  verificationType: VerificationType;
  status: VerificationStatus;
  documentIds: string[];
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}