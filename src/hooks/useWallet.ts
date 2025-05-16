import { useState, useEffect } from 'react';
import { databases, ID } from '@/utils/api';
import { Models } from 'appwrite';

interface WalletData {
  walletAddress: string;
  walletType: string;
  userId: string;
  balance?: string;
}

export const useWallet = (userId: string) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Query for the user's wallet
        const walletsResponse = await databases.listDocuments(
          process.env.NEXT_PUBLIC_DATABASES_WALLET as string, 
          process.env.NEXT_PUBLIC_COLLECTIONS_WALLETS as string,
          [/* Query.equal('userId', userId) */] // Commented out for mock implementation
        );
        
        if (walletsResponse.documents.length > 0) {
          // User has a wallet
          setWallet(walletsResponse.documents[0] as unknown as WalletData);
        } else {
          // Create a mock wallet for demonstration
          const mockWallet: WalletData = {
            walletAddress: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
            walletType: 'ethereum',
            userId
          };
          setWallet(mockWallet);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching wallet:', err);
        setError(err.message || 'Failed to load wallet');
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [userId]);

  const createWallet = async (walletType: string, address?: string) => {
    if (!userId) {
      throw new Error('User ID is required to create a wallet');
    }
    
    try {
      setLoading(true);
      
      // Use provided address or generate a mock one
      const walletAddress = address || '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Create a new wallet document
      const newWallet = {
        userId,
        walletType,
        walletAddress,
        createdAt: new Date().toISOString()
      };
      
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASES_WALLET as string,
        process.env.NEXT_PUBLIC_COLLECTIONS_WALLETS as string,
        ID.unique(),
        newWallet
      );
      
      setWallet(response as unknown as WalletData);
      setError(null);
      return response;
    } catch (err: any) {
      console.error('Error creating wallet:', err);
      setError(err.message || 'Failed to create wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { wallet, loading, error, createWallet };
};
