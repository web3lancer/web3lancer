import { Account, Client, Databases, ID, Query, Storage, Teams, Models } from 'appwrite';
import { EnvConfig } from '@/config/environment';

// Extended Models.Document type for our services
export interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  [key: string]: any;
}

/**
 * AppwriteService - Core service for interacting with Appwrite SDK
 * 
 * This service handles authentication, database operations, and file storage
 * operations using the Appwrite SDK.
 */
export class AppwriteService {
  private client: Client;
  private account: Account;
  private databases: Databases;
  private storage: Storage;
  private teams: Teams;

  constructor(config: EnvConfig) {
    this.client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId);
    
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.teams = new Teams(this.client);
  }

  // Authentication Methods
  async createAccount(email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> {
    try {
      return await this.account.create(ID.unique(), email, password, name);
    } catch (error) {
      console.error('Appwrite error creating account:', error);
      throw error;
    }
  }

  async createEmailSession(email: string, password: string): Promise<Models.Session> {
    try {
      return await this.account.createSession(email, password);
    } catch (error) {
      console.error('Appwrite error creating session:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<Models.User<Models.Preferences>> {
    try {
      return await this.account.get();
    } catch (error) {
      console.error('Appwrite error getting current user:', error);
      throw error;
    }
  }

  async deleteSessions(): Promise<{}> {
    try {
      return await this.account.deleteSessions();
    } catch (error) {
      console.error('Appwrite error deleting sessions:', error);
      throw error;
    }
  }

  // Database Methods
  async createDocument<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: object,
    permissions?: string[]
  ): Promise<T> {
    try {
      const response = await this.databases.createDocument(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions
      );
      return response as unknown as T;
    } catch (error) {
      console.error('Appwrite error creating document:', error);
      throw error;
    }
  }

  async getDocument<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    documentId: string
  ): Promise<T> {
    try {
      const response = await this.databases.getDocument(
        databaseId,
        collectionId,
        documentId
      );
      return response as unknown as T;
    } catch (error) {
      console.error('Appwrite error getting document:', error);
      throw error;
    }
  }

  async listDocuments<T extends AppwriteDocument>(
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
      return response.documents as unknown as T[];
    } catch (error) {
      console.error('Appwrite error listing documents:', error);
      throw error;
    }
  }

  async updateDocument<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: object,
    permissions?: string[]
  ): Promise<T> {
    try {
      const response = await this.databases.updateDocument(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions
      );
      return response as unknown as T;
    } catch (error) {
      console.error('Appwrite error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(
    databaseId: string,
    collectionId: string,
    documentId: string
  ): Promise<{}> {
    try {
      return await this.databases.deleteDocument(
        databaseId,
        collectionId,
        documentId
      );
    } catch (error) {
      console.error('Appwrite error deleting document:', error);
      throw error;
    }
  }

  // Storage Methods
  async uploadFile(
    bucketId: string,
    file: File,
    permissions?: string[]
  ): Promise<Models.File> {
    try {
      return await this.storage.createFile(
        bucketId,
        ID.unique(),
        file,
        permissions
      );
    } catch (error) {
      console.error('Appwrite error uploading file:', error);
      throw error;
    }
  }

  async getFile(bucketId: string, fileId: string): Promise<Models.File> {
    try {
      return await this.storage.getFile(bucketId, fileId);
    } catch (error) {
      console.error('Appwrite error getting file:', error);
      throw error;
    }
  }

  getFilePreview(bucketId: string, fileId: string, width?: number): string {
    return this.storage.getFilePreview(bucketId, fileId, width);
  }

  getFileDownload(bucketId: string, fileId: string): string {
    return this.storage.getFileDownload(bucketId, fileId);
  }

  async deleteFile(bucketId: string, fileId: string): Promise<{}> {
    try {
      return await this.storage.deleteFile(bucketId, fileId);
    } catch (error) {
      console.error('Appwrite error deleting file:', error);
      throw error;
    }
  }

  // Teams Methods
  async createTeam(name: string, roles?: string[]): Promise<Models.Team<any>> {
    try {
      return await this.teams.create(ID.unique(), name, roles);
    } catch (error) {
      console.error('Appwrite error creating team:', error);
      throw error;
    }
  }

  async getTeam(teamId: string): Promise<Models.Team<any>> {
    try {
      return await this.teams.get(teamId);
    } catch (error) {
      console.error('Appwrite error getting team:', error);
      throw error;
    }
  }

  async listTeams(): Promise<Models.TeamList<any>> {
    try {
      return await this.teams.list();
    } catch (error) {
      console.error('Appwrite error listing teams:', error);
      throw error;
    }
  }

  async createTeamMembership(
    teamId: string,
    email: string,
    roles: string[],
    url: string
  ): Promise<Models.Membership> {
    try {
      return await this.teams.createMembership(
        teamId,
        [email],
        roles,
        url
      );
    } catch (error) {
      console.error('Appwrite error creating team membership:', error);
      throw error;
    }
  }
  
  // Utility Methods
  
  /**
   * Handles pagination for listing documents
   * 
   * This method will automatically handle pagination and return all documents
   * that match the query.
   */
  async listAllDocuments<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    queries: string[] = [],
    limit: number = 100
  ): Promise<T[]> {
    try {
      // Add limit to queries
      const queryWithLimit = [...queries, Query.limit(limit)];
      
      // Get first page of results
      const response = await this.databases.listDocuments(
        databaseId,
        collectionId,
        queryWithLimit
      );
      
      let allDocuments = response.documents as unknown as T[];
      
      // If there are more documents, paginate through them
      while (response.documents.length === limit) {
        // Get the last document ID from current batch
        const lastId = response.documents[response.documents.length - 1].$id;
        
        // Add cursor query for pagination
        const nextQuery = [...queries, Query.limit(limit), Query.cursorAfter(lastId)];
        
        // Get next page
        const nextResponse = await this.databases.listDocuments(
          databaseId,
          collectionId,
          nextQuery
        );
        
        // Add new documents to result array
        allDocuments = [...allDocuments, ...(nextResponse.documents as unknown as T[])];
        
        // Update response for next iteration check
        response.documents = nextResponse.documents;
      }
      
      return allDocuments;
    } catch (error) {
      console.error('Appwrite error listing all documents:', error);
      throw error;
    }
  }
  
  /**
   * Performs a bulk operation on documents
   * 
   * This method is useful for performing the same operation on multiple documents
   * with reduced API calls using Promise.all for parallel execution.
   */
  async bulkOperation<T>(
    operation: (item: any) => Promise<T>,
    items: any[]
  ): Promise<T[]> {
    try {
      return await Promise.all(items.map(item => operation(item)));
    } catch (error) {
      console.error('Appwrite error performing bulk operation:', error);
      throw error;
    }
  }
}

