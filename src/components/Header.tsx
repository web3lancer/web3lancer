"use client";

import { AppBar, Toolbar, Typography, Button, IconButton, Avatar, Box, Menu, MenuItem, Tooltip } from "@mui/material";
import { AccountCircle, Notifications, KeyboardArrowDown } from "@mui/icons-material";
import React, { useState } from "react";
import Image from 'next/image';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAccount, useDisconnect } from 'wagmi';

export default function Header() {
  const { user, setUser, signOut } = useAuth();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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
      await disconnect();
      setUser(null);
      router.push('/signin');
      handleClose();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Format wallet address for display
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Get display name (username or wallet address)
  const displayName = user?.name || (address ? formatAddress(address) : '');

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(231, 231, 231, 0.8)',
        width: { xs: '100%', md: `calc(100% - 240px)` },
        ml: { xs: 0, md: '240px' },
        zIndex: (theme) => theme.zIndex.drawer + 1,
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4, md: 6 } }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Box sx={{ position: 'relative', width: 40, height: 40, mr: 2 }}>
            <Image
              src="/logo.svg"
              alt="Web3Lancer"
              fill
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{
              background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            Web3Lancer
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <IconButton
            sx={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              p: 1,
              '&:hover': {
                background: 'rgba(59, 130, 246, 0.2)',
              }
            }}
          >
            <Notifications sx={{ color: '#1E40AF' }} />
          </IconButton>

          {address || user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                      sx={{
                        background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                      }}
                    >
                      {displayName.charAt(0).toUpperCase()}
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
                    {displayName}
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
                  <Typography variant="body2">Account</Typography>
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <Typography variant="body2" color="error">Sign out</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              href="/signin"
              variant="contained"
              sx={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)',
                }
              }}
            ></Button>
              Connect Wallet
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}