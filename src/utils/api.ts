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
    const response = await databases.createDocument('67b87f690013f3c1796a', 'bookmarks', ID.unique(), {
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
    await databases.deleteDocument('67b87f690013f3c1796a', 'bookmarks', bookmarkId);
    console.log('Bookmark removed successfully');
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
}

export { client, account, databases, storage, signUp, signIn, addBookmark, removeBookmark, ID };