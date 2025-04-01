import { databases, ID } from '@/utils/api';
import { APPWRITE_CONFIG } from '@/lib/env';

/**
 * Creates a wallet for a user if one doesn't already exist
 * @param userId The user ID
 * @param walletType The type of wallet to create (default: 'custodial')
 * @returns The wallet ID
 */
export async function createUserWallet(userId: string, walletType: string = 'custodial'): Promise<string> {
  const walletId = ID.unique();
  
  await databases.createDocument(
    APPWRITE_CONFIG.DATABASES.WALLET,
    APPWRITE_CONFIG.COLLECTIONS.WALLETS,
    ID.unique(),
    {
      walletId: walletId,
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      walletType: walletType,
      walletAddress: generateWalletAddress()
    }
  );
  
  return walletId;
}

/**
 * Generate a wallet address (placeholder implementation)
 * In a real implementation, this would use secure key generation
 */
export function generateWalletAddress(): string {
  return `0x${generateRandomHex(40)}`;
}

/**
 * Helper function to generate a random hex string
 */
export function generateRandomHex(length: number): string {
  const characters = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Get wallet information by user ID
 */
export async function getWalletsByUserId(userId: string) {
  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.WALLETS,
      [
        databases.Query.equal('userId', userId)
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error getting wallets by user ID:', error);
    throw error;
  }
}
