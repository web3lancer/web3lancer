"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Box, Grid, Typography, Button, Card, CardContent, useTheme, useMediaQuery, Container, Fab } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { databases } from '../utils/api';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const MotionCard = motion(Card);

interface Job {
  $id: string;
  title: string;
  description: string;
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await databases.listDocuments('67af3ffe0011106c4575', '67b8f57b0018fe4fcde7');
        setJobs(response.documents as Job[]);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    }
    fetchJobs();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MotionCard sx={{ p: 4, m: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Welcome to Web3Lancer
      </Typography>
      <Container maxWidth="xl">
        <Box sx={{ minHeight: '100vh', py: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Grid container spacing={4} alignItems="center" sx={{ mb: 8 }}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #1E40AF, #3B82F6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2
                  }}
                >
                  Work Without Borders
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
                  Connect, collaborate, and conquer from anywhere with digital working.
                </Typography>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/dashboard" passHref>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        px: 4,
                        background: 'linear-gradient(45deg, #1E40AF, #3B82F6)',
                        boxShadow: '0 4px 14px 0 rgba(30, 64, 175, 0.39)',
                      }}
                    >
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Box sx={{
                    position: 'relative',
                    height: { xs: '300px', md: '400px' },
                    width: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  }}>
                    <Image
                      src="/logo/web3lancer.jpg"
                      alt="Web3Lancer"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>

          <Box sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
              What We Offer
            </Typography>
            <Grid container spacing={4}>
              {['Payment Protection', 'Large Pool of Customers', 'Advanced Analytics'].map((title, index) => (
                <Grid item xs={12} md={4} key={title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <MotionCard
                      whileHover={{ y: -10 }}
                      sx={{
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h5" gutterBottom>{title}</Typography>
                        <Typography variant="body1" color="text.secondary">
                          {title === 'Payment Protection' && 'Lower cost and reliable'}
                          {title === 'Large Pool of Customers' && 'Access to global opportunities'}
                          {title === 'Advanced Analytics' && 'Manage your work, Grow your network'}
                        </Typography>
                      </CardContent>
                    </MotionCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
              How It Works
            </Typography>
            <Grid container spacing={4}>
              {['Create an Account', 'Post a Job', 'Hire the Best'].map((step, index) => (
                <Grid item xs={12} md={4} key={step}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <MotionCard
                      whileHover={{ y: -10 }}
                      sx={{
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h5" gutterBottom>{step}</Typography>
                        <Typography variant="body1" color="text.secondary">
                          {step === 'Create an Account' && 'Sign up and create your profile'}
                          {step === 'Post a Job' && 'Describe your project and post it'}
                          {step === 'Hire the Best' && 'Review proposals and hire the best'}
                        </Typography>
                      </CardContent>
                    </MotionCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Add new Download Section */}
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ mb: 4 }}>
              Download Our App
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={5}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <MotionCard
                    whileHover={{ y: -10 }}
                    sx={{
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          color: '#1E40AF',
                          fontWeight: 'bold',
                          background: 'rgba(255, 255, 255, 0.95)',
                          padding: '12px 24px',
                          borderRadius: '30px',
                          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                          border: '1px solid rgba(30, 64, 175, 0.2)',
                        }}
                      >
                        Coming Soon
                      </Typography>
                    </Box>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Download for iOS
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Get Web3Lancer on your iPhone
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        disabled
                      >
                        App Store
                      </Button>
                    </CardContent>
                  </MotionCard>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={5}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <MotionCard
                    whileHover={{ y: -10 }}
                    sx={{
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Download for Android
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Get Android (pre-release) app
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        href="https://github.com/web3lancer/web3lancer/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download APK
                      </Button>
                    </CardContent>
                  </MotionCard>
                </motion.div>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
              Latest Jobs
            </Typography>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
            >
              <Grid container spacing={3}>
                {jobs.map((job, index) => (
                  <Grid item xs={12} sm={6} md={4} key={job.$id || index}>
                    <motion.div variants={item}>
                      <MotionCard
                        whileHover={{ y: -10 }}
                        sx={{
                          height: '100%',
                          background: 'rgba(255, 255, 255, 0.7)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.18)',
                        }}
                      >
                        <CardContent>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        <Fab
          color="primary"
          aria-label="scroll to top"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 72, md: 16 }, // Adjusted to account for mobile bottom navigation
            right: 16,
            background: 'linear-gradient(45deg, #1E40AF, #3B82F6)',
            boxShadow: '0 4px 14px 0 rgba(30, 64, 175, 0.39)',
            zIndex: 1000,
            opacity: 0.9,
            '&:hover': {
              opacity: 1,
              background: 'linear-gradient(45deg, #1E40AF, #3B82F6)',
            },
          }}
        >
          <ArrowUpwardIcon />
        </Fab>
      </Box>
    </Container>
  );
}
