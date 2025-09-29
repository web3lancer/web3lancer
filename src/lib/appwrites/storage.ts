import { storage, ID } from '@/lib/appwrites/client';

// Simple helpers around Appwrite Storage for the frontend

export function getFileViewUrl(bucketId: string, fileId: string): string {
  return storage.getFileView(bucketId, fileId).toString();
}

export function getFilePreviewUrl(
  bucketId: string,
  fileId: string,
  width?: number,
  height?: number
): string {
  // Width/height are optional; Appwrite SDK supports many more params which we can extend later
  // @ts-ignore - preview has many overloads; we'll call with optional dims
  return storage.getFilePreview(bucketId, fileId, width as any, height as any).toString();
}

export async function uploadFile(bucketId: string, file: File) {
  return storage.createFile(bucketId, ID.unique(), file);
}

export async function uploadFiles(bucketId: string, files: File[]) {
  const results = await Promise.all(
    files.map((file) => storage.createFile(bucketId, ID.unique(), file))
  );
  return results.map((r) => r.$id);
}
