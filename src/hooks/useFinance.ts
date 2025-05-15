import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook for managing user wallets
 */
export function useWallets() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user wallets
  const fetchWallets = useCallback(async () => {
    if (!user) {
      setWallets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/wallet');
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallets');
      }
      
      const data = await response.json();
      setWallets(data.wallets);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching wallets:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new wallet
  const createWallet = useCallback(async (walletData) => {
    try {
      setError(null);
      
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(walletData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create wallet');
      }
      
      const data = await response.json();
      
      // Refresh wallets
      fetchWallets();
      
      return data.wallet;
    } catch (err) {
      setError(err.message);
      console.error('Error creating wallet:', err);
      throw err;
    }
  }, [fetchWallets]);

  // Update a wallet
  const updateWallet = useCallback(async (walletId, updateData) => {
    try {
      setError(null);
      
      const response = await fetch('/api/wallet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletId,
          ...updateData,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update wallet');
      }
      
      const data = await response.json();
      
      // Refresh wallets
      fetchWallets();
      
      return data.wallet;
    } catch (err) {
      setError(err.message);
      console.error('Error updating wallet:', err);
      throw err;
    }
  }, [fetchWallets]);

  // Delete a wallet
  const deleteWallet = useCallback(async (walletId) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/wallet?walletId=${walletId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete wallet');
      }
      
      // Refresh wallets
      fetchWallets();
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting wallet:', err);
      throw err;
    }
  }, [fetchWallets]);

  // Load wallets on initial render and when user changes
  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return {
    wallets,
    loading,
    error,
    createWallet,
    updateWallet,
    deleteWallet,
    refreshWallets: fetchWallets,
  };
}

/**
 * Hook for managing payment methods
 */
export function usePaymentMethods() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!user) {
      setPaymentMethods([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/payment-method');
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      
      const data = await response.json();
      setPaymentMethods(data.paymentMethods);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add a new payment method
  const addPaymentMethod = useCallback(async (paymentData) => {
    try {
      setError(null);
      
      const response = await fetch('/api/payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add payment method');
      }
      
      const data = await response.json();
      
      // Refresh payment methods
      fetchPaymentMethods();
      
      return data.paymentMethod;
    } catch (err) {
      setError(err.message);
      console.error('Error adding payment method:', err);
      throw err;
    }
  }, [fetchPaymentMethods]);

  // Update a payment method
  const updatePaymentMethod = useCallback(async (paymentMethodId, updateData) => {
    try {
      setError(null);
      
      const response = await fetch('/api/payment-method', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
          ...updateData,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment method');
      }
      
      const data = await response.json();
      
      // Refresh payment methods
      fetchPaymentMethods();
      
      return data.paymentMethod;
    } catch (err) {
      setError(err.message);
      console.error('Error updating payment method:', err);
      throw err;
    }
  }, [fetchPaymentMethods]);

  // Delete a payment method
  const deletePaymentMethod = useCallback(async (paymentMethodId) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/payment-method?paymentMethodId=${paymentMethodId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment method');
      }
      
      // Refresh payment methods
      fetchPaymentMethods();
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting payment method:', err);
      throw err;
    }
  }, [fetchPaymentMethods]);

  // Load payment methods on initial render and when user changes
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    refreshPaymentMethods: fetchPaymentMethods,
  };
}

/**
 * Hook for managing transactions
 */
export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Fetch user transactions
  const fetchTransactions = useCallback(async (reset = false) => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newPage = reset ? 0 : page;
      const offset = newPage * limit;
      
      const response = await fetch(`/api/transaction?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      
      if (reset) {
        setTransactions(data.transactions);
      } else {
        setTransactions(prev => [...prev, ...data.transactions]);
      }
      
      // Check if there are more transactions to load
      setHasMore(data.transactions.length === limit);
      
      if (!reset) {
        setPage(prev => prev + 1);
      } else {
        setPage(1);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [user, page, limit]);

  // Update transaction status
  const updateTransactionStatus = useCallback(async (transactionId, status, txHash) => {
    try {
      setError(null);
      
      const response = await fetch('/api/transaction', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          status,
          txHash,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update transaction');
      }
      
      const data = await response.json();
      
      // Refresh transactions
      fetchTransactions(true);
      
      return data.transaction;
    } catch (err) {
      setError(err.message);
      console.error('Error updating transaction:', err);
      throw err;
    }
  }, [fetchTransactions]);

  // Load transactions on initial render and when user changes
  useEffect(() => {
    fetchTransactions(true);
  }, [user]);

  return {
    transactions,
    loading,
    error,
    hasMore,
    loadMore: () => fetchTransactions(false),
    refresh: () => fetchTransactions(true),
    updateTransactionStatus,
  };
}

/**
 * Hook for managing escrow transactions
 */
export function useEscrow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create escrow transaction
  const createEscrow = useCallback(async (escrowData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(escrowData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create escrow transaction');
      }
      
      const data = await response.json();
      return data.escrowTransaction;
    } catch (err) {
      setError(err.message);
      console.error('Error creating escrow transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get escrow transactions for a contract
  const getContractEscrows = useCallback(async (contractId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/escrow?contractId=${contractId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get escrow transactions');
      }
      
      const data = await response.json();
      return data.transactions;
    } catch (err) {
      setError(err.message);
      console.error('Error getting escrow transactions:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get escrow transaction for a milestone
  const getMilestoneEscrow = useCallback(async (milestoneId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/escrow?milestoneId=${milestoneId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get milestone escrow transaction');
      }
      
      const data = await response.json();
      return data.transactions[0] || null;
    } catch (err) {
      setError(err.message);
      console.error('Error getting milestone escrow transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Release escrow funds
  const releaseEscrow = useCallback(async (escrowTransactionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/escrow', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          escrowTransactionId,
          action: 'release',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to release escrow funds');
      }
      
      const data = await response.json();
      return data.escrowTransaction;
    } catch (err) {
      setError(err.message);
      console.error('Error releasing escrow funds:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refund escrow funds
  const refundEscrow = useCallback(async (escrowTransactionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/escrow', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          escrowTransactionId,
          action: 'refund',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refund escrow funds');
      }
      
      const data = await response.json();
      return data.escrowTransaction;
    } catch (err) {
      setError(err.message);
      console.error('Error refunding escrow funds:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createEscrow,
    getContractEscrows,
    getMilestoneEscrow,
    releaseEscrow,
    refundEscrow,
  };
}

// Export a combined hook for finance operations
export function useFinance() {
  const wallets = useWallets();
  const paymentMethods = usePaymentMethods();
  const transactions = useTransactions();
  const escrow = useEscrow();

  return {
    wallets,
    paymentMethods,
    transactions,
    escrow,
  };
}