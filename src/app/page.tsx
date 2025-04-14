"use client";
import React, { useEffect, useState } from 'react';
import { Box, Fab } from '@mui/material';
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

interface Job {
  $id: string;
  title: string;
  description: string;
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function init() {
      // Ensure a session exists (anonymous or authenticated)
      await ensureSession().catch(console.error);
      
      // Then fetch jobs
      try {
        const response = await databases.listDocuments('67af3ffe0011106c4575', '67b8f57b0018fe4fcde7');
        setJobs(response.documents as unknown as Job[]);
      } catch (error) {
        console.error('Error fetching jobs:', error);
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
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <HeroSection />
      <StatisticsSection />
      <FeaturesSection />
      <FeaturedProjects />
      <TestimonialsSection />
      <DownloadSection />
      <JobsSection jobs={jobs} />
      <CommunitySection />

      <Fab
        color="primary"
        aria-label="scroll to top"
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: { xs: 72, md: 24 }, // Adjusted bottom position
          right: 24, // Adjusted right position
          background: 'linear-gradient(45deg, #3B82F6, #1E40AF)', // Swapped gradient direction for consistency
          boxShadow: '0 6px 16px rgba(30, 64, 175, 0.3)', // Softer shadow
          zIndex: 1100, // Ensure it's above other elements like AppBar
          opacity: 0.85,
          transition: 'opacity 0.3s ease, background 0.3s ease',
          '&:hover': {
            opacity: 1,
            background: 'linear-gradient(45deg, #1E40AF, #3B82F6)', // Consistent hover gradient
          },
        }}
      >
        <ArrowUpwardIcon />
      </Fab>
    </Box>
  );
}
