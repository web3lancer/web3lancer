import { databases, ID } from './client';
import { DB, COL } from './constants';
import type * as AppwriteTypes from '@/types/appwrite.d';

// --- Skills ---
export async function createSkill(data: Partial<AppwriteTypes.Skills>) {
  return databases.createDocument<AppwriteTypes.Skills>(DB.CORE, COL.SKILLS, ID.unique(), data);
}
export async function listSkills(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Skills>(DB.CORE, COL.SKILLS, queries);
}

// --- Categories ---
export async function createCategory(data: Partial<AppwriteTypes.Categories>) {
  return databases.createDocument<AppwriteTypes.Categories>(DB.CORE, COL.CATEGORIES, ID.unique(), data);
}
export async function listCategories(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Categories>(DB.CORE, COL.CATEGORIES, queries);
}

// --- Platform Settings ---
export async function updatePlatformSetting(settingKey: string, data: Partial<AppwriteTypes.PlatformSettings>) {
  return databases.updateDocument<AppwriteTypes.PlatformSettings>(DB.CORE, COL.PLATFORM_SETTINGS, settingKey, data);
}
export async function listPlatformSettings(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.PlatformSettings>(DB.CORE, COL.PLATFORM_SETTINGS, queries);
}
