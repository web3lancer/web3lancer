import {
  databases,
  ID,
  Query,
} from '@/lib/appwrites/client';
import {
  COL,
  DB,
} from '@/lib/appwrites/constants';
import type * as AppwriteTypes from '@/types/appwrite.d';

// --- Connections ---
export async function createConnection(data: Partial<AppwriteTypes.Connections>) {
  return databases.createDocument<AppwriteTypes.Connections>(DB.SOCIAL, COL.CONNECTIONS, ID.unique(), data);
}

export async function listConnections(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Connections>(DB.SOCIAL, COL.CONNECTIONS, queries);
}

export async function getConnection(followerId: string, followingId: string) {
  const response = await listConnections([
    Query.equal('followerId', followerId),
    Query.equal('followingId', followingId),
  ]);
  return response.documents[0];
}

export async function deleteConnection(connectionId: string) {
  return databases.deleteDocument(DB.SOCIAL, COL.CONNECTIONS, connectionId);
}

// --- Messages ---
export async function createMessage(data: Partial<AppwriteTypes.Messages>) {
  return databases.createDocument<AppwriteTypes.Messages>(DB.SOCIAL, COL.MESSAGES, ID.unique(), data);
}
export async function listMessages(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Messages>(DB.SOCIAL, COL.MESSAGES, queries);
}

// --- Group Chats ---
export async function createGroupChat(data: Partial<AppwriteTypes.GroupChats>) {
  return databases.createDocument<AppwriteTypes.GroupChats>(DB.SOCIAL, COL.GROUP_CHATS, ID.unique(), data);
}
export async function listGroupChats(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.GroupChats>(DB.SOCIAL, COL.GROUP_CHATS, queries);
}

export async function updateGroupChat(groupChatId: string, data: Partial<AppwriteTypes.GroupChats>) {
  return databases.updateDocument<AppwriteTypes.GroupChats>(DB.SOCIAL, COL.GROUP_CHATS, groupChatId, data);
}

// --- Group Messages ---
export async function createGroupMessage(data: Partial<AppwriteTypes.GroupMessages>) {
  return databases.createDocument<AppwriteTypes.GroupMessages>(DB.SOCIAL, COL.GROUP_MESSAGES, ID.unique(), data);
}
export async function listGroupMessages(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.GroupMessages>(DB.SOCIAL, COL.GROUP_MESSAGES, queries);
}
