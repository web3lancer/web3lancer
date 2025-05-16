import { AppwriteService } from './appwriteService';
import { EnvConfig } from '@/config/environment';

/**
 * BaseService - Abstract base class for all service implementations
 * 
 * Provides consistent structure and utilities for service classes that interact with Appwrite.
 */
abstract class BaseService {
  constructor(
    protected appwrite: AppwriteService,
    protected config: EnvConfig
  ) {}

  // Common service methods could be added here
  protected logError(method: string, error: any): void {
    console.error(`[${this.constructor.name}] Error in ${method}:`, error);
  }

  // Helper method to get collection IDs, with fallback
  protected ensureCollectionId(id: string, fallbackName: string): string {
    if (!id) {
      console.warn(`[${this.constructor.name}] Missing collection ID for ${fallbackName}, using fallback`);
      return fallbackName; // In production, this should be replaced with a proper ID
    }
    return id;
  }

  // Helper method to handle Appwrite errors consistently
  protected async handleRequest<T>(
    operation: () => Promise<T>,
    errorContext: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logError(errorContext, error);
      throw error;
    }
  }
}

export default BaseService;