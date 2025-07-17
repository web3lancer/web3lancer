import { storage, ID } from '@/utils/api';

/**
 * Upload a file to Appwrite Storage
 * @param bucketId - The ID of the storage bucket
 * @param file - The file to upload
 * @param filePath - Optional path/name for the file
 * @param onProgress - Optional callback for upload progress
 * @returns The uploaded file data
 */
export async function uploadFile(
  bucketId: string,
  file: File,
  filePath?: string,
  onProgress?: (progress: number) => void
) {
  try {
    // Currently Appwrite doesn't support progress tracking in the web SDK
    // When they add this feature, we can implement the onProgress callback
    
    const fileId = ID.unique();
    const response = await storage.createFile(
      bucketId,
      fileId,
      file
    );
    
    if (onProgress) {
      // Simulate progress since we don't have real progress tracking
      onProgress(100);
    }
    
    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Get a preview URL for a file
 * @param bucketId - The ID of the storage bucket
 * @param fileId - The ID of the file
 * @param width - Optional width for the preview
 * @param height - Optional height for the preview
 * @returns A URL to the file preview
 */
export async function getFilePreview(
  bucketId: string,
  fileId: string,
  width?: number,
  height?: number
) {
  try {
    return storage.getFilePreview(
      bucketId,
      fileId,
      width,
      height
    );
  } catch (error) {
    console.error('Error getting file preview:', error);
    throw error;
  }
}

/**
 * Get a download URL for a file
 * @param bucketId - The ID of the storage bucket
 * @param fileId - The ID of the file
 * @returns A URL to download the file
 */
export async function getFileDownload(
  bucketId: string,
  fileId: string
) {
  try {
    return storage.getFileDownload(
      bucketId,
      fileId
    );
  } catch (error) {
    console.error('Error getting file download:', error);
    throw error;
  }
}

/**
 * Delete a file from storage
 * @param bucketId - The ID of the storage bucket
 * @param fileId - The ID of the file to delete
 * @returns Success response
 */
export async function deleteFile(
  bucketId: string,
  fileId: string
) {
  try {
    return storage.deleteFile(
      bucketId,
      fileId
    );
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}
