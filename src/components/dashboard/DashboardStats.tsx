import React from 'react';
import { Box, Grid, Typography, IconButton, Card, CardContent, useTheme } from '@mui/material';
import { ArrowUpward, MoreVert, Assessment, AccountBalance, WorkOutline, TrendingUp } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

// Map strings to icon components
const iconComponents: Record<string, React.ElementType> = {
  'AccountBalance': AccountBalance,
  'WorkOutline': WorkOutline,
  'Assessment': Assessment,
  'TrendingUp': TrendingUp,
};

interface StatsData {
  title: string;
  value: string;
  icon: string;
  increase: string;
  color: string;
}

interface DashboardStatsProps {
  stats: StatsData[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => {
        const StatIcon = iconComponents[stat.icon] || AccountBalance;
        
        return (
          <Grid item xs={12} sm={6} lg={3} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MotionCard
                whileHover={{ y: -5, boxShadow: theme.shadows[8] }}
                sx={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: `${stat.color}20`,
                      }}
                    >
                      <StatIcon sx={{ color: stat.color }} />
                    </Box>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                    {stat.value}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary" variant="body2">
                      {stat.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                      <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {stat.increase}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </MotionCard>
            </motion.div>
          </Grid>
        );
      })}
    </Grid>
  );
}
