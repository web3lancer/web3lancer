import { Client, Storage } from "appwrite";
import { client } from "@/app/appwrite";

const storage = new Storage(client);

export async function uploadFile(bucketId: string, file: File, filePath: string) {
  try {
    const response = await storage.createFile(bucketId, filePath, file);
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

export { getFile, deleteFile };
