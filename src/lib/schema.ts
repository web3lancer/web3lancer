/**
 * Application Schema Definitions
 * 
 * This file documents the database schemas used in the application,
 * including both existing and new schemas.
 */

// New schemas to add to Appwrite
export const NEW_SCHEMAS = {
  // Wallet database for cryptocurrency management
  WALLET_DATABASE: {
    ID: 'wallet_database', // You'll replace this with the actual ID from Appwrite once created
    COLLECTIONS: {
      // Wallets collection to store user wallet information
      WALLETS: {
        ID: 'wallets_collection', // You'll replace this with the actual ID from Appwrite once created
        FIELDS: {
          WALLET_ID: 'walletId', // string
          USER_ID: 'userId', // string - reference to user ID
          CREATED_AT: 'createdAt', // datetime
          UPDATED_AT: 'updatedAt', // datetime
          // Additional wallet metadata
          WALLET_ADDRESS: 'walletAddress', // string - public address
          WALLET_TYPE: 'walletType', // string - "custodial", "non-custodial"
        }
      },
      
      // Balances collection to store wallet balances
      BALANCES: {
        ID: 'balances_collection', // You'll replace this with the actual ID from Appwrite once created
        FIELDS: {
          BALANCE_ID: 'balanceId', // string
          WALLET_ID: 'walletId', // string - reference to wallet ID
          CURRENCY: 'currency', // string - e.g., "BTC", "ETH", "USD"
          AMOUNT: 'amount', // double - current balance
          LAST_UPDATED: 'lastUpdated', // datetime
        }
      },
      
      // Crypto transactions collection for detailed transaction records
      CRYPTO_TRANSACTIONS: {
        ID: 'crypto_transactions_collection', // You'll replace this with the actual ID from Appwrite once created
        FIELDS: {
          CRYPTO_TX_ID: 'cryptoTxId', // string
          TRANSACTION_ID: 'transactionId', // string - reference to main transactions
          WALLET_ID: 'walletId', // string - reference to wallet ID
          TX_HASH: 'txHash', // string - blockchain transaction hash
          BLOCK_NUMBER: 'blockNumber', // integer - blockchain block number
          FROM_ADDRESS: 'fromAddress', // string
          TO_ADDRESS: 'toAddress', // string
          STATUS: 'status', // string - "pending", "confirmed", "failed"
          NETWORK: 'network', // string - e.g., "ethereum", "bitcoin"
          GAS_PRICE: 'gasPrice', // double (for Ethereum-like chains)
          GAS_USED: 'gasUsed', // double (for Ethereum-like chains)
        }
      }
    }
  },
  
  // Payment methods database to store user payment preferences
  PAYMENT_METHODS_DATABASE: {
    ID: 'payment_methods_database', // You'll replace this with the actual ID from Appwrite once created
    COLLECTIONS: {
      // Payment methods collection
      PAYMENT_METHODS: {
        ID: 'payment_methods_collection', // You'll replace this with the actual ID from Appwrite once created
        FIELDS: {
          PAYMENT_METHOD_ID: 'paymentMethodId', // string
          USER_ID: 'userId', // string - reference to user ID
          TYPE: 'type', // string - "crypto", "fiat", "credit_card", etc.
          DETAILS: 'details', // string (JSON) - encrypted details
          CREATED_AT: 'createdAt', // datetime
          UPDATED_AT: 'updatedAt', // datetime
          IS_DEFAULT: 'isDefault', // boolean
        }
      }
    }
  }
};

/**
 * This schema documentation shows how to create the collections in Appwrite
 * 
 * === Instructions for adding to Appwrite ===
 * 
 * 1. Create the "wallet_database" database in Appwrite
 * 2. Add the "wallets_collection" collection with the fields defined above
 * 3. Add the "balances_collection" collection with the fields defined above
 * 4. Add the "crypto_transactions_collection" collection with the fields defined above
 * 5. Create the "payment_methods_database" database in Appwrite
 * 6. Add the "payment_methods_collection" collection with the fields defined above
 * 
 * After creating these, update the IDs in your environment configuration.
 */
