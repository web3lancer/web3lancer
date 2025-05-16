import React from 'react';
import { Box, Typography, Button, Grid, Container, AppBar, Toolbar, useTheme, Stack, useMediaQuery, IconButton, Drawer, List, ListItem } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function HeroSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #111827 0%, #1F2937 100%)' 
          : 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        position: 'relative',
        pt: { xs: 0, md: 0 },
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
          backgroundSize: 'cover',
          opacity: theme.palette.mode === 'dark' ? 0.05 : 0.1,
          zIndex: 0,
        }
      }}
    >
      {/* Modern Navbar */}
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
            <Box 
              component={Link} 
              href="/"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none' 
              }}
            >
              <Box sx={{ position: 'relative', width: 42, height: 42, mr: 2 }}>
                <Image
                  src="/logo/web3lancer.jpg"
                  alt="Web3Lancer"
                  fill
                  style={{ objectFit: 'contain', borderRadius: '8px' }}
                />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  fontSize: { xs: '1.15rem', md: '1.25rem' },
                }}
              >
                Web3Lancer
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                color="inherit" 
                component={Link} 
                href="/projects"
                sx={{ 
                  fontWeight: 500,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                  } 
                }}
              >
                Projects
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                href="/web3lancers"
                sx={{ 
                  fontWeight: 500,
                  '&:hover': {
                    background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
                  } 
                }}
              >
                Freelancers
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                href="/signup"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 15px rgba(59, 130, 246, 0.4)',
                  }
                }}
              >
                Get Started
              </Button>
            </Box>
          )}

          {/* Mobile Menu Toggle */}
          {isMobile && (
            <IconButton 
              edge="end" 
              color="inherit" 
              aria-label="menu"
              onClick={handleMenuToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '70%',
            maxWidth: '300px',
            boxSizing: 'border-box',
            background: theme.palette.mode === 'dark' ? '#1F2937' : '#FFFFFF',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', width: 36, height: 36, mr: 1.5 }}>
                <Image
                  src="/logo/web3lancer.jpg"
                  alt="Web3Lancer"
                  fill
                  style={{ objectFit: 'contain', borderRadius: '6px' }}
                />
              </Box>
              <Typography
                variant="subtitle1"
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
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            <ListItem sx={{ px: 1, py: 0.75 }}>
              <Button 
                fullWidth 
                color="inherit" 
                component={Link} 
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                sx={{ justifyContent: 'flex-start', fontWeight: 500 }}
              >
                Projects
              </Button>
            </ListItem>
            <ListItem sx={{ px: 1, py: 0.75 }}>
              <Button 
                fullWidth 
                color="inherit" 
                component={Link} 
                href="/freelancers"
                onClick={() => setMobileMenuOpen(false)}
                sx={{ justifyContent: 'flex-start', fontWeight: 500 }}
              >
                Freelancers
              </Button>
            </ListItem>
            <ListItem sx={{ px: 1, py: 1.5 }}>
              <Button 
                fullWidth 
                variant="contained" 
                color="primary" 
                component={Link} 
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1
                }}
              >
                Get Started
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Container 
        maxWidth="lg"
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          px: { xs: 2, sm: 3, md: 4 },
          boxSizing: 'border-box',
          pt: { xs: 14, md: 16 },
          pb: { xs: 6, md: 8 },
          mt: { xs: 2, md: 0 },
        }}
      >
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 5, md: 8 },
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  fontWeight: 800,
                  mb: 2.5,
                  lineHeight: 1.1,
                  background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: { xs: 'center', md: 'left' },
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
                  mb: 4.5,
                  maxWidth: { md: '90%' },
                  mx: { xs: 'auto', md: 0 },
                  fontSize: { xs: '1.05rem', md: '1.15rem' },
                  lineHeight: 1.6,
                  fontWeight: 400,
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                Connect with top talent and innovative projects in the decentralized world.
                Secure, transparent, and powered by blockchain technology.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 2, sm: 3 }}
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                alignItems="center"
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
                    fontWeight: 600,
                    boxShadow: '0 4px 16px 0 rgba(30,64,175,0.25)',
                    borderRadius: 2.5,
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' },
                    maxWidth: { xs: '260px', sm: 'none' },
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px 0 rgba(30,64,175,0.35)',
                    }
                  }}
                >
                  Browse Projects
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  component={Link}
                  href="/projects#post-a-job"
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2.5,
                    borderWidth: 2,
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' },
                    maxWidth: { xs: '260px', sm: 'none' },
                    borderColor: theme.palette.primary.main,
                    background: theme.palette.mode === 'dark' ? 'rgba(30,64,175,0.05)' : 'rgba(30,64,175,0.03)',
                    transition: 'transform 0.2s ease-in-out, background 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      background: theme.palette.mode === 'dark' ? 'rgba(30,64,175,0.12)' : 'rgba(30,64,175,0.08)',
                      borderWidth: 2,
                    },
                  }}
                >
                  Post a Job
                </Button>
              </Stack>
            </motion.div>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}
            >
              <Box
                sx={{
                  width: { xs: '92%', sm: '75%', md: '85%' },
                  maxWidth: 480,
                  height: { xs: 260, sm: 340, md: 400 },
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                  borderRadius: 4,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: theme.palette.mode === 'dark' ? 
                    '0 20px 40px -15px rgba(0,0,0,0.5)' : 
                    '0 25px 50px -12px rgba(0,0,0,0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                  outline: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  transform: 'perspective(1000px) rotateY(-5deg) rotateX(3deg)',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.5s ease-in-out',
                  '&:hover': {
                    transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
                  }
                }}
              >
                <Image
                  src="/images/earn.jpg"
                  alt="Earn with Web3Lancer"
                  fill
                  style={{ objectFit: 'cover', borderRadius: '16px' }}
                  sizes="(max-width: 600px) 90vw, (max-width: 900px) 70vw, 480px"
                  priority
                />
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
