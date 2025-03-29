import { 
  client, 
  account, 
  databases, 
  storage, 
  avatars,
  ID, 
  Query 
} from '@/utils/api';

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
console.log('Note: Consider importing from @/utils/api instead of this file for better code organization');
