"use client";
import React, {
  useEffect,
  useState,
} from 'react';

import Head from 'next/head';

import CommunitySection from '@/app/home0/sections/CommunitySection';
import DownloadSection from '@/app/home0/sections/DownloadSection';
import FeaturedProjects from '@/app/home0/sections/FeaturedProjects';
import FeaturesSection from '@/app/home0/sections/FeaturesSection';
import HeroSection from '@/app/home0/sections/HeroSection';
import JobsSection from '@/app/home0/sections/JobsSection';
import StatisticsSection from '@/app/home0/sections/StatisticsSection';
import TestimonialsSection from '@/app/home0/sections/TestimonialsSection';
import {
  JOB_POSTINGS_COLLECTION_ID,
  JOBS_DATABASE_ID,
} from '@/lib/env';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import {
  Box,
  Container,
  Fab,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';

import {
  databases,
  ensureSession,
} from '../utils/api';

// Placeholder for HowItWorksSection
const HowItWorksSection: React.FC = () => (
  <Box py={8} textAlign="center">
    <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
      How Web3Lancer Works
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, justifyContent: 'center', mb: 5 }}>
      <Paper elevation={1} sx={{ p: 4, borderRadius: 3, flex: 1, maxWidth: { xs: '100%', md: '30%' } }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          1. Post Your Project
        </Typography>
        <Typography variant="body1">
          Describe your project requirements, set your budget, and specify the skills you need.
        </Typography>
      </Paper>
      <Paper elevation={1} sx={{ p: 4, borderRadius: 3, flex: 1, maxWidth: { xs: '100%', md: '30%' } }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          2. Connect with Talent
        </Typography>
        <Typography variant="body1">
          Review proposals from skilled Web3lancers and choose the best match for your project.
        </Typography>
      </Paper>
      <Paper elevation={1} sx={{ p: 4, borderRadius: 3, flex: 1, maxWidth: { xs: '100%', md: '30%' } }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          3. Secure Payment
        </Typography>
        <Typography variant="body1">
          Use our blockchain-based escrow system for secure, transparent payments when milestones are completed.
        </Typography>
      </Paper>
    </Box>
  </Box>
);

// Placeholder for CTABanner
interface CTABannerProps {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}
const CTABanner: React.FC<CTABannerProps> = ({ title, subtitle, primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink }) => (
  <Paper elevation={3} sx={{ 
    py: { xs: 4, md: 6 }, 
    px: { xs: 2, md: 4 }, 
    my: 6, 
    textAlign: 'center', 
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // Example gradient
    color: 'white' 
  }}>
    <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
      {title}
    </Typography>
    <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
      {subtitle}
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Fab variant="extended" color="inherit" href={primaryButtonLink} sx={{ bgcolor: 'white', color: '#1e3a8a', '&:hover': { bgcolor: 'grey.200'} }}>
        {primaryButtonText}
      </Fab>
      <Fab variant="extended" href={secondaryButtonLink} sx={{ borderColor: 'white', color: 'white', borderWidth: 1, borderStyle: 'solid', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)'} }}>
        {secondaryButtonText}
      </Fab>
    </Box>
  </Paper>
);

interface Job {
  $id: string;
  title: string;
  description: string;
  budget?: number;
  skills?: string[];
  createdAt?: string;
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const theme = useTheme();

  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {

    // mark theme as ready after component mounts
    setThemeReady(true);

    async function init() {
      setLoadingJobs(true);
      await ensureSession().catch(error => {
        console.error("Error ensuring session:", error);
      });
      
      try {
        const response = await databases.listDocuments(JOBS_DATABASE_ID, JOB_POSTINGS_COLLECTION_ID);
        const fetchedJobs = response.documents.map((doc: any) => ({
          $id: doc.$id,
          title: doc.title || 'Untitled Job',
          description: doc.description || 'No description provided.',
          budget: doc.budget,
          skills: doc.skills,
          createdAt: doc.createdAt
        })) as Job[];
        setJobs(fetchedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]); 
      } finally {
        setLoadingJobs(false); 
      }
    }
    
    init();
  }, []);


  // Only render full content when theme is ready
  if (!themeReady) {
    return <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Typography>Loading...</Typography>
    </Box>;
  }
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>Web3Lancer – Decentralized Web3 Freelance Marketplace</title>
        <meta name="description" content="Find top Web3 talent or your next blockchain project. Secure, decentralized, and community-driven freelance marketplace for the future of work." />
        <meta property="og:title" content="Web3Lancer – Decentralized Web3 Freelance Marketplace" />
        <meta property="og:description" content="Find top Web3 talent or your next blockchain project. Secure, decentralized, and community-driven freelance marketplace for the future of work." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://web3lancer.xyz/" />
        <meta property="og:image" content="https://web3lancer.xyz/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Web3Lancer – Decentralized Web3 Freelance Marketplace" />
        <meta name="twitter:description" content="Find top Web3 talent or your next blockchain project. Secure, decentralized, and community-driven freelance marketplace for the future of work." />
        <meta name="twitter:image" content="https://web3lancer.xyz/og-image.png" />
      </Head>
      <Box sx={{ 
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        position: 'relative',
      }}>
        <HeroSection />

        <Paper elevation={0} sx={{
          py: { xs: 4, md: 6 },
          background: theme.palette.mode === 'dark' 
            ? theme.palette.grey[900] 
            : theme.palette.grey[50],
          position: 'relative',
          zIndex: 1,
        }}>
          <Container maxWidth="lg">
            <StatisticsSection />
          </Container>
        </Paper>
        
        <Paper elevation={0} sx={{
          py: { xs: 4, md: 6 }, 
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)` 
            : `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[100]} 100%)`,
          position: 'relative',
          zIndex: 1,
        }}>
          <Container maxWidth="lg">
            <FeaturesSection />
          </Container>
        </Paper>

        <Paper elevation={0} sx={{
          py: { xs: 4, md: 6 },
          background: theme.palette.mode === 'dark'
            ? theme.palette.background.paper // A slightly different shade for variety
            : theme.palette.grey[200],
          position: 'relative',
          zIndex: 1,
        }}>
          <Container maxWidth="lg">
            <FeaturedProjects />
          </Container>
        </Paper>

        <Box sx={{ 
          py: { xs: 6, md: 8 },
          background: theme.palette.mode === 'dark' 
              ? 'rgba(10, 25, 41, 0.6)' // Darker acrylic
              : 'rgba(240, 248, 255, 0.75)', // Lighter acrylic
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', 
          position: 'relative',
          zIndex: 1,
        }}>
          <Container maxWidth="lg">
            <HowItWorksSection />
          </Container>
        </Box>

        <Paper elevation={0} sx={{
          py: { xs: 4, md: 6 },
          background: theme.palette.mode === 'dark' 
            ? theme.palette.grey[800] // Another distinct shade
            : theme.palette.grey[100],
          position: 'relative',
          zIndex: 1,
        }}>
          <Container maxWidth="lg">
            <TestimonialsSection />
          </Container>
        </Paper>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <CTABanner 
            title="Ready to Start Your Next Web3 Project?"
            subtitle="Join Web3Lancer today and connect with top talent or find exciting new opportunities."
            primaryButtonText="Find Talent"
            primaryButtonLink="/projects/post"
            secondaryButtonText="Browse Projects"
            secondaryButtonLink="/projects"
          />
        </Container>

        <Paper elevation={0} sx={{
          py: { xs: 4, md: 6 }, 
          background: theme.palette.mode === 'dark' 
            ? theme.palette.background.default // Subtle distinction
            : theme.palette.grey[50],
          position: 'relative',
          zIndex: 1,
        }}>
          <Container maxWidth="lg">
            <JobsSection jobs={jobs} isLoading={loadingJobs} /> 
          </Container>
        </Paper>
        
        <Paper elevation={0} sx={{
          py: { xs: 4, md: 6 },
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(to bottom, ${theme.palette.grey[900]}, ${theme.palette.background.paper})`
            : `linear-gradient(to bottom, ${theme.palette.grey[50]}, ${theme.palette.grey[200]})`,
          position: 'relative',
          zIndex: 1,
        }}>
          <Container maxWidth="lg">
            <DownloadSection />
          </Container>
        </Paper>
        
        <Box sx={{ 
          py: { xs: 6, md: 8 },
          background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: theme.palette.primary.contrastText,
          position: 'relative',
          zIndex: 1,
        }}>
          <Container maxWidth="lg">
            <CommunitySection />
          </Container>
        </Box>

        <Fab
          color="primary"
          aria-label="scroll to top"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 72, md: 32 },
            right: 32,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main || theme.palette.primary.dark})`,
            boxShadow: `0 8px 20px ${theme.palette.primary.dark}59`,
            zIndex: 1100,
            opacity: 0.9,
            transition: 'opacity 0.3s ease, background 0.3s ease, transform 0.3s ease',
            '&:hover': {
              opacity: 1,
              transform: 'scale(1.1)',
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark || theme.palette.primary.main})`,
            },
          }}
        >
          <ArrowUpwardIcon />
        </Fab>
      </Box>
    </>
  );
}
