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
          textAlign: { xs: 'center', md: 'left' }
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
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component={Link}
                  href="/projects"
                  sx={{ py: 1.5, px: 4, fontSize: '1rem' }}
                >
                  Browse Projects
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  component={Link}
                  href="/jobs/post"
                  sx={{ py: 1.5, px: 4, fontSize: '1rem' }}
                >
                  Post a Job
                </Button>
              </Stack>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <Box
                sx={{
                  width: { xs: '80%', sm: '70%', md: '100%' },
                  maxWidth: 500,
                  height: { xs: 250, sm: 350, md: 450 },
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                  borderRadius: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: theme.shadows[6]
                }}
              >
                <Image
                  src="/earn.jpg"
                  alt="Earn with Web3Lancer"
                  layout="fill"
                  style={{ objectFit: 'cover', borderRadius: '12px' }}
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
