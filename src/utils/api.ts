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
    const response = await databases.createDocument('67b885ed000038dd7ab9', 'bookmarks', ID.unique(), {
      userId,
      jobId,
      createdAt: new Date().toISOString(),
    });
    console.log('Bookmark added successfully:', response);
  } catch (error) {
    console.error('Error adding bookmark:', error);
  }
}

async function removeBookmark(bookmarkId: string) {
  try {
    await databases.deleteDocument('67b885ed000038dd7ab9', 'bookmarks', bookmarkId);
    console.log('Bookmark removed successfully');
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
}

async function addTransaction(userId: string, amount: number, type: string) {
  try {
    const response = await databases.createDocument('67b8866c00265d466063', 'transactions', ID.unique(), {
      userId,
      amount,
      type,
      createdAt: new Date().toISOString(),
    });
    console.log('Transaction added successfully:', response);
  } catch (error) {
    console.error('Error adding transaction:', error);
  }
}

async function sendMessage(senderId: string, receiverId: string, content: string) {
  try {
    const response = await databases.createDocument('67b8864c0020483351b5', 'messages', ID.unique(), {
      senderId,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
    });
    console.log('Message sent successfully:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

async function addNotification(userId: string, message: string) {
  try {
    const response = await databases.createDocument('67b8862f00055127cd62', 'notifications', ID.unique(), {
      userId,
      message,
      createdAt: new Date().toISOString(),
    });
    console.log('Notification added successfully:', response);
  } catch (error) {
    console.error('Error adding notification:', error);
  }
}

async function addProject(userId: string, title: string, description: string) {
  try {
    const response = await databases.createDocument('67b88574002c6eb405a2', 'projects', ID.unique(), {
      userId,
      title,
      description,
      createdAt: new Date().toISOString(),
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