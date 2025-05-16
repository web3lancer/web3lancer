/**
 * Cryptocurrency Service
 * 
 * This service handles all crypto-related operations including wallet management,
 * transactions, and balances.
 */

import { databases, ID } from '@/utils/api';
import { parseEther, formatEther } from '@/utils/transactionUtils';
import { generateWalletAddress } from '@/utils/walletUtils';

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
      process.env.DATABASES_WALLET,
      process.env.COLLECTIONS_WALLETS,
      [databases.Query.equal('userId', userId), databases.Query.equal('walletType', walletType)]
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
      address = generateWalletAddress();
    }
    
    const walletId = ID.unique();
    
    await databases.createDocument(
      process.env.DATABASES_WALLET,
      process.env.COLLECTIONS_WALLETS,
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
      process.env.DATABASES_WALLET,
      process.env.COLLECTIONS_BALANCES,
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
      process.env.DATABASES_WALLET,
      process.env.COLLECTIONS_WALLETS,
      [databases.Query.equal('userId', userId)]
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
      process.env.DATABASES_WALLET,
      process.env.COLLECTIONS_BALANCES,
      [databases.Query.equal('walletId', walletId)]
    );
    
    return balances.documents;
  } catch (error) {
    console.error('Error getting wallet balances:', error);
    throw new Error(`Failed to get wallet balances: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user's crypto transactions
 */
export async function getUserCryptoTransactions(userId: string) {
  try {
    // First get user wallets
    const wallets = await getUserWallets(userId);
    if (wallets.length === 0) return [];
    
    // Create a query to get transactions for all wallets
    const walletIds = wallets.map(wallet => wallet.walletId);
    
    // Get transactions for each wallet
    const transactions = await Promise.all(
      walletIds.map(async (walletId) => {
        const txs = await databases.listDocuments(
          process.env.DATABASES_WALLET,
          process.env.COLLECTIONS_CRYPTO_TRANSACTIONS,
          [databases.Query.equal('walletId', walletId)]
        );
        return txs.documents;
      })
    );
    
    // Flatten the array of arrays
    return transactions.flat();
  } catch (error) {
    console.error('Error getting user crypto transactions:', error);
    throw new Error(`Failed to get user crypto transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    // First get the user's wallet or create one if none exists
    const wallets = await getUserWallets(userId);
    let walletId;
    
    if (wallets.length === 0) {
      // Create a new wallet for the user
      const newWallet = await createWallet(userId, 'custodial');
      walletId = newWallet.walletId;
    } else {
      walletId = wallets[0].walletId;
    }
    
    // Create general transaction record
    const transactionId = ID.unique();
    await databases.createDocument(
      process.env.DATABASES_TRANSACTIONS,
      process.env.COLLECTIONS_TRANSACTIONS,
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
      process.env.DATABASES_WALLET,
      process.env.COLLECTIONS_CRYPTO_TRANSACTIONS,
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
    // Find the crypto transaction
    const txResponse = await databases.listDocuments(
      process.env.DATABASES_WALLET,
      process.env.COLLECTIONS_CRYPTO_TRANSACTIONS,
      [databases.Query.equal('txHash', txHash)]
    );
    
    if (txResponse.documents.length === 0) {
      throw new Error('Transaction not found');
    }
    
    const cryptoTx = txResponse.documents[0];
    
    // Update crypto transaction status
    await databases.updateDocument(
      process.env.DATABASES_WALLET,
      process.env.COLLECTIONS_CRYPTO_TRANSACTIONS,
      cryptoTx.$id,
      {
        status,
        ...(blockNumber ? { blockNumber } : {}),
      }
    );
    
    // Also update the main transaction status
    const transactionId = cryptoTx.transactionId;
    const mainTxResponse = await databases.listDocuments(
      process.env.DATABASES_TRANSACTIONS,
      process.env.COLLECTIONS_TRANSACTIONS,
      [databases.Query.equal('transactionId', transactionId)]
    );
    
    if (mainTxResponse.documents.length > 0) {
      const mainTx = mainTxResponse.documents[0];
      await databases.updateDocument(
        process.env.DATABASES_TRANSACTIONS,
        process.env.COLLECTIONS_TRANSACTIONS,
        mainTx.$id,
        { status }
      );
    }
    
    // Create a notification about the transaction status
    const notification = `Your transaction ${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)} is now ${status}`;
    
    await databases.createDocument(
      process.env.DATABASES_NOTIFICATIONS,
      process.env.COLLECTIONS_NOTIFICATIONS,
      ID.unique(),
      {
        userId: cryptoTx.userId || '', // This might need to be fetched from another query if not stored
        message: notification,
        createdAt: new Date().toISOString(),
        type: 'transaction',
        notificationId: ID.unique(),
        read: false,
      }
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw new Error(`Failed to update transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update wallet balance
 */
export async function updateBalance(
  walletId: string,
  currency: string,
  newAmount: number
) {
  try {
    // Check if balance record exists
    const balances = await databases.listDocuments(
      process.env.DATABASES_WALLET,
      process.env.COLLECTIONS_BALANCES,
      [
        databases.Query.equal('walletId', walletId), 
        databases.Query.equal('currency', currency)
      ]
    );
    
    const now = new Date().toISOString();
    
    if (balances.documents.length > 0) {
      // Update existing balance
      const balance = balances.documents[0];
      await databases.updateDocument(
        process.env.DATABASES_WALLET,
        process.env.COLLECTIONS_BALANCES,
        balance.$id,
        {
          amount: newAmount,
          lastUpdated: now
        }
      );
    } else {
      // Create new balance record
      await databases.createDocument(
        process.env.DATABASES_WALLET,
        process.env.COLLECTIONS_BALANCES,
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
 * Add a payment method for a user
 */
export async function addCryptoPaymentMethod(
  userId: string,
  walletAddress: string,
  isDefault: boolean = false
) {
  try {
    const response = await databases.createDocument(
      process.env.DATABASES_PAYMENT_METHODS,
      process.env.COLLECTIONS_PAYMENT_METHODS,
      ID.unique(),
      {
        paymentMethodId: ID.unique(),
        userId,
        type: 'crypto',
        details: JSON.stringify({ walletAddress }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefault,
      }
    );
    
    return response;
  } catch (error) {
    console.error('Error adding crypto payment method:', error);
    throw new Error(`Failed to add payment method: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user's crypto payment methods
 */
export async function getUserCryptoPaymentMethods(userId: string) {
  try {
    const response = await databases.listDocuments(
      process.env.DATABASES_PAYMENT_METHODS,
      process.env.COLLECTIONS_PAYMENT_METHODS,
      [
        databases.Query.equal('userId', userId), 
        databases.Query.equal('type', 'crypto')
      ]
    );
    
    return response.documents.map(doc => ({
      ...doc,
      details: JSON.parse(doc.details || '{}')
    }));
  } catch (error) {
    console.error('Error getting crypto payment methods:', error);
    throw new Error(`Failed to get payment methods: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
