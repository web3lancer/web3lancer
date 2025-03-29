import { client, account, databases, storage, ID, Query } from '@/utils/api';

// Re-export everything from the main API file to maintain compatibility
export { client, account, databases, storage, ID, Query };

// Add a comment to encourage use of the central API file
console.log('Note: Consider importing from @/utils/api instead of this file for better code organization');
