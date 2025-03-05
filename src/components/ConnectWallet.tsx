import { useAccount } from 'wagmi';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Account } from './Account';
import { WalletOptions } from './WalletOptions';

export function ConnectWallet() {
  const { isConnected, isConnecting } = useAccount();
  
  if (isConnecting) {
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
