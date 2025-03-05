import { Client, Storage } from "appwrite";
import { client } from "@/app/appwrite";

const storage = new Storage(client);

export interface UploadProgressCallback {
  (progress: number): void;
}

export async function uploadFile(bucketId: string, file: File, filePath: string, onProgress?: UploadProgressCallback) {
  try {
    const response = await storage.createFile(
      bucketId, 
      filePath, 
      file,
      // Add upload progress tracking
      onProgress ? {
        onProgress: (progress) => {
          onProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      } : undefined
    );
    console.log('File uploaded successfully:', response);
    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getFile(bucketId: string, fileId: string) {
  try {
    const response = await storage.getFile(bucketId, fileId);
    console.log('File retrieved successfully:', response);
    return response;
  } catch (error) {
    console.error('Error retrieving file:', error);
    throw new Error(`Failed to get file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getFilePreview(bucketId: string, fileId: string, width?: number, height?: number) {
  try {
    return storage.getFilePreview(bucketId, fileId, width, height);
  } catch (error) {
    console.error('Error getting file preview:', error);
    throw new Error(`Failed to get file preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteFile(bucketId: string, fileId: string) {
  try {
    await storage.deleteFile(bucketId, fileId);
    console.log('File deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function listFiles(bucketId: string) {
  try {
    const response = await storage.listFiles(bucketId);
    return response.files;
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Remove redundant exports that are already exported above
export { storage };
