import { Client, Account, Databases, Storage, Functions } from 'appwrite';
import * as env from '@/lib/env';

const client = new Client();
client
  .setEndpoint(env.ENDPOINT)
  .setProject(env.PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

export { client, account, databases, storage, functions };