"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Box, Grid, Typography, Button, Card, CardContent, useTheme, useMediaQuery, Container, Fab, Avatar, Divider, IconButton, Stack, Paper } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { databases } from '../utils/api';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TelegramIcon from '@mui/icons-material/Telegram';
import CountUp from 'react-countup';

const MotionCard = motion(Card);
const MotionPaper = motion(Paper);

interface Job {
  $id: string;
  title: string;
  description: string;
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); as Job[]);
  const controls = useAnimation();

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

    controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 }
    }));
  }, [controls]);

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
                    src="/images/earn.png" 
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

      {/* Statistics Section */}
      <Box 
        sx={{ 
          py: 12, 
          background: 'linear-gradient(135deg, #EFF6FF 0%, #F3F4F6 100%)'
        }}
        component={motion.div}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Container maxWidth="xl">
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
            Growing Fast
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {[
              { value: 5000, label: 'Freelancers', icon: '👨‍💻' },
              { value: 1200, label: 'Projects Completed', icon: '✅' },
              { value: 3500, label: 'Happy Clients', icon: '🤝' },
              { value: 98, label: 'Success Rate %', icon: '🚀' },
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>
                      {stat.icon}
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      <CountUp end={stat.value} duration={2.5} />
                      {stat.label === 'Success Rate %' ? '%' : ''}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
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

      {/* How It Works */}
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

      {/* Featured Projects Section */}
      <Box 
        sx={{ 
          py: 12, 
          background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)'
        }}
      >
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
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
              Featured Projects
            </Typography>
            
            <Box 
              sx={{ 
                position: 'relative',
                mx: 'auto',
                overflow: 'hidden',
                pb: 4 
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2, px: 1 }}>
                  {[
                    { title: 'DeFi Platform', category: 'Blockchain', budget: '$15,000' },
                    { title: 'NFT Marketplace', category: 'Web3', budget: '$12,000' },
                    { title: 'DAO Infrastructure', category: 'Governance', budget: '$20,000' },
                    { title: 'Smart Contract Audit', category: 'Security', budget: '$8,000' },
                    { title: 'Metaverse Experience', category: 'VR/AR', budget: '$18,000' }
                  ].map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -10 }}
                    >
                      <Card sx={{ 
                        minWidth: 280, 
                        maxWidth: 280,
                        height: 320,
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          height: 140, 
                          background: `linear-gradient(135deg, 
                            ${theme.palette.primary.light} 0%, 
                            ${theme.palette.primary.main} 100%)`,
                          position: 'relative'
                        }}>
                          <Box sx={{ 
                            position: 'absolute', 
                            bottom: -20, 
                            right: 20,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: theme.palette.primary.dark,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}>
                            {index + 1}
                          </Box>
                        </Box>
                        <CardContent sx={{ flexGrow: 1, position: 'relative', pt: 3 }}>
                          <Typography variant="overline" color="primary.main">
                            {project.category}
                          </Typography>
                          <Typography variant="h5" gutterBottom fontWeight="bold">
                            {project.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            A cutting-edge {project.category.toLowerCase()} project looking for skilled developers.
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ mt: 'auto' }}>
                            Budget: {project.budget}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderRadius: '30px',
                    py: 1.5,
                    px: 4,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                  component={Link}
                  href="/projects"
                >
                  View All Projects
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Testimonials Section */}
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
              What People Say
            </Typography>
            
            <Grid container spacing={4}>
              {[
                {
                  name: 'Alex Thomson',
                  role: 'Blockchain Developer',
                  testimonial: 'Web3Lancer helped me find consistent high-quality blockchain projects. The payment protection gives me peace of mind.',
                  avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
                },
                {
                  name: 'Sarah Williams',
                  role: 'Project Manager',
                  testimonial: 'Finding qualified Web3 talent used to be challenging until I discovered Web3Lancer. Now I can build teams quickly!',
                  avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
                },
                {
                  name: 'Michael Chen',
                  role: 'Smart Contract Developer',
                  testimonial: 'The platform\'s escrow system ensures I get paid fairly for my work. Best freelancing experience in the Web3 space.',
                  avatar: 'https://randomuser.me/api/portraits/men/46.jpg'
                },
              ].map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <MotionCard
                      whileHover={{ 
                        y: -15,
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                      }}
                      sx={{
                        height: '100%',
                        borderRadius: 4,
                        p: 2,
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        position: 'relative',
                      }}
                    >
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <Typography 
                          variant="h1" 
                          sx={{ 
                            position: 'absolute',
                            top: -40,
                            left: -10,
                            color: 'rgba(59, 130, 246, 0.1)',
                            fontSize: '10rem',
                            lineHeight: 1,
                            fontFamily: '"Georgia", serif',
                          }}
                        >
                          "
                        </Typography>
                      </Box>
                      <CardContent>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            mb: 3, 
                            position: 'relative',
                            fontStyle: 'italic'
                          }}
                        >
                          "{testimonial.testimonial}"
                        </Typography>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={testimonial.avatar} 
                            alt={testimonial.name}
                            sx={{ width: 50, height: 50, mr: 2 }}
                          />
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {testimonial.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {testimonial.role}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </MotionCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Download Our App */}
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

      {/* Latest Jobs */}
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

      {/* Join the Community Section */}
      <Box 
        sx={{ 
          py: 12, 
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <MotionPaper
              whileHover={{ y: -5 }}
              sx={{
                p: { xs: 4, md: 8 },
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 80px rgba(0, 0, 0, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                textAlign: 'center',
                position: 'relative',
                zIndex: 2
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  mb: 3,
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Join Our Community
              </Typography>
              
              <Typography 
                variant="h5" 
                color="text.secondary" 
                sx={{ mb: 5, maxWidth: 600, mx: 'auto' }}
              >
                Connect with like-minded professionals, stay updated, and get exclusive resources
              </Typography>
              
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={3} 
                justifyContent="center"
                sx={{ mb: 5 }}
              >
                {[
                  { icon: <TwitterIcon fontSize="large" />, color: '#1DA1F2', name: 'Twitter' },
                  { icon: <GitHubIcon fontSize="large" />, color: '#333', name: 'GitHub' },
                  { icon: <TelegramIcon fontSize="large" />, color: '#0088cc', name: 'Telegram' },
                  { icon: <LinkedInIcon fontSize="large" />, color: '#0077B5', name: 'LinkedIn' },
                ].map((social, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconButton
                      sx={{
                        width: 70,
                        height: 70,
                        backgroundColor: 'white',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                        color: social.color,
                        '&:hover': {
                          backgroundColor: social.color,
                          color: 'white'
                        }
                      }}
                    >
                      {social.icon}
                    </IconButton>
                    <Typography variant="body2" sx={{ mt: 1 }}>{social.name}</Typography>
                  </motion.div>
                ))}
              </Stack>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    py: 2,
                    px: 6,
                    borderRadius: '30px',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #1E40AF, #3B82F6)',
                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
                    '&:hover': {
                      boxShadow: '0 20px 40px rgba(59, 130, 246, 0.6)',
                    },
                  }}
                  component="a"
                  href="https://discord.gg/web3lancer"
                  target="_blank"
                >
                  Join Discord
                </Button>
              </motion.div>
            </MotionPaper>
          </motion.div>
        </Container>
        
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 70%)',
            top: -100,
            left: -100,
            zIndex: 1
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30, 64, 175, 0.2) 0%, rgba(30, 64, 175, 0) 70%)',
            bottom: -50,
            right: -50,
            zIndex: 1
          }}
        />
      </Box>

      <Fab
        color="primary"
        aria-label="scroll to top"
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: { xs: 72, md: 16 },
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
