import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

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
    const response = await account.create('unique()', email, password, name);
    console.log('User created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function signIn(email: string, password: string) {
  try {
    const response = await account.createEmailSession(email, password);
    console.log('User signed in successfully:', response);
    return response;
  } catch (error) {
    console.error('Error signing in:', error);
    throw new Error(`Failed to sign in: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Bookmark management functions
 */
async function addBookmark(userId: string, jobId: string) {
  try {
    // Check if bookmark already exists
    const existing = await databases.listDocuments(
      '67b885ed000038dd7ab9',
      '67b8860100311b7d7939',
      [Query.equal('userId', userId), Query.equal('jobId', jobId)]
    );

    if (existing.documents.length > 0) {
      return existing.documents[0];
    }

    const response = await databases.createDocument('67b885ed000038dd7ab9', '67b8860100311b7d7939', ID.unique(), {
      userId,
      jobId,
      createdAt: new Date().toISOString(),
      bookmarkId: ID.unique(),
    });
    
    console.log('Bookmark added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    throw new Error(`Failed to add bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function removeBookmark(bookmarkId: string) {
  try {
    await databases.deleteDocument('67b885ed000038dd7ab9', '67b8860100311b7d7939', bookmarkId);
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
    const response = await databases.createDocument('67b8866c00265d466063', '67b8867b001643b2585a', ID.unique(), {
      userId,
      amount,
      type,
      createdAt: new Date().toISOString(),
      status,
      transactionId,
    });
    console.log('Transaction added successfully:', response);
    return response;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw new Error(`Failed to add transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Messaging functions
 */
async function sendMessage(senderId: string, receiverId: string, message: string, status: string) {
  try {
    const response = await databases.createDocument('67b8864c0020483351b5', '67b88658000bea7a7c7e', ID.unique(), {
      senderId,
      receiverId,
      message,
      timestamp: new Date().toISOString(),
      messageId: ID.unique(),
      status,
    });
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
    const response = await databases.createDocument('67b8862f00055127cd62', '67b88639000157c7909d', ID.unique(), {
      userId,
      message,
      createdAt: new Date().toISOString(),
      type,
      notificationId: ID.unique(),
      read: false,
    });
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
      '67b8862f00055127cd62',
      '67b88639000157c7909d',
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
    const response = await databases.createDocument('67b88574002c6eb405a2', '67b885810006a89bc6a4', ID.unique(), {
      ownerId,
      title,
      description,
      createdAt: new Date().toISOString(),
      participants,
      status,
      updatedAt: new Date().toISOString(),
      projectId: ID.unique(),
    });
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
      '67b88574002c6eb405a2',
      '67b885810006a89bc6a4',
      [Query.equal('ownerId', userId)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  addBookmark, 
  removeBookmark,
  addTransaction,
  sendMessage,
  addNotification,
  markNotificationAsRead,
  addProject,
  getProjects,
  addUser,
  Query
};