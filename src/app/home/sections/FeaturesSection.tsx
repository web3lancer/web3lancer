import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Container, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import ShieldIcon from '@mui/icons-material/Shield';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WorkIcon from '@mui/icons-material/Work';
import HandshakeIcon from '@mui/icons-material/Handshake';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const features = [
  {
    title: 'Payment Protection',
    description: 'Secure blockchain-based escrow ensures your payments are safe and reliable',
    icon: <ShieldIcon sx={{ fontSize: 40 }} />
  },
  {
    title: 'Global Opportunities',
    description: 'Access to worldwide clients and projects in the Web3 ecosystem',
    icon: <PeopleIcon sx={{ fontSize: 40 }} />
  },
  {
    title: 'Advanced Analytics',
    description: 'Track performance, manage your work, and grow your professional network',
    icon: <BarChartIcon sx={{ fontSize: 40 }} />
  }
];

const steps = [
  {
    title: 'Create an Account',
    description: 'Sign up and build your professional profile with blockchain credentials',
    icon: <PersonAddIcon sx={{ fontSize: 40 }} />
  },
  {
    title: 'Post or Find Jobs',
    description: 'Describe your project or browse available opportunities',
    icon: <WorkIcon sx={{ fontSize: 40 }} />
  },
  {
    title: 'Collaborate Securely',
    description: 'Work together with smart contract protection and decentralized payments',
    icon: <HandshakeIcon sx={{ fontSize: 40 }} />
  }
];

export default function FeaturesSection() {
  return (
    <>
      <Box sx={{ py: 15, background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)', width: '100%', overflow: 'hidden' }}>
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
                mb: 2,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Why Choose Web3Lancer
            </Typography>
            
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
            >
              The next generation platform for decentralized freelancing with blockchain security
            </Typography>
            
            <Grid container spacing={{ xs: 3, md: 5 }} sx={{ width: '100%', mx: 0 }}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={4} key={feature.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <MotionCard
                      whileHover={{ y: -10, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      sx={{
                        height: '100%',
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease',
                        overflow: 'visible'
                      }}
                    >
                      <CardContent sx={{ pt: 5, pb: 4, px: 4, position: 'relative' }}>
                        <MotionBox
                          whileHover={{ rotate: 5 }}
                          sx={{
                            position: 'absolute',
                            top: -25,
                            left: 30,
                            width: 60,
                            height: 60,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                            color: 'white',
                            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                          }}
                        >
                          {feature.icon}
                        </MotionBox>
                        <Typography variant="h5" gutterBottom sx={{ mb: 1, mt: 1, fontWeight: 700 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
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

      <Box sx={{ py: 12, background: 'white', width: '100%', overflow: 'hidden' }}>
        <Container maxWidth={false} sx={{ width: '100%', px: { xs: 2, md: 4, lg: 6 } }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography 
              variant="h2" 
              sx={{ 
                mb: 2, 
                textAlign: 'center',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              How It Works
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
            >
              Simple steps to get started with Web3Lancer
            </Typography>
            
            <Box sx={{ position: 'relative' }}>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  height: 3, 
                  backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                  top: 40, 
                  left: '10%', 
                  width: '80%',
                  display: { xs: 'none', md: 'block' } 
                }} 
              />
              
              <Grid container spacing={4}>
                {steps.map((step, index) => (
                  <Grid item xs={12} md={4} key={step.title}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.3, duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            backgroundColor: 'primary.main',
                            mb: 3,
                            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                            zIndex: 2,
                          }}
                        >
                          {step.icon}
                          <Typography sx={{ position: 'absolute', bottom: -8, right: -8, width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.dark', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                            {index + 1}
                          </Typography>
                        </Avatar>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </>
  );
}
