import { Client, Account, Databases, Storage } from 'appwrite';
import { APPWRITE_CONFIG } from '@/lib/env';

// Initialize the Appwrite client
const client = new Client();

client
    .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
    .setProject(APPWRITE_CONFIG.PROJECT_ID);

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export client and ID for convenience
export { client };
export { ID } from 'appwrite';
