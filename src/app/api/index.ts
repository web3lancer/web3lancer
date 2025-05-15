import { Client, Account, Databases, Storage, Avatars } from 'appwrite';
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID
} from '@/lib/env';

const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

export default client;