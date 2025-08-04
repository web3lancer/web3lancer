import { databases, safeGetDocument, safeListDocuments, ID, ensureSession } from '@/utils/api';
import {
  PROFILES_DATABASE_ID,
  USER_PROFILES_COLLECTION_ID,
  JOBS_DATABASE_ID,
  JOB_POSTINGS_COLLECTION_ID,
  FINANCE_DATABASE_ID,
  USER_WALLETS_COLLECTION_ID,
  PLATFORM_TRANSACTIONS_COLLECTION_ID,
  USER_PAYMENT_METHODS_COLLECTION_ID,
  ESCROW_TRANSACTIONS_COLLECTION_ID
} from '@/lib/env';

/**
 * A wrapper for database access that uses the correct database and collection IDs
 * from the appwrite-database.md documentation
 */

// User profiles
export const profiles = {
  get: async (userId: string) => {
    return await safeGetDocument(
      PROFILES_DATABASE_ID,
      USER_PROFILES_COLLECTION_ID,
      userId
    );
  },
  
  list: async (queries: any[] = []) => {
    return await safeListDocuments(
      PROFILES_DATABASE_ID,
      USER_PROFILES_COLLECTION_ID,
      queries
    );
  },
  
  create: async (data: any) => {
    // Ensure we have a valid session before creating
    await ensureSession();
    
    return await databases.createDocument(
      PROFILES_DATABASE_ID,
      USER_PROFILES_COLLECTION_ID,
      ID.unique(),
      data
    );
  },
  
  update: async (userId: string, data: any) => {
    // Ensure we have a valid session before updating
    await ensureSession();
    
    return await databases.updateDocument(
      PROFILES_DATABASE_ID,
      USER_PROFILES_COLLECTION_ID,
      userId,
      data
    );
  },
  
  delete: async (userId: string) => {
    // Ensure we have a valid session before deleting
    await ensureSession();
    
    return await databases.deleteDocument(
      PROFILES_DATABASE_ID,
      USER_PROFILES_COLLECTION_ID,
      userId
    );
  }
};

// Jobs
export const jobs = {
  get: async (jobId: string) => {
    return await safeGetDocument(
      JOBS_DATABASE_ID,
      JOB_POSTINGS_COLLECTION_ID,
      jobId
    );
  },
  
  list: async (queries: any[] = []) => {
    return await safeListDocuments(
      JOBS_DATABASE_ID,
      JOB_POSTINGS_COLLECTION_ID,
      queries
    );
  },
  
  create: async (data: any) => {
    // Ensure we have a valid session before creating
    await ensureSession();
    
    return await databases.createDocument(
      JOBS_DATABASE_ID,
      JOB_POSTINGS_COLLECTION_ID,
      ID.unique(),
      data
    );
  },
  
  update: async (jobId: string, data: any) => {
    // Ensure we have a valid session before updating
    await ensureSession();
    
    return await databases.updateDocument(
      JOBS_DATABASE_ID,
      JOB_POSTINGS_COLLECTION_ID,
      jobId,
      data
    );
  },
  
  delete: async (jobId: string) => {
    // Ensure we have a valid session before deleting
    await ensureSession();
    
    return await databases.deleteDocument(
      JOBS_DATABASE_ID,
      JOB_POSTINGS_COLLECTION_ID,
      jobId
    );
  }
};

// Wallet
export const wallets = {
  get: async (walletId: string) => {
    return await safeGetDocument(
      FINANCE_DATABASE_ID,
      USER_WALLETS_COLLECTION_ID,
      walletId
    );
  },
  
  listByUser: async (userId: string) => {
    return await safeListDocuments(
      FINANCE_DATABASE_ID,
      USER_WALLETS_COLLECTION_ID,
      [{ equal: ['userId', userId] }]
    );
  },
  
  create: async (data: any) => {
    // Ensure we have a valid session before creating
    await ensureSession();
    
    return await databases.createDocument(
      FINANCE_DATABASE_ID,
      USER_WALLETS_COLLECTION_ID,
      ID.unique(),
      data
    );
  },
  
  update: async (walletId: string, data: any) => {
    // Ensure we have a valid session before updating
    await ensureSession();
    
    return await databases.updateDocument(
      FINANCE_DATABASE_ID,
      USER_WALLETS_COLLECTION_ID,
      walletId,
      data
    );
  },
  
  delete: async (walletId: string) => {
    // Ensure we have a valid session before deleting
    await ensureSession();
    
    return await databases.deleteDocument(
      FINANCE_DATABASE_ID,
      USER_WALLETS_COLLECTION_ID,
      walletId
    );
  }
};

