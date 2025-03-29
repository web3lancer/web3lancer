import React from 'react';
import { Box, Typography } from '@mui/material';

interface WalletDetailsProps {
  wallet: any;
}

export function WalletDetails({ wallet }: WalletDetailsProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" color="text.secondary">Wallet Address</Typography>
      <Typography
        variant="body2"
        sx={{
          fontFamily: 'monospace',
          bgcolor: 'background.paper',
          p: 1.5,
          borderRadius: 1,
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {wallet?.walletAddress || 'No wallet address available'}
      </Typography>
    </Box>
  );
}
