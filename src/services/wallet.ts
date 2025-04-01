import { ID } from 'appwrite';
import { databases } from '@/utils/api';
import { APPWRITE_CONFIG } from '@/lib/env';
import { generateWalletAddress } from '@/utils/walletUtils';

/**
 * Wallet Service
 * 
 * This service handles operations related to cryptocurrency wallets.
 */

/**
 * Create a new wallet for a user
 */
export async function createWallet(userId: string, walletType: string = 'custodial') {
  try {
    // Create a wallet address (in a real implementation, this would involve secure key generation)
    const walletAddress = generateWalletAddress();
    
    // Create the wallet document
    const wallet = await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.WALLETS,
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
export async function createBalance(walletId: string, currency: string, amount: number = 0) {
  try {
    return await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.BALANCES,
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
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.WALLETS,
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

// Export remaining functions directly, no need to duplicate from cryptoService
export { 
  getWalletBalances,
  updateBalance, 
  recordCryptoTransaction 
} from '@/services/cryptoService';
