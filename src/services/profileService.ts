import { Query } from 'appwrite';
import * as env from '@/lib/env';
import BaseService from './baseService';
import { AppwriteService, ID } from './appwriteService';
import { EnvConfig } from '@/config/environment';
import { UserProfile, ProfileVerification } from '@/types/profiles';

/**
 * ProfileService - Handles user profile management operations
 * 
 * This service manages all operations related to user profiles including
 * creation, update, retrieval, and verification.
 */
class ProfileService extends BaseService {
  constructor(
    protected appwrite: AppwriteService,
    protected config: EnvConfig
  ) {
    super(appwrite, config);
  }

  // Create a new user profile
  async createProfile(data: Omit<UserProfile, '$id' | '$createdAt' | '$updatedAt'>): Promise<UserProfile> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<UserProfile>(
          this.config.profiles.databaseId,
          this.config.profiles.userProfilesCollectionId, 
          ID.unique(), 
          data
        );
      },
      'createProfile'
    );
  }

  // Get user profile by ID
  async getProfile(profileId: string): Promise<UserProfile | null> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<UserProfile>(
          this.config.profiles.databaseId,
          this.config.profiles.userProfilesCollectionId,
          profileId
        );
      },
      'getProfile'
    );
  }

  // Get user profile by user ID (Appwrite Account ID)
  async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    return this.handleRequest(
      async () => {
        const profiles = await this.appwrite.listDocuments<UserProfile>(
          this.config.profiles.databaseId,
          this.config.profiles.userProfilesCollectionId,
          [Query.equal('userId', userId)]
        );
        
        return profiles.length > 0 ? profiles[0] : null;
      },
      'getProfileByUserId'
    );
  }

  // Update user profile
  async updateProfile(profileId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<UserProfile>(
          this.config.profiles.databaseId,
          this.config.profiles.userProfilesCollectionId,
          profileId,
          data
        );
      },
      'updateProfile'
    );
  }

  // List profiles with optional filters
  async listProfiles(queries: string[] = []): Promise<UserProfile[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<UserProfile>(
          this.config.profiles.databaseId,
          this.config.profiles.userProfilesCollectionId,
          queries
        );
      },
      'listProfiles'
    );
  }

  // Create a profile verification
  async createVerification(data: Omit<ProfileVerification, '$id' | '$createdAt' | '$updatedAt'>): Promise<ProfileVerification> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<ProfileVerification>(
          this.config.profiles.databaseId,
          this.config.profiles.verificationsCollectionId,
          ID.unique(),
          data
        );
      },
      'createVerification'
    );
  }

  // Get profile verifications by profile ID
  async getVerifications(profileId: string): Promise<ProfileVerification[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<ProfileVerification>(
          this.config.profiles.databaseId,
          this.config.profiles.verificationsCollectionId,
          [Query.equal('profileId', profileId)]
        );
      },
      'getVerifications'
    );
  }

  // Update verification status
  async updateVerification(verificationId: string, status: string, verifierNotes?: string): Promise<ProfileVerification> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<ProfileVerification>(
          this.config.profiles.databaseId,
          this.config.profiles.verificationsCollectionId,
          verificationId,
          { 
            status, 
            verifiedAt: status === 'verified' ? new Date().toISOString() : undefined,
            verifierNotes
          }
        );
      },
      'updateVerification'
    );
  }

  // Upload verification document
  async uploadVerificationDocument(file: File, profileId: string): Promise<string> {
    return this.handleRequest(
      async () => {
        const result = await this.appwrite.uploadFile(
          this.config.storage.verificationDocumentsBucketId,
          ID.unique(),
          file,
          [`user:${profileId}`] // Permissions set to only allow this user to access
        );
        
        return result.$id;
      },
      'uploadVerificationDocument'
    );
  }

  // Delete verification document
  async deleteVerificationDocument(fileId: string): Promise<void> {
    return this.handleRequest(
      async () => {
        await this.appwrite.deleteFile(
          this.config.storage.verificationDocumentsBucketId,
          fileId
        );
      },
      'deleteVerificationDocument'
    );
  }

  // Upload profile picture
  async uploadProfilePicture(file: File, profileId: string): Promise<string> {
    return this.handleRequest(
      async () => {
        const result = await this.appwrite.uploadFile(
          this.config.storage.profileImagesBucketId,
          ID.unique(),
          file,
          ['role:all'] // Public permissions for profile pictures
        );
        
        return result.$id;
      },
      'uploadProfilePicture'
    );
  }

  // Get profile picture URL
  getProfilePictureUrl(fileId: string, width: number = 200, height: number = 200): string {
    return this.appwrite.getFileView(
      this.config.storage.profileImagesBucketId,
      fileId,
      width,
      height
    );
  }

  // Get reviews for a specific project
  async getProjectReviews(projectId: string): Promise<Review[]> {
    try {
      const reviews = await this.appwrite.listDocuments<Review>(
        env.JOBS_DATABASE_ID,
        env.USER_REVIEWS_COLLECTION_ID,
        [
          Query.equal('projectId', projectId),
          Query.orderDesc('$createdAt')
        ]
      );
      return reviews;
    } catch (error) {
      console.error('Error fetching project reviews:', error);
      return [];
    }
  }
}

export default ProfileService;