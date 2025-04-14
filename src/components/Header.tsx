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
import { shouldShowSidebar } from '@/utils/navigation';
import { useTheme } from '@mui/material/styles'; // Import useTheme

interface HeaderProps {
  isHomePage?: boolean;
  isPreAuthPage?: boolean;
}

export default function Header({ isHomePage = false, isPreAuthPage = false }: HeaderProps) {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const pathname = usePathname();
  const showSidebar = shouldShowSidebar(pathname);
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
    // Use theme palette for background and border
    background: theme.palette.mode === 'dark' 
      ? 'rgba(31, 41, 55, 0.8)' // Dark mode background from theme/index.ts
      : 'rgba(255, 255, 255, 0.8)', // Light mode background
    backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${theme.palette.divider}`, // Use theme divider color
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

          {walletAddress || user ? (
            <Account walletAddress={walletAddress} user={user} />
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
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}