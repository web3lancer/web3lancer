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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  IconButton
} from '@mui/material';
import { 
  Security, 
  Key, 
  Lock, 
  DeleteOutline, 
  GitHub, 
  Google, 
  Twitter, 
  LinkedIn 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import MfaSetup from '@/components/profile/MfaSetup';

interface SecuritySectionProps {
  section: 'password' | '2fa' | 'connected';
}

export default function SecuritySection({ section }: SecuritySectionProps) {
  const { user, updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Simulated connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: 'github', name: 'GitHub', connected: true, icon: <GitHub /> },
    { id: 'google', name: 'Google', connected: true, icon: <Google /> },
    { id: 'twitter', name: 'Twitter', connected: false, icon: <Twitter /> },
    { id: 'linkedin', name: 'LinkedIn', connected: false, icon: <LinkedIn /> },
  ]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Call your auth service's password update method
      await updatePassword(currentPassword, newPassword);
      
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Failed to update password. Please check your current password and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleConnectedAccount = (accountId: string) => {
    setConnectedAccounts(accounts => 
      accounts.map(account => 
        account.id === accountId 
          ? { ...account, connected: !account.connected } 
          : account
      )
    );
  };
  
  const removeConnectedAccount = (accountId: string) => {
    if (confirm(`Are you sure you want to disconnect your ${accountId} account?`)) {
      setConnectedAccounts(accounts => 
        accounts.map(account => 
          account.id === accountId 
            ? { ...account, connected: false } 
            : account
        )
      );
    }
  };

  // Password Change Section
  if (section === 'password') {
    return (
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Lock sx={{ mr: 1 }} />
          Change Password
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Update your password to maintain account security. We recommend using a strong, unique password.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Paper sx={{ p: 3, maxWidth: 500, mb: 4, borderRadius: 2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' }}>
          <form onSubmit={handlePasswordChange}>
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              margin="normal"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={loading}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                }
              }}
            />
            
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              helperText="Password must be at least 8 characters"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                }
              }}
            />
            
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              error={newPassword !== confirmPassword && confirmPassword !== ''}
              helperText={newPassword !== confirmPassword && confirmPassword !== '' ? 'Passwords do not match' : ''}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                }
              }}
            />
            
            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                startIcon={loading ? <CircularProgress size={20} /> : <Key />}
                sx={{ 
                  borderRadius: 2, 
                  py: 1,
                  background: 'linear-gradient(90deg, #2097ff 0%, #7857ff 100%)',
                  boxShadow: '0 4px 12px rgba(32, 151, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(32, 151, 255, 0.25)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </form>
        </Paper>
        
        <Alert 
          severity="info" 
          sx={{ 
            mt: 2, 
            borderRadius: 2, 
            background: 'linear-gradient(135deg, rgba(32, 151, 255, 0.08) 0%, rgba(120, 87, 255, 0.08) 100%)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid',
            borderColor: 'info.light'
          }}
        >
          <Typography variant="body2">
            <strong>Password Tip:</strong> Use a combination of uppercase letters, lowercase letters, numbers, and special characters to create a strong password.
          </Typography>
        </Alert>
      </Box>
    );
  }
  
  // Two-Factor Authentication Section
  if (section === '2fa') {
    return (
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Security sx={{ mr: 1 }} />
          Two-Factor Authentication
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Protect your account with an additional layer of security by enabling two-factor authentication.
        </Typography>
        
        <MfaSetup />
        
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Security Tip:</strong> Two-factor authentication significantly improves your account security by requiring something you know (password) and something you have (email access).
          </Typography>
        </Alert>
      </Box>
    );
  }
  
  // Connected Accounts Section
  if (section === 'connected') {
    return (
      <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Lock sx={{ mr: 1 }} />
          Connected Accounts
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage the external accounts connected to your Web3Lancer profile. Connected accounts can be used for login and authentication.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <List>
            {connectedAccounts.map((account) => (
              <React.Fragment key={account.id}>
                <ListItem>
                  <ListItemIcon>
                    {account.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={account.name}
                    secondary={account.connected ? "Connected" : "Not connected"}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={account.connected}
                      onChange={() => toggleConnectedAccount(account.id)}
                    />
                    {account.connected && (
                      <IconButton 
                        edge="end" 
                        aria-label="disconnect" 
                        onClick={() => removeConnectedAccount(account.id)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteOutline />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
        
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Tip:</strong> Connecting multiple accounts provides alternative login methods and enhances your profile with information from these platforms.
          </Typography>
        </Alert>
      </Box>
    );
  }
  
  return null;
}
