import { useEffect } from 'react';

interface AccountData {
  address: string;
  chainId: string | number;
  isReconnected?: boolean;
}

interface UseAccountEffectOptions {
  onConnect?: (data: AccountData) => void;
  onDisconnect?: () => void;
}

export function useAccountEffect({ onConnect, onDisconnect }: UseAccountEffectOptions) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        window.ethereum?.request({ method: 'eth_chainId' })
          .then((chainId: string) => {
            if (onConnect) {
              onConnect({
                address: accounts[0],
                chainId,
                isReconnected: false
              });
            }
          })
          .catch(console.error);
      } else {
        if (onDisconnect) {
          onDisconnect();
        }
      }
    };

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          window.ethereum?.request({ method: 'eth_chainId' })
            .then((chainId: string) => {
              if (onConnect) {
                onConnect({
                  address: accounts[0],
                  chainId,
                  isReconnected: true
                });
              }
            })
            .catch(console.error);
        }
      })
      .catch(console.error);

    // Set up listeners for account and chain changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', (_chainId: string) => {
      // Recommended to reload the page on chain change
      window.location.reload();
    });

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [onConnect, onDisconnect]);
}
