import React from 'react';
import { Box, Typography, LinearProgress, Card, CardContent, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const projectData = [
  { name: 'DApp Development', progress: 75 },
  { name: 'Smart Contract', progress: 45 },
  { name: 'Blockchain Integration', progress: 90 },
];

export function ProjectProgress() {
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
        <Typography variant="h6" sx={{ mb: 3 }}>Project Progress</Typography>
        {projectData.map((project, index) => (
          <Box key={project.name} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{project.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {project.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'rgba(0,0,0,0.05)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                },
              }}
            />
          </Box>
        ))}
      </CardContent>
    </MotionCard>
  );
}
