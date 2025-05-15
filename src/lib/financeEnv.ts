import { getEnv } from '@/lib/env';

class FinanceEnv {
  // Database ID
  static get financeDatabase() {
    return getEnv('NEXT_PUBLIC_APPWRITE_DATABASE_FINANCE_ID') || 'finance_db';
  }

  // Collection IDs
  static get userWalletsCollection() {
    return getEnv('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_WALLETS_ID') || 'user_wallets';
  }

  static get platformTransactionsCollection() {
    return getEnv('NEXT_PUBLIC_APPWRITE_COLLECTION_PLATFORM_TRANSACTIONS_ID') || 'platform_transactions';
  }

  static get userPaymentMethodsCollection() {
    return getEnv('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PAYMENT_METHODS_ID') || 'user_payment_methods';
  }

  static get escrowTransactionsCollection() {
    return getEnv('NEXT_PUBLIC_APPWRITE_COLLECTION_ESCROW_TRANSACTIONS_ID') || 'escrow_transactions';
  }

  // Helper to get all environment variables related to finance
  static getAll() {
    return {
      financeDatabase: this.financeDatabase,
      userWalletsCollection: this.userWalletsCollection,
      platformTransactionsCollection: this.platformTransactionsCollection,
      userPaymentMethodsCollection: this.userPaymentMethodsCollection,
      escrowTransactionsCollection: this.escrowTransactionsCollection
    };
  }
}

export default FinanceEnv;