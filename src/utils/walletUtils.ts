import { account, ID, databases } from './api';
import { wallets } from './dbWrapper';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64 } from '@mysten/sui.js/utils';

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

// Wallet connection and management utilities
export class SuiWalletUtils {
  private static instance: SuiWalletUtils;
  private keypair: Ed25519Keypair | null = null;
  private connected: boolean = false;

  static getInstance(): SuiWalletUtils {
    if (!SuiWalletUtils.instance) {
      SuiWalletUtils.instance = new SuiWalletUtils();
    }
    return SuiWalletUtils.instance;
  }

  // For development: create a keypair from private key
  connectWithPrivateKey(privateKey: string): { success: boolean; address?: string; error?: string } {
    try {
      // Remove 0x prefix if present
      const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
      
      // Convert hex string to Uint8Array
      const privateKeyBytes = new Uint8Array(
        cleanPrivateKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
      
      this.keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
      this.connected = true;
      
      return {
        success: true,
        address: this.keypair.getPublicKey().toSuiAddress(),
      };
    } catch (error) {
      console.error('Failed to connect with private key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Generate a new keypair for testing
  generateKeypair(): { keypair: Ed25519Keypair; address: string; privateKey: string } {
    const keypair = new Ed25519Keypair();
    const address = keypair.getPublicKey().toSuiAddress();
    const privateKey = keypair.export().privateKey;
    
    return {
      keypair,
      address,
      privateKey,
    };
  }

  // Connect with existing keypair
  connectWithKeypair(keypair: Ed25519Keypair): void {
    this.keypair = keypair;
    this.connected = true;
  }

  // Get current keypair
  getKeypair(): Ed25519Keypair | null {
    return this.keypair;
  }

  // Get current address
  getAddress(): string | null {
    if (!this.keypair) return null;
    return this.keypair.getPublicKey().toSuiAddress();
  }

  // Check if connected
  isConnected(): boolean {
    return this.connected && this.keypair !== null;
  }

  // Disconnect
  disconnect(): void {
    this.keypair = null;
    this.connected = false;
  }

  // Export keypair (for backup/storage)
  exportKeypair(): string | null {
    if (!this.keypair) return null;
    return this.keypair.export().privateKey;
  }

  // Import keypair from exported format
  importKeypair(privateKey: string): boolean {
    try {
      const result = this.connectWithPrivateKey(privateKey);
      return result.success;
    } catch (error) {
      console.error('Failed to import keypair:', error);
      return false;
    }
  }
}

// Type definitions for wallet integration
export interface WalletConnection {
  isConnected: boolean;
  address: string | null;
  keypair: Ed25519Keypair | null;
}

export interface TransactionResult {
  success: boolean;
  txDigest?: string;
  error?: string;
  objectChanges?: any[];
}

// Hook-like function for wallet state (can be converted to actual hook later)
export const useWalletConnection = () => {
  const wallet = SuiWalletUtils.getInstance();
  
  return {
    isConnected: wallet.isConnected(),
    address: wallet.getAddress(),
    keypair: wallet.getKeypair(),
    connect: (privateKey: string) => wallet.connectWithPrivateKey(privateKey),
    disconnect: () => wallet.disconnect(),
    generateKeypair: () => wallet.generateKeypair(),
  };
};

// Export singleton instance
export const suiWallet = SuiWalletUtils.getInstance();
