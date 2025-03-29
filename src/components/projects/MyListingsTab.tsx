import React from 'react';
import { Grid, Typography, Button, CardContent, CardActions } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(motion.div);

interface MyListingsTabProps {
  user: any;
  jobs: any[];
  projects: any[];
}

export default function MyListingsTab({ user, jobs, projects }: MyListingsTabProps) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="h5" sx={{ mb: 2 }}>My Jobs</Typography>
        <Grid container spacing={2}>
          {jobs
            .filter(job => job.employerId === user?.$id)
            .map((job) => (
              <Grid item xs={12} key={job.$id}>
                <MotionCard 
                  whileHover={{ y: -5 }}
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 10px 40px 0 rgba(31, 38, 135, 0.15)',
                    overflow: 'hidden',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">{job.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{job.description}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">Edit</Button>
                    <Button size="small" color="error">Delete</Button>
                  </CardActions>
                </MotionCard>
              </Grid>
            ))}
        </Grid>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography variant="h5" sx={{ mb: 2 }}>My Projects</Typography>
        <Grid container spacing={2}>
          {projects
            .filter(project => project.ownerId === user?.$id)
            .map((project) => (
              <Grid item xs={12} key={project.$id}>
                <MotionCard 
                  whileHover={{ y: -5 }}
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 10px 40px 0 rgba(31, 38, 135, 0.15)',
                    overflow: 'hidden',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">{project.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{project.description}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">Edit</Button>
                    <Button size="small" color="error">Delete</Button>
                  </CardActions>
                </MotionCard>
              </Grid>
            ))}
        </Grid>
      </Grid>
    </Grid>
  );
}
