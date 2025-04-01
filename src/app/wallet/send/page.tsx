"use client";

import React from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SendTransaction } from '@/components/wallet/SendTransaction';
import { useMetaMask } from '@/hooks/useMetaMask';

export default function SendPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isConnected } = useMetaMask();
  
  // Handle successful transaction
  const handleSuccess = (txHash: string) => {
    console.log('Transaction successful:', txHash);
    // Additional success handling if needed
    // Redirect after a short delay
    setTimeout(() => {
      router.push('/wallet');
    }, 3000);
  };

  // Handle transaction error
  const handleError = (error: Error) => {
    console.error('Transaction error:', error);
    // Additional error handling if needed
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4, px: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Link href="/wallet">
          <Button variant="text">← Back to Wallet</Button>
        </Link>
      </Box>
      
      <Typography variant="h4" sx={{ mb: 4 }}>Send Cryptocurrency</Typography>
      
      {!user && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please sign in to access your wallet.
        </Alert>
      )}
      
      {user && !isConnected && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please connect your MetaMask wallet to send transactions.
        </Alert>
      )}
      
      {user && isConnected && (
        <SendTransaction 
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="caption" color="text.secondary">
          Note: All blockchain transactions are irreversible. Please double-check the recipient address before sending.
        </Typography>
      </Box>
    </Box>
  );
}
