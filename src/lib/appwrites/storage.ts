import {
  avatars,
  storage,
} from '@/lib/appwrites/client';
import { ID } from 'appwrite';

export function createFile(bucketId: string, file: File) {
  return storage.createFile(bucketId, ID.unique(), file);
}

export function deleteFile(bucketId: string, fileId: string) {
  return storage.deleteFile(bucketId, fileId);
}

export function getFilePreviewUrl(bucketId: string, fileId: string) {
  return storage.getFilePreview(bucketId, fileId).toString();
}
export function getFileViewUrl(bucketId: string, fileId: string) {
  return storage.getFileView(bucketId, fileId).toString();
}
export function getAvatarUrl(userId: string) {
  return avatars.getInitials(userId).toString();
}
