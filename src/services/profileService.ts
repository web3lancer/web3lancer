import { ID, Query, Databases, Storage } from "appwrite";
import { client } from "@/app/appwrite";
import { Profile, VerificationRequest, VerificationType } from "@/types";
import {
  PROFILES_DATABASE_ID,
  USER_PROFILES_COLLECTION_ID,
  PROFILE_AVATARS_BUCKET_ID,
  COVER_IMAGES_BUCKET_ID,
  VERIFICATION_REQUESTS_COLLECTION_ID,
  VERIFICATION_DOCUMENTS_BUCKET_ID
} from "@/lib/env";

class ProfileService {
  private databases: Databases;
  private storage: Storage;

  constructor() {
    this.databases = new Databases(client);
    this.storage = new Storage(client);
  }

  // Create a new profile
  async createProfile(profileData: Partial<Profile>): Promise<Profile | null> {
    try {
      const newProfile = await this.databases.createDocument(
        PROFILES_DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        ID.unique(),
        {
          // Set default values for required fields
          username: profileData.username || "user" + Math.random().toString(36).substring(2, 7),
          displayName: profileData.displayName || profileData.username || "New User",
          profileType: profileData.profileType || "individual",
          roles: profileData.roles || ["freelancer"],
          isVerified: false,
          reputationScore: 0,
          isActive: true,
          socialLinks: profileData.socialLinks || {},
          skills: profileData.skills || [],
          // Include all other fields from profileData
          ...profileData
        }
      );
      return newProfile as Profile;
    } catch (error) {
      console.error("Error creating profile:", error);
      return null;
    }
  }

