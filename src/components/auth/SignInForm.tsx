'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Alert, Button, Divider, TextField, IconButton, Tabs, Tab } from '@mui/material';
import { GitHub, Email, Link as LinkIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ConnectWallet } from '@/components/ConnectWallet';
import { signIn, createMagicURLToken, createGitHubOAuthSession } from '@/utils/api';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import EmailOTPForm from '@/components/EmailOTPForm';

export default function SignInForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [signInMethod, setSignInMethod] = useState<'email' | 'otp' | 'magic'>('email');
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await signIn(formData.email, formData.password);
      
      if (response) {
        setUser(response);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Magic Link sign in
  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    if (!magicLinkEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(magicLinkEmail)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    try {
      await createMagicURLToken(magicLinkEmail);
      setSuccess(`Magic link sent to ${magicLinkEmail}. Please check your email.`);
      setMagicLinkEmail('');
    } catch (error) {
      console.error('Error creating magic link:', error);
      setError('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle GitHub sign in
  const handleGitHubSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Log that we're attempting GitHub login
      console.log('Initiating GitHub login...');
      
      // Call the createGitHubOAuthSession function
      await createGitHubOAuthSession(['user:email']);
      
      // The page will redirect to GitHub authorization page
      // No need to handle redirect here as it will happen automatically
    } catch (error) {
      console.error('Error initiating GitHub login:', error);
      setError('Failed to connect to GitHub. Please try again.');
      setIsLoading(false);
    }
  };

  // Function to handle closing the wallet connect modal
  const handleCloseWalletConnect = () => {
    setShowWalletConnect(false);
    // Reset any ongoing wallet connection attempts
    if (window.ethereum && typeof window.ethereum.removeAllListeners === 'function') {
      window.ethereum.removeAllListeners();
    }
  };

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
          Sign in to your Web3Lancer account
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
        
        {/* Social logins section */}
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
            Or sign in with email
          </Typography>
        </Divider>
        
        {/* Sign in method selector */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={signInMethod} 
            onChange={(_, value) => setSignInMethod(value)}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Email/Password" value="email" />
            <Tab label="Magic Link" value="magic" />
            <Tab label="Email OTP" value="otp" />
          </Tabs>
        </Box>
        
        {/* Email/Password form */}
        {signInMethod === 'email' && (
          <form onSubmit={handleSignIn}>
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
              <Link href="/forgot-password">
                <Typography variant="body2" color="primary">
                  Forgot password?
                </Typography>
              </Link>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              startIcon={<Email />}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        )}

        {/* Magic Link form */}
        {signInMethod === 'magic' && (
          <form onSubmit={handleMagicLinkSignIn}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={magicLinkEmail}
              onChange={(e) => setMagicLinkEmail(e.target.value)}
              required
              helperText="We'll send a sign-in link to this email"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={isLoading}
              startIcon={<LinkIcon />}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>
        )}
        
        {/* Email OTP form */}
        {signInMethod === 'otp' && (
          <EmailOTPForm redirectPath="/dashboard" />
        )}
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account? <Link href="/signup">Sign up</Link>
          </Typography>
        </Box>
        
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
      </Paper>
    </Box>
  );
}
