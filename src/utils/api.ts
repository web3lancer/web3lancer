import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '@/lib/env';

// Initialize client according to Appwrite docs
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67aed8360001b6dd8cb3'); // Your project ID

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

/**
 * User authentication functions
 */
async function signUp(email: string, password: string, name: string) {
  try {
    // Create user according to Appwrite docs pattern
    const response = await account.create(ID.unique(), email, password, name);
    console.log('User created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function signIn(email: string, password: string) {
  try {
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
    console.log('No active session, creating anonymous session');
    return createAnonymousSession();
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
 * User profile functions
 */
async function getUserProfile(userId: string) {
  try {
    const response = await databases.getDocument(
      APPWRITE_CONFIG.DATABASES.USERS,
      APPWRITE_CONFIG.COLLECTIONS.PROFILES,
      userId
    );
    return response;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error(`Failed to fetch user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function updateUserProfile(userId: string, data: any) {
  try {
    const response = await databases.updateDocument(
      APPWRITE_CONFIG.DATABASES.USERS,
      APPWRITE_CONFIG.COLLECTIONS.PROFILES,
      userId,
      data
    );
    return response;
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

export { 
  client, 
  account, 
  databases, 
  storage,
  ID, 
  signUp, 
  signIn,
  createMagicURLToken,
  createMagicURLSession,
  createAnonymousSession,
  ensureSession,
  convertAnonymousSession,
  getUserProfile,
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
  getFilePreview,
  fetchJobs,
  fetchJob,
  Query
};