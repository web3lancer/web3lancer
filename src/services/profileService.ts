import { AppwriteService, ID, Query } from './appwriteService';
import { EnvService } from './envService';

/**
 * Profile Service for managing user profiles
 * Follows best practices from Cross-Cutting Concerns section
 */
class ProfileService {
  private databaseId: string;
  private profilesCollectionId: string;
  private verificationsCollectionId: string;
  private profileAvatarsBucketId: string;
  private coverImagesBucketId: string;
  private verificationDocumentsBucketId: string;

  constructor(
    private appwrite: AppwriteService,
    private env: EnvService<'profiles'>
  ) {
    this.databaseId = this.env.databaseId;
    this.profilesCollectionId = this.env.get('collectionUserProfiles');
    this.verificationsCollectionId = this.env.get('collectionProfileVerifications');
    this.profileAvatarsBucketId = this.env.get('bucketProfileAvatars');
    this.coverImagesBucketId = this.env.get('bucketCoverImages');
    this.verificationDocumentsBucketId = this.env.get('bucketVerificationDocumentsPrivate');
  }

  /**
   * Create a new user profile
   * @param userId The Appwrite User ID
   * @param data The profile data
   * @returns The created profile
   */
  async createProfile(userId: string, data: any) {
    return this.appwrite.createDocument(
      this.databaseId,
      this.profilesCollectionId,
      ID.unique(),
      {
        userId,
        ...data,
        isVerified: false,
        reputationScore: 0,
        isActive: true
      }
    );
  }

  /**
   * Get a user profile by ID
   * @param profileId The profile document ID
   * @returns The profile or null if not found
   */
  async getProfile(profileId: string) {
    return this.appwrite.getDocument(
      this.databaseId,
      this.profilesCollectionId,
      profileId
    );
  }

  /**
   * Get a user profile by user ID
   * @param userId The Appwrite User ID
   * @returns The profile or null if not found
   */
  async getProfileByUserId(userId: string) {
    const profiles = await this.appwrite.listDocuments(
      this.databaseId,
      this.profilesCollectionId,
      [Query.equal('userId', userId)]
    );

    return profiles.length > 0 ? profiles[0] : null;
  }

  /**
   * Update a user profile
   * @param profileId The profile document ID
   * @param data The profile data to update
   * @returns The updated profile
   */
  async updateProfile(profileId: string, data: any) {
    return this.appwrite.updateDocument(
      this.databaseId,
      this.profilesCollectionId,
      profileId,
      data
    );
  }

  /**
   * Delete a user profile
   * @param profileId The profile document ID
   */
  async deleteProfile(profileId: string) {
    return this.appwrite.deleteDocument(
      this.databaseId,
      this.profilesCollectionId,
      profileId
    );
  }

  /**
   * List all user profiles
   * @param queries Optional query parameters
   * @returns Array of profiles
   */
  async listProfiles(queries: string[] = []) {
    return this.appwrite.listDocuments(
      this.databaseId,
      this.profilesCollectionId,
      queries
    );
  }

  /**
   * Upload a profile avatar
   * @param file The avatar file
   * @returns The file ID
   */
  async uploadAvatar(file: File) {
    return this.appwrite.uploadFile(this.profileAvatarsBucketId, file);
  }

  /**
   * Upload a profile cover image
   * @param file The cover image file
   * @returns The file ID
   */
  async uploadCoverImage(file: File) {
    return this.appwrite.uploadFile(this.coverImagesBucketId, file);
  }

  /**
   * Get the avatar preview URL
   * @param fileId The avatar file ID
   * @param width Optional width
   * @param height Optional height
   * @returns The avatar URL
   */
  async getAvatarPreview(fileId: string, width = 200, height = 200) {
    return this.appwrite.getFilePreview(this.profileAvatarsBucketId, fileId, width, height);
  }

  /**
   * Get the cover image preview URL
   * @param fileId The cover image file ID
   * @param width Optional width
   * @param height Optional height
   * @returns The cover image URL
   */
  async getCoverImagePreview(fileId: string, width = 800, height = 300) {
    return this.appwrite.getFilePreview(this.coverImagesBucketId, fileId, width, height);
  }

  /**
   * Submit a profile verification request
   * @param profileId The profile ID
   * @param type The verification type
   * @param documents Array of verification document files
   * @returns The created verification request
   */
  async submitVerificationRequest(profileId: string, type: string, documents: File[]) {
    // Upload verification documents
    const documentIds = [];
    for (const document of documents) {
      const fileId = await this.appwrite.uploadFile(this.verificationDocumentsBucketId, document);
      documentIds.push(fileId);
    }

    // Create verification request
    return this.appwrite.createDocument(
      this.databaseId,
      this.verificationsCollectionId,
      ID.unique(),
      {
        profileId,
        type,
        documentIds,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    );
  }

  /**
   * Get a user's verification status
   * @param profileId The profile ID
   * @returns The verification status or null if not found
   */
  async getVerificationStatus(profileId: string) {
    const verifications = await this.appwrite.listDocuments(
      this.databaseId,
      this.verificationsCollectionId,
      [
        Query.equal('profileId', profileId),
        Query.orderDesc('$createdAt'),
        Query.limit(1)
      ]
    );

    return verifications.length > 0 ? verifications[0] : null;
  }
}

export default ProfileService;