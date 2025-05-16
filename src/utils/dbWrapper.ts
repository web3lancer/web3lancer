import { databases, safeGetDocument, safeListDocuments, ID, ensureSession } from './api';

/**
 * A wrapper for database access that uses the correct database and collection IDs
 * from the appwrite-database.md documentation
 */

// User profiles
export const profiles = {
  get: async (userId: string) => {
    return await safeGetDocument(
      process.env.DATABASES_USERS!,
      process.env.COLLECTIONS_PROFILES!,
      userId
    );
  },
  
  list: async (queries: any[] = []) => {
    return await safeListDocuments(
      process.env.DATABASES_USERS!,
      process.env.COLLECTIONS_PROFILES!,
      queries
    );
  },
  
  create: async (data: any) => {
    // Ensure we have a valid session before creating
    await ensureSession();
    
    return await databases.createDocument(
      process.env.DATABASES_USERS!,
      process.env.COLLECTIONS_PROFILES!,
      ID.unique(),
      data
    );
  },
  
  update: async (userId: string, data: any) => {
    // Ensure we have a valid session before updating
    await ensureSession();
    
    return await databases.updateDocument(
      process.env.DATABASES_USERS!,
      process.env.COLLECTIONS_PROFILES!,
      userId,
      data
    );
  },
  
  delete: async (userId: string) => {
    // Ensure we have a valid session before deleting
    await ensureSession();
    
    return await databases.deleteDocument(
      process.env.DATABASES_USERS!,
      process.env.COLLECTIONS_PROFILES!,
      userId
    );
  }
};

// Jobs
export const jobs = {
  get: async (jobId: string) => {
    return await safeGetDocument(
      process.env.DATABASES_JOBS!,
      process.env.COLLECTIONS_JOBS!,
      jobId
    );
  },
  
  list: async (queries: any[] = []) => {
    return await safeListDocuments(
      process.env.DATABASES_JOBS!,
      process.env.COLLECTIONS_JOBS!,
      queries
    );
  },
  
  create: async (data: any) => {
    // Ensure we have a valid session before creating
    await ensureSession();
    
    return await databases.createDocument(
      process.env.DATABASES_JOBS!,
      process.env.COLLECTIONS_JOBS!,
      ID.unique(),
      data
    );
  },
  
  update: async (jobId: string, data: any) => {
    // Ensure we have a valid session before updating
    await ensureSession();
    
    return await databases.updateDocument(
      process.env.DATABASES_JOBS!,
      process.env.COLLECTIONS_JOBS!,
      jobId,
      data
    );
  },
  
  delete: async (jobId: string) => {
    // Ensure we have a valid session before deleting
    await ensureSession();
    
    return await databases.deleteDocument(
      process.env.DATABASES_JOBS!,
      process.env.COLLECTIONS_JOBS!,
      jobId
    );
  }
};

// Wallet
export const wallets = {
  get: async (walletId: string) => {
    return await safeGetDocument(
      process.env.DATABASES_WALLET!,
      process.env.COLLECTIONS_WALLETS!,
      walletId
    );
  },
  
  listByUser: async (userId: string) => {
    return await safeListDocuments(
      process.env.DATABASES_WALLET!,
      process.env.COLLECTIONS_WALLETS!,
      [{ equal: ['userId', userId] }]
    );
  },
  
  create: async (data: any) => {
    // Ensure we have a valid session before creating
    await ensureSession();
    
    return await databases.createDocument(
      process.env.DATABASES_WALLET!,
      process.env.COLLECTIONS_WALLETS!,
      ID.unique(),
      data
    );
  },
  
  update: async (walletId: string, data: any) => {
    // Ensure we have a valid session before updating
    await ensureSession();
    
    return await databases.updateDocument(
      process.env.DATABASES_WALLET!,
      process.env.COLLECTIONS_WALLETS!,
      walletId,
      data
    );
  },
  
  delete: async (walletId: string) => {
    // Ensure we have a valid session before deleting
    await ensureSession();
    
    return await databases.deleteDocument(
      process.env.DATABASES_WALLET!,
      process.env.COLLECTIONS_WALLETS!,
      walletId
    );
  }
};

// Balances
export const balances = {
  getByWalletAndCurrency: async (walletId: string, currency: string) => {
    const response = await safeListDocuments(
      process.env.DATABASES_WALLET!,
      process.env.COLLECTIONS_BALANCES!,
      [
        { equal: ['walletId', walletId] },
        { equal: ['currency', currency] }
      ]
    );
    
    return response.documents.length > 0 ? response.documents[0] : null;
  },
  
  listByWallet: async (walletId: string) => {
    return await safeListDocuments(
      process.env.DATABASES_WALLET!,
      process.env.COLLECTIONS_BALANCES!,
      [{ equal: ['walletId', walletId] }]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      process.env.DATABASES_WALLET!,
      process.env.COLLECTIONS_BALANCES!,
      ID.unique(),
      data
    );
  },
  
  update: async (balanceId: string, data: any) => {
    return await databases.updateDocument(
      process.env.DATABASES_WALLET!,
      process.env.COLLECTIONS_BALANCES!,
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
      process.env.DATABASES_WALLET!,
      process.env.COLLECTIONS_CRYPTO_TRANSACTIONS!,
      [{ equal: ['walletId', walletId] }]
    );
  },
  
  create: async (data: any) => {
    return await databases.createDocument(
      process.env.DATABASES_WALLET!,
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
