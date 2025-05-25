'use client';

import React from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Alert
} from '@mui/material';
import { useSuiWallet } from '@/contexts/SuiWalletContext';

const SuiWalletConnection: React.FC = () => {
  const { isConnected, currentAccount, connect, disconnect } = useSuiWallet();

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sui Wallet
        </Typography>
        
        {!isConnected ? (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Connect your Sui wallet to interact with Web3Lancer contracts
            </Alert>
            <Button 
              variant="contained" 
              onClick={connect}
              fullWidth
              color="primary"
            >
              Connect Sui Wallet
            </Button>
          </Box>
        ) : (
          <Box>
            <Chip 
              label="Connected" 
              color="success" 
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Account: {currentAccount ? `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}` : 'Loading...'}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={disconnect}
              fullWidth
            >
              Disconnect
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SuiWalletConnection;