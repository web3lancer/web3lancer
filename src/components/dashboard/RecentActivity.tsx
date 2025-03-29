import React from 'react';
import { Box, Typography, Card, CardContent, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

interface Activity {
  title: string;
  description: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const theme = useTheme();
  
  return (
    <MotionCard
      whileHover={{ boxShadow: theme.shadows[8] }}
      sx={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        height: '100%',
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>Recent Activity</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {activity.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.description}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </CardContent>
    </MotionCard>
  );
}
