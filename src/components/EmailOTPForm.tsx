"use client";
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress, 
  Alert,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Paper
} from '@mui/material';
import { Email, VpnKey } from '@mui/icons-material';
import { createEmailOTP, verifyEmailOTP, signOut } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getThemeAwareTextFieldStyles } from '@/utils/themeUtils';

interface EmailOTPFormProps {
  redirectPath?: string;
}

export default function EmailOTPForm({ redirectPath = '/dashboard' }: EmailOTPFormProps) {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [enableSecurityPhrase, setEnableSecurityPhrase] = useState(true);
  const [securityPhrase, setSecurityPhrase] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setUser } = useAuth();
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Ensure we have no active sessions before requesting OTP
      await signOut();
      
      const response = await createEmailOTP(email, enableSecurityPhrase);
      setUserId(response.userId);
      setSecurityPhrase(response.securityPhrase);
      setOtpSent(true);
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!otpCode || otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      setError('Please enter a valid 6-digit OTP code');
      setIsLoading(false);
      return;
    }

    if (!userId) {
      setError('Session expired. Please request a new OTP');
      setIsLoading(false);
      return;
    }

    try {
      // Ensure no active sessions before verifying
      await signOut();
      
      const user = await verifyEmailOTP(userId, otpCode);
      
      if (user) {
        setUser(user);
        router.push(redirectPath);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Invalid OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {!otpSent ? (
        <form onSubmit={handleSendOTP}>
          <Typography variant="h6" gutterBottom>
            Sign In with Email OTP
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We'll send a one-time password to your email
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
            sx={{
              ...getThemeAwareTextFieldStyles()
            }}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={enableSecurityPhrase}
                onChange={(e) => setEnableSecurityPhrase(e.target.checked)}
                color="primary"
              />
            }
            label="Enable security phrase (recommended)"
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            A security phrase helps protect against phishing attacks
          </Typography>
          
          {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
          
          <Button 
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 2, 
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
            {isLoading ? <CircularProgress size={24} /> : 'Send OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <Typography variant="h6" gutterBottom>
            Enter Verification Code
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We've sent a 6-digit code to {email}
          </Typography>
          
          {securityPhrase && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              <Typography variant="subtitle2" gutterBottom color="primary">
                Security Phrase:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {securityPhrase}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Verify this phrase matches the one in the email before entering your code
              </Typography>
            </Paper>
          )}
          
          <TextField
            fullWidth
            label="6-Digit Code"
            variant="outlined"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
            margin="normal"
            required
            inputProps={{ 
              maxLength: 6,
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VpnKey color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{
              ...getThemeAwareTextFieldStyles()
            }}
          />
          
          {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
          
          <Button 
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 2, 
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
            {isLoading ? <CircularProgress size={24} /> : 'Verify Code'}
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button 
              variant="text" 
              color="primary"
              onClick={() => setOtpSent(false)}
              disabled={isLoading}
            >
              Change Email
            </Button>
            
            <Button 
              variant="text" 
              color="primary"
              onClick={handleSendOTP}
              disabled={isLoading}
            >
              Resend Code
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
}
