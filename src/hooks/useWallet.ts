import { useState, useEffect, useCallback } from 'react';

// Define basic types (adjust as needed based on actual data structures)
interface Wallet {
  id: string;
  type: 'custodial' | 'non-custodial'; // Example types
  address: string;
  // Add other relevant wallet properties
}

interface Balance {
  asset: string;
  amount: string;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  asset: string;
  timestamp: number;
  // Add other relevant transaction properties
}

interface PaymentMethod {
  paymentMethodId: string;
  type: 'crypto' | 'card' | 'bank'; // Example types
  isDefault: boolean;
  details?: {
    walletAddress?: string;
    // Add other details based on type
  };
}

// Placeholder data fetching functions (replace with actual API calls)
const fetchWallets = async (): Promise<Wallet[]> => {
  console.log('Fetching wallets...');
  await new Promise(res => setTimeout(res, 500)); // Simulate network delay
  // Example: return [{ id: 'w1', type: 'custodial', address: 'GABC...XYZ' }];
  return []; 
};

const fetchBalances = async (walletId: string): Promise<Balance[]> => {
  console.log(`Fetching balances for wallet ${walletId}...`);
  await new Promise(res => setTimeout(res, 500));
  // Example: return [{ asset: 'XLM', amount: '100.0000' }];
  return [];
};

const fetchTransactions = async (walletId: string): Promise<Transaction[]> => {
  console.log(`Fetching transactions for wallet ${walletId}...`);
  await new Promise(res => setTimeout(res, 500));
  // Example: return [{ id: 't1', type: 'receive', amount: '50', asset: 'XLM', timestamp: Date.now() }];
  return [];
};

const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  console.log('Fetching payment methods...');
  await new Promise(res => setTimeout(res, 500));
  // Example: return [{ paymentMethodId: 'pm1', type: 'crypto', isDefault: true, details: { walletAddress: 'GDEF...UVW' } }];
  return [];
};

export const useWallet = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedWallets = await fetchWallets();
      setWallets(fetchedWallets);

      if (fetchedWallets.length > 0) {
        // Assuming we operate on the first wallet for now
        const primaryWalletId = fetchedWallets[0].id;
        const [fetchedBalances, fetchedTransactions] = await Promise.all([
          fetchBalances(primaryWalletId),
          fetchTransactions(primaryWalletId),
        ]);
        setBalances(fetchedBalances);
        setTransactions(fetchedTransactions);
      } else {
        setBalances([]);
        setTransactions([]);
      }

      const fetchedPaymentMethods = await fetchPaymentMethods();
      setPaymentMethods(fetchedPaymentMethods);

    } catch (err) {
      console.error("Error loading wallet data:", err);
      setError('Failed to load wallet data. Please try again.');
      // Reset state on error
      setWallets([]);
      setBalances([]);
      setTransactions([]);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshWalletData = useCallback(() => {
    loadData();
  }, [loadData]);

  const createWallet = useCallback(async (type: 'custodial' | 'non-custodial') => {
    setLoading(true);
    console.log(`Creating ${type} wallet...`);
    // Placeholder: Replace with actual wallet creation logic
    await new Promise(res => setTimeout(res, 1000));
    // After creation, refresh data
    await loadData(); 
    setLoading(false);
  }, [loadData]);

  const addPaymentMethod = useCallback(async (address: string, isDefault: boolean) => {
    setLoading(true);
    console.log(`Adding payment method: ${address}, Default: ${isDefault}`);
    // Placeholder: Replace with actual API call
    await new Promise(res => setTimeout(res, 1000));
    // Refresh payment methods after adding
    const fetchedPaymentMethods = await fetchPaymentMethods();
    setPaymentMethods(fetchedPaymentMethods);
    setLoading(false);
  }, []);

  const formatBalance = useCallback((balance: Balance | undefined): string => {
    if (!balance) return '0.00';
    // Basic formatting, adjust as needed
    return parseFloat(balance.amount).toFixed(2);
  }, []);

  const getTotalBalance = useCallback((): string => {
    // Placeholder: Needs logic to convert/sum different assets if necessary
    const nativeBalance = balances.find(b => b.asset === 'XLM'); // Example: Assuming XLM is native
    return formatBalance(nativeBalance);
  }, [balances, formatBalance]);

  return {
    wallets,
    balances,
    transactions,
    paymentMethods,
    loading,
    error,
    refreshWalletData,
    createWallet,
    addPaymentMethod,
    formatBalance,
    getTotalBalance,
  };
};
