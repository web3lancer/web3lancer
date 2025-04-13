import { useState, useEffect, useCallback } from 'react';
import { MetaMaskSDK, SDKProvider } from '@metamask/sdk';

interface MetaMaskState {
  account: string | null;
  chainId: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isPending: boolean;
  error: string | null;
}

// Initialize the MetaMask SDK
const initializeMetaMaskSDK = () => {
  return new MetaMaskSDK({
    dappMetadata: {
      name: 'Web3Lancer',
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
    // Recommended options to minimize user friction
    preferDesktop: false,
    useDeeplink: true,
    storage: {
      enabled: true,
    },
  });
};

// Create a singleton instance of the SDK
let metamaskSDK: MetaMaskSDK | null = null;
if (typeof window !== 'undefined') {
  metamaskSDK = initializeMetaMaskSDK();
}

export function useMetaMask() {
  const [state, setState] = useState<MetaMaskState>({
    account: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    isPending: false,
    error: null,
  });

  const [ethereum, setEthereum] = useState<SDKProvider | null>(null);

  // Initialize SDK and set ethereum provider
  useEffect(() => {
    if (!metamaskSDK) return;
    
    try {
      // Get the provider
      const provider = metamaskSDK.getProvider();
      setEthereum(provider);
    } catch (error) {
      console.error('Error initializing MetaMask SDK:', error);
      setState(prev => ({ ...prev, error: 'Failed to initialize MetaMask' }));
    }
  }, []);

  // Handle account changes
  useEffect(() => {
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // No accounts - user is disconnected
        setState(prev => ({
          ...prev,
          account: null,
          isConnected: false,
        }));
      } else {
        // User is connected with at least one account
        setState(prev => ({
          ...prev,
          account: accounts[0],
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({ ...prev, chainId }));
    };

    const handleConnect = () => {
      // Check if we have accounts after connection
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          handleAccountsChanged(accounts);
        })
        .catch((err: Error) => {
          console.error('Error on connect:', err);
        });
    };

    const handleDisconnect = (error: { code: number; message: string }) => {
      console.log('MetaMask disconnected', error);
      setState(prev => ({
        ...prev,
        account: null,
        isConnected: false,
        error: error?.message || 'Disconnected from MetaMask',
      }));
    };

    // Set up listeners
    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);
    ethereum.on('connect', handleConnect);
    ethereum.on('disconnect', handleDisconnect);

    // Check initial connection state
    ethereum.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        handleAccountsChanged(accounts);
        
        // Also get the current chain ID
        return ethereum.request({ method: 'eth_chainId' });
      })
      .then((chainId: string) => {
        setState(prev => ({ ...prev, chainId }));
      })
      .catch((err: Error) => {
        console.error('Error checking initial connection:', err);
      });

    // Clean up listeners
    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
      ethereum.removeListener('connect', handleConnect);
      ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, [ethereum]);

  // Connect to MetaMask
  const connect = useCallback(async () => {
    if (!ethereum) {
      setState(prev => ({ ...prev, error: 'MetaMask not available' }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        setState(prev => ({
          ...prev,
          account: accounts[0],
          isConnected: true,
          isConnecting: false,
        }));
      } else {
        throw new Error('No accounts returned');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error?.message || 'Failed to connect to MetaMask',
      }));
    }
  }, [ethereum]);

  // Disconnect from MetaMask (clear state only as MetaMask doesn't have a disconnect method)
  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      account: null,
      isConnected: false,
    }));
  }, []);

  // Send a transaction
  const sendTransaction = useCallback(async (transaction: any) => {
    if (!ethereum || !state.account) {
      throw new Error('MetaMask not connected');
    }

    setState(prev => ({ ...prev, isPending: true }));
    
    try {
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: state.account,
            ...transaction
          }
        ]
      });
      
      setState(prev => ({ ...prev, isPending: false }));
      return txHash;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isPending: false, 
        error: error?.message || 'Transaction failed'
      }));
      throw error;
    }
  }, [ethereum, state.account]);

  // Estimate gas
  const estimateGas = useCallback(async (transaction: any) => {
    if (!ethereum || !state.account) {
      throw new Error('MetaMask not connected');
    }

    try {
      const gas = await ethereum.request({
        method: 'eth_estimateGas',
        params: [
          {
            from: state.account,
            ...transaction
          }
        ]
      });
      
      // Add 20% buffer to gas estimate
      const gasBuffer = Math.floor(Number(gas) * 1.2).toString(16);
      return `0x${gasBuffer}`;
    } catch (error) {
      console.error('Gas estimation failed:', error);
      // Return a default gas limit if estimation fails
      return '0x1500000'; // ~21 million gas
    }
  }, [ethereum, state.account]);

  // Get chain name
  const getChainName = useCallback(() => {
    if (!state.chainId) return 'Unknown Network';
    
    const chainMap: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0xa': 'Optimism',
      '0x89': 'Polygon',
      '0x2105': 'Base',
      '0xa4b1': 'Arbitrum One',
      '0x5': 'Goerli Testnet',
      '0xaa36a7': 'Sepolia Testnet',
    };
    
    return chainMap[state.chainId] || `Chain ID: ${state.chainId}`;
  }, [state.chainId]);

  // Switch network
  const switchNetwork = useCallback(async (chainId: string) => {
    if (!ethereum) {
      throw new Error('MetaMask not available');
    }

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      return true;
    } catch (error: any) {
      // This error code indicates the chain has not been added to MetaMask
      if (error.code === 4902) {
        // Chain needs to be added
        return false;
      }
      throw error;
    }
  }, [ethereum]);

  // Add network
  const addNetwork = useCallback(async (networkDetails: any) => {
    if (!ethereum) {
      throw new Error('MetaMask not available');
    }

    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkDetails],
      });
      return true;
    } catch (error) {
      console.error('Error adding network:', error);
      throw error;
    }
  }, [ethereum]);

  return {
    ...state,
    connect,
    disconnect,
    sendTransaction,
    estimateGas,
    getChainName,
    switchNetwork,
    addNetwork,
  };
}
