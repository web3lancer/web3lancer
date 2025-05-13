import { Client, Account, Databases, Storage, Avatars, ID, Query, OAuthProvider, ImageGravity, ImageFormat, AuthenticationFactor, AppwriteException } from 'appwrite'; // Add AppwriteException
import { Models } from 'appwrite'; // Import Models for type hints
import { APPWRITE_CONFIG, APP_CONFIG } from '@/lib/env';

// Initialize client according to Appwrite docs
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!); 

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const avatars = new Avatars(client);

export function getProfilePictureUrl(fileId: string): string {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
  if (!bucketId || !fileId) {
    console.error('Missing bucketId or fileId for getProfilePictureUrl');
    return ''; // Return empty string if essential info is missing
  }

  try {
    // Use the globally defined storage instance
    const result = storage.getFilePreview(
      bucketId,
      fileId,
      128, // width
      128, // height
      ImageGravity.Center,
      80, // quality
      undefined, // borderWidth
      undefined, // borderColor
      64, // borderRadius for circle
      undefined, // opacity
      0, // rotation
      undefined, // background
      ImageFormat.Webp
    );
    // Convert the URL object to a string
    return result.toString();
  } catch (error) {
    console.error('Error getting profile picture preview:', error);
    // Fallback: Try getFileView if preview fails (e.g., non-image file)
    try {
      const viewResult = storage.getFileView(bucketId, fileId);
      return viewResult.toString();
    } catch (viewError) {
      console.error('Error getting profile picture view (fallback):', viewError);
      return ''; // Return empty string on error
    }
  }
}

/**
 * User authentication functions
 */
