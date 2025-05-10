"use client";
import React, { useEffect, useState } from 'react';
import { Box, Fab, useTheme, Paper, Typography, Grid, Container } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { databases, ensureSession } from '../utils/api';
import HeroSection from './home/sections/HeroSection';
import StatisticsSection from './home/sections/StatisticsSection';
import FeaturesSection from './home/sections/FeaturesSection';
import FeaturedProjects from './home/sections/FeaturedProjects';
import TestimonialsSection from './home/sections/TestimonialsSection';
import DownloadSection from './home/sections/DownloadSection';
import JobsSection from './home/sections/JobsSection';
import CommunitySection from './home/sections/CommunitySection';
import HowItWorksSection from './home/sections/HowItWorksSection'; // Assuming you will create this
import CTABanner from './home/components/CTABanner'; // Assuming you will create this

interface Job {
  $id: string;
  title: string;
  description: string;
  budget?: number;      // Optional: Add budget
  skills?: string[];    // Optional: Add skills array
  createdAt?: string;   // Optional: Add creation date
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const theme = useTheme();

  useEffect(() => {
    async function init() {
      setLoadingJobs(true);
      await ensureSession().catch(error => {
        console.error("Error ensuring session:", error);
        // Potentially handle session error, e.g., redirect to login or show a message
      });
      
      try {
        const response = await databases.listDocuments('67af3ffe0011106c4575', '67b8f57b0018fe4fcde7');
        // Add more robust type checking or mapping if document structure is complex
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ 
      overflowX: 'hidden',
      width: '100%',
      maxWidth: '100vw', // Ensure it uses viewport width to prevent overflow issues
      boxSizing: 'border-box',
      bgcolor: theme.palette.background.default,
      color: theme.palette.text.primary, // Ensure text color contrasts with background
    }}>
      <HeroSection />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <StatisticsSection />
      </Container>
      
      <Paper elevation={0} sx={{
        py: 6, 
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)` 
          : `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[100]} 100%)`,
      }}>
        <Container maxWidth="lg">
          <FeaturesSection />
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <FeaturedProjects />
      </Container>

      {/* Assuming HowItWorksSection will be created */}
      <Box sx={{ 
        py: 8,
        background: theme.palette.mode === 'dark' 
            ? 'rgba(10, 25, 41, 0.5)' // Dark, slightly transparent acrylic
            : 'rgba(240, 248, 255, 0.7)', // Light, slightly transparent acrylic (AliceBlue based)
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)', // Safari
      }}>
        <Container maxWidth="lg">
          <HowItWorksSection />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <TestimonialsSection />
      </Container>

      {/* Assuming CTABanner will be created */}
      <CTABanner 
        title="Ready to Start Your Next Web3 Project?"
        subtitle="Join Web3Lancer today and connect with top talent or find exciting new opportunities."
        primaryButtonText="Find Talent"
        primaryButtonLink="/projects/post"
        secondaryButtonText="Browse Projects"
        secondaryButtonLink="/projects"
      />

      <Paper elevation={0} sx={{
        py: 6, 
        background: theme.palette.mode === 'dark' 
          ? theme.palette.background.paper // Or a subtle gradient
          : theme.palette.grey[50],
      }}>
        <Container maxWidth="lg">
          <JobsSection jobs={jobs} isLoading={loadingJobs} /> 
        </Container>
      </Paper>
      
      <DownloadSection /> {/* Consider integrating this more thematically or removing if redundant */}
      
      <Box sx={{ 
        py: 8,
        background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
        color: theme.palette.primary.contrastText
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
          bottom: { xs: 72, md: 32 }, // Adjusted bottom margin
          right: 32, // Adjusted right margin
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main || theme.palette.primary.dark})`,
          boxShadow: `0 8px 20px ${theme.palette.primary.dark}59`, // Adjusted shadow, 0.35 opacity
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
  );
}
