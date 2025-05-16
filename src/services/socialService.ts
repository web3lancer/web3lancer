import { AppwriteService, ID, Query } from './appwriteService';
import { EnvService } from './envService';
import { Connection, DirectMessage, GroupChat, GroupMessage } from '@/types/social';

/**
 * Social Service for managing user connections and messaging
 * Follows best practices from Cross-Cutting Concerns section
 */
class SocialService {
  private databaseId: string;
  private connectionsCollectionId: string;
  private directMessagesCollectionId: string;
  private groupChatsCollectionId: string;
  private groupMessagesCollectionId: string;
  private messageAttachmentsBucketId: string;
  
  constructor(
    private appwrite: AppwriteService,
    private env: EnvService<'social'>
  ) {
    this.databaseId = this.env.databaseId;
    this.connectionsCollectionId = this.env.get('collectionUserConnections');
    this.directMessagesCollectionId = this.env.get('collectionDirectMessages');
    this.groupChatsCollectionId = this.env.get('collectionGroupChats');
    this.groupMessagesCollectionId = this.env.get('collectionGroupChatMessages');
    this.messageAttachmentsBucketId = this.env.get('bucketMessageAttachments');
  }

  // User Connections
  async followUser(followerId: string, followingId: string): Promise<Connection> {
    return this.appwrite.createDocument<Connection>(
      this.databaseId,
      this.connectionsCollectionId,
      ID.unique(),
      {
        followerId,
        followingId,
        connectionType: 'follow',
        status: 'active'
      }
    );
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const connections = await this.appwrite.listDocuments<Connection>(
      this.databaseId,
      this.connectionsCollectionId,
      [
        Query.equal('followerId', followerId),
        Query.equal('followingId', followingId),
        Query.equal('connectionType', 'follow')
      ]
    );

    if (connections.length > 0) {
      const connectionId = connections[0].$id;
      await this.appwrite.deleteDocument(
        this.databaseId,
        this.connectionsCollectionId,
        connectionId
      );
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const connections = await this.appwrite.listDocuments<Connection>(
      this.databaseId,
      this.connectionsCollectionId,
      [
        Query.equal('followerId', followerId),
        Query.equal('followingId', followingId),
        Query.equal('connectionType', 'follow'),
        Query.equal('status', 'active')
      ]
    );

    return connections.length > 0;
  }

  async getFollowers(profileId: string): Promise<Connection[]> {
    return this.appwrite.listDocuments<Connection>(
      this.databaseId,
      this.connectionsCollectionId,
      [
        Query.equal('followingId', profileId),
        Query.equal('connectionType', 'follow'),
        Query.equal('status', 'active')
      ]
    );
  }

  async getFollowing(profileId: string): Promise<Connection[]> {
    return this.appwrite.listDocuments<Connection>(
      this.databaseId,
      this.connectionsCollectionId,
      [
        Query.equal('followerId', profileId),
        Query.equal('connectionType', 'follow'),
        Query.equal('status', 'active')
      ]
    );
  }

  // Direct Messaging
  async sendDirectMessage(chatId: string, senderId: string, receiverId: string, messageContent: string, attachments?: File[]): Promise<DirectMessage> {
    let attachmentFileIds: string[] = [];

    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        const fileId = await this.appwrite.uploadFile(this.messageAttachmentsBucketId, file);
        attachmentFileIds.push(fileId);
      }
    }

