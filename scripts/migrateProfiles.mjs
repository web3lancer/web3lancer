import { Client, Databases, Storage, ID } from "node-appwrite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "")
  .setProject(process.env.APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

const databases = new Databases(client);
const storage = new Storage(client);

// Database IDs
const LEGACY_DATABASE_ID = process.env.LEGACY_DATABASE_ID || "";
const PROFILES_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_PROFILES_ID || "";

// Collection IDs
const LEGACY_USERS_COLLECTION_ID = process.env.LEGACY_USERS_COLLECTION_ID || "";
const USER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES_ID || "";

// Bucket IDs
const LEGACY_AVATARS_BUCKET_ID = process.env.LEGACY_AVATARS_BUCKET_ID || "";
const PROFILE_AVATARS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PROFILE_AVATARS_ID || "";

/**
 * Migrates user data from the legacy database to the ProfilesDB
 */
async function migrateUsers() {
  console.log("Starting user migration...");
  
  try {
    // Get all users from the legacy collection
    const legacyUsers = await databases.listDocuments(
      LEGACY_DATABASE_ID,
      LEGACY_USERS_COLLECTION_ID
    );
    
    console.log(`Found ${legacyUsers.total} users to migrate.`);
    
    for (const user of legacyUsers.documents) {
      try {
        // Check if user already has a profile in ProfilesDB
        const existingProfiles = await databases.listDocuments(
          PROFILES_DATABASE_ID,
          USER_PROFILES_COLLECTION_ID,
          [
            // Query using userId which is the user.$id in Appwrite
            { field: "userId", operator: "equal", value: user.$id }
          ]
        );
        
        if (existingProfiles.total > 0) {
          console.log(`User ${user.$id} already has a profile. Skipping.`);
          continue;
        }
        
        // Extract user info
        const { $id: userId, name, email } = user;
        
        // Generate a username from email if not available
        const username = user.username || email.split('@')[0];
        
        // Default values for required fields
        const displayName = name || username;
        const profileType = "individual";
        const roles = ["freelancer"]; // Default role
        
        // Optional fields to migrate if available
        const bio = user.bio || "";
        const location = user.location || "";
        const skills = user.skills || [];
        
        // Social links if available
        const socialLinks = {};
        if (user.socialLinks) {
          socialLinks = user.socialLinks;
        } else {
          // Try to extract individual social links if they exist
          if (user.github) socialLinks.github = user.github;
          if (user.twitter) socialLinks.twitter = user.twitter;
          if (user.linkedin) socialLinks.linkedin = user.linkedin;
          if (user.website) socialLinks.website = user.website;
        }
        
        // Migrate avatar if available
        let avatarFileId = null;
        if (user.avatarId || user.profilePictureId) {
          const avatarId = user.avatarId || user.profilePictureId;
          
          try {
            // Get the avatar file from legacy bucket
            const avatarFile = await storage.getFileDownload(LEGACY_AVATARS_BUCKET_ID, avatarId);
            const avatarBuffer = await avatarFile.arrayBuffer();
            
            // Get file details to determine file type
            const fileDetails = await storage.getFile(LEGACY_AVATARS_BUCKET_ID, avatarId);
            const fileName = fileDetails.name;
            const fileType = fileDetails.mimeType;
            
            // Create a File object from the buffer
            const file = new File([Buffer.from(avatarBuffer)], fileName, { type: fileType });
            
            // Upload to the new profile avatars bucket
            const uploadedFile = await storage.createFile(
              PROFILE_AVATARS_BUCKET_ID,
              ID.unique(),
              file
            );
            
            avatarFileId = uploadedFile.$id;
            console.log(`Migrated avatar for user ${userId}.`);
          } catch (error) {
            console.error(`Error migrating avatar for user ${userId}:`, error);
          }
        }
        
        // Create the profile in ProfilesDB
        const newProfile = await databases.createDocument(
          PROFILES_DATABASE_ID,
          USER_PROFILES_COLLECTION_ID,
          ID.unique(),
          {
            userId,
            username,
            displayName,
            profileType,
            roles,
            bio,
            location,
            skills,
            socialLinks,
            avatarFileId,
            isVerified: false,
            reputationScore: 0,
            isActive: true
          }
        );
        
        console.log(`Created profile for user ${userId}: ${newProfile.$id}`);
      } catch (error) {
        console.error(`Error migrating user ${user.$id}:`, error);
      }
    }
    
    console.log("User migration completed.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run the migration
migrateUsers().catch(console.error);