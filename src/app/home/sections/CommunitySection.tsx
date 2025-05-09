import React from 'react';
import { Box, Typography, Button, Stack, IconButton, Container, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TelegramIcon from '@mui/icons-material/Telegram';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'; // Corrected import

const MotionBox = motion(Box);

export default function CommunitySection() {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 }, 
        backgroundColor: theme.palette.background.default, 
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
              backgroundColor: theme.palette.background.paper, 
              boxShadow: theme.shadows[4],
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
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
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
                color="discord" // Use the new theme color
                size="large"
                startIcon={<ChatBubbleOutlineIcon />}
                sx={{
                  py: 1.5,
                  px: 5,
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  // background and color are now handled by color="discord"
                  boxShadow: `0 8px 25px ${theme.palette.discord.main}4D`, // 0.3 opacity
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    // Hover background is handled by MUI for custom palette colors
                    boxShadow: `0 12px 30px ${theme.palette.discord.main}66`, // 0.4 opacity
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
          background: theme.palette.mode === 'dark' 
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 70%)',
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
          background: theme.palette.mode === 'dark' 
            ? 'radial-gradient(circle, rgba(30, 64, 175, 0.1) 0%, rgba(30, 64, 175, 0) 70%)'
            : 'radial-gradient(circle, rgba(30, 64, 175, 0.05) 0%, rgba(30, 64, 175, 0) 70%)',
          bottom: -60,
          right: -60,
          zIndex: 1
        }}
      />
    </Box>
  );
}

function SocialButtons() {
  const theme = useTheme();
  const socialNetworks = [
    { icon: <TwitterIcon />, color: '#1DA1F2', name: 'Twitter', url: 'https://twitter.com/web3lancer' },
    { icon: <GitHubIcon />, color: '#333', name: 'GitHub', url: 'https://github.com/web3lancer' }, // Changed GitHub icon color for better contrast
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
              backgroundColor: theme.palette.action.hover, // Changed to theme-aware background
              boxShadow: theme.shadows[2],
              color: social.color,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: social.color,
                color: theme.palette.getContrastText(social.color), // Changed to ensure contrast
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
