"use client";
import { Box, Grid, Typography, useTheme, Paper, Avatar, LinearProgress, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ProjectProgress } from '@/components/dashboard/ProjectProgress';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';

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
      const timer = setTimeout(() => {
        fetchUserStats(); 
        fetchUserActivities();
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false); 
    }
  }, [user]);

  const fetchUserStats = async () => {
    console.log("Fetching user stats from Appwrite..."); 
    try {
      setUserStats([
        { title: 'Total Earnings', value: '$12,350', icon: AccountBalanceWalletOutlinedIcon, increase: '+15%', color: theme.palette.success.main },
        { title: 'Active Projects', value: '8', icon: WorkOutlineOutlinedIcon, increase: '+5%', color: theme.palette.info.main },
        { title: 'Completion Rate', value: '94%', icon: AssessmentOutlinedIcon, increase: '+2%', color: theme.palette.warning.main },
        { title: 'Client Rating', value: '4.9/5', icon: StarBorderOutlinedIcon, increase: '+0.3', color: theme.palette.secondary.main },
      ]);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchUserActivities = async () => {
    console.log("Fetching user activities from Appwrite...");
    try {
      setUserActivities([
        { id: 'act1', type: 'Project Completed', description: 'Blockchain Integration', time: '2 hours ago', icon: 'CheckCircleOutline' },
        { id: 'act2', type: 'New Project Assigned', description: 'Smart Contract Development', time: '5 hours ago', icon: 'AssignmentTurnedInOutlined' },
        { id: 'act3', type: 'Payment Received', description: '$1,500 for DApp Development', time: '1 day ago', icon: 'PaidOutlined' },
        { id: 'act4', type: 'Proposal Accepted', description: 'NFT Marketplace Design', time: '2 days ago', icon: 'ThumbUpAltOutlined' },
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
          minHeight: 'calc(100vh - 64px)', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>Loading your dashboard...</Typography>
        <Box sx={{ width: '60%', maxWidth: 500 }}>
          <LinearProgress color="primary" />
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: { xs: 2, md: 3 }, 
        minHeight: 'calc(100vh - 64px)', 
        background: theme.palette.background.default
      }}
    >
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 3, md: 4 } }}>
            <Avatar 
              src={user?.avatarUrl || "/assets/default-avatar.png"} 
              sx={{ 
                width: { xs: 56, md: 64 }, 
                height: { xs: 56, md: 64 }, 
                mr: 2, 
                border: `3px solid ${theme.palette.primary.main}`, 
                boxShadow: theme.shadows[3] 
              }}
            />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Welcome back, {user?.name || 'Developer'}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Here's your dashboard overview.
              </Typography>
            </Box>
          </Box>
        </motion.div>

        <motion.div variants={itemVariants}>
          <DashboardStats stats={userStats} />
        </motion.div>

        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: { xs: 2, md: 3 } }}>
          <Grid item xs={12} lg={8}>
            <motion.div variants={itemVariants}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderRadius: 3, 
                  border: `1px solid ${theme.palette.divider}`, 
                  background: theme.palette.background.paper,
                  height: '100%'
                }}
              >
                <RecentActivity activities={userActivities} />
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} lg={4}>
            <motion.div variants={itemVariants}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderRadius: 3, 
                  border: `1px solid ${theme.palette.divider}`, 
                  background: theme.palette.background.paper,
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