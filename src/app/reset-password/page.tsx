"use client";
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container, 
  Alert, 
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { createPasswordRecovery, completePasswordRecovery } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Visibility, VisibilityOff, LockReset, Email } from '@mui/icons-material';
import Link from 'next/link';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we're in reset mode (have userId and secret in URL)
    const hasResetParams = searchParams.has('userId') && searchParams.has('secret');
    setIsResetMode(hasResetParams);
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      await createPasswordRecovery(email);
      setSuccess(true);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setError('Failed to send reset email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const userId = searchParams.get('userId') || '';
      const secret = searchParams.get('secret') || '';
      await completePasswordRecovery(userId, secret, newPassword);
      setSuccess(true);
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (error) {
      console.error('Error completing password reset:', error);
      setError('Failed to reset password. The link may have expired or been used already.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
          pt: { xs: '80px', sm: '100px' }, // Add padding-top to account for header
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>
            {isResetMode ? 'Reset Your Password' : 'Forgot Password'}
          </Typography>
          
          {!isResetMode && !success && (
            <form onSubmit={handleRequestReset}>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              
              <Button 
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'linear-gradient(90deg, #3B82F6 0%, #1E40AF 100%)',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #2563EB 0%, #1E3A8A 100%)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
              </Button>
            </form>
          )}
          
          {isResetMode && !success && (
            <form onSubmit={handleCompleteReset}>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                Create a new password for your account.
              </Typography>
              
              <TextField
                fullWidth
                label="New Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockReset color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockReset color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              
              <Button 
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'linear-gradient(90deg, #3B82F6 0%, #1E40AF 100%)',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #2563EB 0%, #1E3A8A 100%)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
            </form>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {isResetMode ? 
                'Password reset successful! Redirecting to login...' : 
                'Reset link sent! Please check your email.'}
            </Alert>
          )}
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Remember your password? <Link href="/signin">Sign in</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
