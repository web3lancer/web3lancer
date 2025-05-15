import env from '@/lib/env';

/**
 * Helper class for accessing finance-related environment variables
 */
export class FinanceEnv {
  /**
   * Get the finance database ID
   */
  static get financeDatabase(): string {
    return env.APPWRITE_DATABASE_FINANCE_ID;
  }

  /**
   * Get the user wallets collection ID
   */
  static get userWalletsCollection(): string {
    return env.APPWRITE_COLLECTION_USER_WALLETS_ID;
  }

  /**
   * Get the platform transactions collection ID
   */
  static get platformTransactionsCollection(): string {
    return env.APPWRITE_COLLECTION_PLATFORM_TRANSACTIONS_ID;
  }

  /**
   * Get the user payment methods collection ID
   */
  static get userPaymentMethodsCollection(): string {
    return env.APPWRITE_COLLECTION_USER_PAYMENT_METHODS_ID;
  }

  /**
   * Get the escrow transactions collection ID
   */
  static get escrowTransactionsCollection(): string {
    return env.APPWRITE_COLLECTION_ESCROW_TRANSACTIONS_ID;
  }

  /**
   * Get all finance-related environment variables
   */
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