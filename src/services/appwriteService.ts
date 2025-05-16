import { Client, Account, Databases, Storage, Avatars, Functions, ID, Query } from 'appwrite';
import * as env from '@/lib/env';

/**
 * Centralized Appwrite Service for consistent access across the application
 * Follows the best practices from the Cross-Cutting Concerns section
 */
export class AppwriteService {
  private client: Client;
  private account: Account;
  private databases: Databases;
  private storage: Storage;
  private avatars: Avatars;
  private functions: Functions;

  constructor() {
    this.client = new Client();
    this.client
      .setEndpoint(env.ENDPOINT)
      .setProject(env.PROJECT_ID);

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.avatars = new Avatars(this.client);
    this.functions = new Functions(this.client);
  }

  // Account methods
  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async createSession(email: string, password: string) {
    return await this.account.createEmailPasswordSession(email, password);
  }

  async deleteCurrentSession() {
    return await this.account.deleteSession('current');
  }

  async createUser(email: string, password: string, name: string) {
    return await this.account.create(ID.unique(), email, password, name);
  }

  // Generic database methods
  async createDocument<T = any>(databaseId: string, collectionId: string, documentId: string, data: any, permissions: string[] = []): Promise<T> {
    try {
      return await this.databases.createDocument(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions
      ) as unknown as T;
    } catch (error) {
      console.error(`Error creating document in ${collectionId}:`, error);
      throw error;
    }
  }

  async getDocument<T = any>(databaseId: string, collectionId: string, documentId: string): Promise<T | null> {
    try {
      return await this.databases.getDocument(
        databaseId,
        collectionId,
        documentId
      ) as unknown as T;
    } catch (error) {
      console.error(`Error getting document from ${collectionId}:`, error);
      return null;
    }
  }

  async listDocuments<T = any>(databaseId: string, collectionId: string, queries: string[] = []): Promise<T[]> {
    try {
      const response = await this.databases.listDocuments(
        databaseId,
        collectionId,
        queries
      );
      return response.documents as unknown as T[];
    } catch (error) {
      console.error(`Error listing documents from ${collectionId}:`, error);
      return [];
    }
  }

  async updateDocument<T = any>(databaseId: string, collectionId: string, documentId: string, data: any, permissions: string[] = []): Promise<T> {
    try {
      return await this.databases.updateDocument(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions
      ) as unknown as T;
    } catch (error) {
      console.error(`Error updating document in ${collectionId}:`, error);
      throw error;
    }
  }

  async deleteDocument(databaseId: string, collectionId: string, documentId: string): Promise<void> {
    try {
      await this.databases.deleteDocument(
        databaseId,
        collectionId,
        documentId
      );
    } catch (error) {
      console.error(`Error deleting document from ${collectionId}:`, error);
      throw error;
    }
  }

  // File storage methods
  async uploadFile(bucketId: string, file: File): Promise<string> {
    try {
      const result = await this.storage.createFile(
        bucketId,
        ID.unique(),
        file
      );
      return result.$id;
    } catch (error) {
      console.error(`Error uploading file to ${bucketId}:`, error);
      throw error;
    }
  }

  async getFileView(bucketId: string, fileId: string): Promise<URL> {
    return this.storage.getFileView(bucketId, fileId);
  }

  async getFilePreview(bucketId: string, fileId: string, width?: number, height?: number): Promise<URL> {
    return this.storage.getFilePreview(bucketId, fileId, width, height);
  }

  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    try {
      await this.storage.deleteFile(bucketId, fileId);
    } catch (error) {
      console.error(`Error deleting file from ${bucketId}:`, error);
      throw error;
    }
  }

  // Helper method to get Account instance directly
  getAccount(): Account {
    return this.account;
  }

  // Helper method to get Databases instance directly
  getDatabases(): Databases {
    return this.databases;
  }

  // Helper method to get Storage instance directly
  getStorage(): Storage {
    return this.storage;
  }

  // Helper method to get Avatars instance directly
  getAvatars(): Avatars {
    return this.avatars;
  }

  // Helper method to get Functions instance directly
  getFunctions(): Functions {
    return this.functions;
  }
}

// Export a singleton instance for use throughout the application
export const appwriteService = new AppwriteService();

// Re-export useful Appwrite utilities
export { ID, Query };