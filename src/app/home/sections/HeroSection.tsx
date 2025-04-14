import React from 'react';
import { Box, Typography, Button, Grid, Container, AppBar, Toolbar, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  const theme = useTheme();
  
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 1 }} // Start visible
      animate={{ opacity: 1 }}
      sx={{
        minHeight: '100vh',
        // Use theme background color for dark mode compatibility
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #111827 0%, #1F2937 100%)' 
          : 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        position: 'relative',
        pt: { xs: 10, md: 0 },
        width: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/grid.svg")',
          opacity: theme.palette.mode === 'dark' ? 0.05 : 0.1, // Reduce opacity in dark mode
          zIndex: 0,
        }
      }}
    >
      {/* Home Page Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: theme.palette.mode === 'dark' 
            ? 'rgba(17, 24, 39, 0.85)' 
            : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4, md: 6 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button 
              variant="contained" 
              component={Link} 
              href="/signin"
              sx={{
                borderRadius: '8px',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                py: 0.8,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                }
              }}
            >
              Connect
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="lg"
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          px: { xs: 2, sm: 3, md: 4 },
          boxSizing: 'border-box'
        }}
      >
        <Grid 
          container 
          spacing={{ xs: 4, md: 6 }}
          alignItems="center" 
          sx={{ 
            minHeight: { md: 'calc(100vh - 64px)' },
          }}
        >
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem', lg: '4.25rem' },
                  fontWeight: 700,
                  lineHeight: 1.15,
                  background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3,
                }}
              >
                Revolutionizing
                <br />
                Digital Work
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 400,
                  mb: 5,
                  maxWidth: 550
                }}
              >
                Connect with top Web3 talent and projects in a decentralized workspace with Web3lancer
              </Typography>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link href="/dashboard" passHref>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 5,
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #1E40AF, #3B82F6)',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                      textTransform: 'none',
                      fontWeight: 600,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
                        background: 'linear-gradient(45deg, #1E40AF, #3B82F6)',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: '350px', sm: '450px', md: '550px' },
                  width: '100%',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Image 
                  src="/images/earn.jpg" 
                  alt="Earn with Web3Lancer" 
                  fill
                  style={{ objectFit: 'cover' }}
                  quality={90}
                  priority
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
