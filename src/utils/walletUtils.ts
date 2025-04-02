import { account, ID, databases } from './api';
import { wallets } from './dbWrapper';
import { APPWRITE_CONFIG } from '@/lib/env';

/**
 * Wallet authentication and management utilities
 */

/**
 * Generate a random wallet address for demonstration/testing purposes
 * @returns A wallet address string in the format 0x...
 */
export function generateWalletAddress(): string {
  // Generate a random 40-character hex string for the address
  const characters = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return address;
}

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
    // Check if we already have a wallet with this address
    const existingWallets = await wallets.listByUser(userId);
    
    for (const wallet of existingWallets.documents) {
      if (wallet.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
        // Wallet already linked
        return wallet;
      }
    }
    
    // Create a new wallet record
    const walletId = ID.unique();
    const result = await wallets.create({
      walletId,
      userId,
      walletAddress,
      walletType,
      chainId: chainId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return result;
  } catch (error) {
    console.error('Error linking wallet to user:', error);
    return null;
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
    const walletData = {
      lastUsed: new Date().toISOString()
    };
    
    return await wallets.update(walletId, walletData);
  } catch (error) {
    console.error('Error updating wallet timestamp:', error);
    return null;
  }
}
