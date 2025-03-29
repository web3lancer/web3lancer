import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Container } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

interface Job {
  $id: string;
  title: string;
  description: string;
}

interface JobsSectionProps {
  jobs: Job[];
}

export default function JobsSection({ jobs }: JobsSectionProps) {
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
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
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
      </Container>
    </Box>
  );
}
