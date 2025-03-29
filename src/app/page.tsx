"use client";
import React, { useEffect, useState } from 'react';
import { Box, Fab } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { databases } from '../utils/api';
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
    async function fetchJobs() {
      try {
        const response = await databases.listDocuments('67af3ffe0011106c4575', '67b8f57b0018fe4fcde7');
        setJobs(response.documents as unknown as Job[]);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    }
    fetchJobs();
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
