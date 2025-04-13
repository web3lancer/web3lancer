"use client";
import { Box, Grid, Typography, useTheme, Paper, Avatar, LinearProgress, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ProjectProgress } from '@/components/dashboard/ProjectProgress';

// Animation variants for staggered children animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function DashboardPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<any[]>([]);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate loading time for better UX
      const timer = setTimeout(() => {
        fetchUserStats();
        fetchUserActivities();
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      // In a real app, this would fetch from your database
      setUserStats([
        { title: 'Total Earnings', value: '$12,350', icon: 'AccountBalance', increase: '+15%', color: '#1E40AF' },
        { title: 'Active Projects', value: '8', icon: 'WorkOutline', increase: '+5%', color: '#3B82F6' },
        { title: 'Completion Rate', value: '94%', icon: 'Assessment', increase: '+2%', color: '#60A5FA' },
        { title: 'Client Rating', value: '4.9/5', icon: 'TrendingUp', increase: '+0.3', color: '#93C5FD' },
      ]);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchUserActivities = async () => {
    try {
      // In a real app, this would fetch from your database
      setUserActivities([
        { title: 'Project Completed', description: 'Blockchain Integration', time: '2 hours ago' },
        { title: 'New Project', description: 'Smart Contract Development', time: '5 hours ago' },
        { title: 'Payment Received', description: 'DApp Development', time: '1 day ago' },
        { title: 'Proposal Accepted', description: 'NFT Marketplace', time: '2 days ago' },
      ]);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    }
  };

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          p: 3, 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>Loading your dashboard...</Typography>
        <Box sx={{ width: '50%', maxWidth: 400 }}>
          <LinearProgress color="primary" />
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: 4, 
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(to bottom, #111827, #1F2937)' 
          : 'linear-gradient(to bottom, #F9FAFB, #F3F4F6)'
      }}
    >
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box sx={{ mr: 2 }}>
              <Avatar 
                src={user?.avatarUrl || "/assets/default-avatar.png"} 
                sx={{ width: 64, height: 64, border: '2px solid', borderColor: 'primary.main' }}
              />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Welcome back, {user?.name || 'Developer'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Here's what's happening with your projects today
              </Typography>
            </Box>
          </Box>
        </motion.div>

        <motion.div variants={itemVariants}>
          <DashboardStats stats={userStats} />
        </motion.div>

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  background: theme.palette.background.paper,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  height: '100%'
                }}
              >
                <RecentActivity activities={userActivities} />
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  background: theme.palette.background.paper,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  height: '100%'
                }}
              >
                <ProjectProgress />
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}