// Balances
export const balances = {
  getByWalletAndCurrency: async (walletId: string, currency: string) => {
    const response = await safeListDocuments(
      FINANCE_DATABASE_ID,
      PLATFORM_TRANSACTIONS_COLLECTION_ID,
      [
        { equal: ['walletId', walletId] },
        { equal: ['currency', currency] }
      ]
    );
    
    return response.documents.length > 0 ? response.documents[0] : null;
  },
  
  listByWallet: async (walletId: string) => {
    return await safeListDocuments(
      FINANCE_DATABASE_ID,
      PLATFORM_TRANSACTIONS_COLLECTION_ID,
      [{ equal: ['walletId', walletId] }]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      FINANCE_DATABASE_ID,
      PLATFORM_TRANSACTIONS_COLLECTION_ID,
      ID.unique(),
      data
    );
  },
  
  update: async (balanceId: string, data: any) => {
    return await databases.updateDocument(
      FINANCE_DATABASE_ID,
      PLATFORM_TRANSACTIONS_COLLECTION_ID,
      balanceId,
      data
    );
  }
};

// Transactions
export const transactions = {
  get: async (transactionId: string) => {
    return await safeGetDocument(
      process.env.DATABASES_TRANSACTIONS!,
      process.env.COLLECTIONS_TRANSACTIONS!,
      transactionId
    );
  },
  
  listByUser: async (userId: string, limit = 10) => {
    return await safeListDocuments(
      process.env.DATABASES_TRANSACTIONS!,
      process.env.COLLECTIONS_TRANSACTIONS!,
      [
        { equal: ['userId', userId] },
        { limit }
      ]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      process.env.DATABASES_TRANSACTIONS!,
      process.env.COLLECTIONS_TRANSACTIONS!,
      ID.unique(),
      data
    );
  }
};

// Payment methods
export const paymentMethods = {
  listByUser: async (userId: string) => {
    return await safeListDocuments(
      process.env.DATABASES_PAYMENT_METHODS!,
      process.env.COLLECTIONS_PAYMENT_METHODS!,
      [{ equal: ['userId', userId] }]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      process.env.DATABASES_PAYMENT_METHODS!,
      process.env.COLLECTIONS_PAYMENT_METHODS!,
      ID.unique(),
      data
    );
  },
  
  update: async (paymentMethodId: string, data: any) => {
    return await databases.updateDocument(
      process.env.DATABASES_PAYMENT_METHODS!,
      process.env.COLLECTIONS_PAYMENT_METHODS!,
      paymentMethodId,
      data
    );
  },
  
  delete: async (paymentMethodId: string) => {
    return await databases.deleteDocument(
      process.env.DATABASES_PAYMENT_METHODS!,
      process.env.COLLECTIONS_PAYMENT_METHODS!,
      paymentMethodId
    );
  }
};

// Crypto transactions
export const cryptoTransactions = {
  listByWallet: async (walletId: string) => {
    return await safeListDocuments(
      FINANCE_DATABASE_ID,
      process.env.COLLECTIONS_CRYPTO_TRANSACTIONS!,
      [{ equal: ['walletId', walletId] }]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      FINANCE_DATABASE_ID,
      process.env.COLLECTIONS_CRYPTO_TRANSACTIONS!,
      ID.unique(),
      data
    );
  }
};

// Bookmarks
export const bookmarks = {
  listByUser: async (userId: string) => {
    return await safeListDocuments(
      process.env.DATABASES_BOOKMARKS!,
      process.env.COLLECTIONS_BOOKMARKS!,
      [{ equal: ['userId', userId] }]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      process.env.DATABASES_BOOKMARKS!,
      process.env.COLLECTIONS_BOOKMARKS!,
      ID.unique(),
      data
    );
  },
  
  delete: async (bookmarkId: string) => {
    return await databases.deleteDocument(
      process.env.DATABASES_BOOKMARKS!,
      process.env.COLLECTIONS_BOOKMARKS!,
      bookmarkId
    );
  }
};
