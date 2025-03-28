import { useState, useEffect } from 'react';
import { getUserWallet, getWalletBalances } from '@/services/wallet';
import { processAndRecordPayment } from '@/services/integration';

/**
 * Hook for wallet management
 */
export function useWallet(userId: string) {
  const [wallet, setWallet] = useState<any>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const loadWallet = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get or create wallet
        const walletData = await getUserWallet(userId);
        setWallet(walletData);
        
        // Get balances
        const balancesData = await getWalletBalances(walletData.$id);
        setBalances(balancesData);
      } catch (err) {
        console.error('Error loading wallet:', err);
        setError(err instanceof Error ? err.message : 'Unknown error loading wallet');
      } finally {
        setLoading(false);
      }
    };
    
    loadWallet();
  }, [userId]);

  /**
   * Send cryptocurrency to another address
   */
  const sendCrypto = async (amount: number, currency: string, toAddress: string) => {
    if (!wallet) {
      throw new Error('Wallet not loaded');
    }
    
    try {
      const result = await processAndRecordPayment(
        userId,
        amount,
        currency,
        'crypto',
        `Send ${amount} ${currency} to ${toAddress}`
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }
      
      // Refresh balances
      const balancesData = await getWalletBalances(wallet.$id);
      setBalances(balancesData);
      
      return result;
    } catch (err) {
      console.error('Error sending crypto:', err);
      throw new Error(err instanceof Error ? err.message : 'Unknown error sending crypto');
    }
  };

  /**
   * Add funds to wallet
   */
  const addFunds = async (amount: number, currency: string, paymentMethod: string) => {
    if (!wallet) {
      throw new Error('Wallet not loaded');
    }
    
    try {
      const result = await processAndRecordPayment(
        userId,
        amount,
        currency,
        paymentMethod,
        `Add ${amount} ${currency} to wallet`
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }
      
      // Refresh balances
      const balancesData = await getWalletBalances(wallet.$id);
      setBalances(balancesData);
      
      return result;
    } catch (err) {
      console.error('Error adding funds:', err);
      throw new Error(err instanceof Error ? err.message : 'Unknown error adding funds');
    }
  };

  return {
    wallet,
    balances,
    loading,
    error,
    sendCrypto,
    addFunds,
  };
}