// Export the Appwrite ID and Query for convenience
export { ID, Query };

export default AppwriteService;
  
  // Utility Methods
  
  /**
   * Handles pagination for listing documents
   * 
   * This method will automatically handle pagination and return all documents
   * that match the query.
   */
  async listAllDocuments<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    queries: string[] = [],
    limit: number = 100
  ): Promise<T[]> {
    try {
      // Add limit to queries
      const queryWithLimit = [...queries, Query.limit(limit)];
      
      // Get first page of results
      const response = await this.databases.listDocuments(
        databaseId,
        collectionId,
        queryWithLimit
      );
      
      let allDocuments = response.documents as unknown as T[];
      
      // If there are more documents, paginate through them
      while (response.documents.length === limit) {
        // Get the last document ID from current batch
        const lastId = response.documents[response.documents.length - 1].$id;
        
        // Add cursor query for pagination
        const nextQuery = [...queries, Query.limit(limit), Query.cursorAfter(lastId)];
        
        // Get next page
        const nextResponse = await this.databases.listDocuments(
          databaseId,
          collectionId,
          nextQuery
        );
        
        // Add new documents to result array
        allDocuments = [...allDocuments, ...(nextResponse.documents as unknown as T[])];
        
        // Update response for next iteration check
        response.documents = nextResponse.documents;
      }
      
      return allDocuments;
    } catch (error) {
      console.error('Appwrite error listing all documents:', error);
      throw error;
    }
  }
  
  /**
   * Performs a bulk operation on documents
   * 
   * This method is useful for performing the same operation on multiple documents
   * with reduced API calls using Promise.all for parallel execution.
   */
  async bulkOperation<T>(
    operation: (item: any) => Promise<T>,
    items: any[]
  ): Promise<T[]> {
    try {
      return await Promise.all(items.map(item => operation(item)));
    } catch (error) {
      console.error('Appwrite error performing bulk operation:', error);
      throw error;
    }
  }
}
}

// Export the Appwrite ID and Query for convenience
export { ID, Query };

export default AppwriteService;