async function signUp(email: string, password: string, name: string) {
  try {
    // Create a unique user ID
    const userId = ID.unique();

    // Create the user
    const response = await account.create(userId, email, password, name);
    console.log('User created successfully:', response);

    // Send email verification after successful signup
    try {
          const baseURL = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'https://www.web3lancer.website');
      const verificationURL = `${baseURL}/verify-email`;
      await account.createVerification(verificationURL);
      console.log('Verification email sent');
    } catch (verificationError) {
      console.error('Error sending verification email:', verificationError);
      // We don't throw here to allow account creation to succeed even if verification fails
    }

    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function signIn(email: string, password: string) {
  try {
    // Delete any existing session before creating a new one
    try {
      await signOut();
    } catch (error) {
      // Ignore errors from signOut, we just want to make sure we clean up before signing in
      console.log('No active session to clear before signing in, or signOut failed (which is handled)');
    }
    
    // Create session according to Appwrite docs pattern
    await account.createEmailPasswordSession(email, password);
    
    // After creating the session, get the user details
    const user = await account.get();
    console.log('User signed in successfully:', user);
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw new Error(`Failed to sign in: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function signOut() {
  try {
    // Attempt to delete the current session
    await account.deleteSession('current');
    console.log('Session deleted successfully.');
    return true;
  } catch (error) {
    console.error('Error signing out or no session to delete:', error);
    // Don't throw on error, as we want to clear local state even if server fails
    // or if there was no session to begin with.
    return false;
  }
}

async function listSessions() {
  try {
    return await account.listSessions();
  } catch (error) {
    console.error('Error listing sessions:', error);
    return { total: 0, sessions: [] };
  }
}

/**
 * Email verification functions
 */
async function createEmailVerification() {
  try {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'https://www.web3lancer.website');
    const verificationURL = `${baseURL}/verify-email`;
    const response = await account.createVerification(verificationURL);
    console.log('Verification email sent successfully');
    return response;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function completeEmailVerification(userId: string, secret: string) {
  try {
    const response = await account.updateVerification(userId, secret);
    console.log('Email verified successfully');
    return response;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw new Error(`Failed to verify email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Password recovery functions
 */
async function createPasswordRecovery(email: string) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'https://www.web3lancer.website');
    const recoveryURL = `${baseURL}/reset-password`;
    const response = await account.createRecovery(email, recoveryURL);
    console.log('Password recovery email sent successfully');
    return response;
  } catch (error) {
    console.error('Error sending password recovery email:', error);
    throw new Error(`Failed to send recovery email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function completePasswordRecovery(userId: string, secret: string, newPassword: string) {
  try {
    const response = await account.updateRecovery(userId, secret, newPassword);
    console.log('Password recovery completed successfully');
    return response;
  } catch (error) {
    console.error('Error completing password recovery:', error);
    throw new Error(`Failed to complete recovery: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Magic URL Authentication methods
 */
async function createMagicURLToken(email: string) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'https://www.web3lancer.website');
    
    // Create a unique user ID for new users or fetch existing ID
    let userId = ID.unique();
    
    // Try to find if user with this email already exists
    try {
      const users = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASES.USERS,
        APPWRITE_CONFIG.COLLECTIONS.PROFILES,
        [Query.equal('email', email)]
      );
      
      if (users.documents.length > 0) {
        // Use existing user ID if found
        userId = users.documents[0].userId;
      }
    } catch (error) {
      console.log('No existing user found, creating new user ID');
    }
    
    // Create the magic URL token
    const magicURL = `${baseURL}/verify-magic-link`;
    const token = await account.createMagicURLToken(userId, email, magicURL);
    
    console.log('Magic URL token created successfully');
    return token;
  } catch (error) {
    console.error('Error creating magic URL token:', error);
    throw new Error(`Failed to create magic URL token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a session using magic URL token
 */
async function createMagicURLSession(userId: string, secret: string) {
  try {
    // Delete any existing session before creating a new one
    try {
      await signOut();
    } catch (error) {
      // Ignore errors from signOut, we just want to make sure we clean up
      console.log('No active session to clear before magic link signin');
    }
    
    const session = await account.createSession(userId, secret);
    console.log('Session created successfully with magic URL');
    
    // Now get the user details
    const user = await account.get();
    return user;
  } catch (error) {
    console.error('Error creating session with magic URL:', error);
    throw new Error(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create an anonymous session for guests
 * This allows guests to access basic features without signing up
 */
async function createAnonymousSession() {
  try {
    // First check if we already have a session to avoid creating duplicate sessions
    try {
      const user = await account.get();
      console.log('User already has an active session:', user);
      return user;
    } catch (error) {
      // No active session, proceed to create anonymous session
    }
    
    const response = await account.createAnonymousSession();
    console.log('Anonymous session created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error creating anonymous session:', error);
    throw new Error(`Failed to create anonymous session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if user is authenticated, if not create an anonymous session
 * This ensures all users have at least guest access to permitted resources
 */
async function ensureSession() {
  try {
    // Try to get current session
    const session = await account.get();
    return session;
  } catch (error) {
    console.log('No active session detected, need to authenticate');
    
    // Check if refreshing the session might help
    try {
      const sessions = await account.listSessions();
      if (sessions && sessions.total > 0 && sessions.sessions[0]) {
        // Try to use the most recent session
        const latestSession = sessions.sessions[0];
        console.log('Found existing session, attempting to activate it');
        
        try {
          await account.updateSession(latestSession.$id);
          return await account.get();
        } catch (refreshError) {
          console.log('Failed to refresh existing session:', refreshError);
        }
      }
    } catch (sessionsError) {
      console.log('Error listing sessions:', sessionsError);
    }
    
    // If we still don't have a session, create an anonymous one
    try {
      console.log('Creating anonymous session as fallback');
      const anonymousSession = await createAnonymousSession();
      // After creating the anonymous session, get the user
      return await account.get();
    } catch (anonymousError) {
      console.error('Failed to create anonymous session:', anonymousError);
      throw anonymousError; // Re-throw to indicate failure
    }
  }
}

/**
 * Verify current session and handle authentication
 */
async function verifySession() {
  try {
    // Get current user information
    const currentUser = await account.get();
    return currentUser;
  } catch (error) {
    console.log('No active session');
    return null;
  }
}

/**
 * Validate and refresh the current session if needed
 */
async function validateSession() {
  try {
    // Attempt to get current user
    await account.get();
    return true;
  } catch (error: any) {
    // If the error is an authentication error (401)
    if (error.code === 401) {
      // Try to refresh the session
      try {
        const sessions = await account.listSessions();
        if (sessions && sessions.total > 0 && sessions.sessions[0]) {
          await account.updateSession(sessions.sessions[0].$id);
          return true;
        }
      } catch (refreshError) {
        console.error('Failed to refresh session:', refreshError);
      }
    }
    return false;
  }
}

/**
 * Convert anonymous session to permanent account
 * @param email User's email
 * @param password User's password
 * @param name User's name
 */
async function convertAnonymousSession(email: string, password: string, name: string) {
  try {
    const response = await account.updateEmail(email, password);
    if (response) {
      await account.updateName(name);
    }
    console.log('Anonymous account converted successfully');
    return response;
  } catch (error) {
    console.error('Error converting anonymous account:', error);
    throw new Error(`Failed to convert anonymous account: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Email OTP Authentication functions
 */
async function createEmailOTP(email: string, enableSecurityPhrase: boolean = false) {
  try {
    // Generate a unique user ID
    const userId = ID.unique();
    
    // Create an email token with optional security phrase
    const response = await account.createEmailToken(userId, email, enableSecurityPhrase);
    console.log('Email OTP sent successfully');
    
    return {
      userId: response.userId,
      securityPhrase: enableSecurityPhrase ? response.phrase : null
    };
  } catch (error) {
    console.error('Error creating email OTP:', error);
    throw new Error(`Failed to create email OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify email OTP code and create session
 */
async function verifyEmailOTP(userId: string, secret: string) {
  try {
    // Delete any existing session before creating a new one
    try {
      await signOut();
    } catch (error) {
      // Ignore errors from signOut, we just want to make sure we clean up
      console.log('No active session to clear before OTP verification');
    }
    
    // Create a session using the OTP code
    const session = await account.createSession(userId, secret);
    console.log('Email OTP verified successfully');
    
    // After successful verification, get the user
    const user = await account.get();
    return user;
  } catch (error) {
    console.error('Error verifying email OTP:', error);
    throw new Error(`Failed to verify email OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Multi-Factor Authentication (MFA) functions
 */

// Generate recovery codes for MFA
async function createMfaRecoveryCodes() {
  try {
    const response = await account.createMfaRecoveryCodes();
    console.log('MFA recovery codes generated successfully');
    return response.recoveryCodes;
  } catch (error) {
    console.error('Error generating MFA recovery codes:', error);
    throw new Error(`Failed to generate MFA recovery codes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Enable or disable MFA on an account
async function updateMfa(enable: boolean) {
  try {
    const response = await account.updateMFA(enable);
    console.log(`MFA ${enable ? 'enabled' : 'disabled'} successfully`);
    return response;
  } catch (error) {
    console.error(`Error ${enable ? 'enabling' : 'disabling'} MFA:`, error);
    throw new Error(`Failed to ${enable ? 'enable' : 'disable'} MFA: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// List available MFA factors for the current user
async function listMfaFactors() {
  try {
    const response = await account.listMfaFactors();
    console.log('MFA factors listed successfully');
    return response;
  } catch (error) {
    console.error('Error listing MFA factors:', error);
    throw new Error(`Failed to list MFA factors: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create an MFA challenge for a specific factor
async function createMfaChallenge(factor: AuthenticationFactor) { // Use AuthenticationFactor enum
  try {
    const response = await account.createMfaChallenge(factor);
    console.log(`MFA challenge created successfully for factor: ${factor}`);
    return response;
  } catch (error) {
    console.error(`Error creating MFA challenge for factor ${factor}:`, error);
    throw new Error(`Failed to create MFA challenge: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Complete an MFA challenge
async function updateMfaChallenge(challengeId: string, otp: string) {
  try {
    const response = await account.updateMfaChallenge(challengeId, otp);
    console.log('MFA challenge completed successfully');
    return response;
  } catch (error) {
    console.error('Error completing MFA challenge:', error);
    throw new Error(`Failed to complete MFA challenge: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Verify the user's email before enabling MFA
async function createMfaEmailVerification() {
  try {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'https://www.web3lancer.website');
    const verificationURL = `${baseURL}/verify-email`;
    const response = await account.createVerification(verificationURL);
    console.log('Email verification sent for MFA setup');
    return response;
  } catch (error) {
    console.error('Error creating email verification for MFA:', error);
    throw new Error(`Failed to create email verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * User profile functions
 */
async function getUserProfile(userId: string): Promise<Models.Document | null> { // Add return type
  try {
    const profile = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_USERS_ID!, // users
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES_ID!, // Profiles
      userId
    );
    return profile;
  } catch (error) {
    if ((error as AppwriteException).code === 404) {
      console.log(`Profile not found for user ID: ${userId}`);
      return null;
    }
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

async function getUserProfileByUsername(username: string): Promise<Models.Document | null> {
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_USERS_ID!, // users
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES_ID!, // Profiles
      [Query.equal('username', username)]
    );
    if (response.documents.length > 0) {
      return response.documents[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile by username:', error);
    throw error;
  }
}

async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_USERS_ID!, // users
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES_ID!, // Profiles
      [Query.equal('username', username)]
    );
    return response.documents.length === 0; // True if username is available
  } catch (error) {
    console.error('Error checking username availability:', error);
    // Assuming an error means it's not available or there's a system issue
    return false; 
  }
}


/**
 * Create a new user profile in the database
 */
async function createUserProfile(userId: string, userData: Models.User<Models.Preferences>, username?: string): Promise<Models.Document | null> { // Add return type and use correct userData type
  try {
    // Check if a profile already exists for this userId to prevent duplicates
    // Appwrite document ID for profiles should be the same as the user ID for easy lookup
    try {
      const existingProfile = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_USERS_ID!, // users
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES_ID!, // Profiles
        userId
      );
      if (existingProfile) {
        console.log(`Profile already exists for user ${userId}`);
        return existingProfile;
      }
    } catch (e: any) {
      // If document not found, that's good, we can create it.
      if (e.code !== 404) {
        throw e; // Re-throw other errors
      }
    }

    const profileData: { [key: string]: any } = {
      userId: userId, // Explicitly set userId attribute in the document
      name: userData.name || '',
      email: userData.email || '',
      username: username || '', // Add username
      profilePicture: '', // Initialize or get from userData if available
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      skills: [],
      bio: ''
    };

    // Use the userId as the documentId for the profile document
    const profile = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_USERS_ID!, // users
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES_ID!, // Profiles
      userId, // Use user's ID as document ID for the profile
      profileData
    );
    return profile;
  } catch (error: any) {
    // Handle specific error for unique constraint violation on username if applicable
    if (error.code === 409) { // Appwrite conflict error code
      console.error('Error creating user profile: Username might be taken or another conflict.', error);
    } else {
      console.error('Error creating user profile:', error);
    }
    // Optionally, re-throw or return null based on how you want to handle this upstream
    throw error;
  }
}

async function updateUserProfile(userId: string, data: any) {
  try {
    // If username is being updated, check for availability first
    if (data.username) {
      const currentProfile = await getUserProfile(userId);
      // Check if currentProfile exists and if the username is actually changing
      if (currentProfile && currentProfile.username !== data.username) {
        const isAvailable = await checkUsernameAvailability(data.username);
        if (!isAvailable) {
          throw new Error(`Username '${data.username}' is already taken.`);
        }
      }
    }

    const profile = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_USERS_ID!, // users
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROFILES_ID!, // Profiles
      userId, // Document ID is the user's ID
      {
        ...data,
        updatedAt: new Date().toISOString()
      }
    );
    return profile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Bookmark management functions
 */
async function addBookmark(userId: string, jobId: string) {
  try {
    // Check if bookmark already exists
    const existing = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASES.BOOKMARKS,
      APPWRITE_CONFIG.COLLECTIONS.BOOKMARKS,
      [Query.equal('userId', userId), Query.equal('jobId', jobId)]
    );

    if (existing.documents.length > 0) {
      return existing.documents[0];
    }

    const response = await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.BOOKMARKS, 
      APPWRITE_CONFIG.COLLECTIONS.BOOKMARKS, 
      ID.unique(), 
      {
        userId,
        jobId,
        createdAt: new Date().toISOString(),
        bookmarkId: ID.unique(),
      }
    );
    
    console.log('Bookmark added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw new Error(`Failed to add bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function removeBookmark(bookmarkId: string) {
  try {
    await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASES.BOOKMARKS,
      APPWRITE_CONFIG.COLLECTIONS.BOOKMARKS,
      bookmarkId
    );
    console.log('Bookmark removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw new Error(`Failed to remove bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transaction management functions
 */
async function addTransaction(userId: string, amount: number, type: string, status: string, transactionId: string) {
  try {
    const response = await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.TRANSACTIONS,
      APPWRITE_CONFIG.COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      {
        userId,
        amount,
        type,
        createdAt: new Date().toISOString(),
        status,
        transactionId,
      }
    );
    console.log('Transaction added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw new Error(`Failed to add transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Job management functions
 */
async function fetchJobs() {
  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASES.JOBS,
      APPWRITE_CONFIG.COLLECTIONS.JOBS,
    );
    return response;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error(`Failed to fetch jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function fetchJob(jobId: string) {
  try {
    const response = await databases.getDocument(
      APPWRITE_CONFIG.DATABASES.JOBS,
      APPWRITE_CONFIG.COLLECTIONS.JOBS,
      jobId
    );
    return response;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw new Error(`Failed to fetch job: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Messaging functions
 */
async function sendMessage(senderId: string, receiverId: string, message: string, status: string) {
  try {
    const response = await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.MESSAGES,
      APPWRITE_CONFIG.COLLECTIONS.MESSAGES,
      ID.unique(),
      {
        senderId,
        receiverId,
        message,
        timestamp: new Date().toISOString(),
        messageId: ID.unique(),
        status,
      }
    );
    console.log('Message sent successfully:', response);
    
    // Also create notification for recipient
    await addNotification(receiverId, `New message from user ${senderId}`, 'message');
    
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Notification management functions
 */
async function addNotification(userId: string, message: string, type: string) {
  try {
    const response = await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.NOTIFICATIONS,
      APPWRITE_CONFIG.COLLECTIONS.NOTIFICATIONS,
      ID.unique(),
      {
        userId,
        message,
        createdAt: new Date().toISOString(),
        type,
        notificationId: ID.unique(),
        read: false,
      }
    );
    console.log('Notification added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding notification:', error);
    throw new Error(`Failed to add notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function markNotificationAsRead(notificationId: string) {
  try {
    const response = await databases.updateDocument(
      APPWRITE_CONFIG.DATABASES.NOTIFICATIONS,
      APPWRITE_CONFIG.COLLECTIONS.NOTIFICATIONS,
      notificationId,
      { read: true }
    );
    return response;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(`Failed to update notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Project management functions
 */
async function addProject(ownerId: string, title: string, description: string, participants: string[], status: string) {
  try {
    const response = await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.PROJECTS,
      APPWRITE_CONFIG.COLLECTIONS.PROJECTS,
      ID.unique(),
      {
        ownerId,
        title,
        description,
        createdAt: new Date().toISOString(),
        participants,
        status,
        updatedAt: new Date().toISOString(),
        projectId: ID.unique(),
      }
    );
    console.log('Project added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding project:', error);
    throw new Error(`Failed to add project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getProjects(userId: string) {
  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASES.PROJECTS,
      APPWRITE_CONFIG.COLLECTIONS.PROJECTS,
      [Query.equal('ownerId', userId)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Payment methods management
 */
async function addPaymentMethod(
  userId: string,
  type: string,
  details: string,
  isDefault: boolean = false
) {
  try {
    const response = await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.PAYMENT_METHODS,
      APPWRITE_CONFIG.COLLECTIONS.PAYMENT_METHODS,
      ID.unique(),
      {
        userId,
        type,
        details,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentMethodId: ID.unique(),
        isDefault,
      }
    );
    console.log('Payment method added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw new Error(`Failed to add payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getUserPaymentMethods(userId: string) {
  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASES.PAYMENT_METHODS,
      APPWRITE_CONFIG.COLLECTIONS.PAYMENT_METHODS,
      [Query.equal('userId', userId)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw new Error(`Failed to fetch payment methods: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * File storage functions
 */
async function uploadFile(bucketId: string, file: File, filePath: string, onProgress?: (progress: number) => void) {
  try {
    const response = await storage.createFile(
      bucketId,
      ID.unique(),
      file
    );
    console.log('File uploaded successfully:', response);
    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getFilePreview(bucketId: string, fileId: string, width?: number, height?: number) {
  try {
    const response = await storage.getFilePreview(
      bucketId,
      fileId,
      width,
      height
    );
    return response;
  } catch (error) {
    console.error('Error getting file preview:', error);
    throw new Error(`Failed to get file preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * OAuth Authentication functions
 */
async function createGitHubOAuthSession(scopes: string[] = ['user:email']) {
  try {
    // Ensure base URL is correctly determined
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'https://www.web3lancer.website');
    const successUrl = `${baseURL}/auth/callback`; // Redirect to a dedicated callback page
    const failureUrl = `${baseURL}/signin?error=github_oauth_failed`; // Redirect back to signin on failure

    console.log(`Initiating GitHub OAuth: Success URL: ${successUrl}, Failure URL: ${failureUrl}`);
    
    // Use Appwrite's built-in OAuth method
    await account.createOAuth2Session(
      OAuthProvider.Github, // Use the correct provider enum
      successUrl,
      failureUrl,
      scopes
    );
    // No return needed, Appwrite handles the redirect
  } catch (error) {
    console.error('Error initiating GitHub OAuth session:', error);
    throw new Error(`Failed to initiate GitHub OAuth: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function createGoogleOAuthSession(scopes: string[] = ['email', 'profile']) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://www.web3lancer.website');
    const successUrl = `${baseURL}/auth/callback`;
    const failureUrl = `${baseURL}/signin?error=google_oauth_failed`;
    await account.createOAuth2Session(
      OAuthProvider.Google,
      successUrl,
      failureUrl,
      scopes
    );
  } catch (error) {
    console.error('Error initiating Google OAuth session:', error);
    throw new Error(`Failed to initiate Google OAuth: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get current session details including OAuth provider information
 */
async function getCurrentSession() {
  try {
    return await account.getSession('current');
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is currently logged in
 * @returns Whether the user is logged in
 */
async function isLoggedIn() {
  return (await getCurrentSession()) !== null;
}

/**
 * Refresh OAuth token if needed
 */
async function refreshOAuthSession(sessionId: string) {
  try {
    const session = await account.updateSession(sessionId);
    console.log('OAuth session refreshed successfully');
    return session;
  } catch (error) {
    console.error('Error refreshing OAuth session:', error);
    throw new Error(`Failed to refresh OAuth session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if session token needs refresh and refresh if needed
 */
async function ensureValidOAuthToken() {
  try {
    const session = await getCurrentSession();
    
    if (!session) {
      console.log('No session found in ensureValidOAuthToken');
      return null;
    }
    
    // Only proceed if this is an OAuth session
    if (session.provider && session.provider === 'github') {
      // Ensure providerAccessTokenExpiry is treated as a number
      const expiryTime = Number(session.providerAccessTokenExpiry) * 1000; // Convert seconds to milliseconds
      const now = Date.now();
      const buffer = 5 * 60 * 1000; // 5 minutes buffer

      // Check if the token is close to expiring or already expired
      if (!isNaN(expiryTime) && now >= expiryTime - buffer) {
        console.log('GitHub OAuth token needs refresh.');
        // Attempt to refresh the session
        try {
          return await refreshOAuthSession(session.$id);
        } catch (refreshError) {
          console.error('Failed to refresh GitHub OAuth token:', refreshError);
          // If refresh fails, might need to re-authenticate
          return null;
        }
      }
    }
    
    return session;
  } catch (error) {
    console.error('Error ensuring valid OAuth token:', error);
    return null;
  }
}

/**
 * User management functions
 */
async function addUser(email: string, password: string, name: string) {
  try {
    const response = await account.create(ID.unique(), email, password, name);
    console.log('User added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding user:', error);
    throw new Error(`Failed to add user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Utility functions for safe document retrieval
 */

/**
 * Safe document fetching that handles "Document not found" errors gracefully
 * @param databaseId Database ID
 * @param collectionId Collection ID
 * @param documentId Document ID
 * @param defaultValue Optional default value to return if document isn't found
 * @returns The document or the default value
 */
async function safeGetDocument(databaseId: string, collectionId: string, documentId: string, defaultValue: any = null) {
  try {
    // Validate the session before attempting to access data
    await validateSession();
    return await databases.getDocument(databaseId, collectionId, documentId);
  } catch (error: any) {
    // Check if this is a "Document not found" error
    if (error.code === 404) {
      console.log(`Document not found: ${documentId} in collection ${collectionId}`);
      return defaultValue;
    }
    
    // For authentication errors, try to refresh the session and retry
    if (error.code === 401) {
      try {
        const valid = await validateSession();
        if (valid) {
          return await databases.getDocument(databaseId, collectionId, documentId);
        }
      } catch (retryError) {
        console.error('Error after session validation retry:', retryError);
      }
    }
    
    // Rethrow other errors
    throw error;
  }
}

/**
 * Safe list documents that handles errors gracefully
 * @param databaseId Database ID
 * @param collectionId Collection ID
 * @param queries Query parameters
 * @returns List of documents or empty array on failure
 */
async function safeListDocuments(databaseId: string, collectionId: string, queries: any[] = []) {
  try {
    // Validate the session before attempting to access data
    await validateSession();
    return await databases.listDocuments(databaseId, collectionId, queries);
  } catch (error: any) {
    // For authentication errors, try to refresh the session and retry
    if (error.code === 401) {
      try {
        const valid = await validateSession();
        if (valid) {
          return await databases.listDocuments(databaseId, collectionId, queries);
        }
      } catch (retryError) {
        console.error('Error after session validation retry:', retryError);
      }
    }
    
    console.error(`Error listing documents in collection ${collectionId}:`, error);
    return { documents: [], total: 0 };
  }
}

export const deleteProfilePictureFile = async (fileId: string): Promise<void> => {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
  if (!bucketId) {
    throw new Error('Bucket ID is not defined in environment variables');
  }
  try {
    await storage.deleteFile(bucketId, fileId);
    console.log('Profile picture file deleted successfully:', fileId);
  } catch (error) {
    console.error('Error deleting profile picture file:', error);
    throw new Error(`Failed to delete profile picture file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export { 
  client, 
  account, 
  databases, 
  storage,
  avatars,
  ID, 
  signUp, 
  signIn,
  signOut,
  listSessions,
  createEmailVerification,
  completeEmailVerification,
  createPasswordRecovery,
  completePasswordRecovery,
  createMagicURLToken,
  createMagicURLSession,
  createAnonymousSession,
  ensureSession,
  verifySession,
  validateSession,
  convertAnonymousSession,
  createEmailOTP,
  verifyEmailOTP,
  createMfaRecoveryCodes,
  updateMfa,
  listMfaFactors,
  createMfaChallenge,
  updateMfaChallenge,
  createMfaEmailVerification,
  getUserProfile,
  getUserProfileByUsername, // Export new function
  checkUsernameAvailability, // Export new function
  createUserProfile,
  updateUserProfile,
  addBookmark, 
  removeBookmark,
  addTransaction,
  sendMessage,
  addNotification,
  markNotificationAsRead,
  addProject,
  getProjects,
  addUser,
  addPaymentMethod,
  getUserPaymentMethods,
  uploadFile,
  getFilePreview, // Ensure getFilePreview is exported if needed elsewhere
  fetchJobs,
  fetchJob,
  createGitHubOAuthSession,
  createGoogleOAuthSession,
  getCurrentSession,
  refreshOAuthSession,
  ensureValidOAuthToken,
  isLoggedIn,
  Query,
  safeGetDocument,
  safeListDocuments
};