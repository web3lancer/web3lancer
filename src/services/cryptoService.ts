/**
 * Cryptocurrency Service
 * 
 * This service handles all crypto-related operations including wallet management,
 * transactions, and balances.
 */

import { databases, ID, Query } from '@/utils/api';
import { parseEther, formatEther } from '@/utils/transactionUtils';

// Database and collection IDs from appwrite-database.md
const WALLET_DATABASE_ID = '67e629540014107023a2';
const WALLETS_COLLECTION_ID = '67e629b1003bcc87679e';
const BALANCES_COLLECTION_ID = '67e62a5c00093534cc42';
const CRYPTO_TRANSACTIONS_COLLECTION_ID = '67e62b6f0003ed0e4ecc';
const TRANSACTIONS_DATABASE_ID = '67b8866c00265d466063';
const TRANSACTIONS_COLLECTION_ID = '67b8867b001643b2585a';

/**
 * Create a new wallet for a user
 */
export async function createWallet(
  userId: string,
  walletType: 'custodial' | 'non-custodial',
  walletAddress?: string
): Promise<{ walletId: string; walletAddress: string }> {
  try {
    // Check if user already has a wallet of this type
    const existingWallets = await databases.listDocuments(
      WALLET_DATABASE_ID,
      WALLETS_COLLECTION_ID,
      [Query.equal('userId', userId), Query.equal('walletType', walletType)]
    );
    
    if (existingWallets.documents.length > 0) {
      return {
        walletId: existingWallets.documents[0].walletId,
        walletAddress: existingWallets.documents[0].walletAddress
      };
    }
    
    // Generate wallet address for custodial wallets if not provided
    let address = walletAddress || '';
    if (walletType === 'custodial' && !address) {
      // In a real implementation, you would use a secure method to generate or derive a wallet address
      address = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    }
    
    const walletId = ID.unique();
    
    await databases.createDocument(
      WALLET_DATABASE_ID,
      WALLETS_COLLECTION_ID,
      ID.unique(),
      {
        walletId,
        userId,
        walletAddress: address,
        walletType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    
    // Initialize with zero balance for ETH
    await databases.createDocument(
      WALLET_DATABASE_ID,
      BALANCES_COLLECTION_ID,
      ID.unique(),
      {
        balanceId: ID.unique(),
        walletId,
        currency: 'ETH',
        amount: 0,
        lastUpdated: new Date().toISOString()
      }
    );
    
    return { walletId, walletAddress: address };
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user's wallets
 */
export async function getUserWallets(userId: string) {
  try {
    const wallets = await databases.listDocuments(
      WALLET_DATABASE_ID,
      WALLETS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    
    return wallets.documents;
  } catch (error) {
    console.error('Error getting user wallets:', error);
    throw new Error(`Failed to get user wallets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get wallet balances
 */
export async function getWalletBalances(walletId: string) {
  try {
    const balances = await databases.listDocuments(
      WALLET_DATABASE_ID,
      BALANCES_COLLECTION_ID,
      [Query.equal('walletId', walletId)]
    );
    
    return balances.documents;
  } catch (error) {
    console.error('Error getting wallet balances:', error);
    throw new Error(`Failed to get wallet balances: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Record crypto transaction with detailed information
 */
export async function recordCryptoTransaction(
  userId: string,
  txHash: string,
  fromAddress: string,
  toAddress: string,
  value: string,
  network: string,
  gasPrice?: string,
  gasUsed?: string
) {
  try {
    // First get the user's wallet
    const wallets = await getUserWallets(userId);
    if (wallets.length === 0) {
      throw new Error('User has no wallet');
    }
    
    const walletId = wallets[0].walletId;
    
    // Create general transaction record
    const transactionId = ID.unique();
    await databases.createDocument(
      TRANSACTIONS_DATABASE_ID,
      TRANSACTIONS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        amount: formatEther(value), // Convert wei to ether for storage
        type: 'crypto',
        createdAt: new Date().toISOString(),
        status: 'pending',
        transactionId,
      }
    );
    
    // Create detailed crypto transaction record
    await databases.createDocument(
      WALLET_DATABASE_ID,
      CRYPTO_TRANSACTIONS_COLLECTION_ID,
      ID.unique(),
      {
        cryptoTxId: ID.unique(),
        transactionId,
        walletId,
        txHash,
        fromAddress,
        toAddress,
        status: 'pending',
        network,
        gasPrice: gasPrice ? parseFloat(formatEther(gasPrice)) : null,
        gasUsed: gasUsed ? parseFloat(gasUsed) : null,
      }
    );
    
    return { transactionId };
  } catch (error) {
    console.error('Error recording crypto transaction:', error);
    throw new Error(`Failed to record crypto transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  txHash: string,
  status: 'pending' | 'confirmed' | 'failed',
  blockNumber?: number
) {
  try {
    // First find the crypto transaction
    const txResponse = await databases.listDocuments(
      WALLET_DATABASE_ID,
      CRYPTO_TRANSACTIONS_COLLECTION_ID,
      [Query.equal('txHash', txHash)]
    );
    
    if (txResponse.documents.length === 0) {
      throw new Error('Transaction not found');
    }
    
    const cryptoTx = txResponse.documents[0];
    
    // Update crypto transaction status
    await databases.updateDocument(
      WALLET_DATABASE_ID,
      CRYPTO_TRANSACTIONS_COLLECTION_ID,
      cryptoTx.$id,
      {
        status,
        ...(blockNumber ? { blockNumber } : {}),
      }
    );
    
    // Also update the main transaction status
    const transactionId = cryptoTx.transactionId;
    const mainTxResponse = await databases.listDocuments(
      TRANSACTIONS_DATABASE_ID,
      TRANSACTIONS_COLLECTION_ID,
      [Query.equal('transactionId', transactionId)]
    );
    
    if (mainTxResponse.documents.length > 0) {
      const mainTx = mainTxResponse.documents[0];
      await databases.updateDocument(
        TRANSACTIONS_DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        mainTx.$id,
        { status }
      );
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw new Error(`Failed to update transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get transaction history for a wallet
 */
export async function getWalletTransactions(walletId: string) {
  try {
    const transactions = await databases.listDocuments(
      WALLET_DATABASE_ID,
      CRYPTO_TRANSACTIONS_COLLECTION_ID,
      [Query.equal('walletId', walletId)]
    );
    
    return transactions.documents;
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    throw new Error(`Failed to get wallet transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update wallet balance
 */
export async function updateWalletBalance(
  walletId: string,
  currency: string,
  newAmount: number
) {
  try {
    // Check if balance record exists
    const balances = await databases.listDocuments(
      WALLET_DATABASE_ID,
      BALANCES_COLLECTION_ID,
      [Query.equal('walletId', walletId), Query.equal('currency', currency)]
    );
    
    const now = new Date().toISOString();
    
    if (balances.documents.length > 0) {
      // Update existing balance
      const balance = balances.documents[0];
      await databases.updateDocument(
        WALLET_DATABASE_ID,
        BALANCES_COLLECTION_ID,
        balance.$id,
        {
          amount: newAmount,
          lastUpdated: now
        }
      );
    } else {
      // Create new balance record
      await databases.createDocument(
        WALLET_DATABASE_ID,
        BALANCES_COLLECTION_ID,
        ID.unique(),
        {
          balanceId: ID.unique(),
          walletId,
          currency,
          amount: newAmount,
          lastUpdated: now
        }
      );
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    throw new Error(`Failed to update wallet balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all user transactions (both general and crypto)
 */
export async function getUserTransactions(userId: string) {
  try {
    // Get general transactions
    const transactions = await databases.listDocuments(
      TRANSACTIONS_DATABASE_ID,
      TRANSACTIONS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    
    // Get wallet IDs for this user
    const wallets = await getUserWallets(userId);
    const walletIds = wallets.map(wallet => wallet.walletId);
    
    // If user has no wallets, just return the general transactions
    if (walletIds.length === 0) {
      return transactions.documents;
    }
    
    // For each transaction, get detailed crypto info if applicable
    const enrichedTransactions = await Promise.all(
      transactions.documents.map(async (tx) => {
        if (tx.type === 'crypto') {
          try {
            const cryptoTxResponse = await databases.listDocuments(
              WALLET_DATABASE_ID,
              CRYPTO_TRANSACTIONS_COLLECTION_ID,
              [Query.equal('transactionId', tx.transactionId)]
            );
            
            if (cryptoTxResponse.documents.length > 0) {
              return {
                ...tx,
                cryptoDetails: cryptoTxResponse.documents[0]
              };
            }
          } catch (err) {
            console.error('Error fetching crypto details:', err);
          }
        }
        return tx;
      })
    );
    
    return enrichedTransactions;
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw new Error(`Failed to get user transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
