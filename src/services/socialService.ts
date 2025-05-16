import { Client, ID, Query, Databases, Storage } from 'appwrite';
import { Connection, Bookmark } from '@/types/social'; 
import * as env from '@/lib/env';

class SocialService {
  private client: Client;
  private databases: Databases;
  private storage: Storage;
  
  constructor() {
    this.client = new Client();
    this.client
      .setEndpoint(env.ENDPOINT) 
      .setProject(env.PROJECT_ID); 
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
  }
  
  // --- User Connections --- 
  async followUser(followerId: string, followingId: string): Promise<Connection> {
    try {
      const response = await this.databases.createDocument(
        env.SOCIAL_DATABASE_ID,
        env.USER_CONNECTIONS_COLLECTION_ID,
        ID.unique(),
        {
          followerId,
          followingId,
          connectionType: 'follow',
          status: 'active',
        }
      );
      return response as unknown as Connection; // Cast to unknown first, then to Connection
    } catch (error) {
      console.error('Error in followUser:', error);
      throw error;
    }
  }
  
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      const connections = await this.databases.listDocuments(
        env.SOCIAL_DATABASE_ID,
        env.USER_CONNECTIONS_COLLECTION_ID,
        [
          Query.equal('followerId', followerId),
          Query.equal('followingId', followingId),
          Query.equal('connectionType', 'follow'),
        ]
      );
      
      if (connections.documents.length > 0) {
        const connectionId = connections.documents[0].$id;
        await this.databases.deleteDocument(
          env.SOCIAL_DATABASE_ID,
          env.USER_CONNECTIONS_COLLECTION_ID,
          connectionId
        );
      }
    } catch (error) {
      console.error('Error in unfollowUser:', error);
      throw error;
    }
  }
  
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const connections = await this.databases.listDocuments(
        env.SOCIAL_DATABASE_ID,
        env.USER_CONNECTIONS_COLLECTION_ID,
        [
          Query.equal('followerId', followerId),
          Query.equal('followingId', followingId),
          Query.equal('connectionType', 'follow'),
          Query.equal('status', 'active'),
        ]
      );
      return connections.documents.length > 0;
    } catch (error) {
      console.error('Error in isFollowing:', error);
      return false; 
    }
  }
  
  async getFollowers(profileId: string): Promise<Connection[]> {
    try {
      const response = await this.databases.listDocuments(
        env.SOCIAL_DATABASE_ID,
        env.USER_CONNECTIONS_COLLECTION_ID,
        [
          Query.equal('followingId', profileId),
          Query.equal('connectionType', 'follow'),
          Query.equal('status', 'active'),
        ]
      );
      return response.documents as unknown as Connection[]; // Cast to unknown first
    } catch (error) {
      console.error('Error in getFollowers:', error);
      throw error;
    }
  }
  
  async getFollowing(profileId: string): Promise<Connection[]> {
    try {
      const response = await this.databases.listDocuments(
        env.SOCIAL_DATABASE_ID,
        env.USER_CONNECTIONS_COLLECTION_ID,
        [
          Query.equal('followerId', profileId),
          Query.equal('connectionType', 'follow'),
          Query.equal('status', 'active'),
        ]
      );
      return response.documents as unknown as Connection[]; // Cast to unknown first
    } catch (error) {
      console.error('Error in getFollowing:', error);
      throw error;
    }
  }
  
  async sendMessage(chatId: string, senderId: string, receiverId: string, messageContent: string, attachments?: File[]): Promise<any> {
    try {
      let attachmentFileIds: string[] = [];
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          const uploadedFile = await this.storage.createFile(
            env.MESSAGE_ATTACHMENTS_BUCKET_ID, 
            ID.unique(),
            file
          );
          attachmentFileIds.push(uploadedFile.$id);
        }
      }
      const response = await this.databases.createDocument(
        env.SOCIAL_DATABASE_ID,
        env.DIRECT_MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          chatId,
          senderId,
          receiverId, 
          messageContent,
          mediaFileIds: attachmentFileIds.length > 0 ? attachmentFileIds : undefined,
          isRead: false,
        }
      );
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getMessages(chatId: string, limit = 25, offset = 0): Promise<any[]> {
    try {
      const response = await this.databases.listDocuments(
        env.SOCIAL_DATABASE_ID,
        env.DIRECT_MESSAGES_COLLECTION_ID,
        [
          Query.equal('chatId', chatId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit),
          Query.offset(offset),
        ]
      );
      return response.documents;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async addBookmark(profileId: string, itemId: string, itemType: Bookmark['itemType']): Promise<Bookmark> {
    try {
      const response = await this.databases.createDocument(
        env.CONTENT_DATABASE_ID, 
        env.USER_BOOKMARKS_COLLECTION_ID,
        ID.unique(),
        {
          profileId,
          itemId,
          itemType,
        }
      );
      return response as unknown as Bookmark; // Cast to unknown first
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  async removeBookmark(bookmarkId: string): Promise<void> {
    try {
      await this.databases.deleteDocument(
        env.CONTENT_DATABASE_ID,
        env.USER_BOOKMARKS_COLLECTION_ID,
        bookmarkId
      );
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  async getUserBookmarks(profileId: string, itemType?: Bookmark['itemType']): Promise<Bookmark[]> {
    try {
      const queries: string[] = [Query.equal('profileId', profileId)];
      if (itemType) {
        queries.push(Query.equal('itemType', itemType));
      }
      const response = await this.databases.listDocuments(
        env.CONTENT_DATABASE_ID,
        env.USER_BOOKMARKS_COLLECTION_ID,
        queries
      );
      return response.documents as unknown as Bookmark[]; // Cast to unknown first
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      throw error;
    }
  }
}

const socialService = new SocialService();
export default socialService;