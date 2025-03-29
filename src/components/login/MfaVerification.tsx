"use client";
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  InputAdornment
} from '@mui/material';
import { 
  Security,
  Key,
  Email
} from '@mui/icons-material';
import { 
  createMfaChallenge, 
  updateMfaChallenge 
} from '@/utils/api';

interface MfaVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MfaVerification({ onSuccess, onCancel }: MfaVerificationProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'recovery'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeSent, setChallengeSent] = useState(false);
  
  // Request MFA challenge for email
  const handleRequestEmailChallenge = async () => {
    try {
      setLoading(true);
      const challenge = await createMfaChallenge('email');
      setChallengeId(challenge.$id);
      setChallengeSent(true);
      setError(null);
    } catch (error) {
      console.error('Error creating MFA email challenge:', error);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Request MFA challenge for recovery code
  const handleRequestRecoveryChallenge = async () => {
    try {
      setLoading(true);
      const challenge = await createMfaChallenge('recoverycode');
      setChallengeId(challenge.$id);
      setChallengeSent(true);
      setError(null);
    } catch (error) {
      console.error('Error creating MFA recovery challenge:', error);
      setError('Failed to initiate recovery code verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Verify email code
  const handleVerifyEmailCode = async () => {
    if (!challengeId || !verificationCode) {
      setError('Please enter the verification code sent to your email.');
      return;
    }
    
    try {
      setLoading(true);
      await updateMfaChallenge(challengeId, verificationCode);
      onSuccess();
    } catch (error) {
      console.error('Error verifying email code:', error);
      setError('Invalid verification code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Verify recovery code
  const handleVerifyRecoveryCode = async () => {
    if (!challengeId || !recoveryCode) {
      setError('Please enter a recovery code.');
      return;
    }
    
    try {
      setLoading(true);
      await updateMfaChallenge(challengeId, recoveryCode);
      onSuccess();
    } catch (error) {
      console.error('Error verifying recovery code:', error);
      setError('Invalid recovery code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 4, maxWidth: 500, mx: 'auto', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Security color="primary" sx={{ mr: 2 }} />
        <Typography variant="h5">
          Two-Factor Authentication
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your account is protected with multi-factor authentication. Please verify your identity using one of the methods below.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => {
          setActiveTab(newValue);
          setChallengeId(null);
          setChallengeSent(false);
        }}
        sx={{ mb: 3 }}
      >
        <Tab label="Email Verification" value="email" />
        <Tab label="Recovery Code" value="recovery" />
      </Tabs>
      
      {activeTab === 'email' && (
        <Box>
          {!challengeSent ? (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                We'll send a verification code to your email address.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<Email />}
                onClick={handleRequestEmailChallenge}
                disabled={loading}
                fullWidth
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enter the verification code sent to your email:
              </Typography>
              
              <TextField
                label="Verification Code"
                variant="outlined"
                fullWidth
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleVerifyEmailCode}
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Verify'}
              </Button>
            </>
          )}
        </Box>
      )}
      
      {activeTab === 'recovery' && (
        <Box>
          {!challengeSent ? (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Use one of the recovery codes you saved when setting up MFA.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<Key />}
                onClick={handleRequestRecoveryChallenge}
                disabled={loading}
                fullWidth
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Continue with Recovery Code'}
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enter one of your recovery codes:
              </Typography>
              
              <TextField
                label="Recovery Code"
                variant="outlined"
                fullWidth
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder="Example: b654562828"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Each recovery code can only be used once.
              </Alert>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleVerifyRecoveryCode}
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Verify'}
              </Button>
            </>
          )}
        </Box>
      )}
      
      <Button
        variant="text"
        color="inherit"
        onClick={onCancel}
        sx={{ mt: 3 }}
      >
        Cancel
      </Button>
    </Paper>
  );
}
