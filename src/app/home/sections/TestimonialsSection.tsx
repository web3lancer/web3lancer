import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar, Divider, Container, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const testimonials = [
  {
    name: 'Alex Thomson',
    role: 'Blockchain Developer',
    testimonial: 'Web3Lancer helped me find consistent high-quality blockchain projects. The payment protection gives me peace of mind.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    name: 'Sarah Williams',
    role: 'Project Manager',
    testimonial: 'Finding qualified Web3 talent used to be challenging until I discovered Web3Lancer. Now I can build teams quickly!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'Smart Contract Developer',
    testimonial: 'The platform\'s escrow system ensures I get paid fairly for my work. Best freelancing experience in the Web3 space.',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg'
  },
];

export default function TestimonialsSection() {
  const theme = useTheme();
  
  return (
    <Box sx={{ py: 15, background: theme.palette.background.paper, width: '100%', overflow: 'hidden' }}>
      <Container maxWidth={false} sx={{ width: '100%', px: { xs: 2, md: 4, lg: 6 } }}>
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
            What People Say
          </Typography>
          
          <Grid container spacing={{ xs: 2, md: 4 }} sx={{ width: '100%', mx: 0 }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <MotionCard
                    whileHover={{ 
                      y: -15,
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 20px 40px rgba(0, 0, 0, 0.5)' 
                        : '0 20px 40px rgba(0, 0, 0, 0.1)'
                    }}
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      p: 2,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(31, 41, 55, 0.7)'
                        : 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 10px 30px rgba(0, 0, 0, 0.2)'
                        : '0 10px 30px rgba(0, 0, 0, 0.05)',
                      border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.05)'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <Typography 
                        variant="h1" 
                        sx={{ 
                          position: 'absolute',
                          top: -40,
                          left: -10,
                          color: 'rgba(59, 130, 246, 0.1)',
                          fontSize: '10rem',
                          lineHeight: 1,
                          fontFamily: '"Georgia", serif',
                        }}
                      >
                        "
                      </Typography>
                    </Box>
                    <CardContent>
                      <Typography 
                        variant="body1"
                        sx={{ 
                          mb: 3, 
                          position: 'relative',
                          fontStyle: 'italic'
                        }}
                      >
                        "{testimonial.testimonial}"
                      </Typography>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={testimonial.avatar} 
                          alt={testimonial.name}
                          sx={{ width: 50, height: 50, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Box>
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
