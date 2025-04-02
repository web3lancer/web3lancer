'use client';

import React, { useState } from 'react';
import { Box, Typography, Container, Paper, Alert, Button, Divider, TextField, IconButton, Tabs, Tab } from '@mui/material';
import { GitHub, Email } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ConnectWallet } from '@/components/ConnectWallet';
import { signUp, convertAnonymousSession } from '@/utils/api';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import EmailOTPForm from '@/components/EmailOTPForm';

export default function SignUpPage() {
  const router = useRouter();
  const { isAnonymous, setIsAnonymous } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [signupMethod, setSignupMethod] = useState<'email' | 'otp'>('email');
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let response;

      // If user has an anonymous session, convert it instead of creating new account
      if (isAnonymous) {
        response = await convertAnonymousSession(formData.email, formData.password, formData.name);
        setIsAnonymous(false);
      } else {
        // Regular signup flow
        response = await signUp(formData.email, formData.password, formData.name);
      }

      if (response) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Failed to create account. Email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle GitHub sign up
  const handleGitHubSignUp = () => {
    // Redirect to GitHub OAuth flow
    window.location.href = '/api/auth/github';
  };

  // Function to handle closing the wallet connect modal
  const handleCloseWalletConnect = () => {
    setShowWalletConnect(false);
    // Reset any ongoing wallet connection attempts
    if (window.ethereum && window.ethereum.removeAllListeners) {
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
          Create Account
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sign up to get started with Web3Lancer
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
            onClick={handleGitHubSignUp}
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
            Or sign up with email
          </Typography>
        </Divider>
        
        {/* Sign up method selector */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={signupMethod} 
            onChange={(_, value) => setSignupMethod(value)}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Email/Password" value="email" />
            <Tab label="Email OTP" value="otp" />
          </Tabs>
        </Box>
        
        {/* Email/Password form */}
        {signupMethod === 'email' && (
          <form onSubmit={handleSignUp}>
            <TextField
              label="Name"
              name="name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={handleChange}
              required
            />
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
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={isLoading}
              startIcon={<Email />}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        )}
        
        {/* Email OTP form */}
        {signupMethod === 'otp' && (
          <EmailOTPForm redirectPath="/dashboard" />
        )}
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account? <Link href="/signin">Sign in</Link>
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
