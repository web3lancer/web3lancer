import React from 'react';
import { Box, Typography, Grid, Container, useTheme, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const statistics = [
  { value: '5K+', label: 'Freelancers', icon: <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} /> },
  { value: '1.2K+', label: 'Projects Completed', icon: <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'success.main' }} /> },
  { value: '3.5K+', label: 'Happy Clients', icon: <EmojiEventsIcon sx={{ fontSize: 40, color: 'secondary.main' }} /> },
  { value: '98%', label: 'Success Rate', icon: <RocketLaunchIcon sx={{ fontSize: 40, color: 'warning.main' }} /> },
];

export default function StatisticsSection() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1F2937 0%, #111827 100%)'
          : 'linear-gradient(135deg, #F3F4F6 0%, #EFF6FF 100%)',
        width: '100%',
        overflow: 'hidden'
      }}
      component={motion.div}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
        <Typography
          variant="h2"
          align="center"
          sx={{
            mb: { xs: 6, md: 10 },
            fontWeight: 700,
            color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827',
          }}
        >
          Our Growing Community
        </Typography>

        <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} justifyContent="center">
          {statistics.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    textAlign: 'center',
                    borderRadius: 3,
                    background: theme.palette.background.paper,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Box sx={{ mb: 2 }}>{stat.icon}</Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      mb: 1
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
