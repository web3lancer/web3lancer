import React from 'react';
import { Box, Typography, Button, Stack, IconButton, Container } from '@mui/material';
import { motion } from 'framer-motion';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TelegramIcon from '@mui/icons-material/Telegram';
// import DiscordIcon from '@/components/icons/DiscordIcon'; // Assuming a custom Discord icon component exists or can be created
// import DiscordIcon from '@mui/icons-material/GitHub';
import DiscordIcon from '@mui/icons-material/GitHub';

const MotionBox = motion(Box);

export default function CommunitySection() {
  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 }, 
        background: '#ffffff', // White background
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
          <MotionBox
            whileHover={{ y: -5 }}
            sx={{
              p: { xs: 4, sm: 6, md: 8 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              textAlign: 'center',
              position: 'relative',
              zIndex: 2
            }}
          >
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Join Our Community
            </Typography>
            
            <Typography 
              variant="h6"
              color="text.secondary" 
              sx={{ mb: 6, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
            >
              Connect with like-minded professionals, stay updated, and get exclusive resources
            </Typography>
            
            <SocialButtons />
            
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<DiscordIcon />}
                sx={{
                  py: 1.5,
                  px: 5,
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  background: '#5865F2',
                  color: '#ffffff',
                  boxShadow: '0 8px 25px rgba(88, 101, 242, 0.3)',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: '#4f5bda',
                    boxShadow: '0 12px 30px rgba(88, 101, 242, 0.4)',
                  },
                }}
                component="a"
                href="https://discord.gg/web3lancer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Discord
              </Button>
            </motion.div>
          </MotionBox>
        </motion.div>
      </Container>
      
      <Box
        sx={{
          position: 'absolute',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 70%)',
          top: -80,
          left: -80,
          zIndex: 1
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30, 64, 175, 0.05) 0%, rgba(30, 64, 175, 0) 70%)',
          bottom: -60,
          right: -60,
          zIndex: 1
        }}
      />
    </Box>
  );
}

function SocialButtons() {
  const socialNetworks = [
    { icon: <TwitterIcon />, color: '#1DA1F2', name: 'Twitter', url: 'https://twitter.com/web3lancer' },
    { icon: <GitHubIcon />, color: '#333', name: 'GitHub', url: 'https://github.com/web3lancer' },
    { icon: <TelegramIcon />, color: '#0088cc', name: 'Telegram', url: 'https://t.me/web3lancer' },
    { icon: <LinkedInIcon />, color: '#0077B5', name: 'LinkedIn', url: 'https://linkedin.com/company/web3lancer' },
  ];

  return (
    <Stack 
      direction="row"
      spacing={{ xs: 2, sm: 3 }}
      justifyContent="center"
      sx={{ mb: 6 }}
      flexWrap="wrap"
    >
      {socialNetworks.map((social, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <IconButton
            component="a"
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit Web3Lancer on ${social.name}`}
            sx={{
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 },
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.07)',
              color: social.color,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: social.color,
                color: 'white',
                boxShadow: `0 6px 20px ${social.color}33`,
              }
            }}
          >
            {React.cloneElement(social.icon, { fontSize: 'medium' })}
          </IconButton>
        </motion.div>
      ))}
    </Stack>
  );
}
