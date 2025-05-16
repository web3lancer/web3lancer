import { Account, Avatars, Client, Databases, Functions, ID, Models, Query, Storage, Teams } from 'appwrite';
import { EnvConfig } from '@/config/environment';

/**
 * AppwriteService - A unified service for interacting with Appwrite
 * 
 * This service wraps all Appwrite SDK functionality with consistent error handling,
 * typing, and logging to simplify interaction with Appwrite services.
 */
export class AppwriteService {
  private client: Client;
  private account: Account;
  private databases: Databases;
  private storage: Storage;
  private avatars: Avatars;
  private functions: Functions;
  private teams: Teams;

  constructor(private config: EnvConfig) {
    // Initialize Appwrite client
    this.client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId);

    // Initialize Appwrite services
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.avatars = new Avatars(this.client);
    this.functions = new Functions(this.client);
    this.teams = new Teams(this.client);
  }

  // Account methods
  async createAccount(email: string, password: string, name?: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await this.account.create(ID.unique(), email, password, name);
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  async createEmailSession(email: string, password: string): Promise<Models.Session> {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.error('Error creating email session:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<Models.User<Models.Preferences>> {
    try {
      return await this.account.get();
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<{}> {
    try {
      return await this.account.deleteSession(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  async deleteSessions(): Promise<{}> {
    try {
      return await this.account.deleteSessions();
    } catch (error) {
      console.error('Error deleting all sessions:', error);
      throw error;
    }
  }

  // Database methods
  async createDocument<T extends object>(
    databaseId: string, 
    collectionId: string, 
    documentId: string, 
    data: object, 
    permissions?: string[]
  ): Promise<T> {
    try {
      return await this.databases.createDocument(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions
      ) as T;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async getDocument<T extends object>(
    databaseId: string, 
    collectionId: string, 
    documentId: string
  ): Promise<T | null> {
    try {
      return await this.databases.getDocument(
        databaseId,
        collectionId,
        documentId
      ) as T;
    } catch (error) {
      if ((error as any)?.code === 404) {
        return null;
      }
      console.error('Error getting document:', error);
      throw error;
    }
  }

  async listDocuments<T extends object>(
    databaseId: string, 
    collectionId: string, 
    queries?: string[]
  ): Promise<T[]> {
    try {
      const response = await this.databases.listDocuments(
        databaseId,
        collectionId,
        queries
      );
      return response.documents as T[];
    } catch (error) {
      console.error('Error listing documents:', error);
      throw error;
    }
  }

  async updateDocument<T extends object>(
    databaseId: string, 
    collectionId: string, 
    documentId: string, 
    data: object, 
    permissions?: string[]
  ): Promise<T> {
    try {
      return await this.databases.updateDocument(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions
      ) as T;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(
    databaseId: string, 
    collectionId: string, 
    documentId: string
  ): Promise<void> {
    try {
      await this.databases.deleteDocument(
        databaseId,
        collectionId,
        documentId
      );
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Storage methods
  async uploadFile(
    bucketId: string, 
    fileId: string, 
    file: File, 
    permissions?: string[]
  ): Promise<Models.File> {
    try {
      return await this.storage.createFile(
        bucketId,
        fileId,
        file,
        permissions
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getFile(
    bucketId: string, 
    fileId: string
  ): Promise<Models.File> {
    try {
      return await this.storage.getFile(
        bucketId,
        fileId
      );
    } catch (error) {
      console.error('Error getting file:', error);
      throw error;
    }
  }

  async listFiles(
    bucketId: string, 
    queries?: string[]
  ): Promise<Models.FileList> {
    try {
      return await this.storage.listFiles(
        bucketId,
        queries
      );
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  async deleteFile(
    bucketId: string, 
    fileId: string
  ): Promise<{}> {
    try {
      return await this.storage.deleteFile(
        bucketId,
        fileId
      );
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  getFilePreview(
    bucketId: string, 
    fileId: string, 
    width?: number, 
    height?: number, 
    gravity?: string, 
    quality?: number
  ): string {
    return this.storage.getFilePreview(
      bucketId,
      fileId,
      width,
      height,
      gravity as any,
      quality
    ).toString();
  }

  getFileView(
    bucketId: string, 
    fileId: string
  ): string {
    return this.storage.getFileView(
      bucketId,
      fileId
    ).toString();
  }

  getFileDownload(
    bucketId: string, 
    fileId: string
  ): string {
    return this.storage.getFileDownload(
      bucketId,
      fileId
    ).toString();
  }

  // Avatars methods
  getInitials(name: string, width?: number, height?: number, background?: string): string {
    return this.avatars.getInitials(name, width, height, background).toString();
  }

  // Function methods
  async executeFunction(functionId: string, data?: string): Promise<Models.Execution> {
    try {
      return await this.functions.createExecution(functionId, data);
    } catch (error) {
      console.error('Error executing function:', error);
      throw error;
    }
  }

  // Teams methods
  async createTeam(name: string, roles?: string[]): Promise<Models.Team<any>> {
    try {
      return await this.teams.create(ID.unique(), name, roles);
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  // Create pagination helper
  createPagination<T extends object>(
    fetchFunction: (queries: string[]) => Promise<T[]>,
    baseQueries: string[] = [],
    limit: number = 25
  ): {
    fetchPage: (page: number) => Promise<T[]>;
    fetchNextPage: (lastId: string, lastCreatedAt: string) => Promise<T[]>;
    fetchAll: () => Promise<T[]>;
  } {
    return {
      // Fetch by page number (less efficient, requires offset)
      fetchPage: async (page: number): Promise<T[]> => {
        const offset = (page - 1) * limit;
        const queries = [
          ...baseQueries,
          Query.limit(limit),
          Query.offset(offset)
        ];
        return await fetchFunction(queries);
      },
      
      // Fetch next page using cursor pagination (more efficient)
      fetchNextPage: async (lastId: string, lastCreatedAt: string): Promise<T[]> => {
        // Using cursor pagination based on createdAt and ID
        const queries = [
          ...baseQueries,
          Query.limit(limit),
          Query.cursorAfter(lastId)
        ];
        return await fetchFunction(queries);
      },
      
      // Fetch all documents (use carefully - could be slow for large collections)
      fetchAll: async (): Promise<T[]> => {
        const queries = [
          ...baseQueries,
          Query.limit(100) // Higher limit for efficiency
        ];
        let allResults: T[] = [];
        let results = await fetchFunction(queries);
        
        allResults = [...results];
        
        while (results.length === 100) {
          const lastItem = results[results.length - 1] as any;
          if (!lastItem.$id) break;
          
          const nextQueries = [
            ...baseQueries,
            Query.limit(100),
            Query.cursorAfter(lastItem.$id)
          ];
          
          results = await fetchFunction(nextQueries);
          allResults = [...allResults, ...results];
        }
        
        return allResults;
      }
    };
  }
}

// Helper for Query - this preserves the type-checking when using Query methods
export { ID, Query };