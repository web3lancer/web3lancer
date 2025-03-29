// Re-export from the main API file and env file
import { client, account, databases, storage, ID } from '@/utils/api';
import { APPWRITE_CONFIG } from '@/lib/env';

// Export for backward compatibility
export { 
  client, 
  account, 
  databases, 
  storage, 
  ID, 
  APPWRITE_CONFIG 
};

console.log('Note: Consider importing from @/utils/api and @/lib/env instead for better code organization');
