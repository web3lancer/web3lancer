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
    <Box sx={{ overflowX: 'hidden' }}>
      {/* Hero Section */}
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
                {/* Add 3D illustration or animation here */}
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
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 15, background: '#fff' }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              align="center"
              sx={{
                mb: 8,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Why Choose Web3Lancer
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
          </motion.div>
        </Container>
      </Box>

      {/* Rest of the sections with similar modern styling */}
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
                      <Typography variant="h6">{job.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{job.description}</Typography>
                    </CardContent>
                  </MotionCard>
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
  );
}
