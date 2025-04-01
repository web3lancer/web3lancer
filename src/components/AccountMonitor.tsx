import React from 'react';
import { useAccountEffect } from '@/hooks/useAccountEffect';
import { Box, Typography, Alert } from '@mui/material';

export function AccountMonitor() {
  const [status, setStatus] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);
  const [chainId, setChainId] = React.useState<string | null>(null);

  useAccountEffect({
    onConnect(data) {
      setStatus('connected');
      setAddress(data.address);
      setChainId(data.chainId as string);
      console.log("Connected!", {
        address: data.address,
        chainId: data.chainId,
        isReconnected: data.isReconnected
      });
    },
    onDisconnect() {
      setStatus('disconnected');
      setAddress(null);
      setChainId(null);
      console.log("Disconnected!");
    }
  });

  if (!status) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Alert 
        severity={status === 'connected' ? 'success' : 'info'}
        sx={{ mb: 1 }}
      >
        {status === 'connected' ? (
          <Typography variant="body2">
            Connected to {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
            {chainId && ` on chain ID ${chainId}`}
          </Typography>
        ) : (
          <Typography variant="body2">Wallet disconnected</Typography>
        )}
      </Alert>
    </Box>
  );
}
