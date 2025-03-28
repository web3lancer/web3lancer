import { ID } from 'appwrite';
import { databases, client } from '@/utils/api';
import { NEW_SCHEMAS } from '@/lib/schema';

/**
 * Wallet Service
 * 
 * This service handles operations related to cryptocurrency wallets.
 * Note: This will use the new schema that needs to be added to Appwrite.
 */

/**
 * Create a new wallet for a user
 */
export async function createWallet(userId: string, walletType: string = 'custodial') {
  try {
    // Create a wallet address (in a real implementation, this would involve secure key generation)
    const walletAddress = `0x${generateRandomHex(40)}`; // Ethereum-style address for example
    
    // Create the wallet document
    const wallet = await databases.createDocument(
      NEW_SCHEMAS.WALLET_DATABASE.ID,
      NEW_SCHEMAS.WALLET_DATABASE.COLLECTIONS.WALLETS.ID,
      ID.unique(),
      {
        userId,
        walletAddress,
        walletType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    
    // Initialize with zero balances for common cryptocurrencies
    await Promise.all([
      createBalance(wallet.$id, 'BTC', 0),
      createBalance(wallet.$id, 'ETH', 0),
      createBalance(wallet.$id, 'USD', 0),
    ]);
    
    return wallet;
  } catch (error) {
    console.error('Error creating wallet:', error);
    throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a balance entry for a wallet
 */
async function createBalance(walletId: string, currency: string, amount: number = 0) {
  try {
    return await databases.createDocument(
      NEW_SCHEMAS.WALLET_DATABASE.ID,
      NEW_SCHEMAS.WALLET_DATABASE.COLLECTIONS.BALANCES.ID,
      ID.unique(),
      {
        walletId,
        currency,
        amount,
        lastUpdated: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error(`Error creating ${currency} balance:`, error);
    throw new Error(`Failed to create balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a user's wallet
 */
export async function getUserWallet(userId: string) {
  try {
    const response = await databases.listDocuments(
      NEW_SCHEMAS.WALLET_DATABASE.ID,
      NEW_SCHEMAS.WALLET_DATABASE.COLLECTIONS.WALLETS.ID,
      [
        databases.Query.equal('userId', userId)
      ]
    );
    
    if (response.documents.length === 0) {
      // No wallet found, create one
      return await createWallet(userId);
    }
    
    return response.documents[0];
  } catch (error) {
    console.error('Error getting user wallet:', error);
    throw new Error(`Failed to get wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get wallet balances
 */
export async function getWalletBalances(walletId: string) {
  try {
    const response = await databases.listDocuments(
      NEW_SCHEMAS.WALLET_DATABASE.ID,
      NEW_SCHEMAS.WALLET_DATABASE.COLLECTIONS.BALANCES.ID,
      [
        databases.Query.equal('walletId', walletId)
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error getting wallet balances:', error);
    throw new Error(`Failed to get balances: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update a wallet balance
 */
export async function updateBalance(walletId: string, currency: string, amount: number) {
  try {
    // Find the existing balance
    const response = await databases.listDocuments(
      NEW_SCHEMAS.WALLET_DATABASE.ID,
      NEW_SCHEMAS.WALLET_DATABASE.COLLECTIONS.BALANCES.ID,
      [
        databases.Query.equal('walletId', walletId),
        databases.Query.equal('currency', currency)
      ]
    );
    
    if (response.documents.length === 0) {
      // Balance doesn't exist, create it
      return await createBalance(walletId, currency, amount);
    }
    
    // Update the existing balance
    const balance = response.documents[0];
    return await databases.updateDocument(
      NEW_SCHEMAS.WALLET_DATABASE.ID,
      NEW_SCHEMAS.WALLET_DATABASE.COLLECTIONS.BALANCES.ID,
      balance.$id,
      {
        amount,
        lastUpdated: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error(`Error updating ${currency} balance:`, error);
    throw new Error(`Failed to update balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Record a crypto transaction
 */
export async function recordCryptoTransaction(
  transactionId: string,
  walletId: string,
  txHash: string,
  fromAddress: string,
  toAddress: string,
  network: string,
  status: string = 'pending',
  blockNumber?: number,
  gasPrice?: number,
  gasUsed?: number
) {
  try {
    return await databases.createDocument(
      NEW_SCHEMAS.WALLET_DATABASE.ID,
      NEW_SCHEMAS.WALLET_DATABASE.COLLECTIONS.CRYPTO_TRANSACTIONS.ID,
      ID.unique(),
      {
        transactionId,
        walletId,
        txHash,
        fromAddress,
        toAddress,
        network,
        status,
        blockNumber,
        gasPrice,
        gasUsed,
      }
    );
  } catch (error) {
    console.error('Error recording crypto transaction:', error);
    throw new Error(`Failed to record transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function to generate a random hex string
 */
function generateRandomHex(length: number): string {
  const characters = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
