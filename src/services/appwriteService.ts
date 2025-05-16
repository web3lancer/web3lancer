import { Client, Account, Databases, Storage, Functions, Teams, Query, ID, Models } from 'appwrite';
import { EnvConfig } from '@/config/environment';

/**
 * Base document interface from Appwrite
 */
export interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  [key: string]: any;
}

/**
 * AppwriteService
 * A service wrapper for Appwrite SDK
 */
class AppwriteService {
  private client: Client;
  private account: Account;
  private databases: Databases;
  private storage: Storage;
  private functions: Functions;
  private teams: Teams;

  constructor(private config: EnvConfig) {
    this.client = new Client();
    this.client
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId);

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.functions = new Functions(this.client);
    this.teams = new Teams(this.client);
  }

  // Account methods
  async createAccount(email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> {
    return this.account.create(ID.unique(), email, password, name);
  }

  async createEmailSession(email: string, password: string): Promise<Models.Session> {
    return this.account.createEmailSession(email, password);
  }

  async getAccount(): Promise<Models.User<Models.Preferences>> {
    return this.account.get();
  }

  async deleteSession(sessionId: string): Promise<{}> {
    return this.account.deleteSession(sessionId);
  }

  async deleteCurrentSession(): Promise<{}> {
    return this.account.deleteSession('current');
  }

  // Database methods
  async createDocument<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: any,
    permissions?: string[]
  ): Promise<T> {
    const response = await this.databases.createDocument(
      databaseId,
      collectionId,
      documentId,
      data,
      permissions
    );
    return response as unknown as T;
  }

  async getDocument<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    queries?: string[]
  ): Promise<T> {
    const response = await this.databases.getDocument(
      databaseId,
      collectionId,
      documentId,
      queries
    );
    return response as unknown as T;
  }

  async listDocuments<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    queries?: string[]
  ): Promise<T[]> {
    const response = await this.databases.listDocuments(
      databaseId,
      collectionId,
      queries
    );
    return response.documents as unknown as T[];
  }

  async updateDocument<T extends AppwriteDocument>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: any,
    permissions?: string[]
  ): Promise<T> {
    const response = await this.databases.updateDocument(
      databaseId,
      collectionId,
      documentId,
      data,
      permissions
    );
    return response as unknown as T;
  }

  async deleteDocument(
    databaseId: string,
    collectionId: string,
    documentId: string
  ): Promise<{}> {
    return this.databases.deleteDocument(
      databaseId,
      collectionId,
      documentId
    );
  }

  // Storage methods
  async createFile(
    bucketId: string,
    fileId: string,
    file: File,
    permissions?: string[]
  ): Promise<Models.File> {
    return this.storage.createFile(
      bucketId,
      fileId,
      file,
      permissions
    );
  }

  async getFileView(
    bucketId: string,
    fileId: string
  ): Promise<string> {
    return this.storage.getFileView(
      bucketId,
      fileId
    );
  }

  async getFileDownload(
    bucketId: string,
    fileId: string
  ): Promise<string> {
    return this.storage.getFileDownload(
      bucketId,
      fileId
    );
  }

  async deleteFile(
    bucketId: string,
    fileId: string
  ): Promise<{}> {
    return this.storage.deleteFile(
      bucketId,
      fileId
    );
  }

  // Functions methods
  async executeFunction(
    functionId: string,
    data?: any
  ): Promise<Models.Execution> {
    return this.functions.createExecution(
      functionId,
      JSON.stringify(data)
    );
  }

  // Teams methods
  async createTeam(
    name: string,
    roles?: string[]
  ): Promise<Models.Team> {
    return this.teams.create(
      ID.unique(),
      name,
      roles
    );
  }

  async getTeam(
    teamId: string
  ): Promise<Models.Team> {
    return this.teams.get(
      teamId
    );
  }

  async deleteTeam(
    teamId: string
  ): Promise<{}> {
    return this.teams.delete(
      teamId
    );
  }

  async createTeamMembership(
    teamId: string,
    email: string,
    roles?: string[],
    url?: string
  ): Promise<Models.Membership> {
    return this.teams.createMembership(
      teamId,
      [email],
      roles,
      url
    );
  }

  // Utility method to get the authenticated user's ID
  async getCurrentUserId(): Promise<string | null> {
    try {
      const account = await this.getAccount();
      return account.$id;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }
}

// Export AppwriteService class and Appwrite SDK components that we need
export { AppwriteService, ID, Query };