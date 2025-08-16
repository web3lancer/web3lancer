import {
  databases,
  ID,
  Query,
} from '@/lib/appwrites/client';
import {
  COL,
  DB,
} from '@/lib/appwrites/constants';
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

export async function getProfileByUserId(userId: string) {
  const response = await listProfiles([Query.equal('userId', userId)]);
  return response.documents[0];
}

export async function createProject(data: Partial<AppwriteTypes.Profiles>) {
  return databases.createDocument<AppwriteTypes.Profiles>(
    DB.PROFILES,
    COL.PROFILES,
    ID.unique(),
    data
  );
}