    return this.appwrite.createDocument<DirectMessage>(
      this.databaseId,
      this.directMessagesCollectionId,
      ID.unique(),
      {
        chatId,
        senderId,
        receiverId,
        messageContent,
        mediaFileIds: attachmentFileIds.length > 0 ? attachmentFileIds : undefined,
        isRead: false,
        isDeleted: false
      }
    );
  }

  async getDirectMessages(chatId: string, limit = 25, offset = 0): Promise<DirectMessage[]> {
    return this.appwrite.listDocuments<DirectMessage>(
      this.databaseId,
      this.directMessagesCollectionId,
      [
        Query.equal('chatId', chatId),
        Query.equal('isDeleted', false),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );
  }

  async markDirectMessageAsRead(messageId: string): Promise<DirectMessage> {
    return this.appwrite.updateDocument<DirectMessage>(
      this.databaseId,
      this.directMessagesCollectionId,
      messageId,
      { isRead: true }
    );
  }

  async deleteDirectMessage(messageId: string): Promise<DirectMessage> {
    // Soft delete - set isDeleted flag
    return this.appwrite.updateDocument<DirectMessage>(
      this.databaseId,
      this.directMessagesCollectionId,
      messageId,
      { isDeleted: true }
    );
  }

  // Group Chats
  async createGroupChat(name: string, creatorId: string, memberIds: string[] = []): Promise<GroupChat> {
    const allMembers = new Set([creatorId, ...memberIds]);
    
    return this.appwrite.createDocument<GroupChat>(
      this.databaseId,
      this.groupChatsCollectionId,
      ID.unique(),
      {
        name,
        creatorId,
        memberIds: Array.from(allMembers),
        adminIds: [creatorId],
        isActive: true
      }
    );
  }

  async getGroupChat(groupId: string): Promise<GroupChat | null> {
    return this.appwrite.getDocument<GroupChat>(
      this.databaseId,
      this.groupChatsCollectionId,
      groupId
    );
  }

  async getUserGroupChats(userId: string): Promise<GroupChat[]> {
    return this.appwrite.listDocuments<GroupChat>(
      this.databaseId,
      this.groupChatsCollectionId,
      [
        Query.search('memberIds', userId),
        Query.equal('isActive', true)
      ]
    );
  }

  async addGroupChatMember(groupId: string, userId: string): Promise<GroupChat> {
    const groupChat = await this.getGroupChat(groupId);
    
    if (!groupChat) {
      throw new Error('Group chat not found');
    }
    
    const memberIds = new Set([...groupChat.memberIds, userId]);
    
    return this.appwrite.updateDocument<GroupChat>(
      this.databaseId,
      this.groupChatsCollectionId,
      groupId,
      { memberIds: Array.from(memberIds) }
    );
  }

  async removeGroupChatMember(groupId: string, userId: string): Promise<GroupChat> {
    const groupChat = await this.getGroupChat(groupId);
    
    if (!groupChat) {
      throw new Error('Group chat not found');
    }
    
    const memberIds = groupChat.memberIds.filter(id => id !== userId);
    
    return this.appwrite.updateDocument<GroupChat>(
      this.databaseId,
      this.groupChatsCollectionId,
      groupId,
      { memberIds }
    );
  }

  async sendGroupMessage(groupId: string, senderId: string, messageContent: string, attachments?: File[]): Promise<GroupMessage> {
    let attachmentFileIds: string[] = [];

    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        const fileId = await this.appwrite.uploadFile(this.messageAttachmentsBucketId, file);
        attachmentFileIds.push(fileId);
      }
    }

    return this.appwrite.createDocument<GroupMessage>(
      this.databaseId,
      this.groupMessagesCollectionId,
      ID.unique(),
      {
        groupId,
        senderId,
        messageContent,
        mediaFileIds: attachmentFileIds.length > 0 ? attachmentFileIds : undefined,
        isDeleted: false
      }
    );
  }

  async getGroupMessages(groupId: string, limit = 25, offset = 0): Promise<GroupMessage[]> {
    return this.appwrite.listDocuments<GroupMessage>(
      this.databaseId,
      this.groupMessagesCollectionId,
      [
        Query.equal('groupId', groupId),
        Query.equal('isDeleted', false),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );
  }

  async deleteGroupMessage(messageId: string): Promise<GroupMessage> {
    // Soft delete - set isDeleted flag
    return this.appwrite.updateDocument<GroupMessage>(
      this.databaseId,
      this.groupMessagesCollectionId,
      messageId,
      { isDeleted: true }
    );
  }

  // File methods
  async getMessageAttachmentUrl(fileId: string): Promise<URL> {
    return this.appwrite.getFileView(this.messageAttachmentsBucketId, fileId);
  }
}

export default SocialService;