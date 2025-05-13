"use client";

import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Button, Menu, MenuItem, useTheme } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

// Add ethereum window type declaration
declare global {
  interface Window {
    ethereum?: {
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
    };
  }
}

export default function SidebarAccountWidget() {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const theme = useTheme();
  
  useEffect(() => {
    // Fetch wallet info if needed
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        })
        .catch(console.error);
    }
  }, []);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {user && (
          <>
            <Avatar
              sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.light }}
              alt={user?.email?.split('@')[0] || "User"}
            >
              {(user?.email?.charAt(0) || "U").toUpperCase()}
            </Avatar>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
                {user?.email?.split('@')[0] || "User"}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {user?.email || ""}
              </Typography>
            </Box>
          </>
        )}
        {!user && (
          <Button
            variant="contained"
            fullWidth
            href="/signin"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.25)',
              }
            }}
          >
            Sign In
          </Button>
        )}
      </Box>
      
      {/* Wallet Connection Button */}
      <Button
        variant="outlined"
        onClick={handleClick}
        sx={{
          borderRadius: '8px',
          textTransform: 'none',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          color: '#fff',
          fontSize: '0.8rem',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
            background: 'rgba(255, 255, 255, 0.05)',
          }
        }}
      >
        {walletAddress ? formatWalletAddress(walletAddress) : 'Connect Wallet'}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: '12px',
            minWidth: '180px',
            overflow: 'visible',
            mt: 1.5,
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
        <MenuItem onClick={handleClose}>Wallet</MenuItem>
        <MenuItem onClick={() => {
          // Disconnect wallet
          if (window.ethereum && typeof window.ethereum.request === 'function') {
            // This is more of a UI disconnect, actual implementation depends on wallet
            setWalletAddress(undefined);
          }
          handleClose();
        }}>Disconnect</MenuItem>
      </Menu>
    </Box>
  );
}