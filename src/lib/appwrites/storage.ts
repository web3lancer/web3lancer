import { storage, avatars } from './client';

export function getFilePreviewUrl(bucketId: string, fileId: string) {
  return storage.getFilePreview(bucketId, fileId).toString();
}
export function getFileViewUrl(bucketId: string, fileId: string) {
  return storage.getFileView(bucketId, fileId).toString();
}
export function getAvatarUrl(userId: string) {
  return avatars.getInitials(userId).toString();
}
