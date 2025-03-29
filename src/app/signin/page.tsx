'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Alert, Button, Divider, TextField, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { GitHub, Email } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMultiAccount } from '@/contexts/MultiAccountContext';
import { motion } from 'framer-motion';
import { ConnectWallet } from '@/components/ConnectWallet';
import { useAccount } from 'wagmi';
import { signIn, createMagicURLToken } from '@/utils/api';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const { accounts, activeAccount, addAccount, switchAccount, hasMaxAccounts } = useMultiAccount();
  const [error, setError] = useState<string | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const redirectPath = searchParams?.get('redirect') || '/dashboard';
  const addAccountParam = searchParams?.get('addAccount');
  
  // Email sign-in state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Magic link sign-in state
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    if (addAccountParam === 'true') {
      setIsAddingAccount(true);
    }
  }, [addAccountParam]);

  // Handle successful wallet connection
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
          if (hasMaxAccounts) {
            setError(`Maximum number of accounts (3) reached. Please remove an account before adding a new one.`);
            return;
          }
          
          addAccount({
            $id: accountId,
            walletId: address,
            isActive: true
          });
          router.push(redirectPath);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to add account');
        }
      } else {
        // New connection - add account
        try {
          if (accounts.length === 0 || !hasMaxAccounts) {
            addAccount({
              $id: accountId,
              walletId: address,
              isActive: true
            });
          }
          router.push(redirectPath);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to add account');
        }
      }
    }
  }, [address, accounts, router, redirectPath, isAddingAccount, hasMaxAccounts, addAccount, switchAccount]);

  // Handle signing in with an existing account from the accounts list
  const handleSignInWithAccount = (account: any) => {
    switchAccount(account.$id);
    router.push(redirectPath);
  };

  // Handle email sign in - ensure it matches Appwrite docs pattern
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // This matches the Appwrite docs pattern for email/password sessions
      const response = await signIn(email, password);
      
      if (response) {
        // Add this account to multi-accounts if not already there
        const accountId = response.$id;
        const existingAccount = accounts.find(acc => acc.$id === accountId);
        
        if (!existingAccount) {
          if (hasMaxAccounts) {
            setError(`Maximum number of accounts (3) reached. Please remove an account before adding a new one.`);
            setIsLoading(false);
            return;
          }
          
          try {
            addAccount({
              $id: accountId,
              // Handle the case where name or email might be undefined
              name: response.name || '',
              email: response.email || '',
              isActive: true
            });
          } catch (error) {
            console.error('Error adding account:', error);
          }
        } else {
          switchAccount(accountId);
        }
        
        router.push(redirectPath);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle GitHub sign in
  const handleGitHubSignIn = () => {
    // Redirect to GitHub OAuth flow 
    window.location.href = '/api/auth/github';
  };

  // Handle magic link sign in
  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!magicLinkEmail || !magicLinkEmail.includes('@')) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      await createMagicURLToken(magicLinkEmail);
      setMagicLinkSent(true);
    } catch (error) {
      console.error('Error sending magic link:', error);
      setError('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      p: { xs: 2, sm: 4 },
      pt: { xs: '80px', sm: '100px' }, // Add padding-top to account for header
      background: 'linear-gradient(135deg, #f6f7f9 0%, #ffffff 100%)',
    }}>
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
                ? 'Connect with another wallet or sign in with email to add as an additional account'
                : 'Connect with your wallet or sign in with email to continue to the platform'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {accounts.length > 0 && !isAddingAccount && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>Your Accounts</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {accounts.map((account) => (
                  <Button 
                    key={account.$id}
                    variant="outlined"
                    onClick={() => handleSignInWithAccount(account)}
                    sx={{ 
                      justifyContent: 'flex-start',
                      py: 1.5,
                      px: 2,
                      borderColor: account.isActive ? 'primary.main' : 'divider',
                      backgroundColor: account.isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent' 
                    }}
                  >
                    {account.name || account.email || (account.walletId ? `${account.walletId.substring(0, 6)}...${account.walletId.substring(account.walletId.length - 4)}` : 'Unknown Account')}
                  </Button>
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                {hasMaxAccounts 
                  ? "You've reached the maximum number of accounts (3)" 
                  : "Connect another wallet"}
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={hasMaxAccounts}
                onClick={() => setIsAddingAccount(true)}
              >
                Add New Account
              </Button>
            </Paper>
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
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Connect Wallet</Typography>
              <ConnectWallet />
              
              <Divider sx={{ my: 4 }}>
                <Typography variant="body2" color="text.secondary">OR</Typography>
              </Divider>
              
              {/* Email Sign In Form */}
              <Box component="form" onSubmit={handleEmailSignIn} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Sign in with Email</Typography>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
                  <Link href="/reset-password" passHref>
                    <Typography 
                      variant="body2" 
                      color="primary"
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Forgot password?
                    </Typography>
                  </Link>
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GitHub />}
              onClick={handleGitHubSignIn}
              sx={{ mb: 2 }}
            >
              Sign In with GitHub
            </Button>

            {/* Magic Link Section */}
            <Divider sx={{ my: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Or sign in with magic link
              </Typography>
            </Divider>
            
            {magicLinkSent ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                Magic link has been sent to your email. Please check your inbox and spam folders.
              </Alert>
            ) : (
              <form onSubmit={handleMagicLinkSignIn}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  margin="normal"
                  type="email"
                  value={magicLinkEmail}
                  onChange={(e) => setMagicLinkEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button 
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ 
                    mt: 2, 
                    mb: 2,
                    py: 1.5,
                    background: 'linear-gradient(90deg, #3B82F6 0%, #1E40AF 100%)',
                    boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                    borderRadius: '12px',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #2563EB 0%, #1E3A8A 100%)',
                      boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.6)',
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Send Magic Link'}
                </Button>
              </form>
            )}
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link href="/signup" style={{ color: '#1E40AF', fontWeight: 600 }}>
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        {isAddingAccount && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              variant="text" 
              onClick={() => setIsAddingAccount(false)}
            >
              Cancel Adding Account
            </Button>
          </Box>
        )}
      </motion.div>
    </Container>
  );
}
