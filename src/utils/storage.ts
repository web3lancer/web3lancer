import { Storage, ID } from 'appwrite';
import { client } from './api';

const storage = new Storage(client);

async function uploadFile(bucketId: string, file: File, path: string) {
  try {
    const response = await storage.createFile(bucketId, ID.unique(), file, path);
    console.log('File uploaded successfully:', response);
    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

async function getFile(bucketId: string, fileId: string) {
  try {
    const response = await storage.getFile(bucketId, fileId);
    console.log('File retrieved successfully:', response);
    return response;
  } catch (error) {
    console.error('Error retrieving file:', error);
    throw error;
  }
}

async function deleteFile(bucketId: string, fileId: string) {
  try {
    await storage.deleteFile(bucketId, fileId);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export { uploadFile, getFile, deleteFile };
