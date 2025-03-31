import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Box, CircularProgress, Typography, Alert, Backdrop } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Account } from './Account';
import { WalletOptions } from './WalletOptions';
import { useEffect } from 'react';

export function ConnectWallet() {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const { isLoading: isConnectLoading, error: connectError, reset: resetConnect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const isLoading = isConnecting || isReconnecting || isConnectLoading;
  
  // Reset state when component mounts - important for modal reopening
  useEffect(() => {
    // Cancel any pending wallet connection attempts
    if (window.ethereum) {
      if (window.ethereum.removeAllListeners) {
        try {
          window.ethereum.removeAllListeners();
        } catch (e) {
          console.log("Couldn't remove ethereum listeners", e);
        }
      }
    }
    
    // Reset wagmi connection state
    resetConnect?.();
    
    return () => {
      // Also cleanup on unmount
      resetConnect?.();
    };
  }, [resetConnect]);
  
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1">Connecting to wallet...</Typography>
      </Box>
    );
  }

  if (connectError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error connecting to wallet: {connectError.message}
      </Alert>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isConnected ? 'connected' : 'disconnected'}
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
        {isConnected ? <Account /> : <WalletOptions />}
      </motion.div>
    </AnimatePresence>
  );
}
