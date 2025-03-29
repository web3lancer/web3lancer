import { useState, useEffect } from 'react';
import { databases } from '@/utils/api';
import { APPWRITE_CONFIG } from '@/lib/env';
import { Query } from 'appwrite';

export function useWallet(userId: string) {
  const [wallet, setWallet] = useState<any>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchWalletData();
    }
  }, [userId]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch wallet data
      const walletResponse = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASES.WALLET,
        APPWRITE_CONFIG.COLLECTIONS.WALLETS,
        [Query.equal('userId', userId)]
      );
      
      if (walletResponse.documents.length > 0) {
        const userWallet = walletResponse.documents[0];
        setWallet(userWallet);
        
        // Fetch balances for this wallet
        const balancesResponse = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASES.WALLET,
          APPWRITE_CONFIG.COLLECTIONS.BALANCES,
          [Query.equal('walletId', userWallet.$id)]
        );
        
        setBalances(balancesResponse.documents);
      } else {
        // Create a default wallet if none exists
        const walletId = crypto.randomUUID();
        const walletAddress = `0x${Array.from({length: 40}, () => 
          Math.floor(Math.random() * 16).toString(16)).join('')}`;
          
        const newWallet = await databases.createDocument(
          APPWRITE_CONFIG.DATABASES.WALLET,
          APPWRITE_CONFIG.COLLECTIONS.WALLETS,
          walletId,
          {
            userId,
            walletAddress,
            walletType: 'custodial',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        );
        
        setWallet(newWallet);
        
        // Create default balances
        const defaultBalances = [
          { currency: 'USD', amount: 0 },
          { currency: 'ETH', amount: 0 },
          { currency: 'BTC', amount: 0 },
        ];
        
        const balancePromises = defaultBalances.map(balance => 
          databases.createDocument(
            APPWRITE_CONFIG.DATABASES.WALLET,
            APPWRITE_CONFIG.COLLECTIONS.BALANCES,
            crypto.randomUUID(),
            {
              walletId: newWallet.$id,
              currency: balance.currency,
              amount: balance.amount,
              lastUpdated: new Date().toISOString(),
            }
          )
        );
        
        const createdBalances = await Promise.all(balancePromises);
        setBalances(createdBalances);
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError("Failed to load wallet data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendCrypto = async (to: string, amount: number, currency: string) => {
    // Implementation for sending crypto would go here
    console.log(`Sending ${amount} ${currency} to ${to}`);
  };

  const addFunds = async (amount: number, currency: string) => {
    // Implementation for adding funds would go here
    console.log(`Adding ${amount} ${currency} to wallet`);
  };

  return { wallet, balances, loading, error, sendCrypto, addFunds };
}
