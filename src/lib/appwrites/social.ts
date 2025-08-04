import { databases, ID } from './client';
import { DB, COL } from './constants';
import type * as AppwriteTypes from '@/types/appwrite.d';

// --- Connections ---
export async function createConnection(data: Partial<AppwriteTypes.Connections>) {
  return databases.createDocument<AppwriteTypes.Connections>(DB.SOCIAL, COL.CONNECTIONS, ID.unique(), data);
}
export async function listConnections(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.Connections>(DB.SOCIAL, COL.CONNECTIONS, queries);
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

// --- Group Messages ---
export async function createGroupMessage(data: Partial<AppwriteTypes.GroupMessages>) {
  return databases.createDocument<AppwriteTypes.GroupMessages>(DB.SOCIAL, COL.GROUP_MESSAGES, ID.unique(), data);
}
export async function listGroupMessages(queries: any[] = []) {
  return databases.listDocuments<AppwriteTypes.GroupMessages>(DB.SOCIAL, COL.GROUP_MESSAGES, queries);
}
