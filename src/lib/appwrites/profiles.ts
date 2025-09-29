import { databases, ID, Query } from '@/lib/appwrites/client';
import { DB, COL } from '@/lib/appwrites/constants';
import type * as AppwriteTypes from '@/types/appwrite.d';

export async function createProfile(data: Partial<AppwriteTypes.Profiles>) {
  return databases.createDocument<AppwriteTypes.Profiles>(DB.PROFILES, COL.PROFILES, ID.unique(), data);
}

export async function getProfile(profileId: string) {
  return databases.getDocument<AppwriteTypes.Profiles>(DB.PROFILES, COL.PROFILES, profileId);
}

export async function getProfileByUserId(userId: string) {
  const res = await databases.listDocuments<AppwriteTypes.Profiles>(DB.PROFILES, COL.PROFILES, [
    Query.equal('userId', userId),
    Query.limit(1),
  ]);
  return res.documents[0];
}

export async function updateProfile(profileId: string, data: Partial<AppwriteTypes.Profiles>) {
  return databases.updateDocument<AppwriteTypes.Profiles>(DB.PROFILES, COL.PROFILES, profileId, data);
}

export async function listProfiles(queries: string[] = []) {
  return databases.listDocuments<AppwriteTypes.Profiles>(DB.PROFILES, COL.PROFILES, queries);
}
