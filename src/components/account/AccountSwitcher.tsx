import React, { useState } from 'react';
import { Box, Avatar, Typography, Button, Divider, Paper, List, ListItem, ListItemAvatar, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, CircularProgress, TextField, DialogActions } from '@mui/material';
import { Add, Delete, ExitToApp, Check, Lock } from '@mui/icons-material';
import { useMultiAccount, UserAccount } from '@/contexts/MultiAccountContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount, useDisconnect } from 'wagmi';

// Renders the appropriate avatar for an account
const AccountAvatar = ({ account }: { account: UserAccount }) => {
  // If the account has a profile picture, use it
  if (account.profilePicture) {
    return (
      <Avatar 
        src={account.profilePicture}
        alt={account.name || 'User'}
        sx={{ 
          width: 40, 
          height: 40,
          border: account.isActive ? '2px solid #1E40AF' : 'none'
        }}
      />
    );
  }

  // Otherwise, use the first letter of the name or wallet address
  const firstLetter = account.name 
    ? account.name.charAt(0).toUpperCase()
    : account.walletId 
      ? account.walletId.charAt(0).toUpperCase() 
      : 'U';

  return (
    <Avatar
      sx={{
        width: 40,
        height: 40,
        background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
        border: account.isActive ? '2px solid #1E40AF' : 'none',
        boxShadow: account.isActive ? '0 0 0 2px rgba(30, 64, 175, 0.2)' : 'none',
      }}
    >
      {firstLetter}
    </Avatar>
  );
};

// Format wallet address for display
const formatAddress = (addr?: string) => {
  if (!addr) return '';
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

export function AccountSwitcher() {
  const { accounts, activeAccount, removeAccount, switchAccount, hasMaxAccounts } = useMultiAccount();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const handleSwitchAccount = async (accountId: string) => {
    if (activeAccount?.$id === accountId) return; // Don't switch if already active
    
    try {
      setIsSwitching(true);
      await switchAccount(accountId);
      
      // Redirect to dashboard after successful switch
      router.push('/dashboard');
    } catch (error) {
      console.error("Error switching accounts:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleRemoveAccount = async (accountId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (activeAccount?.$id === accountId) {
      // If removing the active account, sign out first
      try {
        await disconnect();
        await signOut();
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
    
    removeAccount(accountId);
  };

  const handleAddAccount = () => {
    setIsAddingAccount(true);
    // Redirect to sign in page 
    router.push('/signin?addAccount=true');
  };

  const handleOpenProfile = () => {
    router.push('/profile');
  };

  const handleSignOut = async () => {
    try {
      await disconnect();
      await signOut();
      // Remove the active account from the list
      if (activeAccount) {
        removeAccount(activeAccount.$id);
      }
      router.push('/signin');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handlePasswordLogin = async () => {
    try {
      setIsSwitching(true);
      // Add logic for password-based login
      setPasswordDialogOpen(false);
    } catch (error) {
      setError('Invalid password');
    } finally {
      setIsSwitching(false);
    }
  };

  // Get display name for an account
  const getDisplayName = (account: UserAccount) => {
    return account.name || (account.walletId ? formatAddress(account.walletId) : 'Unknown User');
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        maxWidth: 400,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Active Account Section */}
      {activeAccount && (
        <Box sx={{
          p: 2,
          backgroundColor: 'action.hover',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccountAvatar account={activeAccount} />
            <Box sx={{ ml: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {getDisplayName(activeAccount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeAccount.email || (activeAccount.walletId ? 'Wallet Account' : 'Unknown')}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenProfile}
              sx={{ borderRadius: '8px' }}
            >
              View Profile
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<ExitToApp />}
              onClick={handleSignOut}
              sx={{ borderRadius: '8px' }}
            >
              Sign Out
            </Button>
          </Box>
        </Box>
      )}

      {/* Account List */}
      <List sx={{ py: 0 }}>
        <Divider />
        {accounts.map((account) => (
          <React.Fragment key={account.$id}>
            <ListItem 
              button
              onClick={() => handleSwitchAccount(account.$id)}
              selected={account.isActive}
              sx={{ 
                py: 1.5, 
                bgcolor: account.isActive ? 'action.selected' : 'transparent',
                position: 'relative',
                '&:hover': {
                  bgcolor: account.isActive ? 'action.selected' : 'action.hover',
                }
              }}
              disabled={isSwitching && account.isActive}
            >
              <ListItemAvatar>
                <AccountAvatar account={account} />
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight={account.isActive ? 600 : 400}>
                    {getDisplayName(account)}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {account.email || (account.walletId ? 'Wallet Account' : '')}
                  </Typography>
                }
              />
              
              {account.isActive && (
                <Check sx={{ color: 'primary.main', position: 'absolute', right: 40 }} />
              )}
              
              {!account.isActive && (
                <IconButton 
                  size="small" 
                  onClick={(e) => handleRemoveAccount(account.$id, e)}
                  sx={{ 
                    color: 'error.light',
                    '&:hover': { 
                      color: 'error.main',
                      bgcolor: 'error.lightest' 
                    }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
              
              {account.credentials?.hasPassword && (
                <Lock 
                  fontSize="small" 
                  color="action" 
                  sx={{ position: 'absolute', right: 72, opacity: 0.6 }}
                />
              )}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      {/* Add Account Button */}
      <Box sx={{ p: 2 }}>
        {!hasMaxAccounts ? (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddAccount}
            disabled={isAddingAccount}
            sx={{
              borderStyle: 'dashed',
              borderRadius: '8px',
              py: 1
            }}
          >
            {isAddingAccount ? (
              <CircularProgress size={24} />
            ) : (
              'Add Account'
            )}
          </Button>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Maximum of 3 accounts reached
          </Typography>
        )}
        
        {error && (
          <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
      </Box>
      
      {/* Password Dialog for Email Accounts */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => {
          setPasswordDialogOpen(false);
          setError(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Enter Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setPasswordDialogOpen(false);
              setError(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordLogin}
            disabled={isSwitching}
            variant="contained"
          >
            {isSwitching ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
