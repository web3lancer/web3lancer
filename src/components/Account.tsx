import React, { useState, useEffect } from 'react';
import { Avatar, Box, Button, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Tooltip, Typography } from '@mui/material';
import { Person, Logout, Login, Settings, AccountBalanceWallet, KeyboardArrowDown, PersonAdd } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { NetworkSwitcher } from './wallet/NetworkSwitcher';
import { signOut as apiSignOut, getUserProfile, getProfilePictureUrl } from '@/utils/api'; // Import signOut from api

export function Account() {
  const { user, isAnonymous } = useAuth(); // Removed profilePicture from here
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [headerProfilePicture, setHeaderProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (user && user.$id) {
        try {
          const profile = await getUserProfile(user.$id);
          if (profile && profile.profilePicture) {
            setHeaderProfilePicture(getProfilePictureUrl(profile.profilePicture));
          } else {
            setHeaderProfilePicture(null);
          }
        } catch (error) {
          console.error("Error fetching profile picture for header:", error);
          setHeaderProfilePicture(null);
        }
      }
    };

    fetchProfilePicture();
  }, [user]);
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleClose();
    try {
      console.log("Attempting sign out via apiSignOut...");
      await apiSignOut(); // Directly call the imported signOut function
    } catch (error) {
      console.error("Error during sign out:", error);
      // Handle the error appropriately, maybe show a message to the user
    } finally {
      // Ensure redirection happens even if sign out fails
      router.push('/'); 
    }
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
              src={headerProfilePicture || undefined} // Use fetched profile picture
              sx={{
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              }}
            >
              {/* Fallback to initials if no picture */}
              {!headerProfilePicture && user?.name ? user.name[0]?.toUpperCase() : !headerProfilePicture ? '?' : null}
            </Avatar>
          </motion.div>
          <KeyboardArrowDown
            fontSize="small"
            sx={{
              color: 'text.secondary',
              // Ensure this is always visible or adjust based on design for the icon-only look
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
            {user.email || 'guest'}
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
