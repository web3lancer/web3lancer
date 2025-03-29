'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Alert } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMultiAccount } from '@/contexts/MultiAccountContext';
import { motion } from 'framer-motion';
import { ConnectWallet } from '@/components/ConnectWallet';
import { useAccount } from 'wagmi';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const { accounts, activeAccount, addAccount, switchAccount } = useMultiAccount();
  const [error, setError] = useState<string | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const redirectPath = searchParams?.get('redirect') || '/dashboard';
  const addAccountParam = searchParams?.get('addAccount');

  useEffect(() => {
    if (addAccountParam === 'true') {
      setIsAddingAccount(true);
    }
  }, [addAccountParam]);

  // Handle successful connection
  useEffect(() => {
    if (address) {
      const accountId = `wallet-${address}`;
      const existingAccount = accounts.find(acc => acc.$id === accountId || acc.walletId === address);
      
      if (existingAccount) {
        // Account already exists, switch to it
        switchAccount(existingAccount.$id);
        router.push(redirectPath);
      } else if (isAddingAccount) {
        // Adding a new account
        try {
          addAccount({
            $id: accountId,
            walletId: address,
            isActive: true
          });
          router.push(redirectPath);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to add account');
        }
      } else if (activeAccount) {
        // Default case: redirect to dashboard
        router.push(redirectPath);
      }
    }
  }, [address, accounts, router, redirectPath, isAddingAccount]);

  return (
    <Container maxWidth="sm" sx={{ pt: 4, pb: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
            {isAddingAccount ? 'Add Another Account' : 'Welcome to Web3Lancer'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isAddingAccount
              ? 'Connect with another wallet to add as an additional account'
              : 'Connect with your wallet to continue to the platform'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
          }}
        >
          <ConnectWallet />
        </Paper>
      </motion.div>
    </Container>
  );
}
