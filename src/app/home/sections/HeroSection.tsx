import React from 'react';
import { Box, Typography, Button, Grid, Container } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.05) 0%, rgba(59, 130, 246, 0.1) 100%)',
        position: 'relative',
        pt: { xs: 8, md: 0 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/grid.svg")',
          opacity: 0.4,
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center" sx={{ minHeight: '100vh' }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                  fontWeight: 800,
                  lineHeight: 1.2,
                  background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
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
                variant="h4"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  mb: 4,
                  maxWidth: 500
                }}
              >
                Connect with top Web3 talent and projects in a decentralized workspace
              </Typography>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/dashboard" passHref>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      py: 2,
                      px: 6,
                      borderRadius: '30px',
                      fontSize: '1.2rem',
                      background: 'linear-gradient(45deg, #1E40AF, #3B82F6)',
                      boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.6)',
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
                  height: { xs: '300px', md: '600px' },
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(59, 130, 246, 0.2) 100%)',
                  borderRadius: '30px',
                  overflow: 'hidden',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Image 
                  src="/images/earn.jpg" 
                  alt="Earn with Web3Lancer" 
                  layout="fill" 
                  objectFit="cover"
                  quality={100}
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
