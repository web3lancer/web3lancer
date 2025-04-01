import { databases, safeGetDocument, safeListDocuments, ID } from './api';
import { APPWRITE_CONFIG } from '@/lib/env';

/**
 * A wrapper for database access that uses the correct database and collection IDs
 * from the appwrite-database.md documentation
 */

// User profiles
export const profiles = {
  get: async (userId: string) => {
    return await safeGetDocument(
      APPWRITE_CONFIG.DATABASES.USERS,
      APPWRITE_CONFIG.COLLECTIONS.PROFILES,
      userId
    );
  },
  
  list: async (queries: any[] = []) => {
    return await safeListDocuments(
      APPWRITE_CONFIG.DATABASES.USERS,
      APPWRITE_CONFIG.COLLECTIONS.PROFILES,
      queries
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.USERS,
      APPWRITE_CONFIG.COLLECTIONS.PROFILES,
      ID.unique(),
      data
    );
  },
  
  update: async (userId: string, data: any) => {
    return await databases.updateDocument(
      APPWRITE_CONFIG.DATABASES.USERS,
      APPWRITE_CONFIG.COLLECTIONS.PROFILES,
      userId,
      data
    );
  },
  
  delete: async (userId: string) => {
    return await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASES.USERS,
      APPWRITE_CONFIG.COLLECTIONS.PROFILES,
      userId
    );
  }
};

// Jobs
export const jobs = {
  get: async (jobId: string) => {
    return await safeGetDocument(
      APPWRITE_CONFIG.DATABASES.JOBS,
      APPWRITE_CONFIG.COLLECTIONS.JOBS,
      jobId
    );
  },
  
  list: async (queries: any[] = []) => {
    return await safeListDocuments(
      APPWRITE_CONFIG.DATABASES.JOBS,
      APPWRITE_CONFIG.COLLECTIONS.JOBS,
      queries
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.JOBS,
      APPWRITE_CONFIG.COLLECTIONS.JOBS,
      ID.unique(),
      data
    );
  },
  
  update: async (jobId: string, data: any) => {
    return await databases.updateDocument(
      APPWRITE_CONFIG.DATABASES.JOBS,
      APPWRITE_CONFIG.COLLECTIONS.JOBS,
      jobId,
      data
    );
  },
  
  delete: async (jobId: string) => {
    return await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASES.JOBS,
      APPWRITE_CONFIG.COLLECTIONS.JOBS,
      jobId
    );
  }
};

// Wallet
export const wallets = {
  get: async (walletId: string) => {
    return await safeGetDocument(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.WALLETS,
      walletId
    );
  },
  
  listByUser: async (userId: string) => {
    return await safeListDocuments(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.WALLETS,
      [{ equal: ['userId', userId] }]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.WALLETS,
      ID.unique(),
      data
    );
  }
};

// Balances
export const balances = {
  getByWalletAndCurrency: async (walletId: string, currency: string) => {
    const response = await safeListDocuments(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.BALANCES,
      [
        { equal: ['walletId', walletId] },
        { equal: ['currency', currency] }
      ]
    );
    
    return response.documents.length > 0 ? response.documents[0] : null;
  },
  
  listByWallet: async (walletId: string) => {
    return await safeListDocuments(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.BALANCES,
      [{ equal: ['walletId', walletId] }]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.BALANCES,
      ID.unique(),
      data
    );
  },
  
  update: async (balanceId: string, data: any) => {
    return await databases.updateDocument(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.BALANCES,
      balanceId,
      data
    );
  }
};

// Transactions
export const transactions = {
  get: async (transactionId: string) => {
    return await safeGetDocument(
      APPWRITE_CONFIG.DATABASES.TRANSACTIONS,
      APPWRITE_CONFIG.COLLECTIONS.TRANSACTIONS,
      transactionId
    );
  },
  
  listByUser: async (userId: string, limit = 10) => {
    return await safeListDocuments(
      APPWRITE_CONFIG.DATABASES.TRANSACTIONS,
      APPWRITE_CONFIG.COLLECTIONS.TRANSACTIONS,
      [
        { equal: ['userId', userId] },
        { limit }
      ]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.TRANSACTIONS,
      APPWRITE_CONFIG.COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      data
    );
  }
};

// Payment methods
export const paymentMethods = {
  listByUser: async (userId: string) => {
    return await safeListDocuments(
      APPWRITE_CONFIG.DATABASES.PAYMENT_METHODS,
      APPWRITE_CONFIG.COLLECTIONS.PAYMENT_METHODS,
      [{ equal: ['userId', userId] }]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.PAYMENT_METHODS,
      APPWRITE_CONFIG.COLLECTIONS.PAYMENT_METHODS,
      ID.unique(),
      data
    );
  },
  
  update: async (paymentMethodId: string, data: any) => {
    return await databases.updateDocument(
      APPWRITE_CONFIG.DATABASES.PAYMENT_METHODS,
      APPWRITE_CONFIG.COLLECTIONS.PAYMENT_METHODS,
      paymentMethodId,
      data
    );
  },
  
  delete: async (paymentMethodId: string) => {
    return await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASES.PAYMENT_METHODS,
      APPWRITE_CONFIG.COLLECTIONS.PAYMENT_METHODS,
      paymentMethodId
    );
  }
};

// Crypto transactions
export const cryptoTransactions = {
  listByWallet: async (walletId: string) => {
    return await safeListDocuments(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.CRYPTO_TRANSACTIONS,
      [{ equal: ['walletId', walletId] }]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.CRYPTO_TRANSACTIONS,
      ID.unique(),
      data
    );
  }
};

// Bookmarks
export const bookmarks = {
  listByUser: async (userId: string) => {
    return await safeListDocuments(
      APPWRITE_CONFIG.DATABASES.BOOKMARKS,
      APPWRITE_CONFIG.COLLECTIONS.BOOKMARKS,
      [{ equal: ['userId', userId] }]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.BOOKMARKS,
      APPWRITE_CONFIG.COLLECTIONS.BOOKMARKS,
      ID.unique(),
      data
    );
  },
  
  delete: async (bookmarkId: string) => {
    return await databases.deleteDocument(
      APPWRITE_CONFIG.DATABASES.BOOKMARKS,
      APPWRITE_CONFIG.COLLECTIONS.BOOKMARKS,
      bookmarkId
    );
  }
};
