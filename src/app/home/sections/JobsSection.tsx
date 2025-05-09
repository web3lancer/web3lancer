import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Container, useTheme, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

interface Job {
  $id: string;
  title: string;
  description: string;
}

interface JobsSectionProps {
  jobs: Job[];
  isLoading: boolean; // Added isLoading prop
}

export default function JobsSection({ jobs, isLoading }: JobsSectionProps) {
  const theme = useTheme();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Box sx={{ mb: 8 }}>
      <Container maxWidth="xl">
        <Typography variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
          Latest Jobs
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : !jobs || jobs.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Jobs Found
            </Typography>
            <Typography color="text.secondary">
              There are currently no open positions. Please check back later!
            </Typography>
          </Box>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
          >
            <Grid container spacing={3}>
              {jobs.map((job, index) => (
                <Grid item xs={12} sm={6} md={4} key={job.$id || index}>
                  <motion.div variants={item}>
                    <MotionCard
                      whileHover={{ y: -10 }}
                      sx={{
                        height: '100%',
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(30, 41, 59, 0.7)'
                          : 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: theme.palette.mode === 'dark'
                          ? '1px solid rgba(255, 255, 255, 0.05)'
                          : '1px solid rgba(255, 255, 255, 0.18)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 8px 32px rgba(0, 0, 0, 0.2)'
                          : '0 8px 32px rgba(31, 38, 135, 0.1)',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6">{job.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{job.description}</Typography>
                      </CardContent>
                    </MotionCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </Container>
    </Box>
  );
}
