import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();
client
  .setEndpoint('https://[HOSTNAME_OR_IP]/v1') // Your Appwrite Endpoint
  .setProject('67aed8360001b6dd8cb3'); // Your project ID

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

async function signUp(email: string, password: string) {
  try {
    const response = await account.create('unique()', email, password);
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

async function createDocument(collectionId: string, data: object) {
  try {
    const response = await databases.createDocument('67aed8360001b6dd8cb3', collectionId, 'unique()', data);
    console.log('Document created successfully:', response);
  } catch (error) {
    console.error('Error creating document:', error);
  }
}

async function getDocument(collectionId: string, documentId: string) {
  try {
    const response = await databases.getDocument('67aed8360001b6dd8cb3', collectionId, documentId);
    console.log('Document retrieved successfully:', response);
  } catch (error) {
    console.error('Error retrieving document:', error);
  }
}

async function updateDocument(collectionId: string, documentId: string, data: object) {
  try {
    const response = await databases.updateDocument('67aed8360001b6dd8cb3', collectionId, documentId, data);
    console.log('Document updated successfully:', response);
  } catch (error) {
    console.error('Error updating document:', error);
  }
}

async function deleteDocument(collectionId: string, documentId: string) {
  try {
    const response = await databases.deleteDocument('67aed8360001b6dd8cb3', collectionId, documentId);
    console.log('Document deleted successfully:', response);
  } catch (error) {
    console.error('Error deleting document:', error);
  }
}

async function uploadFile(file: File) {
  try {
    const response = await storage.createFile('[BUCKET_ID]', 'unique()', file);
    console.log('File uploaded successfully:', response);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

async function getFile(fileId: string) {
  try {
    const response = await storage.getFile('[BUCKET_ID]', fileId);
    console.log('File retrieved successfully:', response);
  } catch (error) {
    console.error('Error retrieving file:', error);
  }
}

export { client, account, databases, storage, signUp, signIn, createDocument, getDocument, updateDocument, deleteDocument, uploadFile, getFile };