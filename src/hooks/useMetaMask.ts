import { useState, useEffect, useCallback } from 'react';
import { MetaMaskSDK } from '@metamask/sdk';

interface UseMetaMaskReturn {
  provider: any;
  isMetaMaskInstalled: boolean;
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  connectMetaMask: () => Promise<void>;
  disconnectMetaMask: () => void;
  error: string | null;
  isPending: boolean;
  switchNetwork: (chainId: string) => Promise<void>;
  sendTransaction: (transaction: {
    to: string;
    value: string;
    data?: string;
    gas?: string;
  }) => Promise<string>;
  estimateGas: (transaction: {
    to: string;
    from?: string;
    value: string;
    data?: string;
  }) => Promise<string>;
}

export function useMetaMask(): UseMetaMaskReturn {
  const [sdk, setSdk] = useState<MetaMaskSDK | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

  // Initialize SDK
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const MMSDK = new MetaMaskSDK({
          dappMetadata: {
            name: 'Web3Lancer',
            url: window.location.href,
          },
          // Options can be extended here
        });
        setSdk(MMSDK);
        const provider = MMSDK.getProvider();
        setProvider(provider);
        
        // Check if MetaMask is installed
        setIsMetaMaskInstalled(!!window.ethereum?.isMetaMask);
        
        // Check if already connected
        if (provider) {
          provider.request({ method: 'eth_accounts' })
            .then((accounts: unknown) => {
              const ethAccounts = accounts as string[];
              if (ethAccounts && ethAccounts.length > 0) {
                setIsConnected(true);
                setAccount(ethAccounts[0]);
                provider.request({ method: 'eth_chainId' })
                  .then((chainId) => chainId && setChainId(chainId as string))
                  .catch(console.error);
              }
            })
            .catch(console.error);
        }
      }
    } catch (err) {
      console.error('Error initializing MetaMask SDK:', err);
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        setIsConnected(false);
        setAccount(null);
      } else {
        // Account changed
        setIsConnected(true);
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log("Chain changed to:", chainId);
      setChainId(chainId);
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
    };
  }, [provider]);

  // Connect to MetaMask
  const connectMetaMask = useCallback(async () => {
    if (!provider) {
      setError('MetaMask SDK not initialized');
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setIsConnected(true);
        setAccount(accounts[0]);
        const chainId = await provider.request({ method: 'eth_chainId' });
        setChainId(chainId);
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError('User rejected connection');
      } else {
        setError(err.message || 'Failed to connect to MetaMask');
      }
      console.error('MetaMask connection error:', err);
    } finally {
      setIsPending(false);
    }
  }, [provider]);

  // Switch to a different network
  const switchNetwork = useCallback(async (targetChainId: string) => {
    if (!provider) {
      setError('MetaMask SDK not initialized');
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (err: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (err.code === 4902) {
        setError('This network needs to be added to MetaMask');
      } else {
        setError(err.message || 'Failed to switch network');
      }
      console.error('Error switching network:', err);
    } finally {
      setIsPending(false);
    }
  }, [provider]);

  // Disconnect from MetaMask
  const disconnectMetaMask = useCallback(() => {
    // MetaMask doesn't have a disconnect method, but we can reset our state
    setIsConnected(false);
    setAccount(null);
  }, []);

  // Send a transaction using MetaMask
  const sendTransaction = useCallback(async (transaction: {
    to: string;
    value: string;
    data?: string;
    gas?: string;
  }): Promise<string> => {
    if (!provider) {
      throw new Error('MetaMask SDK not initialized');
    }
    
    if (!account) {
      throw new Error('No account connected');
    }
    
    setIsPending(true);
    setError(null);
    
    try {
      // Create the transaction parameters
      const transactionParameters = {
        from: account,
        to: transaction.to,
        value: transaction.value, // Value in hex
        data: transaction.data || '0x', // Optional data
        gas: transaction.gas // Optional gas limit
      };
      
      // Send the transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      
      return txHash;
    } catch (err: any) {
      if (err.code === 4001) {
        setError('User rejected transaction');
      } else {
        setError(err.message || 'Failed to send transaction');
      }
      console.error('MetaMask transaction error:', err);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [provider, account]);

  // Estimate gas for a transaction
  const estimateGas = useCallback(async (transaction: {
    to: string;
    from?: string;
    value: string;
    data?: string;
  }): Promise<string> => {
    if (!provider) {
      throw new Error('MetaMask SDK not initialized');
    }
    
    try {
      // Create the transaction parameters
      const transactionParameters = {
        from: transaction.from || account,
        to: transaction.to,
        value: transaction.value,
        data: transaction.data || '0x'
      };
      
      // Estimate the gas
      const gasEstimate = await provider.request({
        method: 'eth_estimateGas',
        params: [transactionParameters],
      });
      
      // Add 10% buffer to gas estimate
      const gasWithBuffer = Math.floor(parseInt(gasEstimate, 16) * 1.1).toString(16);
      return '0x' + gasWithBuffer;
    } catch (err: any) {
      console.error('Gas estimation error:', err);
      throw new Error(`Failed to estimate gas: ${err.message || 'Unknown error'}`);
    }
  }, [provider, account]);

  return {
    provider,
    isMetaMaskInstalled,
    isConnected,
    account,
    chainId,
    connectMetaMask,
    disconnectMetaMask,
    switchNetwork,
    sendTransaction,
    estimateGas,
    error,
    isPending
  };
}
