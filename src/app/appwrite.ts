import { 
  client, 
  account, 
  databases, 
  storage, 
  avatars,
  ID, 
  Query 
} from '@/utils/api';
// This file will be used to re-export the initialized Appwrite Client
// so it can be imported and used throughout the application
export * from './api';

// Re-export everything from the main API file
export { 
  client, 
  account, 
  databases, 
  storage, 
  avatars,
  ID, 
  Query 
};

// Add a comment to encourage use of the central API file
