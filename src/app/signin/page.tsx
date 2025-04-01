'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, Alert, Button, Divider, TextField, IconButton, InputAdornment, CircularProgress, Tabs, Tab } from '@mui/material';
import { GitHub, Email } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMultiAccount } from '@/contexts/MultiAccountContext';
import { motion } from 'framer-motion';
import { ConnectWallet } from '@/components/ConnectWallet';
import { useAccount } from 'wagmi';
import { signIn, createMagicURLToken } from '@/utils/api';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import EmailOTPForm from '@/components/EmailOTPForm';
import MfaVerification from '@/components/login/MfaVerification';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const { accounts, activeAccount, addAccount, switchAccount, hasMaxAccounts } = useMultiAccount();
  const { user, setUser, isMfaRequired, setIsMfaRequired } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const redirectPath = searchParams?.get('redirect') || '/dashboard';
  const addAccountParam = searchParams?.get('addAccount');
  const [authMethod, setAuthMethod] = useState<'email' | 'otp' | 'magic'>('email');
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
          if (hasMaxAccounts && !isAddingAccount) {
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
            if (error instanceof Error) {
              setError(error.message);
              setIsLoading(false);
              return;
            }
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
  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Redirect to GitHub OAuth flow, using the same approach as in SignUpPage
      window.location.href = '/api/auth/github';
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      setError('Failed to initiate GitHub sign in. Please try again.');
      setIsLoading(false);
    }
  };

  // Check if there's an error parameter in the URL (from GitHub redirect)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get('error');
    if (error === 'github_auth_failed') {
      setError('GitHub authentication failed. Please try again or use another sign-in method.');
    }
  }, []);

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

  // Handle MFA verification success
  const handleMfaSuccess = () => {
    setIsMfaRequired(false);
    router.push(redirectPath);
  };

  // Handle MFA verification cancel
  const handleMfaCancel = () => {
    setIsMfaRequired(false);
  };

  // Function to handle closing the wallet connect modal
  const handleCloseWalletConnect = () => {
    setShowWalletConnect(false);
    // Reset any ongoing wallet connection attempts
    if (window.ethereum && window.ethereum.removeAllListeners) {
      window.ethereum.removeAllListeners();
    }
  };

  // Show MFA verification if required
  if (isMfaRequired) {
    return (
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: { xs: 2, sm: 4 },
        pt: { xs: '80px', sm: '100px' },
        background: 'linear-gradient(135deg, #f6f7f9 0%, #ffffff 100%)',
      }}>
        <MfaVerification onSuccess={handleMfaSuccess} onCancel={handleMfaCancel} />
      </Box>
    );
  }

  // Main render for sign-in page
  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      p: { xs: 2, sm: 4 },
      pt: { xs: '80px', sm: '100px' },
      background: 'linear-gradient(135deg, #f6f7f9 0%, #ffffff 100%)',
    }}>
      <Paper sx={{ 
        maxWidth: 480,
        width: '100%',
        p: { xs: 3, sm: 4 },
        borderRadius: 2,
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome Back
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sign in to your account to continue
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Social logins section - Moved to top */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<GitHub />}
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              borderColor: 'rgba(0, 0, 0, 0.2)',
              color: '#333',
              '&:hover': {
                borderColor: '#333',
                background: 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            GitHub
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => setShowWalletConnect(true)}
            disabled={isLoading}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              borderColor: 'rgba(0, 0, 0, 0.2)',
              color: '#333',
              '&:hover': {
                borderColor: '#333',
                background: 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            Connect Wallet
          </Button>
        </Box>
        
        <Divider sx={{ my: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Or continue with email
          </Typography>
        </Divider>

        {/* Auth method selector */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={authMethod} 
            onChange={(_, value) => setAuthMethod(value)}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Email/Password" value="email" />
            <Tab label="Email OTP" value="otp" />
            <Tab label="Magic Link" value="magic" />
          </Tabs>
        </Box>
        
        {/* Email/Password form */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailSignIn}>
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
              sx={{ mt: 2 }}
              disabled={isLoading}
              startIcon={<Email />}
            >
              {isLoading ? 'Signing In...' : 'Sign In with Email'}
            </Button>
          </form>
        )}
        
        {/* Email OTP form */}
        {authMethod === 'otp' && (
          <EmailOTPForm redirectPath={redirectPath} />
        )}
        
        {/* Magic Link form */}
        {authMethod === 'magic' && (
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
        
        {/* Add wallet connection modal */}
        {showWalletConnect && (
          <Box 
            sx={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              p: 2
            }}
          >
            <Box 
              sx={{ 
                maxWidth: '450px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
              }}
            >
              <Button
                variant="text"
                color="primary" 
                onClick={handleCloseWalletConnect}
                sx={{ 
                  position: 'absolute', 
                  right: 0, 
                  top: 0, 
                  zIndex: 10 
                }}
              >
                Close
              </Button>
              <ConnectWallet key={`wallet-connect-${showWalletConnect}`} />
            </Box>
          </Box>
        )}
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account? <Link href="/signup">Sign up</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
