import React, { useState } from 'react';
import { Avatar, Box, Button, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Tooltip, Typography } from '@mui/material';
import { Person, Logout, Login, Settings, AccountBalanceWallet, KeyboardArrowDown, PersonAdd } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { NetworkSwitcher } from './wallet/NetworkSwitcher';

export function Account() {
  const { user, logout, profilePicture, isAnonymous } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleClose();
    await logout();
    router.push('/');
  };
  
  const handleProfileClick = () => {
    handleClose();
    router.push('/profile');
  };
  
  const handleSettingsClick = () => {
    handleClose();
    router.push('/settings');
  };

  const handleWalletClick = () => {
    handleClose();
    router.push('/wallet');
  };

  // Format wallet address for display
  const formatAddress = (addr?: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Get display name (username or wallet address)
  const displayName = user?.name || 
                    (user?.walletId ? formatAddress(user.walletId) : '');
  
  // Debug information
  console.log('Account component render:', { 
    hasUser: !!user, 
    isAnonymous, 
    displayName,
    userName: user?.name
  });

  if (isAnonymous || !user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Button
          onClick={handleMenuClick}
          sx={{
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#1E40AF',
            fontWeight: 600,
            '&:hover': {
              background: 'rgba(59, 130, 246, 0.2)',
            }
          }}
          endIcon={<KeyboardArrowDown />}
        >
          Guest User
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              mt: 1
            }
          }}
        >
          <MenuItem 
            onClick={() => {
              handleClose();
              router.push('/signin');
            }} 
            sx={{ py: 1.5, px: 2 }}
          >
            <ListItemIcon>
              <Login fontSize="small" sx={{ color: '#1E40AF' }} />
            </ListItemIcon>
            <ListItemText>Sign In</ListItemText>
          </MenuItem>
          <MenuItem 
            onClick={() => {
              handleClose();
              router.push('/signup');
            }} 
            sx={{ py: 1.5, px: 2 }}
          >
            <ListItemIcon>
              <PersonAdd fontSize="small" sx={{ color: '#1E40AF' }} />
            </ListItemIcon>
            <ListItemText>Create Account</ListItemText>
          </MenuItem>
        </Menu>
        <Box sx={{ ml: 2 }}>
          <NetworkSwitcher />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <Tooltip title="Account settings">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 }
          }}
          onClick={handleMenuClick}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar
              src={profilePicture || undefined}
              sx={{
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              }}
            >
              {user?.name ? user.name[0]?.toUpperCase() : '?'}
            </Avatar>
          </motion.div>
          <Box sx={{ ml: 1.5, display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
              {displayName || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email ? user.email : 'Web3 Account'}
            </Typography>
          </Box>
          <KeyboardArrowDown
            fontSize="small"
            sx={{
              color: 'text.secondary',
              display: { xs: 'none', sm: 'block' },
              ml: 0.5
            }}
          />
        </Box>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
            mt: 1
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {displayName || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email || 'Web3 Account'}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfileClick} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <Person fontSize="small" sx={{ color: '#1E40AF' }} />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSettingsClick} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <Settings fontSize="small" sx={{ color: '#1E40AF' }} />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleWalletClick} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <AccountBalanceWallet fontSize="small" sx={{ color: '#1E40AF' }} />
          </ListItemIcon>
          <ListItemText>Wallet</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Logout</ListItemText>
        </MenuItem>
      </Menu>
      
      <Box sx={{ ml: 2 }}>
        <NetworkSwitcher />
      </Box>
    </Box>
  );
}
