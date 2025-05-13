"use client";

import { AppBar, Toolbar, Typography, Button, IconButton, Box, Menu, MenuItem } from "@mui/material";
import { Notifications } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { motion } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { Account } from './Account';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme, SxProps, Theme } from '@mui/material/styles';

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

interface HeaderProps {
  isHomePage?: boolean;
  isPreAuthPage?: boolean;
}

export default function Header({ isHomePage = false, isPreAuthPage = false }: HeaderProps) {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const pathname = usePathname();
  const theme = useTheme();
  
  // Add variables for sidebar calculations
  const drawerWidth = 240; // Match the primaryDrawerWidth from AppLayout
  const showSidebar = !isHomePage && !isPreAuthPage && 
    !['/signin', '/signup', '/'].includes(pathname ?? ''); // Simple check for sidebar visibility

  const [walletMenuAnchor, setWalletMenuAnchor] = useState<null | HTMLElement>(null);
  
  const handleWalletMenuClose = () => {
    setWalletMenuAnchor(null);
  };
  
  const handleDisconnectWallet = () => {
    // Disconnect wallet logic
    if (window.ethereum && typeof window.ethereum.request === 'function') {
      // This is more of a UI disconnect, actual implementation depends on wallet
      setWalletAddress(undefined);
    }
    handleWalletMenuClose();
  };

  useEffect(() => {
    let isMounted = true;

    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (isMounted && accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Failed to get ethereum accounts:", error);
        }
      }
    };

    checkWalletConnection();

    // Check for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (isMounted) {
          setWalletAddress(accounts.length > 0 ? accounts[0] : undefined);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        isMounted = false;
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Define the connect wallet button style
  const connectWalletButtonSx: SxProps<Theme> = {
    borderRadius: '12px',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' 
      : 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
      : '0 4px 12px rgba(59, 130, 246, 0.35)',
    padding: { xs: '6px 12px', sm: '8px 20px' },
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': {
      boxShadow: theme.palette.mode === 'dark' 
        ? '0 6px 16px rgba(0, 0, 0, 0.3)' 
        : '0 6px 16px rgba(59, 130, 246, 0.45)',
      background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #5A50E6 0%, #864CF0 100%)' 
      : 'linear-gradient(135deg, #284EC1 0%, #4CA0F8 100%)',
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isHomePage) {
    // For homepage, we want to show the header with different styling
    return (
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: theme.palette.mode === 'dark' 
            ? 'rgba(17, 24, 39, 0.85)' 
            : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: 'none',
          width: 'auto',
          zIndex: theme.zIndex.drawer + 2,
          transition: theme.transitions.create(['background-color', 'border-color'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.standard,
          }),
          margin: '16px',
          marginLeft: '16px',
          marginRight: '16px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          position: 'fixed',
          left: 0,
          right: 0,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4, md: 6 } }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Link href="/" passHref>
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Box sx={{ position: 'relative', width: 40, height: 40, mr: 2 }}>
                  <Image
                    src="/logo/web3lancer.jpg"
                    alt="Web3Lancer"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    display: { xs: 'none', sm: 'block' }, // Hide on mobile
                    background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                  }}
                >
                  Web3Lancer
                </Typography>
              </Box>
            </Link>
          </motion.div>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2, md: 3 } }}>
            {!user && (
              <>
                <Button
                  href="/signin"
                  variant="outlined"
                  sx={{
                    borderRadius: '12px',
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: 'rgba(59, 130, 246, 0.04)',
                    }
                  }}
                >
                  Sign In
                </Button>
                <Button
                  href="/signup"
                  variant="contained"
                  sx={connectWalletButtonSx}
                >
                  Sign Up
                </Button>
              </>
            )}
            {user && <Account />}
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // Transform the appBar to have rounded corners and aloofness
  const appBarSx: SxProps<Theme> = {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(17, 24, 39, 0.85)' 
      : 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', // For Safari
    borderBottom: 'none',
    width: 'auto',
    zIndex: theme.zIndex.drawer + 2, // Higher z-index to ensure it's above sidebars
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
    margin: '16px',
    marginLeft: '16px', // Always have left margin
    marginRight: '16px', // Always have right margin
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    position: 'fixed',
    left: 0,
    right: 0,
  };

  if (isPreAuthPage) {
    return (
      <AppBar
        position="fixed"
        elevation={0}
        sx={appBarSx}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4, md: 6 } }}>
          <Link href="/" passHref>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Box sx={{ position: 'relative', width: 40, height: 40, mr: 2 }}>
                <Image
                  src="/logo/web3lancer.jpg"
                  alt="Web3Lancer"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  display: { xs: 'none', sm: 'block' }, // Hide on mobile
                  background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
              >
                Web3Lancer
              </Typography>
            </Box>
          </Link>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={appBarSx}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4, md: 6 } }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Link href="/" passHref>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Box sx={{ position: 'relative', width: 40, height: 40, mr: 2 }}>
                <Image
                  src="/logo/web3lancer.jpg"
                  alt="Web3Lancer"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  display: { xs: 'none', sm: 'block' }, // Hide on mobile
                  background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
              >
                Web3Lancer
              </Typography>
            </Box>
          </Link>
        </motion.div>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2, md: 3 } }}>
          {/* Show notification icon only on mobile/tablet where sidebar isn't visible */}
          <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
            <IconButton
              sx={{
                background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '12px',
                p: 1,
                color: theme.palette.text.secondary,
                '&:hover': {
                  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                }
              }}
            >
              <Notifications />
            </IconButton>
          </Box>

          {/* Mobile: Show Account, Desktop: Show Wallet Connect Button */}
          {walletAddress || user ? (
            <>
              {/* Account on mobile only */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Account />
              </Box>
              
              {/* Wallet button on desktop only */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Button
                  variant="outlined"
                  onClick={(e) => {
                    setWalletMenuAnchor(e.currentTarget);
                  }}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                    color: theme.palette.text.primary,
                    '&:hover': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    }
                  }}
                >
                  {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect'}
                </Button>
              </Box>
            </>
          ) : (
            <Button
              onClick={async () => {
                if (window.ethereum && typeof window.ethereum.request === 'function') {
                  try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    if (accounts.length > 0) {
                      setWalletAddress(accounts[0]);
                    }
                  } catch (error) {
                    console.error("Failed to connect wallet:", error);
                    window.location.href = '/signin';
                  }
                } else {
                  window.location.href = '/signin';
                }
              }}
              variant="contained"
              sx={connectWalletButtonSx}
            >
              Connect
            </Button>
          )}
        </Box>
      </Toolbar>
      {/* Wallet Menu */}
      <Menu
        anchorEl={walletMenuAnchor}
        open={Boolean(walletMenuAnchor)}
        onClose={handleWalletMenuClose}
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
        <MenuItem onClick={handleWalletMenuClose}>Wallet</MenuItem>
        <MenuItem onClick={handleDisconnectWallet}>Disconnect</MenuItem>
      </Menu>
    </AppBar>
  );
}