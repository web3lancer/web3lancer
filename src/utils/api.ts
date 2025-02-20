import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();
client
  .setProject('67aed8360001b6dd8cb3'); // Your project ID

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

async function signUp(email: string, password: string, name: string) {
  try {
    const response = await account.create('unique()', email, password, name);
    console.log('User created successfully:', response);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

async function signIn(email: string, password: string) {
  try {
    const response = await account.createSession(email, password);
    console.log('User signed in successfully:', response);
  } catch (error) {
    console.error('Error signing in:', error);
  }
}

export { client, account, databases, storage, signUp, signIn };