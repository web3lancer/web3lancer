import { databases, ID } from './client';
import { DB, COL } from './constants';
import type * as AppwriteTypes from '@/types/appwrite.d';

export async function getProfile(userId: string): Promise<AppwriteTypes.Profiles | null> {
  try {
    return await databases.getDocument<AppwriteTypes.Profiles>(DB.PROFILES, COL.PROFILES, userId);
  } catch {
    return null;
  }
}
export async function updateProfile(userId: string, data: Partial<AppwriteTypes.Profiles>) {
  return databases.updateDocument<AppwriteTypes.Profiles>(DB.PROFILES, COL.PROFILES, userId, data);
}
export async function listProfiles(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Profiles>(DB.PROFILES, COL.PROFILES, queries);
}

export async function createProject(data: Partial<AppwriteTypes.Profiles>) {
  return databases.createDocument<AppwriteTypes.Profiles>(
    DB.PROFILES,
    COL.PROFILES,
    ID.unique(),
    data
  );
}
