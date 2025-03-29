import React from 'react';
import { Grid, Typography, Alert, Button, Box, Chip, CardContent, CardActions } from '@mui/material';
import { WorkOutline, Work } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionCard = motion(motion.div);

interface BrowseProjectsTabProps {
  jobs: any[];
  projects: any[];
  loading: boolean;
}

export default function BrowseProjectsTab({ jobs, projects, loading }: BrowseProjectsTabProps) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <WorkOutline sx={{ mr: 1 }} /> Available Jobs
        </Typography>
        {jobs.length === 0 && !loading ? (
          <Alert severity="info">No jobs available at the moment.</Alert>
        ) : (
          <Grid container spacing={2}>
            {jobs.map((job) => (
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
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{job.description}</Typography>
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {job.tags?.map((tag: string, index: number) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{ background: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">Apply</Button>
                    <Button size="small" color="primary">Details</Button>
                  </CardActions>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Work sx={{ mr: 1 }} /> Active Projects
        </Typography>
        {projects.length === 0 && !loading ? (
          <Alert severity="info">No active projects at the moment.</Alert>
        ) : (
          <Grid container spacing={2}>
            {projects.map((project) => (
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
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{project.description}</Typography>
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {project.tags?.map((tag: string, index: number) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{ background: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">Join</Button>
                    <Button size="small" color="primary">Details</Button>
                  </CardActions>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}
