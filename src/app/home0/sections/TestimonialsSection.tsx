import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar, Divider, Container, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const MotionCard = motion(Card);

const testimonials = [
  {
    name: 'Alex Thomson',
    role: 'Blockchain Developer',
    testimonial: 'Web3Lancer helped me find consistent high-quality blockchain projects. The payment protection gives me peace of mind and the community is fantastic!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    name: 'Sarah Williams',
    role: 'Project Manager at DeFi Corp',
    testimonial: 'Finding qualified Web3 talent used to be a nightmare. Web3Lancer streamlined the process and connected us with amazing developers quickly!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'Smart Contract Auditor',
    testimonial: "The platform's escrow system and dispute resolution are top-notch. It's the best freelancing experience I've had in the Web3 space by far.",
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg'
  },
];

export default function TestimonialsSection() {
  const theme = useTheme();
  
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, background: theme.palette.background.default, width: '100%', overflow: 'hidden' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: { xs: 6, md: 10 },
              fontWeight: 700,
              color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827',
            }}
          >
            Loved by Innovators
          </Typography>
          
          <Grid container spacing={{ xs: 3, sm: 4 }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  style={{ height: '100%' }}
                >
                  <Card
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 3,
                      background: theme.palette.background.paper,
                      boxShadow: theme.shadows[3],
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      textAlign: 'center'
                    }}
                  >
                    <Avatar
                      alt={testimonial.name}
                      src={testimonial.avatar}
                      sx={{ width: 80, height: 80, margin: '0 auto 16px auto', border: `3px solid ${theme.palette.primary.main}` }}
                    />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {testimonial.role}
                    </Typography>
                    <FormatQuoteIcon sx={{ fontSize: 40, color: 'primary.light', mb: 1 }} />
                    <Typography variant="body1" color="text.primary" sx={{ fontStyle: 'italic', flexGrow: 1 }}>
                      {testimonial.testimonial}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
