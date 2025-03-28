import { Client, Account, Databases, Storage, ID } from 'appwrite';
import { APPWRITE_CONFIG } from '@/lib/env';

// Initialize the Appwrite client
const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67aed8360001b6dd8cb3'); // Your project ID

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export client and ID for convenience
export { client, ID };
export { Query } from 'appwrite';
