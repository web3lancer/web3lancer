import { Client, Account, Databases, Storage, Avatars, ID, Query, OAuthProvider, ImageGravity, ImageFormat, AuthenticationFactor, AppwriteException } from 'appwrite'; // Add AppwriteException
import { Models } from 'appwrite'; // Import Models for type hints
import { APPWRITE_CONFIG, APP_CONFIG } from '@/lib/env';

// Initialize client according to Appwrite docs
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1') // Use env var or default
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '67aed8360001b6dd8cb3'); // Use env var or default

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
      const baseURL = APP_CONFIG.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
      console.log('No active session to clear before signing in');
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
    try {
      const session = await account.getSession('current');
      if (session) {
        await account.deleteSession('current');
        return true;
      }
    } catch (e) {
      // No active session
    }
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    // Don't throw on error, as we want to clear local state even if server fails
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
    const baseURL = APP_CONFIG.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
    const baseURL = APP_CONFIG.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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
    // Get the base URL from environment variables
    const baseURL = process.env.NEXT_PUBLIC_APP_URL ||
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    // Create a unique user ID for new users or fetch existing ID
    let userId = ID.unique();

    // Try to find if user with this email already exists
    try {
      // Ensure database and collection IDs are defined
      const databaseId = APPWRITE_CONFIG.DATABASES.USERS;
      const collectionId = APPWRITE_CONFIG.COLLECTIONS.PROFILES;
      if (!databaseId || !collectionId) {
        throw new Error('User database or profile collection ID is not configured.');
      }

      const users = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('email', email)]
      );

      if (users.documents.length > 0 && users.documents[0].userId) {
        // Use existing user ID if found
        userId = users.documents[0].userId;
      }
    } catch (error) {
      // Log specific errors if needed, otherwise assume no user found
      if (!(error instanceof AppwriteException && error.code === 404)) {
        console.warn('Error checking for existing user during magic link creation:', error);
      }
      console.log('No existing user found or error occurred, creating new user ID for magic link.');
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
      return user; // Return the existing user object if a session exists
    } catch (error) {
      // No active session, proceed to create anonymous session
      console.log('No active session found, creating anonymous session.');
    }

    await account.createAnonymousSession(); // Create the session
    console.log('Anonymous session created successfully.');
    // After creating the anonymous session, get the user details
    return await account.get();
  } catch (error) {
    console.error('Error creating anonymous session:', error);
    throw new Error(`Failed to create anonymous session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if user is authenticated, if not create an anonymous session
 * This ensures all users have at least guest access to permitted resources
 */
async function ensureSession(): Promise<Models.User<Models.Preferences>> {
  try {
    // Try to get current user (which implies an active session)
    const user = await account.get();
    return user;
  } catch (error) {
    console.log('No active session detected, attempting to create anonymous session.');
    // If getting the user fails (no session), create an anonymous one
    try {
      return await createAnonymousSession();
    } catch (anonymousError) {
      console.error('Failed to create anonymous session in ensureSession:', anonymousError);
      // Re-throw the error if anonymous session creation fails
      throw anonymousError;
    }
  }
}

/**
 * Verify current session and return user or null
 */
async function verifySession(): Promise<Models.User<Models.Preferences> | null> {
  try {
    // Get current user information
    const currentUser = await account.get();
    return currentUser;
  } catch (error) {
    // Appwrite throws an error if no session exists
    console.log('No active session found during verification.');
    return null;
  }
}

/**
 * Validate and potentially refresh the current session
 * Returns true if a valid session exists or was refreshed, false otherwise.
 */
async function validateSession(): Promise<boolean> {
  try {
    // Attempt to get current user, which validates the session
    await account.get();
    return true;
  } catch (error) {
    // Check if it's an authentication error (e.g., expired session)
    if (error instanceof AppwriteException && error.code === 401) {
      console.log('Session validation failed (401), attempting to refresh.');
      // No direct refresh mechanism, Appwrite SDK handles session internally.
      // If get() fails with 401, the session is invalid.
      // We could try listing sessions and updating, but get() failing is usually definitive.
      // For simplicity, we'll consider a 401 on get() as an invalid session state.
      return false;
    }
    // Log other errors but consider the session potentially valid if not 401
    console.warn('Unexpected error during session validation:', error);
    // Depending on the error, the session might still be technically valid but inaccessible.
    // Returning false is safer in ambiguous cases.
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
    // Update email and password first
    const response = await account.updateEmail(email, password);
    // If email/password update is successful, update the name
    await account.updateName(name);

    console.log('Anonymous account converted successfully');
    // Return the user object after conversion
    return await account.get();
  } catch (error) {
    console.error('Error converting anonymous account:', error);
    throw new Error(`Failed to convert anonymous account: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Email OTP Authentication functions
 */
async function createEmailOTP(email: string) {
  try {
    // Generate a unique user ID for the token
    const userId = ID.unique();

    // Create an email token (OTP)
    const response = await account.createEmailToken(userId, email);
    console.log('Email OTP request successful, userId for verification:', response.userId);

    // Return only the userId needed for verification
    return { userId: response.userId };
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
      // Ignore errors from signOut
      console.log('No active session to clear before OTP verification');
    }

    // Create a session using the OTP secret
    await account.createSession(userId, secret);
    console.log('Email OTP verified successfully, session created.');

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
    return response.recoveryCodes; // Return the codes array
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
    console.log('MFA factors listed successfully:', response);
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
    return response; // Contains challenge ID ($id) and expiry
  } catch (error) {
    console.error(`Error creating MFA challenge for factor ${factor}:`, error);
    throw new Error(`Failed to create MFA challenge: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Complete an MFA challenge
async function updateMfaChallenge(challengeId: string, otp: string) {
  try {
    // This method verifies the OTP and completes the MFA step (e.g., during login or factor setup)
    const response = await account.updateMfaChallenge(challengeId, otp);
    console.log('MFA challenge completed successfully');
    // The response here is typically empty on success, confirming verification.
    // A session might be created or updated depending on the context.
    return response;
  } catch (error) {
    console.error('Error completing MFA challenge:', error);
    throw new Error(`Failed to complete MFA challenge: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// This seems redundant with createEmailVerification, but kept for potential specific MFA context
async function createMfaEmailVerification() {
  try {
    const baseURL = APP_CONFIG.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationURL = `${baseURL}/verify-email`; // Should point to where verification is handled
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
async function getUserProfile(userId: string): Promise<Models.Document | null> {
  try {
    console.log('Fetching user profile for user ID:', userId);
    const databaseId = APPWRITE_CONFIG.DATABASES.USERS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.PROFILES;

    if (!databaseId || !collectionId) {
      console.error('User database or profile collection ID is not configured.');
      return null;
    }

    try {
      // Attempt to get the profile document using the userId as the documentId
      const profile = await databases.getDocument(databaseId, collectionId, userId);
      console.log('Profile found:', profile);
      return profile;
    } catch (error) {
      // If document not found (404), try to create it
      if (error instanceof AppwriteException && error.code === 404) {
        console.log('Profile not found for user:', userId, 'Attempting to create one.');
        // Fetch user data to pass to createUserProfile
        try {
          const currentUserData = await account.get();
          // Ensure the fetched user ID matches the requested ID
          if (currentUserData.$id === userId) {
            return await createUserProfile(userId, currentUserData);
          } else {
            console.error(`Mismatch between requested userId (${userId}) and current user ID (${currentUserData.$id})`);
            return null;
          }
        } catch (accountError) {
          console.error('Failed to get user account data while creating profile:', accountError);
          return null; // Cannot create profile without user data
        }
      } else {
        // Re-throw other errors
        console.error('Error fetching profile document:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('General error in getUserProfile:', error);
    return null;
  }
}

/**
 * Create a new user profile in the database
 */
async function createUserProfile(userId: string, userData: Models.User<Models.Preferences>): Promise<Models.Document | null> {
  try {
    console.log('Creating new user profile for:', userId);
    const databaseId = APPWRITE_CONFIG.DATABASES.USERS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.PROFILES;

    if (!databaseId || !collectionId) {
      console.error('User database or profile collection ID is not configured for profile creation.');
      return null;
    }

    const email = userData.email || '';
    const name = userData.name || '';
    const now = new Date().toISOString();

    // Define default profile data
    const profileData = {
      userId: userId,
      name: name,
      email: email,
      profilePicture: '', // Default empty profile picture ID
      createdAt: now,
      updatedAt: now,
      skills: [], // Default empty skills array
      bio: '' // Default empty bio
    };

    // Define permissions: only the user can read/write their own profile
    const permissions = [
      `read("user:${userId}")`,
      `write("user:${userId}")`
    ];

    const response = await databases.createDocument(
      databaseId,
      collectionId,
      userId, // Use the Appwrite User ID ($id) as the Document ID for easy lookup
      profileData,
      permissions
    );

    console.log('User profile created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Handle conflict (profile already exists, maybe due to race condition)
    if (error instanceof AppwriteException && error.code === 409) {
      console.log('Profile already exists for user (conflict on create):', userId);
      // Attempt to fetch the existing profile as a fallback
      try {
        const databaseId = APPWRITE_CONFIG.DATABASES.USERS;
        const collectionId = APPWRITE_CONFIG.COLLECTIONS.PROFILES;
        if (!databaseId || !collectionId) return null; // Guard clause
        return await databases.getDocument(databaseId, collectionId, userId);
      } catch (fetchError) {
        console.error('Failed to fetch existing profile after conflict:', fetchError);
        return null;
      }
    }
    // Return null for other creation errors if called from getUserProfile context
    return null;
  }
}

async function updateUserProfile(userId: string, data: Partial<Models.Document & { name?: string; email?: string; profilePicture?: string; skills?: string[]; bio?: string }>) {
  try {
    console.log('Updating user profile for:', userId, 'with data:', data);
    const databaseId = APPWRITE_CONFIG.DATABASES.USERS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.PROFILES;

    if (!databaseId || !collectionId) {
      throw new Error('User database or profile collection ID is not configured for update.');
    }

    // Ensure updatedAt is always set
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    // Remove userId, createdAt from the update payload if present, as they shouldn't be updated directly
    delete (updateData as any).userId;
    delete (updateData as any).createdAt;
    delete (updateData as any).$id;
    delete (updateData as any).$collectionId;
    delete (updateData as any).$databaseId;
    delete (updateData as any).$permissions;
    delete (updateData as any).$updatedAt; // Let Appwrite handle this if we don't set it above

    try {
      // Attempt to update the document directly
      const response = await databases.updateDocument(
        databaseId,
        collectionId,
        userId, // Document ID is the User ID
        updateData
      );
      console.log('User profile updated successfully:', response);
      return response;
    } catch (error) {
      // If profile doesn't exist (404), create it first, then update (if needed)
      if (error instanceof AppwriteException && error.code === 404) {
        console.log('Profile not found during update, attempting to create first.');
        try {
          const currentUser = await account.get();
          if (currentUser.$id !== userId) {
             throw new Error("Cannot create profile for a different user.");
          }
          const newProfile = await createUserProfile(userId, currentUser);
          if (!newProfile) {
            throw new Error("Failed to create profile during update process.");
          }
          // If there was actual data to update besides defaults
          if (Object.keys(data).length > 0) {
             console.log('Applying update data to newly created profile.');
             // Re-attempt the update on the newly created profile
             const updatedProfile = await databases.updateDocument(
               databaseId,
               collectionId,
               userId,
               updateData // Use the same updateData payload
             );
             console.log('Newly created profile updated successfully:', updatedProfile);
             return updatedProfile;
          }
          // If no specific data was passed, return the newly created profile
          return newProfile;
        } catch (createOrUpdateError) {
           console.error('Error during profile creation/update fallback:', createOrUpdateError);
           throw createOrUpdateError; // Rethrow the error from the fallback path
        }
      }
      // Re-throw other errors (like permission errors)
      throw error;
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error(`Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Bookmark management functions
 */
async function addBookmark(userId: string, jobId: string) {
  try {
    const databaseId = APPWRITE_CONFIG.DATABASES.BOOKMARKS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.BOOKMARKS;
    if (!databaseId || !collectionId) {
      throw new Error('Bookmark database or collection ID not configured.');
    }

    // Check if bookmark already exists to prevent duplicates
    const existing = await databases.listDocuments(
      databaseId,
      collectionId,
      [
        Query.equal('userId', userId),
        Query.equal('jobId', jobId),
        Query.limit(1) // Only need to know if at least one exists
      ]
    );

    if (existing.total > 0) {
      console.log('Bookmark already exists for this user and job.');
      return existing.documents[0]; // Return the existing bookmark
    }

    // Create new bookmark if none exists
    const response = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(), // Use unique ID for the bookmark document itself
      {
        userId, // User who bookmarked
        jobId, // Job that was bookmarked
        createdAt: new Date().toISOString(),
        // bookmarkId: ID.unique(), // Redundant if document ID is unique
      },
      [`read("user:${userId}")`, `write("user:${userId}")`] // Permissions
    );

    console.log('Bookmark added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw new Error(`Failed to add bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function removeBookmark(bookmarkDocumentId: string) {
  try {
    const databaseId = APPWRITE_CONFIG.DATABASES.BOOKMARKS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.BOOKMARKS;
    if (!databaseId || !collectionId) {
      throw new Error('Bookmark database or collection ID not configured.');
    }

    await databases.deleteDocument(
      databaseId,
      collectionId,
      bookmarkDocumentId // Use the document ID of the bookmark to delete
    );
    console.log('Bookmark removed successfully using document ID:', bookmarkDocumentId);
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    // Handle specific errors like not found (404) gracefully if needed
    if (error instanceof AppwriteException && error.code === 404) {
        console.warn(`Bookmark with ID ${bookmarkDocumentId} not found for deletion.`);
        return false; // Indicate bookmark was not found/deleted
    }
    throw new Error(`Failed to remove bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transaction management functions
 */
async function addTransaction(userId: string, amount: number, type: string, status: string, relatedId: string, description?: string) {
  try {
    const databaseId = APPWRITE_CONFIG.DATABASES.TRANSACTIONS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.TRANSACTIONS;
    if (!databaseId || !collectionId) {
      throw new Error('Transaction database or collection ID not configured.');
    }

    const response = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(), // Unique ID for the transaction document
      {
        userId,
        amount,
        type, // e.g., 'deposit', 'withdrawal', 'payment', 'refund'
        status, // e.g., 'pending', 'completed', 'failed'
        relatedId, // e.g., Job ID, Project ID, PaymentIntent ID
        description, // Optional description
        createdAt: new Date().toISOString(),
        // transactionId: ID.unique(), // Redundant if document ID is unique
      },
      [`read("user:${userId}")`] // Only user can read their transactions
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
async function fetchJobs(queries: string[] = []) {
  try {
    const databaseId = APPWRITE_CONFIG.DATABASES.JOBS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.JOBS;
    if (!databaseId || !collectionId) {
      throw new Error('Jobs database or collection ID not configured.');
    }
    // Add default queries if needed, e.g., filter by status='open'
    const response = await databases.listDocuments(
      databaseId,
      collectionId,
      queries // Allow passing custom queries (e.g., for filtering, sorting, pagination)
    );
    console.log(`Fetched ${response.total} jobs.`);
    return response; // Returns { total: number, documents: Models.Document[] }
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error(`Failed to fetch jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function fetchJob(jobId: string) {
  try {
    const databaseId = APPWRITE_CONFIG.DATABASES.JOBS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.JOBS;
    if (!databaseId || !collectionId) {
      throw new Error('Jobs database or collection ID not configured.');
    }
    const response = await databases.getDocument(
      databaseId,
      collectionId,
      jobId
    );
    console.log('Fetched job details for ID:', jobId);
    return response;
  } catch (error) {
    console.error('Error fetching job:', error);
     if (error instanceof AppwriteException && error.code === 404) {
        console.warn(`Job with ID ${jobId} not found.`);
        return null; // Return null if job not found
    }
    throw new Error(`Failed to fetch job: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Messaging functions
 */
async function sendMessage(senderId: string, receiverId: string, content: string, conversationId: string) {
  try {
    const databaseId = APPWRITE_CONFIG.DATABASES.MESSAGES;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.MESSAGES;
    if (!databaseId || !collectionId) {
      throw new Error('Messages database or collection ID not configured.');
    }

    const response = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(), // Unique ID for the message document
      {
        senderId,
        receiverId,
        content, // Renamed from 'message' for clarity
        conversationId, // Link messages belonging to the same chat
        timestamp: new Date().toISOString(),
        status: 'sent', // Initial status, could be updated to 'delivered', 'read'
        // messageId: ID.unique(), // Redundant
      },
      // Permissions: sender and receiver can read, sender can update/delete (maybe?)
      [
        `read("user:${senderId}")`,
        `read("user:${receiverId}")`,
        // `write("user:${senderId}")` // Decide on write permissions carefully
      ]
    );
    console.log('Message sent successfully:', response);

    // Trigger notification for the recipient
    await addNotification(receiverId, `New message in conversation ${conversationId}`, 'message', { conversationId });

    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Notification management functions
 */
async function addNotification(userId: string, message: string, type: string, data?: object) {
  try {
    const databaseId = APPWRITE_CONFIG.DATABASES.NOTIFICATIONS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.NOTIFICATIONS;
    if (!databaseId || !collectionId) {
      throw new Error('Notifications database or collection ID not configured.');
    }

    const response = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(), // Unique ID for the notification document
      {
        userId, // The user who should receive the notification
        message, // The notification text
        type, // e.g., 'message', 'job_update', 'system'
        data, // Optional additional data (like conversationId, jobId)
        createdAt: new Date().toISOString(),
        read: false, // Default to unread
        // notificationId: ID.unique(), // Redundant
      },
      [`read("user:${userId}")`, `write("user:${userId}")`] // User can read/update (e.g., mark as read)
    );
    console.log('Notification added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding notification:', error);
    throw new Error(`Failed to add notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function markNotificationAsRead(notificationDocumentId: string) {
  try {
    const databaseId = APPWRITE_CONFIG.DATABASES.NOTIFICATIONS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.NOTIFICATIONS;
    if (!databaseId || !collectionId) {
      throw new Error('Notifications database or collection ID not configured.');
    }

    const response = await databases.updateDocument(
      databaseId,
      collectionId,
      notificationDocumentId, // Use the document ID of the notification
      { read: true } // Update the 'read' status
    );
    console.log('Notification marked as read:', notificationDocumentId);
    return response;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(`Failed to update notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Project management functions
 */
async function addProject(ownerId: string, title: string, description: string, participants: string[] = [], status: string = 'active') {
  try {
    const databaseId = APPWRITE_CONFIG.DATABASES.PROJECTS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.PROJECTS;
    if (!databaseId || !collectionId) {
      throw new Error('Projects database or collection ID not configured.');
    }
    const now = new Date().toISOString();

    // Ensure owner is included in participants for permission handling
    const allParticipants = Array.from(new Set([ownerId, ...participants]));

    // Define permissions based on participants
    const permissions = allParticipants.map(pId => `read("user:${pId}")`);
    permissions.push(`write("user:${ownerId}")`); // Only owner can write by default

    const response = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(), // Unique ID for the project document
      {
        ownerId,
        title,
        description,
        participants: allParticipants, // Store the list of user IDs
        status, // e.g., 'active', 'completed', 'archived'
        createdAt: now,
        updatedAt: now,
        // projectId: ID.unique(), // Redundant
      },
      permissions
    );
    console.log('Project added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding project:', error);
    throw new Error(`Failed to add project: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getProjects(userId: string, queries: string[] = []) {
  try {
    const databaseId = APPWRITE_CONFIG.DATABASES.PROJECTS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.PROJECTS;
     if (!databaseId || !collectionId) {
      throw new Error('Projects database or collection ID not configured.');
    }
    // Query for projects where the user is either the owner or a participant
    const response = await databases.listDocuments(
      databaseId,
      collectionId,
      [
        // Query.equal('ownerId', userId), // This only gets projects owned by user
        Query.search('participants', userId), // More robust: checks if userId is in the participants array
        ...queries // Allow additional filtering/sorting
      ]
    );
    console.log(`Fetched ${response.total} projects for user ${userId}.`);
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
  type: string, // e.g., 'card', 'paypal', 'crypto_wallet'
  details: object, // Store relevant details securely (e.g., last4 digits for card, email for paypal, address for crypto)
  isDefault: boolean = false
) {
  try {
    const databaseId = APPWRITE_CONFIG.DATABASES.PAYMENT_METHODS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.PAYMENT_METHODS;
    if (!databaseId || !collectionId) {
      throw new Error('Payment Methods database or collection ID not configured.');
    }
    const now = new Date().toISOString();

    // If setting this as default, ensure others are unset (requires extra logic)
    // This might be better handled in a dedicated "set default" function

    const response = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(), // Unique ID for the payment method document
      {
        userId,
        type,
        details, // Be careful about storing sensitive data here
        isDefault,
        createdAt: now,
        updatedAt: now,
        // paymentMethodId: ID.unique(), // Redundant
      },
      [`read("user:${userId}")`, `write("user:${userId}")`] // User manages their own methods
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
    const databaseId = APPWRITE_CONFIG.DATABASES.PAYMENT_METHODS;
    const collectionId = APPWRITE_CONFIG.COLLECTIONS.PAYMENT_METHODS;
     if (!databaseId || !collectionId) {
      throw new Error('Payment Methods database or collection ID not configured.');
    }
    const response = await databases.listDocuments(
      databaseId,
      collectionId,
      [Query.equal('userId', userId)] // Filter by user ID
    );
    console.log(`Fetched ${response.total} payment methods for user ${userId}.`);
    return response.documents;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw new Error(`Failed to fetch payment methods: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * File storage functions
 */
async function uploadFile(bucketId: string, file: File, fileId: string = ID.unique(), permissions?: string[], onProgress?: (progress: { loaded: number; total: number; }) => void) {
  try {
    if (!bucketId) {
        throw new Error("Bucket ID is required for file upload.");
    }
    console.log(`Uploading file to bucket ${bucketId} with ID ${fileId}`);
    const response = await storage.createFile(
      bucketId,
      fileId, // Allow providing a specific ID or generate unique
      file,
      permissions, // Optional permissions
      onProgress ? (progress) => onProgress(progress) : undefined // Pass progress callback
    );
    console.log('File uploaded successfully:', response);
    return response; // Returns Models.File object
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Renamed to avoid conflict with Appwrite SDK's getFilePreview method name if imported directly
async function getFilePreviewUrl(bucketId: string, fileId: string, width?: number, height?: number, gravity?: ImageGravity, quality?: number, outputFormat?: ImageFormat) {
  try {
     if (!bucketId || !fileId) {
        throw new Error("Bucket ID and File ID are required for file preview.");
    }
    // Note: storage.getFilePreview returns a URL object
    const urlObject = storage.getFilePreview(
      bucketId,
      fileId,
      width,
      height,
      gravity,
      quality,
      undefined, // borderWidth
      undefined, // borderColor
      undefined, // borderRadius
      undefined, // opacity
      undefined, // rotation
      undefined, // background
      outputFormat
    );
    return urlObject.toString(); // Return the URL string
  } catch (error) {
    console.error('Error getting file preview URL:', error);
    // Don't throw here, return empty string or null? Depends on usage.
    // Returning empty string similar to getProfilePictureUrl
    return '';
    // Or: throw new Error(`Failed to get file preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deletes a file from a specified bucket.
 * @param bucketId The ID of the bucket containing the file.
 * @param fileId The ID of the file to delete.
 */
async function deleteFile(bucketId: string, fileId: string): Promise<void> {
  try {
    if (!bucketId || !fileId) {
        throw new Error("Bucket ID and File ID are required for file deletion.");
    }
    await storage.deleteFile(bucketId, fileId);
    console.log(`File ${fileId} deleted successfully from bucket ${bucketId}.`);
  } catch (error) {
    console.error(`Error deleting file ${fileId} from bucket ${bucketId}:`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// Specific function for profile pictures using the general deleteFile
async function deleteProfilePictureFile(fileId: string): Promise<void> {
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
    if (!bucketId) {
        console.error('Profile picture bucket ID is not configured.');
        throw new Error('Profile picture bucket ID is not configured.');
    }
    return deleteFile(bucketId, fileId);
};

/**
 * OAuth Authentication functions
 */
async function createOAuthSession(provider: OAuthProvider, scopes: string[] = []) {
  try {
    // Ensure base URL is correctly determined
    const baseURL = process.env.NEXT_PUBLIC_APP_URL ||
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const successUrl = `${baseURL}/auth/callback?provider=${provider}`; // Redirect to a dedicated callback page, include provider
    const failureUrl = `${baseURL}/signin?error=${provider}_oauth_failed`; // Redirect back to signin on failure

    console.log(`Initiating ${provider} OAuth: Success URL: ${successUrl}, Failure URL: ${failureUrl}`);

    // Use Appwrite's built-in OAuth method
    // This function redirects the user, so it doesn't return anything on success.
    await account.createOAuth2Session(
      provider,
      successUrl,
      failureUrl,
      scopes
    );
  } catch (error) {
    console.error(`Error initiating ${provider} OAuth session:`, error);
    throw new Error(`Failed to initiate ${provider} OAuth: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Specific wrapper for GitHub for convenience
async function createGitHubOAuthSession(scopes: string[] = ['user:email']) {
    return createOAuthSession(OAuthProvider.Github, scopes);
}

/**
 * Get current session details including OAuth provider information
 */
async function getCurrentSession(): Promise<Models.Session | null> {
  try {
    // Use 'current' to get the active session
    return await account.getSession('current');
  } catch (error) {
    // Appwrite throws if no session exists
    if (error instanceof AppwriteException && (error.code === 401 || error.code === 404)) {
        console.log('No active session found.');
    } else {
        console.error('Error fetching current session:', error);
    }
    return null;
  }
}

/**
 * Check if user is currently logged in (has any valid session)
 * @returns Boolean indicating login status
 */
async function isLoggedIn(): Promise<boolean> {
  // Simply check if getCurrentSession returns a session object
  return (await getCurrentSession()) !== null;
}

/**
 * Refresh OAuth token if needed (Appwrite handles this automatically with getSession/get)
 * This function might be less necessary unless explicitly managing session tokens.
 */
// async function refreshOAuthSession(sessionId: string) {
//   try {
//     // Updating a session might be used for specific cases, but getSession('current') usually handles refresh
//     const session = await account.updateSession(sessionId);
//     console.log('OAuth session potentially refreshed/updated successfully');
//     return session;
//   } catch (error) {
//     console.error('Error updating/refreshing OAuth session:', error);
//     throw new Error(`Failed to refresh OAuth session: ${error instanceof Error ? error.message : 'Unknown error'}`);
//   }
// }

/**
 * Check if session token needs refresh and refresh if needed (Appwrite SDK handles this)
 * This function checks the expiry manually, which might be useful for UI indicators,
 * but Appwrite's `account.get()` or `account.getSession('current')` should handle automatic refresh.
 */
async function checkSessionExpiry(): Promise<Models.Session | null> {
  try {
    const session = await getCurrentSession();

    if (!session) {
      console.log('No session found in checkSessionExpiry');
      return null;
    }

    // Check provider token expiry if it exists (relevant for OAuth)
    if (session.providerAccessTokenExpiry) {
      const expiryTime = Number(session.providerAccessTokenExpiry) * 1000; // Convert seconds to milliseconds
      const now = Date.now();
      const buffer = 5 * 60 * 1000; // 5 minutes buffer

      if (!isNaN(expiryTime) && now >= expiryTime - buffer) {
        console.warn(`Provider access token for session ${session.$id} is expired or nearing expiry.`);
        // Appwrite's subsequent calls to account.get() should handle this.
        // No explicit refresh action needed here usually.
      }
    }

    // Check the main session expiry
    const sessionExpiryTime = new Date(session.expire).getTime();
    const now = Date.now();
     if (now >= sessionExpiryTime) {
         console.warn(`Session ${session.$id} is expired.`);
         // The session is invalid, getCurrentSession should ideally not return it,
         // but we double-check here.
         return null; // Treat expired session as no session
     }


    return session;
  } catch (error) {
    console.error('Error checking session expiry:', error);
    return null;
  }
}

/**
 * User management functions (Admin/Specific Use Cases)
 */
// Note: This duplicates `signUp` functionality. Decide if a separate `addUser` is needed
// (e.g., for admin purposes without sending verification, or different defaults).
// Keeping it distinct for now as per original code.
async function addUser(email: string, password: string, name: string) {
  try {
    // This uses account.create, same as signUp. Consider if different logic is needed.
    const response = await account.create(ID.unique(), email, password, name);
    console.log('User added successfully via addUser:', response);
    // Consider if email verification should be sent here too.
    return response;
  } catch (error) {
    console.error('Error adding user via addUser:', error);
    throw new Error(`Failed to add user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Utility functions for safe document retrieval with session validation
 */

/**
 * Safe document fetching that handles "Document not found" and session errors gracefully.
 * @param databaseId Database ID
 * @param collectionId Collection ID
 * @param documentId Document ID
 * @param defaultValue Optional default value to return if document isn't found or on auth error.
 * @returns The document or the default value.
 */
async function safeGetDocument<T extends Models.Document>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    defaultValue: T | null = null
): Promise<T | null> {
  try {
    // Basic input validation
    if (!databaseId || !collectionId || !documentId) {
        console.error("Missing required IDs for safeGetDocument");
        return defaultValue;
    }
    // No need to explicitly call validateSession if Appwrite SDK handles it,
    // but useful if custom pre-checks are desired.
    // const isValidSession = await validateSession();
    // if (!isValidSession) {
    //     console.warn("Session invalid before safeGetDocument");
    //     return defaultValue;
    // }

    return await databases.getDocument<T>(databaseId, collectionId, documentId);
  } catch (error) {
    if (error instanceof AppwriteException) {
      if (error.code === 404) {
        // Document not found
        console.log(`Document not found: ${documentId} in ${databaseId}/${collectionId}`);
        return defaultValue;
      } else if (error.code === 401) {
        // Authentication error (invalid session)
        console.warn(`Authentication error (401) in safeGetDocument for ${documentId}`);
        // Attempting refresh via validateSession might be redundant if getDocument already failed
        return defaultValue; // Return default on auth error
      } else if (error.code === 403) {
        // Permission error
        console.warn(`Permission error (403) in safeGetDocument for ${documentId}`);
        return defaultValue; // Return default on permission error
      }
    }
    // Log and rethrow unexpected errors
    console.error(`Unexpected error in safeGetDocument for ${documentId}:`, error);
    // Decide whether to throw or return default for unexpected errors
    // Throwing might be better to signal a bigger issue.
    throw error;
    // return defaultValue;
  }
}

/**
 * Safe list documents that handles errors gracefully, especially auth errors.
 * @param databaseId Database ID
 * @param collectionId Collection ID
 * @param queries Query parameters
 * @returns List of documents or empty list on failure.
 */
async function safeListDocuments<T extends Models.Document>(
    databaseId: string,
    collectionId: string,
    queries: string[] = []
): Promise<{ total: number; documents: T[] }> {
  const defaultResponse = { total: 0, documents: [] };
  try {
     // Basic input validation
    if (!databaseId || !collectionId) {
        console.error("Missing required IDs for safeListDocuments");
        return defaultResponse;
    }
    // const isValidSession = await validateSession();
    // if (!isValidSession) {
    //     console.warn("Session invalid before safeListDocuments");
    //     return defaultResponse;
    // }

    return await databases.listDocuments<T>(databaseId, collectionId, queries);
  } catch (error) {
     if (error instanceof AppwriteException) {
      if (error.code === 401) {
        // Authentication error
        console.warn(`Authentication error (401) in safeListDocuments for ${collectionId}`);
        return defaultResponse; // Return empty list on auth error
      } else if (error.code === 403) {
         // Permission error
        console.warn(`Permission error (403) in safeListDocuments for ${collectionId}`);
        return defaultResponse; // Return empty list on permission error
      }
    }
    // Log and return default for other errors
    console.error(`Error listing documents in ${databaseId}/${collectionId}:`, error);
    return defaultResponse;
  }
}

// --- Exports ---
// Group exports logically

// Core Appwrite Clients
export { client, account, databases, storage, avatars };

// Appwrite Helpers
export { ID, Query, OAuthProvider, AuthenticationFactor, AppwriteException };

// Authentication Functions
export {
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
  convertAnonymousSession,
  createEmailOTP,
  verifyEmailOTP,
  createOAuthSession, // Export generic OAuth function
  createGitHubOAuthSession, // Keep specific one if needed
};

// Session Management Functions
export {
  ensureSession,
  verifySession,
  validateSession,
  getCurrentSession,
  isLoggedIn,
  checkSessionExpiry, // Export the expiry check utility
  // refreshOAuthSession, // Likely not needed due to SDK handling
};

// MFA Functions
export {
  createMfaRecoveryCodes,
  updateMfa,
  listMfaFactors,
  createMfaChallenge,
  updateMfaChallenge,
  createMfaEmailVerification, // Keep if distinct logic exists
};

// User Profile Functions
export {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
};

// Data Management Functions (Grouped by feature)
export { addBookmark, removeBookmark };
export { addTransaction };
export { fetchJobs, fetchJob };
export { sendMessage };
export { addNotification, markNotificationAsRead };
export { addProject, getProjects };
export { addPaymentMethod, getUserPaymentMethods };

// File Storage Functions
export {
    uploadFile,
    getFilePreviewUrl, // Export renamed preview function
    deleteFile, // Export generic delete
    deleteProfilePictureFile // Export specific delete
};

// User Management (Admin/Specific)
export { addUser };

// Safe Data Access Utilities
export { safeGetDocument, safeListDocuments };