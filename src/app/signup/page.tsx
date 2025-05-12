'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, Button, Divider, Tabs, Tab, 
  useMediaQuery, Stack, Card, CardContent, Fade, useTheme } from '@mui/material';
import { GitHub, Email, Link as LinkIcon, Google as GoogleIcon, Login } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ConnectWallet } from '@/components/ConnectWallet';
import { signUp, createMagicURLToken } from '@/utils/api';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import EmailOTPForm from '@/components/EmailOTPForm';
import { ThemeAwareTextField } from '@/components/auth/ThemeAwareTextField';
import { motion } from 'framer-motion';

// Define a type for window.ethereum if it exists
interface EthereumWindow extends Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] | object }) => Promise<any>;
    on?: (event: string, handler: (...args: any[]) => void) => void;
    removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    removeAllListeners?: () => void;
  };
}

declare const window: EthereumWindow;

// Motion components for animations
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

export default function SignUpPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAnonymous, setIsAnonymous, initiateGitHubLogin, initiateGoogleLogin, convertSession, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [signupMethod, setSignupMethod] = useState<'email' | 'otp' | 'magic'>('email');
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let response;

      // If user has an anonymous session, convert it using the context function
      if (isAnonymous) {
        console.log('Converting anonymous session for:', formData.email);
        response = await convertSession(formData.email, formData.password, formData.name);
      } else {
        // Regular signup flow
        console.log('Performing regular signup for:', formData.email);
        response = await signUp(formData.email, formData.password, formData.name);
      }

      if (response) {
        console.log('Signup/Conversion successful, redirecting...');
        await refreshUser();
        router.push('/dashboard');
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during sign up/conversion:', error);
      setError(`Failed to create account. ${error instanceof Error ? error.message : 'Email may already be in use or another error occurred.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!magicLinkEmail || !/^\S+@\S+\.\S+$/.test(magicLinkEmail)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      await createMagicURLToken(magicLinkEmail);
      setSuccess('Magic link sent! Check your email to sign in.');
    } catch (error) {
      console.error('Error sending magic link:', error);
      setError(`Failed to send magic link. ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignUp = () => {
    initiateGitHubLogin();
  };

  const handleGoogleSignUp = () => {
    initiateGoogleLogin();
  };

  const handleCloseWalletConnect = () => {
    setShowWalletConnect(false);
    if (window.ethereum && window.ethereum.removeAllListeners) {
      window.ethereum.removeAllListeners();
    }
  };

  useEffect(() => {
    return () => {
      if (window.ethereum && typeof window.ethereum.removeAllListeners === 'function') {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      p: { xs: 2, sm: 4 },
      pt: { xs: '80px', sm: '100px' },
      background: theme => theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
        : 'linear-gradient(135deg, #f6f7f9 0%, #ffffff 100%)',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
    }}>
      <MotionPaper 
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        sx={{ 
          maxWidth: { xs: '100%', sm: 580 },
          width: '100%',
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          boxShadow: theme => theme.palette.mode === 'dark'
            ? '0 8px 40px rgba(0, 0, 0, 0.4)'
            : '0 8px 40px rgba(0, 0, 0, 0.12)',
          background: theme => theme.palette.mode === 'dark'
            ? 'rgba(26, 32, 44, 0.9)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          color: theme => theme.palette.text.primary,
          overflow: 'hidden'
        }}
      >
        <MotionBox variants={fadeInUp}>
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 800, 
            textAlign: 'center',
            background: theme => theme.palette.mode === 'dark' 
              ? 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)' 
              : 'linear-gradient(90deg, #0072ff 0%, #00c6ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Sign up to get started with Web3Lancer
          </Typography>
        </MotionBox>
        
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          </Fade>
        )}
        
        {success && (
          <Fade in={!!success}>
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </Fade>
        )}
        
        <MotionBox variants={fadeInUp} sx={{ mb: 4 }}>
          <Typography variant="subtitle2" textAlign="center" sx={{ mb: 2, opacity: 0.8 }}>
            Sign up with
          </Typography>
          
          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={2} 
            sx={{ width: '100%', justifyContent: 'center' }}
          >
            <Button
              variant="outlined"
              startIcon={<GitHub />}
              onClick={handleGitHubSignUp}
              fullWidth={isMobile}
              disabled={isLoading}
              sx={{
                py: 1.5,
                px: isMobile ? 2 : 4,
                borderRadius: '12px',
                borderWidth: '2px',
                borderColor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.1)',
                color: theme => theme.palette.mode === 'dark' 
                  ? theme.palette.common.white 
                  : theme.palette.grey[900],
                backgroundColor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.02)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme => theme.palette.mode === 'dark' 
                    ? '0 8px 16px rgba(0,0,0,0.4)' 
                    : '0 8px 16px rgba(0,0,0,0.1)',
                  borderColor: theme => theme.palette.mode === 'dark' 
                    ? theme.palette.primary.main 
                    : theme.palette.primary.main,
                },
                flex: isMobile ? 'auto' : 1
              }}
            >
              GitHub
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignUp}
              fullWidth={isMobile}
              disabled={isLoading}
              sx={{
                py: 1.5,
                px: isMobile ? 2 : 4,
                borderRadius: '12px',
                borderWidth: '2px',
                borderColor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.1)',
                color: theme => theme.palette.mode === 'dark' 
                  ? theme.palette.common.white 
                  : theme.palette.grey[900],
                backgroundColor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.02)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme => theme.palette.mode === 'dark' 
                    ? '0 8px 16px rgba(0,0,0,0.4)' 
                    : '0 8px 16px rgba(0,0,0,0.1)',
                  borderColor: theme => theme.palette.mode === 'dark' 
                    ? theme.palette.primary.main 
                    : theme.palette.primary.main,
                },
                flex: isMobile ? 'auto' : 1
              }}
            >
              Google
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setShowWalletConnect(true)}
              fullWidth={isMobile}
              disabled={isLoading}
              sx={{
                py: 1.5,
                px: isMobile ? 2 : 4,
                borderRadius: '12px',
                borderWidth: '2px',
                borderColor: theme => theme.palette.mode === 'dark' 
            />
            <ThemeAwareTextField
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
              sx={{ 
                mt: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
              disabled={isLoading}
              startIcon={<Email />}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        )}

        {signupMethod === 'magic' && (
          <form onSubmit={handleMagicLinkSignUp}>
            <ThemeAwareTextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={magicLinkEmail}
              onChange={(e) => setMagicLinkEmail(e.target.value)}
              required
              helperText="We'll send a sign-up link to this email"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ 
                mt: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
              disabled={isLoading}
              startIcon={<LinkIcon />}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>
        )}
        
        {signupMethod === 'otp' && (
          <EmailOTPForm redirectPath="/dashboard" />
        )}
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account? <Link href="/signin" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Sign in</Link>
          </Typography>
        </Box>
        
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
              bgcolor: theme => theme.palette.mode === 'dark'
                ? 'rgba(0, 0, 0, 0.7)'
                : 'rgba(255, 255, 255, 0.7)',
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
