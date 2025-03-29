import { useState, useEffect } from 'react';
import { ID, databases } from '@/utils/api';
import { APPWRITE_CONFIG } from '@/lib/env';

interface Wallet {
  $id: string;
  walletId: string;
  userId: string;
  walletAddress: string;
  walletType: string;
  createdAt: string;
  updatedAt: string;
}

interface Balance {
  $id: string;
  balanceId: string;
  walletId: string;
  currency: string;
  amount: number;
  lastUpdated: string;
}

export function useWallet(userId: string) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = async () => {
    try {
      // Check if user already has a wallet
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASES.WALLET,
        APPWRITE_CONFIG.COLLECTIONS.WALLETS,
        [{ key: 'userId', value: userId }]
      );

      if (response.documents.length > 0) {
        setWallet(response.documents[0] as Wallet);
        return response.documents[0].$id;
      } else {
        // Create new wallet for user
        const newWallet = await createWallet(userId);
        setWallet(newWallet as Wallet);
        return newWallet.$id;
      }
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setError('Failed to fetch wallet. Please try again later.');
      return null;
    }
  };

  const fetchBalances = async (walletId: string) => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASES.WALLET,
        APPWRITE_CONFIG.COLLECTIONS.BALANCES,
        [{ key: 'walletId', value: walletId }]
      );
      
      if (response.documents.length > 0) {
        setBalances(response.documents as Balance[]);
      } else {
        // Create default balances
        const defaultBalances = await createDefaultBalances(walletId);
        setBalances(defaultBalances);
      }
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError('Failed to fetch wallet balances. Please try again later.');
    }
  };

  const createWallet = async (userId: string) => {
    // Generate a demo wallet address (in real app this would be a proper crypto wallet)
    const walletAddress = `0x${Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    const walletData = {
      walletId: ID.unique(),
      userId: userId,
      walletAddress: walletAddress,
      walletType: 'custodial', // Default to custodial wallet
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return await databases.createDocument(
      APPWRITE_CONFIG.DATABASES.WALLET,
      APPWRITE_CONFIG.COLLECTIONS.WALLETS,
      ID.unique(),
      walletData
    );
  };

  const createDefaultBalances = async (walletId: string) => {
    const defaultCurrencies = ['BTC', 'ETH', 'USDT'];
    const balancesPromises = defaultCurrencies.map(currency => 
      databases.createDocument(
        APPWRITE_CONFIG.DATABASES.WALLET,
        APPWRITE_CONFIG.COLLECTIONS.BALANCES,
        ID.unique(),
        {
          balanceId: ID.unique(),
          walletId: walletId,
          currency: currency,
          amount: currency === 'USDT' ? 100 : 0.01, // Give some demo funds
          lastUpdated: new Date().toISOString()
        }
      )
    );
    
    const results = await Promise.all(balancesPromises);
    return results;
  };

  const sendCrypto = async (amount: number, currency: string, toAddress: string) => {
    try {
      if (!wallet) throw new Error('Wallet not initialized');
      
      // Find the balance for this currency
      const targetBalance = balances.find(b => b.currency === currency);
      if (!targetBalance) throw new Error(`No ${currency} balance found`);
      
      if (targetBalance.amount < amount) {
        throw new Error(`Insufficient ${currency} balance`);
      }
      
      // Create a transaction record
      const txData = {
        cryptoTxId: ID.unique(),
        transactionId: ID.unique(),
        walletId: wallet.walletId,
        txHash: `0x${Array.from({length: 64}, () => 
          Math.floor(Math.random() * 16).toString(16)).join('')}`,
        blockNumber: Math.floor(Math.random() * 1000000),
        fromAddress: wallet.walletAddress,
        toAddress: toAddress,
        status: 'confirmed',
        network: currency === 'ETH' ? 'ethereum' : 
                 currency === 'BTC' ? 'bitcoin' : 'tether',
        gasPrice: 0.0001,
        gasUsed: 0.0001
      };
      
      await databases.createDocument(
        APPWRITE_CONFIG.DATABASES.WALLET,
        APPWRITE_CONFIG.COLLECTIONS.CRYPTO_TRANSACTIONS,
        ID.unique(),
        txData
      );
      
      // Update balance
      await databases.updateDocument(
        APPWRITE_CONFIG.DATABASES.WALLET,
        APPWRITE_CONFIG.COLLECTIONS.BALANCES,
        targetBalance.$id,
        {
          amount: targetBalance.amount - amount - 0.0001, // Subtract amount + gas
          lastUpdated: new Date().toISOString()
        }
      );
      
      // Refresh balances
      fetchBalances(wallet.walletId);
      
      return { success: true, data: txData };
    } catch (err) {
      console.error('Error sending crypto:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error processing transaction'
      };
    }
  };

  useEffect(() => {
    const initWallet = async () => {
      setLoading(true);
      setError(null);
      try {
        const walletId = await fetchWallet();
        if (walletId) {
          await fetchBalances(walletId);
        }
      } catch (err) {
        console.error('Error initializing wallet:', err);
        setError('Failed to initialize wallet. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      initWallet();
    }
  }, [userId]);

  return {
    wallet,
    balances,
    loading,
    error,
    sendCrypto
  };
}
