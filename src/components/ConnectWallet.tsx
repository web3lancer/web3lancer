import { useAccount, useConnect } from 'wagmi';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Account } from './Account';
import { WalletOptions } from './WalletOptions';

export function ConnectWallet() {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const { isLoading: isConnectLoading, error: connectError } = useConnect();
  
  const isLoading = isConnecting || isReconnecting || isConnectLoading;
  
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
      >
        {isConnected ? <Account /> : <WalletOptions />}
      </motion.div>
    </AnimatePresence>
  );
}
