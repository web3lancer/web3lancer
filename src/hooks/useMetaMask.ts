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
            .then((accounts: string[]) => {
              if (accounts.length > 0) {
                setIsConnected(true);
                setAccount(accounts[0]);
                provider.request({ method: 'eth_chainId' })
                  .then((chainId: string) => setChainId(chainId))
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

  return {
    provider,
    isMetaMaskInstalled,
    isConnected,
    account,
    chainId,
    connectMetaMask,
    disconnectMetaMask,
    switchNetwork,
    error,
    isPending
  };
}
