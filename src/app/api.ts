import {
  Account,
  Client,
  Databases,
  Functions,
  Storage,
} from 'appwrite';

import {
  ENDPOINT,
  PROJECT_ID,
} from '@/lib/env';

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

// Initialize Appwrite services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

export { account, client, databases, functions, storage };
