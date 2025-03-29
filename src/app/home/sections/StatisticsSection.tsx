import React from 'react';
import { Box, Typography, Grid, Container } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const statistics = [
  { value: 5000, label: 'Freelancers', icon: '👨‍💻' },
  { value: 1200, label: 'Projects Completed', icon: '✅' },
  { value: 3500, label: 'Happy Clients', icon: '🤝' },
  { value: 98, label: 'Success Rate %', icon: '🚀' },
];

export default function StatisticsSection() {
  return (
    <Box 
      sx={{ 
        py: 12, 
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F3F4F6 100%)',
        width: '100%',
        overflow: 'hidden'
      }}
      component={motion.div}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <Container maxWidth={false} sx={{ width: '100%', px: { xs: 2, md: 4, lg: 6 } }}>
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
          Growing Fast
        </Typography>
        
        <Grid container spacing={{ xs: 2, md: 4 }} justifyContent="center" sx={{ width: '100%', mx: 0 }}>
          {statistics.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>
                    {stat.icon}
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    <CountUp end={stat.value} duration={2.5} />
                    {stat.label === 'Success Rate %' ? '%' : ''}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
