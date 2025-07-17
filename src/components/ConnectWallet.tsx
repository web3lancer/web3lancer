import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Box, CircularProgress, Typography, Alert, Backdrop } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Account } from '@/components/Account';
import { WalletOptions } from '@/components/WalletOptions';
import { useEffect } from 'react';
import { NetworkStatus } from '@/components/wallet/NetworkStatus';
import { NetworkWatcher } from '@/components/wallet/NetworkWatcher';
import { useAuth } from '@/contexts/AuthContext';

export function ConnectWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connectors, connect, status, error: connectError, reset: resetConnect } = useConnect();
  const { disconnect } = useDisconnect();
  const { user } = useAuth();

  const isLoading = isConnecting || isReconnecting || status === 'pending';
  const error = connectError;

  useEffect(() => {
    resetConnect?.();

    return () => {
      resetConnect?.();
    };
  }, [resetConnect]);

  useEffect(() => {
    function onConnect(data: any) {
      console.log("Connected!", {
        address: data.address,
        chainId: data.chainId,
        isReconnected: data.isReconnected
      });
    }

    function onDisconnect() {
      console.log("Disconnected!");
    }

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('Account changed:', accounts[0] || 'disconnected');
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        console.log('Chain changed:', chainId);
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  return (
    <>
      <NetworkWatcher />
      <AnimatePresence mode="wait">
        <motion.div
          key={isConnected || user?.walletId ? 'connected' : 'disconnected'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%'
          }}
        >
          {isConnected || user?.walletId ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ color: theme => theme.palette.text.primary }}>Connected Wallet</Typography>
                <NetworkStatus />
              </Box>
              <Account address={address} disconnect={disconnect} />
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ mb: 2, color: theme => theme.palette.text.primary }}>Connect Wallet</Typography>
              <WalletOptions connectors={connectors} connect={connect} />
            </>
          )}
        </motion.div>
      </AnimatePresence>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
        <Typography sx={{ ml: 2 }}>Connecting...</Typography>
      </Backdrop>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error.message || 'Failed to connect wallet.'}
        </Alert>
      )}
    </>
  );
}
