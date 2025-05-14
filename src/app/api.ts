import { Client, Account, Databases, Storage, Functions } from 'appwrite';
import { PROJECT_ID, ENDPOINT } from '@/lib/env';

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

// Initialize Appwrite services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

export { client, account, databases, storage, functions };