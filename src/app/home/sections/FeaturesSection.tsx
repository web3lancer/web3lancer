import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Container } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const features = [
  {
    title: 'Payment Protection',
    description: 'Lower cost and reliable'
  },
  {
    title: 'Large Pool of Customers',
    description: 'Access to global opportunities'
  },
  {
    title: 'Advanced Analytics',
    description: 'Manage your work, Grow your network'
  }
];

const steps = [
  {
    title: 'Create an Account',
    description: 'Sign up and create your profile'
  },
  {
    title: 'Post a Job',
    description: 'Describe your project and post it'
  },
  {
    title: 'Hire the Best',
    description: 'Review proposals and hire the best'
  }
];

export default function FeaturesSection() {
  return (
    <>
      <Box sx={{ py: 15, background: '#fff' }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              align="center"
              sx={{
                mb: 8,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Why Choose Web3Lancer
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={4} key={feature.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
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
                        <Typography variant="h5" gutterBottom>{feature.title}</Typography>
                        <Typography variant="body1" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </MotionCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ mb: 8 }}>
        <Container maxWidth="xl">
          <Typography variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
            How It Works
          </Typography>
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={step.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
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
                      <Typography variant="h5" gutterBottom>{step.title}</Typography>
                      <Typography variant="body1" color="text.secondary">
                        {step.description}
                      </Typography>
                    </CardContent>
                  </MotionCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
}
