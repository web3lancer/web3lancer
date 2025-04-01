import { account, ID, databases } from './api';
import { wallets } from './dbWrapper';
import { APPWRITE_CONFIG } from '@/lib/env';

/**
 * Wallet authentication and management utilities
 */

/**
 * Check if the current session has access to the wallet
 * @param walletId ID of the wallet to check
 * @returns Whether the current user has access to the wallet
 */
export async function verifyWalletAccess(walletId: string): Promise<boolean> {
  try {
    // First, check if we have a valid session
    const user = await account.get();
    if (!user) return false;
    
    // Then check if the wallet belongs to this user
    const walletData = await wallets.get(walletId);
    return walletData?.userId === user.$id;
  } catch (error) {
    console.error('Error verifying wallet access:', error);
    return false;
  }
}

/**
 * Link a wallet address to a user account
 * 
 * @param userId User ID to link the wallet to
 * @param walletAddress The blockchain wallet address
 * @param walletType Type of wallet (e.g., 'metamask', 'phantom', etc.)
 * @param chainId Optional chain ID for the wallet
 * @returns The created wallet object or null if failed
 */
export async function linkWalletToUser(
  userId: string, 
  walletAddress: string,
  walletType: string,
  chainId?: number
) {
  try {
    // Check if the wallet is already linked to this user
    const existingWallets = await wallets.listByUser(userId);
    const alreadyLinked = existingWallets.documents.find(
      wallet => wallet.address?.toLowerCase() === walletAddress.toLowerCase()
    );
    
    if (alreadyLinked) {
      return alreadyLinked; // Wallet already linked
    }
    
    // Create a wallet record
    const walletData = {
      userId: userId,
      address: walletAddress,
      type: walletType,
      chainId: chainId || null,
      isPrimary: existingWallets.documents.length === 0, // First wallet is primary
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    // Save the wallet in the database
    return await wallets.create(walletData);
  } catch (error) {
    console.error('Error linking wallet to user:', error);
    throw new Error('Failed to link wallet to user account');
  }
}

/**
 * Update the last used timestamp for a wallet
 * 
 * @param walletId ID of the wallet to update
 * @returns Updated wallet object or null if failed
 */
export async function updateWalletLastUsed(walletId: string) {
  try {
    // Verify access first
    if (!(await verifyWalletAccess(walletId))) {
      throw new Error('Access to wallet denied');
    }
    
    return await wallets.update(walletId, {
      lastUsed: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating wallet last used:', error);
    return null;
  }
}
