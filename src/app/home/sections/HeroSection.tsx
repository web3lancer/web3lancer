import React from 'react';
import { Box, Typography, Button, Grid, Container, AppBar, Toolbar, useTheme, Stack } from '@mui/material';
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
                style={{ objectFit: 'contain', borderRadius: '4px' }}
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
            <Button color="inherit" component={Link} href="/projects">Projects</Button>
            <Button color="inherit" component={Link} href="/freelancers">Freelancers</Button>
            <Button variant="contained" color="primary" component={Link} href="/signup">
              Get Started
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
          boxSizing: 'border-box',
          pt: { xs: 14, md: 16 }, // Add top padding to clear AppBar
          pb: { xs: 6, md: 8 },
        }}
      >
        <Grid 
          container 
          spacing={{ xs: 4, md: 6 }}
          alignItems="center" 
          justifyContent="center"
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
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  fontWeight: 800,
                  mb: 2,
                  lineHeight: 1.2,
                  background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Find Your Next
                <br />
                Web3 Opportunity
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mb: 4,
                  maxWidth: { md: 500 },
                  mx: { xs: 'auto', md: 0 },
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  lineHeight: 1.6
                }}
              >
                Connect with top talent and innovative projects in the decentralized world.
                Secure, transparent, and powered by blockchain.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                alignItems={{ xs: 'center', md: 'flex-start' }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component={Link}
                  href="/projects"
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    boxShadow: '0 4px 16px 0 rgba(30,64,175,0.12)',
                    borderRadius: 2,
                  }}
                >
                  Browse Projects
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  component={Link}
                  href="/jobs/post"
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    borderRadius: 2,
                    borderWidth: 2,
                    borderColor: theme.palette.primary.main,
                    background: theme.palette.mode === 'dark' ? 'rgba(30,64,175,0.05)' : 'rgba(30,64,175,0.03)',
                    '&:hover': {
                      background: theme.palette.mode === 'dark' ? 'rgba(30,64,175,0.12)' : 'rgba(30,64,175,0.08)',
                    },
                  }}
                >
                  Post a Job
                </Button>
              </Stack>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}
            >
              <Box
                sx={{
                  width: { xs: '90%', sm: '70%', md: '80%' },
                  maxWidth: 420,
                  height: { xs: 220, sm: 320, md: 380 },
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200',
                  borderRadius: 4,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: theme.shadows[8],
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src="/images/earn.jpg"
                  alt="Earn with Web3Lancer"
                  fill
                  style={{ objectFit: 'cover', borderRadius: '16px' }}
                  sizes="(max-width: 600px) 90vw, (max-width: 900px) 70vw, 420px"
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
