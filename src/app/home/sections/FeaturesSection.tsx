import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Container, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const features = [
  {
    title: 'Payment Protection',
    description: 'Secure blockchain-based escrow ensures your payments are safe and reliable',
    icon: <ShieldOutlinedIcon sx={{ fontSize: 32 }} />
  },
  {
    title: 'Global Opportunities',
    description: 'Access to worldwide clients and projects in the Web3 ecosystem',
    icon: <PeopleAltOutlinedIcon sx={{ fontSize: 32 }} />
  },
  {
    title: 'Advanced Analytics',
    description: 'Track performance, manage your work, and grow your professional network',
    icon: <BarChartOutlinedIcon sx={{ fontSize: 32 }} />
  }
];

const steps = [
  {
    title: 'Create an Account',
    description: 'Sign up and build your professional profile with blockchain credentials',
    icon: <PersonAddAltOutlinedIcon sx={{ fontSize: 32 }} />
  },
  {
    title: 'Post or Find Jobs',
    description: 'Describe your project or browse available opportunities',
    icon: <WorkOutlineOutlinedIcon sx={{ fontSize: 32 }} />
  },
  {
    title: 'Collaborate Securely',
    description: 'Work together with smart contract protection and decentralized payments',
    icon: <HandshakeOutlinedIcon sx={{ fontSize: 32 }} />
  }
];

export default function FeaturesSection() {
  return (
    <>
      <Box sx={{ py: { xs: 8, md: 12 }, background: '#ffffff', width: '100%', overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
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
                fontWeight: 700,
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
              sx={{ mb: 10, maxWidth: 700, mx: 'auto', lineHeight: 1.6 }}
            >
              The next generation platform for decentralized freelancing with blockchain security
            </Typography>
            
            <Grid container spacing={{ xs: 3, md: 4 }} sx={{ width: '100%', mx: 0 }}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={4} key={feature.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <MotionCard
                      whileHover={{ y: -8, boxShadow: '0 12px 35px rgba(0,0,0,0.08)' }}
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        background: '#ffffff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.3s ease-out',
                        overflow: 'visible'
                      }}
                    >
                      <CardContent sx={{ pt: 6, pb: 4, px: 3, position: 'relative' }}>
                        <MotionBox
                          whileHover={{ rotate: 0, scale: 1.1 }}
                          sx={{
                            position: 'absolute',
                            top: -28,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 56,
                            height: 56,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                            color: 'white',
                            boxShadow: '0 6px 15px rgba(59, 130, 246, 0.3)',
                          }}
                        >
                          {feature.icon}
                        </MotionBox>
                        <Typography variant="h6" align="center" gutterBottom sx={{ mb: 1.5, mt: 2, fontWeight: 600 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" align="center" color="text.secondary" sx={{ lineHeight: 1.7 }}>
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

      <Box sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', width: '100%', overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
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
                fontWeight: 700,
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
              sx={{ mb: 10, maxWidth: 700, mx: 'auto', lineHeight: 1.6 }}
            >
              Simple steps to get started with Web3Lancer
            </Typography>
            
            <Box sx={{ position: 'relative' }}>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  height: 2,
                  backgroundColor: 'primary.light',
                  opacity: 0.5,
                  top: 40, 
                  left: '15%',
                  width: '70%',
                  display: { xs: 'none', md: 'block' },
                  zIndex: 0
                }} 
              />
              
              <Grid container spacing={{ xs: 4, md: 6 }}>
                {steps.map((step, index) => (
                  <Grid item xs={12} md={4} key={step.title}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.3, duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                            color: 'white',
                            mb: 3,
                            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                            zIndex: 2,
                          }}
                        >
                          {step.icon}
                          <Typography sx={{ 
                            position: 'absolute', 
                            top: -10, 
                            right: -10, 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            bgcolor: 'primary.dark', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            border: '3px solid #F3F4F6',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}>
                            {index + 1}
                          </Typography>
                        </Avatar>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
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
