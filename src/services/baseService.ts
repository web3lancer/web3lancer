import { AppwriteService, AppwriteDocument } from './appwriteService';
import { EnvConfig } from '@/config/environment';

/**
 * BaseService - Abstract base class for all services
 * 
 * This class provides common functionality for all services, including
 * error handling, logging, and performance tracking.
 */
class BaseService {
  constructor(
    protected appwrite: AppwriteService,
    protected config: EnvConfig
  ) {}

  /**
   * Handles requests with standardized error handling and logging
   * @param requestFn The function to execute
   * @param methodName Name of the method being called (for logging)
   * @returns The result of the request function
   */
  protected async handleRequest<T>(
    requestFn: () => Promise<T>,
    methodName: string
  ): Promise<T> {
    try {
      const startTime = performance.now();
      const result = await requestFn();
      const endTime = performance.now();
      
      // Log performance for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.debug(`${this.constructor.name}.${methodName} completed in ${Math.round(endTime - startTime)}ms`);
      }
      
      return result;
    } catch (error: any) {
      // Add context to the error
      const contextualError = new Error(
        `Error in ${this.constructor.name}.${methodName}: ${error.message}`
      );
      
      // Preserve the original error stack if possible
      if (error.stack) {
        contextualError.stack = error.stack;
      }
      
      // Log the error
      console.error(contextualError);
      
      // Rethrow with context
      throw contextualError;
    }
  }

  /**
   * Creates a document with error handling
   */
  protected async createDocument<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: object,
    methodName: string
  ): Promise<T> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.createDocument<T>(
          databaseId,
          collectionId,
          documentId,
          data
        );
      },
      methodName
    );
  }

  /**
   * Gets a document with error handling
   */
  protected async getDocument<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    methodName: string
  ): Promise<T> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.getDocument<T>(
          databaseId,
          collectionId,
          documentId
        );
      },
      methodName
    );
  }

  /**
   * Lists documents with error handling
   */
  protected async listDocuments<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    queries: string[] = [],
    methodName: string
  ): Promise<T[]> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.listDocuments<T>(
          databaseId,
          collectionId,
          queries
        );
      },
      methodName
    );
  }

  /**
   * Updates a document with error handling
   */
  protected async updateDocument<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: object,
    methodName: string
  ): Promise<T> {
    return this.handleRequest(
      async () => {
        return await this.appwrite.updateDocument<T>(
          databaseId,
          collectionId,
          documentId,
          data
        );
      },
      methodName
    );
  }

  /**
   * Deletes a document with error handling
   */
  protected async deleteDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    methodName: string
  ): Promise<void> {
    return this.handleRequest(
      async () => {
        await this.appwrite.deleteDocument(
          databaseId,
          collectionId,
          documentId
        );
      },
      methodName
    );
  }

  /**
   * Uploads a file with error handling
   */
  protected async uploadFile(
    bucketId: string,
    file: File,
    methodName: string
  ) {
    return this.handleRequest(
      async () => {
        return await this.appwrite.uploadFile(bucketId, file);
      },
      methodName
    );
  }

  /**
   * Gets a file preview URL
   */
  protected getFilePreview(
    bucketId: string,
    fileId: string,
    width?: number
  ): string {
    return this.appwrite.getFilePreview(bucketId, fileId, width);
  }

  /**
   * Gets a file download URL
   */
  protected getFileDownload(
    bucketId: string,
    fileId: string
  ): string {
    return this.appwrite.getFileDownload(bucketId, fileId);
  }

  /**
   * Deletes a file with error handling
   */
  protected async deleteFile(
    bucketId: string,
    fileId: string,
    methodName: string
  ): Promise<void> {
    return this.handleRequest(
      async () => {
        await this.appwrite.deleteFile(bucketId, fileId);
      },
      methodName
    );
  }
}

export default BaseService;

export default BaseService;