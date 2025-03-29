import React from 'react';
import { Box, Typography, Button, Stack, IconButton, Container, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TelegramIcon from '@mui/icons-material/Telegram';

const MotionPaper = motion(Paper);

export default function CommunitySection() {
  return (
    <Box 
      sx={{ 
        py: 12, 
        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <MotionPaper
            whileHover={{ y: -5 }}
            sx={{
              p: { xs: 4, md: 8 },
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 80px rgba(0, 0, 0, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              textAlign: 'center',
              position: 'relative',
              zIndex: 2
            }}
          >
            <Typography
              variant="h2"
              sx={{
                mb: 3,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Join Our Community
            </Typography>
            
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ mb: 5, maxWidth: 600, mx: 'auto' }}
            >
              Connect with like-minded professionals, stay updated, and get exclusive resources
            </Typography>
            
            <SocialButtons />
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  py: 2,
                  px: 6,
                  borderRadius: '30px',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #1E40AF, #3B82F6)',
                  boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
                  '&:hover': {
                    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.6)',
                  },
                }}
                component="a"
                href="https://discord.gg/web3lancer"
                target="_blank"
              >
                Join Discord
              </Button>
            </motion.div>
          </MotionPaper>
        </motion.div>
      </Container>
      
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 70%)',
          top: -100,
          left: -100,
          zIndex: 1
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30, 64, 175, 0.2) 0%, rgba(30, 64, 175, 0) 70%)',
          bottom: -50,
          right: -50,
          zIndex: 1
        }}
      />
    </Box>
  );
}

function SocialButtons() {
  const socialNetworks = [
    { icon: <TwitterIcon fontSize="large" />, color: '#1DA1F2', name: 'Twitter' },
    { icon: <GitHubIcon fontSize="large" />, color: '#333', name: 'GitHub' },
    { icon: <TelegramIcon fontSize="large" />, color: '#0088cc', name: 'Telegram' },
    { icon: <LinkedInIcon fontSize="large" />, color: '#0077B5', name: 'LinkedIn' },
  ];

  return (
    <Stack 
      direction={{ xs: 'column', sm: 'row' }} 
      spacing={3} 
      justifyContent="center"
      sx={{ mb: 5 }}
    >
      {socialNetworks.map((social, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <IconButton
            sx={{
              width: 70,
              height: 70,
              backgroundColor: 'white',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              color: social.color,
              '&:hover': {
                backgroundColor: social.color,
                color: 'white'
              }
            }}
          >
            {social.icon}
          </IconButton>
          <Typography variant="body2" sx={{ mt: 1 }}>{social.name}</Typography>
        </motion.div>
      ))}
    </Stack>
  );
}
