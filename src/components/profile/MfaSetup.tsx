"use client";
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  TextField,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid
} from '@mui/material';
import { 
  Security, 
  Email, 
  VerifiedUser, 
  Check, 
  FileCopy, 
  Key, 
  LockOpen, 
  Warning
} from '@mui/icons-material';
import { 
  listMfaFactors, 
  createMfaRecoveryCodes, 
  updateMfa, 
  createEmailVerification,
  createMfaChallenge,
  updateMfaChallenge
} from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

export default function MfaSetup() {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [factors, setFactors] = useState<any>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [openRecoveryDialog, setOpenRecoveryDialog] = useState(false);
  const [recoveryCodesGenerated, setRecoveryCodesGenerated] = useState(false);
  
  const steps = ['Verify Email', 'Generate Recovery Codes', 'Enable MFA'];
  
  // Fetch MFA status on component mount
  useEffect(() => {
    async function checkMfaStatus() {
      try {
        setLoading(true);
        const factorsData = await listMfaFactors();
        setFactors(factorsData);
        setMfaEnabled(factorsData.email === true);
        
        // If MFA is already set up, skip to the last step
        if (factorsData.email === true) {
          setActiveStep(3);
        }
      } catch (error) {
        console.error('Error checking MFA status:', error);
        setError('Failed to check MFA status. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      checkMfaStatus();
    }
  }, [user]);
  
  // Step 1: Send email verification
  const handleSendVerification = async () => {
    try {
      setLoading(true);
      await createEmailVerification();
      setVerificationSent(true);
      setError(null);
    } catch (error) {
      console.error('Error sending verification email:', error);
      setError('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Generate recovery codes
  const handleGenerateRecoveryCodes = async () => {
    try {
      setLoading(true);
      const codes = await createMfaRecoveryCodes();
      setRecoveryCodes(codes);
      setRecoveryCodesGenerated(true);
      setOpenRecoveryDialog(true);
      setError(null);
      setActiveStep(2);
    } catch (error) {
      console.error('Error generating recovery codes:', error);
      setError('Failed to generate recovery codes. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Step 3: Enable MFA
  const handleEnableMfa = async () => {
    try {
      setLoading(true);
      
      // Create MFA challenge for email
      const challenge = await createMfaChallenge('email');
      setChallengeId(challenge.$id);
      setError(null);
    } catch (error) {
      console.error('Error creating MFA challenge:', error);
      setError('Failed to create MFA challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Verify MFA challenge
  const handleVerifyChallenge = async () => {
    if (!challengeId || !verificationCode) {
      setError('Please enter the verification code sent to your email.');
      return;
    }
    
    try {
      setLoading(true);
      await updateMfaChallenge(challengeId, verificationCode);
      
      // After successful verification, enable MFA
      await updateMfa(true);
      
      // Update local state
      setMfaEnabled(true);
      setActiveStep(3);
      setError(null);
    } catch (error) {
      console.error('Error verifying MFA challenge:', error);
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle MFA on/off
  const handleToggleMfa = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMfaState = event.target.checked;
    
    // If turning off MFA, show confirmation dialog
    if (!newMfaState) {
      if (confirm('Are you sure you want to disable MFA? This will decrease the security of your account.')) {
        try {
          setLoading(true);
          await updateMfa(false);
          setMfaEnabled(false);
          setActiveStep(0);
          setRecoveryCodesGenerated(false);
          setError(null);
        } catch (error) {
          console.error('Error disabling MFA:', error);
          setError('Failed to disable MFA. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    } else {
      // If turning on MFA, start the setup process
      setActiveStep(0);
    }
  };
  
  // Copy recovery codes to clipboard
  const handleCopyRecoveryCodes = () => {
    const text = recoveryCodes.join('\n');
    navigator.clipboard.writeText(text);
    alert('Recovery codes copied to clipboard!');
  };
  
  if (loading && !factors) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ 
        p: 3, 
        borderRadius: 2,
        boxShadow: theme.shadows[1],
        mb: 4
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Security color="primary" sx={{ mr: 2 }} />
        <Typography variant="h6" component="h2">
          Multi-Factor Authentication (MFA)
        </Typography>
        
        {mfaEnabled && (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              MFA is {mfaEnabled ? 'enabled' : 'disabled'}
            </Typography>
            <Switch
              checked={mfaEnabled}
              onChange={handleToggleMfa}
              color="primary"
            />
          </Box>
        )}
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add an extra layer of security to your account by requiring an additional verification step when signing in.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* MFA Status & Toggle for accounts with MFA already set up */}
      {mfaEnabled ? (
        <Box sx={{ mb: 3 }}>
          <Alert severity="success" icon={<VerifiedUser />} sx={{ mb: 3 }}>
            Your account is protected with multi-factor authentication.
          </Alert>
          
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<Key />}
            onClick={() => setOpenRecoveryDialog(true)}
            sx={{ mr: 2 }}
          >
            View Recovery Codes
          </Button>
        </Box>
      ) : (
        <>
          {/* Stepper for MFA setup process */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Step content */}
          <Box sx={{ mt: 2, mb: 4 }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Step 1: Verify Your Email
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Before setting up MFA, we need to verify your email address.
                </Typography>
                
                {verificationSent ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Verification email sent! Please check your inbox and follow the link to verify your email. After verification, return here and proceed to the next step.
                  </Alert>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Email />}
                    onClick={handleSendVerification}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Send Verification Email'}
                  </Button>
                )}
                
                {verificationSent && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setActiveStep(1)}
                    sx={{ mt: 2 }}
                  >
                    I've Verified My Email
                  </Button>
                )}
              </Box>
            )}
            
            {activeStep === 1 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Step 2: Generate Recovery Codes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Recovery codes allow you to access your account if you lose access to your authentication method. Save these codes in a secure place - they will only be shown once.
                </Typography>
                
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Important:</strong> Without these recovery codes, you may lose access to your account if you cannot access your email.
                  </Typography>
                </Alert>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Key />}
                  onClick={handleGenerateRecoveryCodes}
                  disabled={loading || recoveryCodesGenerated}
                >
                  {loading ? <CircularProgress size={24} /> : 'Generate Recovery Codes'}
                </Button>
              </Box>
            )}
            
            {activeStep === 2 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Step 3: Enable MFA
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  When you enable MFA, you will need to enter a verification code sent to your email each time you log in.
                </Typography>
                
                {challengeId ? (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Enter the verification code sent to your email:
                    </Typography>
                    
                    <TextField
                      label="Verification Code"
                      variant="outlined"
                      fullWidth
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleVerifyChallenge}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Verify & Enable MFA'}
                    </Button>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<LockOpen />}
                    onClick={handleEnableMfa}
                    disabled={loading || !recoveryCodesGenerated}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Enable MFA'}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </>
      )}
      
      {/* Recovery Codes Dialog */}
      <Dialog
        open={openRecoveryDialog}
        onClose={() => setOpenRecoveryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Key color="primary" sx={{ mr: 1 }} />
            Recovery Codes
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            <strong>Important:</strong> Store these recovery codes in a secure place. Each code can only be used once to recover access to your account if you lose access to your authentication methods.
          </DialogContentText>
          
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: theme.palette.background.default,
              borderRadius: 1,
              mb: 2,
              fontFamily: 'monospace'
            }}
          >
            <Grid container spacing={1}>
              {recoveryCodes.map((code, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Typography variant="body2" fontFamily="monospace">
                    {code}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          <Button
            startIcon={<FileCopy />}
            variant="outlined"
            onClick={handleCopyRecoveryCodes}
          >
            Copy to Clipboard
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRecoveryDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
