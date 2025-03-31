import { useState, useEffect } from 'react';
import { walletStore } from '@/utils/stellar/walletStore';
import { getAccountBalance, submit, fundWithFriendbot, accountExists } from '@/utils/stellar/horizonQueries';
import { Keypair, Transaction } from '@stellar/stellar-sdk';

export function useStellarWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [balances, setBalances] = useState<Array<{asset: string, balance: string}>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to wallet store changes
    const unsubscribe = walletStore.subscribe((state) => {
      setPublicKey(state.publicKey);
      setHasWallet(!!state.publicKey && state.hasSecret);
      
      if (state.publicKey) {
        loadBalance(state.publicKey);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const loadBalance = async (key: string) => {
    if (!key) return;
    
    setLoading(true);
    try {
      const fetchedBalances = await getAccountBalance(key);
      setBalances(fetchedBalances);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading balance');
    } finally {
      setLoading(false);
    }
  };

  const fundAccount = async () => {
    if (!publicKey) {
      setError('No public key available');
      return;
    }
    
    setLoading(true);
    try {
      await fundWithFriendbot(publicKey);
      await loadBalance(publicKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error funding account');
    } finally {
      setLoading(false);
    }
  };

  const signTransaction = async (xdr: string, network: string, pincode: string) => {
    setLoading(true);
    try {
      return await walletStore.sign({
        transactionXDR: xdr,
        network,
        pincode
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error signing transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitTransaction = async (transaction: Transaction) => {
    setLoading(true);
    try {
      return await submit(transaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async (pincode: string) => {
    setLoading(true);
    try {
      const keypair = Keypair.random();
      await walletStore.register({
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret(),
        pincode
      });
      
      // Check if account exists, if not fund it
      const exists = await accountExists(keypair.publicKey());
      if (!exists) {
        await fundWithFriendbot(keypair.publicKey());
      }
      
      await loadBalance(keypair.publicKey());
      return keypair.publicKey();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const importWallet = async (secretKey: string, pincode: string) => {
    setLoading(true);
    try {
      const keypair = Keypair.fromSecret(secretKey);
      await walletStore.register({
        publicKey: keypair.publicKey(),
        secretKey: secretKey,
        pincode
      });
      await loadBalance(keypair.publicKey());
      return keypair.publicKey();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error importing wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearWallet = () => {
    walletStore.clear();
    setBalances([]);
  };

  return {
    publicKey,
    hasWallet,
    balances,
    loading,
    error,
    loadBalance,
    fundAccount,
    signTransaction,
    submitTransaction,
    createWallet,
    importWallet,
    clearWallet
  };
}
