"use client";

import { AppBar, Toolbar, Typography, Button, IconButton, Box } from "@mui/material";
import { Notifications } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { motion } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { Account } from './Account';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import { shouldShowSidebar } from '@/utils/navigation'; // Commented out as showSidebar is not used
import { useTheme } from '@mui/material/styles'; // Import useTheme

interface HeaderProps {
  isHomePage?: boolean;
  isPreAuthPage?: boolean;
}

export default function Header({ isHomePage = false, isPreAuthPage = false }: HeaderProps) {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const pathname = usePathname();
  // const showSidebar = shouldShowSidebar(pathname); // Commented out as showSidebar is not used
  const theme = useTheme(); // Get the current theme

  useEffect(() => {
    let isMounted = true;

    const checkWalletConnection = async () => {
      try {
        const wagmi = await import('wagmi');

        if (wagmi.getClient) {
          const client = wagmi.getClient();
          const account = client.getAccount();

          if (isMounted) {
            setWalletAddress(account?.address);
          }
        }
      } catch (err) {
        console.error("Failed to load wagmi:", err);
      }
    };

    checkWalletConnection();

    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (isMounted) {
          setWalletAddress(accounts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (isMounted && accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        })
        .catch(console.error);

      return () => {
        isMounted = false;
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  if (isHomePage) {
    return null;
  }

  // Common AppBar styles
  const appBarSx = {
    background: theme.palette.mode === 'dark' 
      ? 'rgba(20, 20, 30, 0.75)' // Adjusted for modern glassy effect
      : 'rgba(255, 255, 255, 0.75)', // Adjusted for modern glassy effect
    backdropFilter: 'blur(24px)', // Increased blur
    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`, // More subtle border
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
  };

  if (isPreAuthPage) {
    return (
      <AppBar
        position="fixed"
        elevation={0}
        sx={appBarSx} // Apply common styles
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
      sx={appBarSx} // Apply common styles
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
              src="/logo/web3lancer.jpg"
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2, md: 3 } }}>
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

          {walletAddress || user ? (
            <Account walletAddress={walletAddress} user={user} />
          ) : (
            <Button
              href="/signin"
              variant="contained"
              sx={{
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
              }}
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}