import { Client, Account, Databases, Storage, ID } from 'appwrite';

const client = new Client();
client
  .setProject('67aed8360001b6dd8cb3'); // Your project ID

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

async function signUp(email: string, password: string, name: string) {
  try {
    const response = await account.create('unique()', email, password, name);
    console.log('User created successfully:', response);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

async function signIn(email: string, password: string) {
  try {
    const response = await account.createSession(email, password);
    console.log('User signed in successfully:', response);
  } catch (error) {
    console.error('Error signing in:', error);
  }
}

async function addBookmark(userId: string, jobId: string) {
  try {
    const response = await databases.createDocument('67b885ed000038dd7ab9', '67b8860100311b7d7939', ID.unique(), {
      userId,
      jobId,
      createdAt: new Date().toISOString(),
      bookmarkId: ID.unique(),
    });
    console.log('Bookmark added successfully:', response);
  } catch (error) {
    console.error('Error adding bookmark:', error);
  }
}

async function removeBookmark(bookmarkId: string) {
  try {
    await databases.deleteDocument('67b885ed000038dd7ab9', '67b8860100311b7d7939', bookmarkId);
    console.log('Bookmark removed successfully');
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
}

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
  } catch (error) {
    console.error('Error adding transaction:', error);
  }
}

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
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

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
  } catch (error) {
    console.error('Error adding notification:', error);
  }
}

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
  } catch (error) {
    console.error('Error adding project:', error);
  }
}

async function addUser(email: string, password: string, name: string) {
  try {
    const response = await account.create(ID.unique(), email, password, name);
    console.log('User added successfully:', response);
  } catch (error) {
    console.error('Error adding user:', error);
  }
}

export { client, account, databases, storage, signUp, signIn, addBookmark, removeBookmark, addTransaction, sendMessage, addNotification, addProject, addUser, ID };