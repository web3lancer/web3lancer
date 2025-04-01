/**
 * Database Configuration Utilities
 * 
 * This file provides utilities to validate and verify Appwrite database configurations
 */

import { databases } from '@/utils/api';
import { APPWRITE_CONFIG } from '@/lib/env';

/**
 * Interface for collection check result
 */
interface CollectionValidationResult {
  exists: boolean;
  databaseId: string;
  collectionId: string;
  error?: string;
}

/**
 * Validates if a collection exists in the database
 */
export async function checkCollectionExists(
  databaseId: string,
  collectionId: string
): Promise<CollectionValidationResult> {
  try {
    // Attempt to list documents with a limit of 0 just to check if collection exists
    await databases.listDocuments(databaseId, collectionId, []);
    
    return {
      exists: true,
      databaseId,
      collectionId
    };
  } catch (error: any) {
    console.error(`Collection validation error for ${databaseId}/${collectionId}:`, error);
    
    return {
      exists: false,
      databaseId,
      collectionId,
      error: error.message
    };
  }
}

/**
 * Validates all database collections from APPWRITE_CONFIG
 * Can be used during development or early in app initialization
 */
export async function validateDatabaseConfig(): Promise<{valid: boolean, results: CollectionValidationResult[]}> {
  const results: CollectionValidationResult[] = [];
  
  try {
    // Check each database collection pair
    for (const [dbKey, dbId] of Object.entries(APPWRITE_CONFIG.DATABASES)) {
      // Skip if no corresponding collection key
      if (!APPWRITE_CONFIG.COLLECTIONS[dbKey]) continue;
      
      const result = await checkCollectionExists(
        dbId as string,
        APPWRITE_CONFIG.COLLECTIONS[dbKey] as string
      );
      
      results.push(result);
    }
    
    // Check if all collections were valid
    const valid = results.every(result => result.exists);
    
    return {
      valid,
      results
    };
  } catch (error) {
    console.error("Failed to validate database config:", error);
    return {
      valid: false,
      results
    };
  }
}

/**
 * Get the effective ID from appwrite-database.md documentation
 * This helps prevent hard-coded IDs that might be out of sync
 */
export function getDatabaseId(key: keyof typeof APPWRITE_CONFIG.DATABASES): string {
  return APPWRITE_CONFIG.DATABASES[key] as string;
}

/**
 * Get the effective collection ID from appwrite-database.md documentation
 */
export function getCollectionId(key: keyof typeof APPWRITE_CONFIG.COLLECTIONS): string {
  return APPWRITE_CONFIG.COLLECTIONS[key] as string;
}
