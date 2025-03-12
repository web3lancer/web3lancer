"use client";

import { AppBar, Toolbar, Typography, Button, IconButton, Avatar, Box } from "@mui/material";
import { AccountCircle, Notifications } from "@mui/icons-material";
import React from "react";
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

  const handleSignOut = async () => {
    try {
      await disconnect();
      setUser(null);
      router.push('/signin');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(231, 231, 231, 0.8)',
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

          {address ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleSignOut}
                sx={{
                  borderRadius: '12px',
                  borderColor: '#1E40AF',
                  color: '#1E40AF',
                  '&:hover': {
                    borderColor: '#3B82F6',
                    background: 'rgba(59, 130, 246, 0.1)',
                  }
                }}
              >
                Disconnect
              </Button>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                  }}
                >
                  <AccountCircle />
                </Avatar>
              </motion.div>
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
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}