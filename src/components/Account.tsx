import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Menu, MenuItem, Tooltip, Divider, Button, ListItemIcon, ListItemText, Alert } from '@mui/material';
import { KeyboardArrowDown, Person, AccountCircle, ExitToApp, Login, PersonAdd, VerifiedUser, MarkEmailRead, GitHub } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createEmailVerification, account, safeGetDocument } from '@/utils/api';
import { APPWRITE_CONFIG } from '@/lib/env';
import { NetworkSwitcher } from './wallet/NetworkSwitcher';

export function Account() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const [disconnectWallet, setDisconnectWallet] = useState<(() => void) | undefined>(undefined);
  const { user, signOut, isAnonymous, profilePicture, setProfilePicture } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const open = Boolean(anchorEl);

  // Safely try to use wagmi hooks
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Dynamically import and use wagmi hooks
        import('wagmi').then(wagmi => {
          // Create a function to get account data
          const getAccountData = () => {
            try {
              const { useAccount, useDisconnect } = wagmi;
              
              // Get address
              const { address } = useAccount();
              setWalletAddress(address);
              
              // Get disconnect function
              const { disconnect } = useDisconnect();
              setDisconnectWallet(() => disconnect);
            } catch (error) {
              console.error('Error accessing wagmi hooks:', error);
            }
          };
          
          // Call initially
          getAccountData();
          
          // Setup event listener for account changes
          if (window.ethereum) {
            window.ethereum.on('accountsChanged', () => {
              getAccountData();
            });
          }
        }).catch(err => {
          console.error('Error loading wagmi:', err);
        });
      } catch (error) {
        console.error('Error in wagmi import:', error);
      }
    }
    
    return () => {
      // Cleanup listener
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  // Display GitHub info if available
  const isGitHubUser = user?.provider === 'github';

  // Fetch profile picture when user changes
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        if (user?.$id && !user.walletId) {
          const response = await safeGetDocument(
            APPWRITE_CONFIG.DATABASES.USERS,
            APPWRITE_CONFIG.COLLECTIONS.PROFILES,
            user.$id,
            null
          );
          if (response && response.profilePicture) {
            setProfilePicture(response.profilePicture);
          }
        }
      } catch (error) {
        console.error('Error in profile picture fetch flow:', error);
      }
    };

    fetchProfilePicture();
  }, [user, setProfilePicture]);

  // Check if user is verified
  useEffect(() => {}, [user]);

  const handleResendVerification = async () => {};

  // Format wallet address for display
  const formatAddress = (addr?: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Get display name (username or wallet address)
  const displayName = user?.name || 
                      (user?.walletId ? formatAddress(user.walletId) : 
                      walletAddress ? formatAddress(walletAddress) : '');

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    handleClose();
  };

  const handleSignOut = async () => {
    try {
      // Disconnect wallet if available
      if (disconnectWallet) {
        disconnectWallet();
      }
      await signOut();
      router.push('/signin');
      handleClose();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // If user is anonymous, let's show a different display
  if (isAnonymous) {
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
              {displayName ? displayName.charAt(0).toUpperCase() : <AccountCircle />}
            </Avatar>
          </motion.div>
          <Typography
            variant="body2"
            sx={{
              mx: 1.5,
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {displayName || 'Account'}
          </Typography>
          <KeyboardArrowDown
            fontSize="small"
            sx={{
              color: 'text.secondary',
              display: { xs: 'none', sm: 'block' }
            }}
          />
        </Box>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            borderRadius: 2,
            minWidth: 180,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileClick}>
          <Person fontSize="small" sx={{ mr: 1.5 }} />
          <Typography variant="body2">Profile</Typography>
        </MenuItem>
        
        {!isVerified && !user?.walletId && (
          <MenuItem onClick={handleResendVerification}>
            <ListItemIcon>
              <MarkEmailRead fontSize="small" sx={{ color: '#1E40AF' }} />
            </ListItemIcon>
            <ListItemText primary="Verify Email" />
          </MenuItem>
        )}
        {isVerified && !user?.walletId && (
          <MenuItem sx={{ pointerEvents: 'none', opacity: 0.7 }}>
            <ListItemIcon>
              <VerifiedUser fontSize="small" sx={{ color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText primary="Email Verified" />
          </MenuItem>
        )}
        {isGitHubUser && (
          <MenuItem sx={{ pointerEvents: 'none', opacity: 0.7 }}>
            <ListItemIcon>
              <GitHub fontSize="small" sx={{ color: '#1E40AF' }} />
            </ListItemIcon>
            <ListItemText primary="Connected with GitHub" />
          </MenuItem>
        )}
        {verificationSent && (
          <Alert severity="success" sx={{ mx: 2, my: 1 }}>
            Verification email sent!
          </Alert>
        )}
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ExitToApp fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
          <Typography variant="body2" color="error">Sign out</Typography>
        </MenuItem>
      </Menu>
      <Box sx={{ ml: 2 }}>
        <NetworkSwitcher />
      </Box>
    </Box>
  );
}
