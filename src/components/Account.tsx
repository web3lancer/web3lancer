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
      const success = await apiSignOut(); // apiSignOut is from '@/utils/api'
      if (success) {
        console.log("Sign out successful. Redirecting and reloading to ensure state reset.");
      } else {
        console.warn("Sign out API call reported failure or no active session. Still proceeding with redirect/reload.");
      }
    } catch (error) {
      console.error("Error during sign out process:", error);
    } finally {
      // Force a full page reload to home to ensure all state is reset.
      window.location.href = '/';
    }
  };

  
  const handleProfileClick = () => {
    handleClose();
    if (user) {
      // The UserProfilePage at /u/[usernameOrId] will handle redirection from ID to username if username exists
      const profilePath = `/u/${user.$id}`;
      router.push(profilePath);
    } else {
      // Fallback or error handling if user is not available
      router.push('/login'); 
    }
  };
  
  const handleSettingsClick = () => {
    handleClose();
    router.push('/settings');
  };

  const handleWalletClick = () => {
    handleClose();
    router.push('/wallet');
  };

  const handleLoginClick = () => {
    handleClose();
    router.push('/signin');
  };

  const handleCreateAccountClick = () => {
    handleClose();
    router.push('/signup');
  };

  // Format wallet address for display
  const formatAddress = (addr?: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Get display name (username or wallet address)
  const displayName = user?.name || 
                    (user?.prefs?.walletId ? formatAddress(user.prefs.walletId as string) : '');
  
  // Debug information
  console.log('Account component render:', { 
    hasUser: !!user, 
    isAnonymous, 
    displayName,
    userName: user?.name
  });

  // Removed the if (isAnonymous || !user) block that returned a different Button and Menu.
  // The component will now always return the Avatar-based menu, with items changing based on auth state.

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
              {/* Fallback to initials if no picture, or '?' if not logged in/no name */}
              {!headerProfilePicture && user?.name ? user.name[0]?.toUpperCase() : !headerProfilePicture ? '?' : null}
            </Avatar>
          </motion.div>
          <KeyboardArrowDown
            fontSize="small"
            sx={{
              color: 'text.secondary',
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
        {user && !isAnonymous ? (
          // User is logged in AND not anonymous - show profile info and logout option
          [
            <Box key="userInfo" sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {displayName || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email || 'No email provided'}
              </Typography>
            </Box>,
            <Divider key="divider1" />,
            <MenuItem key="profile" onClick={handleProfileClick} sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon>
                <Person fontSize="small" sx={{ color: '#1E40AF' }} />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>,
            <MenuItem key="settings" onClick={handleSettingsClick} sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon>
                <Settings fontSize="small" sx={{ color: '#1E40AF' }} />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>,
            <MenuItem key="wallet" onClick={handleWalletClick} sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon>
                <AccountBalanceWallet fontSize="small" sx={{ color: '#1E40AF' }} />
              </ListItemIcon>
              <ListItemText>Wallet</ListItemText>
            </MenuItem>,
            <Divider key="divider2" />,
            <MenuItem key="logout" onClick={handleLogout} sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Logout</ListItemText>
            </MenuItem>
          ]
        ) : (
          // Guest user (isAnonymous is true) or no user at all - show only login and signup options
          [
            <MenuItem key="login" onClick={handleLoginClick} sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon>
                <Login fontSize="small" sx={{ color: '#1E40AF' }} />
              </ListItemIcon>
              <ListItemText>Login</ListItemText>
            </MenuItem>,
            <MenuItem key="signup" onClick={handleCreateAccountClick} sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon>
                <PersonAdd fontSize="small" sx={{ color: '#1E40AF' }} />
              </ListItemIcon>
              <ListItemText>Sign Up</ListItemText>
            </MenuItem>
          ]
        )}
      </Menu>
      
      <Box sx={{ ml: 2 }}>
        <NetworkSwitcher />
      </Box>
    </Box>
  );
}
