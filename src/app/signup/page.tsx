'use client';

import React, { useState } from 'react';
import { Box, Typography, Container, Paper, Alert, Button, Divider, TextField, IconButton } from '@mui/material';
import { GitHub, Email } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ConnectWallet } from '@/components/ConnectWallet';
import { signUp } from '@/utils/api';
import Link from 'next/link';
import { useMultiAccount } from '@/contexts/MultiAccountContext';

export default function SignUpPage() {
  const router = useRouter();
  const { addAccount, hasMaxAccounts } = useMultiAccount();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (hasMaxAccounts) {
      setError('Maximum number of accounts (3) reached. Please remove an account before adding a new one.');
      setIsLoading(false);
      return;
    }

    try {
      // This matches the Appwrite docs pattern for creating users
      const response = await signUp(formData.email, formData.password, formData.name);
      
      if (response) {
        // Add the new account to multi-accounts
        try {
          addAccount({
            $id: response.$id,
            name: response.name,
            email: response.email,
            isActive: true
          });
        } catch (error) {
          console.error('Error adding account:', error);
        }
        
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
    if (hasMaxAccounts) {
      setError('Maximum number of accounts (3) reached. Please remove an account before adding a new one.');
      return;
    }
    // Redirect to GitHub OAuth flow
    window.location.href = '/api/auth/github';
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 4, pb: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
            Create an Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join Web3Lancer to start your decentralized freelancing journey
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
          <Typography variant="h6" sx={{ mb: 3 }}>Connect Wallet</Typography>
          <ConnectWallet />
          
          <Divider sx={{ my: 4 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>
          
          {/* Email Sign Up Form */}
          <Box component="form" onSubmit={handleSignUp} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Sign up with Email</Typography>
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
          </Box>
          
          {/* GitHub Sign Up */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GitHub />}
            onClick={handleGitHubSignUp}
            sx={{ mb: 2 }}
          >
            Sign Up with GitHub
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link href="/signin" style={{ color: '#1E40AF', fontWeight: 600 }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
}
