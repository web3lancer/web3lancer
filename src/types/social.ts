// filepath: /home/nathfavour/Documents/code/web3lancer/web3lancer/src/types/social.ts

// Corresponds to SocialDB/user_connections
export interface Connection {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  followerId: string; // Profile.$id of the user initiating the follow/connection
  followingId: string; // Profile.$id of the user being followed/connected with
  connectionType: 'follow' | 'friend_request'; // 'friend_request' for mutual connections
  status: 'pending' | 'active' | 'rejected' | 'blocked' | 'unfollowed';
}

// Corresponds to SocialDB/direct_messages
// For direct messages, a Conversation concept is often used to group messages.
// See Conversation and DirectMessage in content.ts if you are merging, or define separately here.

// If using a separate Conversation/Chat document for direct messages:
export interface DirectChat {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    participantIds: string[]; // [Profile.$id, Profile.$id] - typically sorted to create a unique ID
    lastMessageId?: string; // Message.$id
    lastMessageText?: string;
    lastMessageAt?: string; // ISO Datetime
    unreadCounts?: Record<string, number>; // { [profileId]: count }
}

export interface DirectMessage { // Individual message within a DirectChat
    $id: string;
    $createdAt: string;
    $updatedAt: string; // For read status updates, edits, etc.
    chatId: string; // DirectChat.$id or a composite key of participants
    senderId: string; // Profile.$id
    receiverId: string; // Profile.$id (denormalized for querying, though chatId implies participants)
    content: string;
    mediaFileId?: string; // Storage File ID from message_attachments bucket
    isRead: boolean; // By the receiver
    readAt?: string; // ISO Datetime
    status?: 'sent' | 'delivered' | 'read' | 'failed' | 'deleted_by_sender' | 'deleted_by_receiver';
    reactions?: { userId: string, emoji: string }[]; // Optional: simple reactions
}

// Corresponds to SocialDB/group_chats
export interface GroupChat {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  description?: string;
  creatorId: string; // Profile.$id
  adminIds: string[]; // Profile.$id array
  memberIds: string[]; // Profile.$id array
  avatarFileId?: string; // Storage File ID for group avatar
  lastMessageId?: string; // GroupChatMessage.$id
  lastMessageText?: string;
  lastMessageAt?: string; // ISO Datetime
  visibility: 'public' | 'private' | 'invite_only';
  settings?: Record<string, any>; // e.g., { allowMemberInvites: true }
}

// Corresponds to SocialDB/group_chat_messages
export interface GroupChatMessage {
  $id: string;
  $createdAt: string;
  $updatedAt: string; // For edits, read receipts if complex
  groupId: string; // GroupChat.$id
  senderId: string; // Profile.$id
  content: string;
  mediaFileId?: string; // Storage File ID
  mentions?: string[]; // Array of Profile.$id mentioned
  status?: 'sent' | 'delivered' | 'read_by_some' | 'failed'; // Simplified status
  // readBy?: string[]; // Array of Profile.$id who have read (can get large)
  reactions?: { userId: string, emoji: string }[];
}

// Note: The `Feeds` collection is conceptual and usually implemented via functions.
// Types for feed items would depend on the aggregated content (e.g., Post, JobPosting).
