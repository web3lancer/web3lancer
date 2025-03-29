import React, { useState } from 'react';
import { Box, Avatar, Typography, Button, Divider, Paper, List, ListItem, ListItemAvatar, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, CircularProgress } from '@mui/material';
import { Add, Delete, ExitToApp, Check } from '@mui/icons-material';
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
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const handleSwitchAccount = (accountId: string) => {
    if (activeAccount?.$id === accountId) return; // Don't switch if already active
    
    switchAccount(accountId);
    
    // Redirect to dashboard or reload
    router.push('/dashboard');
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
        <Box sx={{ p: 3, background: 'rgba(30, 64, 175, 0.05)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <AccountAvatar account={activeAccount} />
            </motion.div>
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6">{getDisplayName(activeAccount)}</Typography>
              <Typography variant="body2" color="text.secondary">
                {activeAccount.email || (activeAccount.walletId ? 'Wallet Connected' : '')}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<ExitToApp />}
              size="small"
              onClick={handleOpenProfile}
              sx={{ flex: 1 }}
            >
              Profile
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<Delete />}
              size="small"
              onClick={handleSignOut}
              sx={{ flex: 1 }}
            >
              Sign Out
            </Button>
          </Box>
        </Box>
      )}

      <Divider />
      
      {/* List of Other Accounts */}
      <List sx={{ maxHeight: 300, overflow: 'auto' }}>
        {accounts
          .filter(account => !account.isActive)
          .map(account => (
            <ListItem
              key={account.$id}
              onClick={() => handleSwitchAccount(account.$id)}
              sx={{ 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
              }}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="remove account"
                  onClick={(e) => handleRemoveAccount(account.$id, e)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <AccountAvatar account={account} />
              </ListItemAvatar>
              <ListItemText 
                primary={getDisplayName(account)} 
                secondary={account.email || (account.walletId ? 'Wallet Connected' : '')}
              />
            </ListItem>
          ))}
      </List>
      
      <Divider />
      
      {/* Add Account Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Add />}
          onClick={handleAddAccount}
          disabled={hasMaxAccounts || isAddingAccount}
        >
          {isAddingAccount ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Adding Account...
            </>
          ) : (
            hasMaxAccounts ? 'Max Accounts Reached' : 'Add Another Account'
          )}
        </Button>
      </Box>
    </Paper>
  );
}