  // Get profile by ID
  async getProfile(profileId: string): Promise<Profile | null> {
    try {
      const profile = await this.databases.getDocument(
        PROFILES_DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        profileId
      );
      return profile as Profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }

  // Get profile by userId
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    try {
      const profiles = await this.databases.listDocuments(
        PROFILES_DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      if (profiles.total > 0) {
        return profiles.documents[0] as Profile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile by userId:", error);
      return null;
    }
  }

  // Get profile by username
  async getProfileByUsername(username: string): Promise<Profile | null> {
    try {
      const profiles = await this.databases.listDocuments(
        PROFILES_DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        [Query.equal("username", username)]
      );

      if (profiles.total > 0) {
        return profiles.documents[0] as Profile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile by username:", error);
      return null;
    }
  }

  // Update profile
  async updateProfile(profileId: string, profileData: Partial<Profile>): Promise<Profile | null> {
    try {
      const updatedProfile = await this.databases.updateDocument(
        PROFILES_DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        profileId,
        profileData
      );
      return updatedProfile as Profile;
    } catch (error) {
      console.error("Error updating profile:", error);
      return null;
    }
  }

  // Update profile avatar
  async updateProfileAvatar(profileId: string, avatarFile: File): Promise<{ profile: Profile | null, fileId: string | null }> {
    try {
      // First get the profile
      const profile = await this.getProfile(profileId);
      if (!profile) {
        throw new Error(`Profile with ID ${profileId} not found`);
      }

      // Delete old avatar if exists
      if (profile.avatarFileId) {
        try {
          await this.storage.deleteFile(PROFILE_AVATARS_BUCKET_ID, profile.avatarFileId);
        } catch (error) {
          console.error("Error deleting old avatar:", error);
        }
      }

      // Upload new avatar
      const uploadedFile = await this.storage.createFile(
        PROFILE_AVATARS_BUCKET_ID,
        ID.unique(),
        avatarFile
      );

      // Update profile with new avatar file ID
      const updatedProfile = await this.updateProfile(profileId, {
        avatarFileId: uploadedFile.$id
      });

      return {
        profile: updatedProfile,
        fileId: uploadedFile.$id
      };
    } catch (error) {
      console.error("Error updating profile avatar:", error);
      return { profile: null, fileId: null };
    }
  }

  // Update profile cover image
  async updateProfileCover(profileId: string, coverFile: File): Promise<{ profile: Profile | null, fileId: string | null }> {
    try {
      // First get the profile
      const profile = await this.getProfile(profileId);
      if (!profile) {
        throw new Error(`Profile with ID ${profileId} not found`);
      }

      // Delete old cover if exists
      if (profile.coverImageFileId) {
        try {
          await this.storage.deleteFile(COVER_IMAGES_BUCKET_ID, profile.coverImageFileId);
        } catch (error) {
          console.error("Error deleting old cover image:", error);
        }
      }

      // Upload new cover
      const uploadedFile = await this.storage.createFile(
        COVER_IMAGES_BUCKET_ID,
        ID.unique(),
        coverFile
      );

      // Update profile with new cover file ID
      const updatedProfile = await this.updateProfile(profileId, {
        coverImageFileId: uploadedFile.$id
      });

      return {
        profile: updatedProfile,
        fileId: uploadedFile.$id
      };
    } catch (error) {
      console.error("Error updating profile cover:", error);
      return { profile: null, fileId: null };
    }
  }

  // Get avatar URL
  getProfileAvatarUrl(fileId: string): string {
    return this.storage.getFileView(PROFILE_AVATARS_BUCKET_ID, fileId).href;
  }

  // Get cover image URL
  getProfileCoverUrl(fileId: string): string {
    return this.storage.getFileView(COVER_IMAGES_BUCKET_ID, fileId).href;
  }

  // Submit verification request
  async submitVerification(
    profileId: string, 
    userId: string,
    verificationType: VerificationType, 
    documents: File[]
  ): Promise<{ request: VerificationRequest | null, documentIds: string[] }> {
    try {
      // Upload all documents
      const documentIds: string[] = [];
      for (const doc of documents) {
        const uploadedFile = await this.storage.createFile(
          VERIFICATION_DOCUMENTS_BUCKET_ID,
          ID.unique(),
          doc
        );
        documentIds.push(uploadedFile.$id);
      }

      // Create verification request
      const verificationRequest = await this.databases.createDocument(
        PROFILES_DATABASE_ID,
        VERIFICATION_REQUESTS_COLLECTION_ID,
        ID.unique(),
        {
          profileId,
          userId,
          verificationType,
          status: "pending",
          documentIds,
          // Add any additional metadata needed
        }
      );

      return {
        request: verificationRequest as VerificationRequest,
        documentIds
      };
    } catch (error) {
      console.error("Error submitting verification:", error);
      return { request: null, documentIds: [] };
    }
  }

  // Get verification requests for a profile
  async getVerificationRequests(profileId: string): Promise<VerificationRequest[]> {
    try {
      const requests = await this.databases.listDocuments(
        PROFILES_DATABASE_ID,
        VERIFICATION_REQUESTS_COLLECTION_ID,
        [Query.equal("profileId", profileId)]
      );

      return requests.documents as VerificationRequest[];
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      return [];
    }
  }

  // Search profiles
  async searchProfiles(searchTerm: string, limit: number = 10): Promise<Profile[]> {
    try {
      // Search by username, displayName, skills, etc.
      const profiles = await this.databases.listDocuments(
        PROFILES_DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        [
          Query.search("displayName", searchTerm),
          Query.limit(limit)
        ]
      );

      return profiles.documents as Profile[];
    } catch (error) {
      console.error("Error searching profiles:", error);
      return [];
    }
  }

  // List profiles with filtering options
  async listProfiles({
    page = 1,
    limit = 10,
    profileType,
    roles,
    isVerified,
    skills
  }: {
    page?: number;
    limit?: number;
    profileType?: string;
    roles?: string[];
    isVerified?: boolean;
    skills?: string[];
  }): Promise<{ profiles: Profile[]; total: number }> {
    try {
      const queries: string[] = [
        Query.limit(limit),
        Query.offset((page - 1) * limit)
      ];

      if (profileType) {
        queries.push(Query.equal("profileType", profileType));
      }

      if (isVerified !== undefined) {
        queries.push(Query.equal("isVerified", isVerified));
      }

      // Add more complex queries if needed

      const response = await this.databases.listDocuments(
        PROFILES_DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        queries
      );

      // Additional filtering for properties like roles and skills
      // that might need more complex filtering than Appwrite queries allow
      let filteredProfiles = response.documents as Profile[];

      if (roles && roles.length > 0) {
        filteredProfiles = filteredProfiles.filter(profile => 
          profile.roles.some(role => roles.includes(role))
        );
      }

      if (skills && skills.length > 0) {
        filteredProfiles = filteredProfiles.filter(profile => 
          profile.skills && profile.skills.some(skill => skills.includes(skill))
        );
      }

      return {
        profiles: filteredProfiles,
        total: response.total
      };
    } catch (error) {
      console.error("Error listing profiles:", error);
      return { profiles: [], total: 0 };
    }
  }
}

// Export single instance
const profileService = new ProfileService();
export default profileService;