import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Menu, MenuItem, Tooltip, Divider } from '@mui/material';
import { KeyboardArrowDown, Person, AccountCircle, ExitToApp, SwitchAccount } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiAccount, UserAccount } from '@/contexts/MultiAccountContext';
import { AccountSwitcher } from './account/AccountSwitcher';

export function Account() {
  const router = useRouter();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { user, setUser, signOut } = useAuth();
  const { activeAccount } = useMultiAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const open = Boolean(anchorEl);

  // Format wallet address for display
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Get display name (username or wallet address)
  const displayName = activeAccount?.name || 
                      user?.name || 
                      (activeAccount?.walletId ? formatAddress(activeAccount.walletId) : 
                      address ? formatAddress(address) : '');

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

  const handleAccountsClick = () => {
    setAccountMenuOpen(true);
    handleClose();
  };

  const handleSignOut = async () => {
    try {
      await disconnect();
      setUser(null);
      router.push('/signin');
      handleClose();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                src={activeAccount?.profilePicture}
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
          <MenuItem onClick={handleAccountsClick}>
            <SwitchAccount fontSize="small" sx={{ mr: 1.5 }} />
            <Typography variant="body2">Switch Accounts</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleSignOut}>
            <ExitToApp fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
            <Typography variant="body2" color="error">Sign out</Typography>
          </MenuItem>
        </Menu>
      </Box>

      {/* Account Switcher Dialog */}
      <Menu
        open={accountMenuOpen}
        onClose={() => setAccountMenuOpen(false)}
        anchorEl={anchorEl}
        PaperProps={{
          sx: {
            width: 350,
            maxWidth: '90vw',
            borderRadius: 2,
            mt: 1.5,
            maxHeight: '80vh',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 0 }}>
          <AccountSwitcher />
        </Box>
      </Menu>
    </>
  );
}
