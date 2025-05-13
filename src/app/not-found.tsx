'use client';

import Link from 'next/link';
import { Box, Typography, Button, Container, useTheme, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { ErrorOutline } from '@mui/icons-material';
import Image from 'next/image';
// This ensures the 404 page can be properly styled without sidebars
import { useEffect } from 'react';

export default function NotFound() {
  const theme = useTheme();

  // Ensure this page is rendered without sidebars
  useEffect(() => {
    // Add a class to the body to signal this is the 404 page
    document.body.classList.add('not-found-page');
    
    return () => {
      // Clean up when component unmounts
      document.body.classList.remove('not-found-page');
    };
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(180deg, #0A1122 0%, #121826 100%)' 
          : 'linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={theme.palette.mode === 'dark' ? 10 : 3}
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 4,
            background: theme.palette.mode === 'dark' 
              ? 'rgba(23, 25, 35, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.05)'}`,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            <Box sx={{ position: 'relative', width: 150, height: 150, mb: 2, mx: 'auto' }}>
              <Image
                src="/logo/web3lancer.jpg"
                alt="Web3Lancer Logo"
                fill
                style={{ 
                  objectFit: 'contain',
                  opacity: 0.15,
                }}
              />
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ErrorOutline 
                  sx={{ 
                    fontSize: 80,
                    color: theme.palette.mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.8)'
                      : 'rgba(79, 70, 229, 0.8)',
                  }}
                />
              </Box>
            </Box>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 2,
                textAlign: 'center',
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
                  : 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textFillColor: 'transparent',
              }}
            >
              404
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Typography 
              variant="h5" 
              component="h2"
              sx={{
                fontWeight: 600,
                mb: 2,
                textAlign: 'center',
              }}
            >
              Page Not Found
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: 'center',
                mb: 4
              }}
            >
              Oops! The page you're looking for doesn't exist in the Web3Lancer universe.
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ width: '100%' }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                component={Link} 
                href="/"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' 
                    : 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
                    : '0 4px 12px rgba(59, 130, 246, 0.35)',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    boxShadow: theme.palette.mode === 'dark' 
                      ? '0 6px 16px rgba(0, 0, 0, 0.3)' 
                      : '0 6px 16px rgba(59, 130, 246, 0.45)',
                  }
                }}
              >
                Return to Home
              </Button>
              
              <Button
                component={Link}
                href="/projects"
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(99, 102, 241, 0.6)' 
                    : 'rgba(59, 130, 246, 0.6)',
                  color: theme.palette.mode === 'dark'
                    ? 'rgba(99, 102, 241, 0.9)'
                    : 'rgba(59, 130, 246, 0.9)',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: theme.palette.mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.9)'
                      : 'rgba(59, 130, 246, 0.9)',
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.08)'
                      : 'rgba(59, 130, 246, 0.08)',
                  }
                }}
              >
                Explore Projects
              </Button>
            </Box>
          </motion.div>
        </Paper>
      </Container>
    </Box>
  );
}