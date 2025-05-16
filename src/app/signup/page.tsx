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
import { ProfileType } from "@/types";

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
    username: '',
    profileType: 'individual' as ProfileType,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    if (!formData.username.trim()) {
      setError("Username is required");
      setIsLoading(false);
      return;
    }

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
        router.push('/home');
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
              Connect Wallet
            </Button>
          </Stack>
        </MotionBox>
        
        <Divider sx={{ 
          my: 3,
          '&::before, &::after': {
            borderColor: theme => theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)',
          }
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
            or continue with
          </Typography>
        </Divider>
        
        <MotionBox variants={fadeInUp} sx={{ mb: 4 }}>
          <Tabs 
            value={signupMethod} 
            onChange={(_, value) => setSignupMethod(value)}
            variant="fullWidth"
            orientation={isMobile ? "vertical" : "horizontal"}
            sx={{ 
              mb: 3,
              '& .MuiTab-root': {
                color: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.7)' 
                  : 'rgba(0, 0, 0, 0.7)',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: isMobile ? 2 : 0,
                my: isMobile ? 0.5 : 0,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.05)',
                }
              },
              '& .Mui-selected': {
                color: theme => theme.palette.mode === 'dark' 
                  ? theme.palette.primary.light 
                  : theme.palette.primary.main,
                fontWeight: 700,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: isMobile ? 0 : 3,
                borderRadius: 2
              },
              border: isMobile ? 'none' : theme => `1px solid ${theme.palette.divider}`,
              borderRadius: isMobile ? 0 : 2,
              p: isMobile ? 0 : 0.5,
            }}
          >
            <Tab 
              label="Email Password" 
              value="email" 
              icon={<Email fontSize="small" />} 
              iconPosition="start"
            />
            <Tab 
              label="Magic Link" 
              value="magic" 
              icon={<LinkIcon fontSize="small" />} 
              iconPosition="start"
            />
            <Tab 
              label="Email OTP" 
              value="otp" 
              icon={<Login fontSize="small" />} 
              iconPosition="start"
            />
          </Tabs>
          
          <Card 
            elevation={0} 
            sx={{ 
              p: 0, 
              backgroundColor: 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              {signupMethod === 'email' && (
                <Fade in={signupMethod === 'email'}>
                  <form onSubmit={handleSignUp}>
                    <ThemeAwareTextField
                      label="Full Name"
                      name="name"
                      type="text"
                      fullWidth
                      margin="normal"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.15)' 
                              : 'rgba(0, 0, 0, 0.15)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.25)' 
                              : 'rgba(0, 0, 0, 0.25)',
                          },
                        }
                      }}
                    />
                    <ThemeAwareTextField
                      label="Username"
                      name="username"
                      type="text"
                      fullWidth
                      margin="normal"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.15)' 
                              : 'rgba(0, 0, 0, 0.15)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.25)' 
                              : 'rgba(0, 0, 0, 0.25)',
                          },
                        }
                      }}
                    />
                    <ThemeAwareTextField
                      label="Email"
                      name="email"
                      type="email"
                      fullWidth
                      margin="normal"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.15)' 
                              : 'rgba(0, 0, 0, 0.15)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.25)' 
                              : 'rgba(0, 0, 0, 0.25)',
                          },
                        }
                      }}
                    />
                    <ThemeAwareTextField
                      label="Profile Type"
                      name="profileType"
                      select
                      fullWidth
                      margin="normal"
                      value={formData.profileType}
                      onChange={handleChange}
                      required
                      SelectProps={{
                        native: true,
                      }}
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.15)' 
                              : 'rgba(0, 0, 0, 0.15)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.25)' 
                              : 'rgba(0, 0, 0, 0.25)',
                          },
                        }
                      }}
                    >
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                      <option value="dao">DAO</option>
                    </ThemeAwareTextField>
                    <ThemeAwareTextField
                      label="Password"
                      name="password"
                      type="password"
                      fullWidth
                      margin="normal"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.15)' 
                              : 'rgba(0, 0, 0, 0.15)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.25)' 
                              : 'rgba(0, 0, 0, 0.25)',
                          },
                        }
                      }}
                    />
                    <ThemeAwareTextField
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      fullWidth
                      margin="normal"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.15)' 
                              : 'rgba(0, 0, 0, 0.15)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.25)' 
                              : 'rgba(0, 0, 0, 0.25)',
                          },
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{ 
                        mt: 3,
                        py: 1.5,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: 2,
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                        },
                      }}
                      disabled={isLoading}
                      startIcon={<Email />}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </Fade>
              )}
              
              {signupMethod === 'magic' && (
                <Fade in={signupMethod === 'magic'}>
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
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.15)' 
                              : 'rgba(0, 0, 0, 0.15)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme => theme.palette.mode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.25)' 
                              : 'rgba(0, 0, 0, 0.25)',
                          },
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{ 
                        mt: 3,
                        py: 1.5,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: 2,
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                        },
                      }}
                      disabled={isLoading}
                      startIcon={<LinkIcon />}
                    >
                      {isLoading ? 'Sending...' : 'Send Magic Link'}
                    </Button>
                  </form>
                </Fade>
              )}
              
              {signupMethod === 'otp' && (
                <Fade in={signupMethod === 'otp'}>
                  <Box>
                    <EmailOTPForm redirectPath="/home" />
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>
        </MotionBox>
        
        <MotionBox variants={fadeInUp} sx={{ 
          mt: 4, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Already have an account?{' '}
            <Link href="/signin" style={{ 
              color: theme.palette.primary.main, 
              textDecoration: 'none',
              fontWeight: 600,
              position: 'relative'
            }}>
              Sign in
            </Link>
          </Typography>
        </MotionBox>
        
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
                ? 'rgba(0, 0, 0, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
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
                position: 'relative',
                borderRadius: 3,
                boxShadow: theme => theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Button
                variant="contained"
                color="primary" 
                onClick={handleCloseWalletConnect}
                sx={{ 
                  position: 'absolute', 
                  right: 16, 
                  top: 16, 
                  zIndex: 10,
                  minWidth: 'auto',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  p: 0
                }}
              >
                &times;
              </Button>
              <ConnectWallet key={`wallet-connect-${showWalletConnect}`} />
            </Box>
          </Box>
        )}
      </MotionPaper>
    </Box>
  );
}
