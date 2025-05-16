import * as env from '@/lib/env';

/**
 * Interface for environment variable configs
 */
export interface EnvConfig {
  [key: string]: string;
}

/**
 * Environment Service for accessing scoped environment variables
 * Follows best practices from Cross-Cutting Concerns section
 */
export class EnvService<T extends 'profiles' | 'jobs' | 'finance' | 'social' | 'content' | 'governance' | 'activity' | 'core'> {
  private scope: T;

  /**
   * Create a new EnvService
   * @param scope The database scope (profiles, jobs, etc.)
   */
  constructor(scope: T) {
    this.scope = scope;
  }

  /**
   * Get a specific environment variable by key
   * @param key The environment variable key
   * @returns The environment variable value
   */
  get(key: string): string {
    const upperScope = this.scope.toUpperCase();
    const databaseKey = `${upperScope}_DATABASE_ID`;
    const collectionKeyPrefix = `${upperScope}_COLLECTION_`;
    
    switch (key) {
      case 'databaseId':
        return env[`${upperScope}_DATABASE_ID` as keyof typeof env] as string;
      default:
        // Check if the key starts with 'collection'
        if (key.startsWith('collection')) {
          const collectionName = key.replace('collection', '').toLowerCase();
          const envKey = `${collectionKeyPrefix}${collectionName.toUpperCase()}_ID`;
          return env[envKey as keyof typeof env] as string;
        }
        
        // For bucket IDs
        if (key.startsWith('bucket')) {
          const bucketName = key.replace('bucket', '').toLowerCase();
          const envKey = `${upperScope}_BUCKET_${bucketName.toUpperCase()}_ID`;
          return env[envKey as keyof typeof env] as string;
        }
        
        return '';
    }
  }

  /**
   * Get the database ID for this scope
   */
  get databaseId(): string {
    return this.get('databaseId');
  }
}

export default EnvService;