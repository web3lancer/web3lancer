"use client";
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ProjectProgress } from '@/components/dashboard/ProjectProgress';

export default function DashboardPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<any[]>([]);
  const [userActivities, setUserActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchUserActivities();
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
      ]);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          Dashboard
        </Typography>

        <DashboardStats stats={userStats} />

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={8}>
            <RecentActivity activities={userActivities} />
          </Grid>
          <Grid item xs={12} md={4}>
            <ProjectProgress />
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}