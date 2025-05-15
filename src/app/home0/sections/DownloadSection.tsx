import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Container, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

const MotionCard = motion(Card);

export default function DownloadSection() {
  const theme = useTheme();

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 }, 
        textAlign: 'center',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #111827 0%, #1F2937 100%)' 
          : 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration elements */}
      <Box sx={{ 
        position: 'absolute', 
        top: -50, 
        right: -50, 
        width: '250px', 
        height: '250px', 
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 70%)',
        zIndex: 0
      }} />
      
      <Box sx={{ 
        position: 'absolute', 
        bottom: -80, 
        left: -80, 
        width: '200px', 
        height: '200px', 
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30, 64, 175, 0.05) 0%, rgba(30, 64, 175, 0) 70%)',
        zIndex: 0
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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
            Get Web3Lancer on Your Device
          </Typography>

          <Typography 
            variant="h6"
            color="text.secondary" 
            sx={{ 
              mb: 8, 
              maxWidth: 700, 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.1rem' },
              lineHeight: 1.6
            }}
          >
            Take your Web3 freelancing journey to the next level with our mobile apps.
            Access projects, communicate with clients, and manage your crypto earnings on the go.
          </Typography>
        </motion.div>

        <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
          {/* iOS App Card */}
          <Grid item xs={12} sm={8} md={5}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <MotionCard
                whileHover={{ y: -8, boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08)' }}
                transition={{ type: 'spring', stiffness: 300 }}
                sx={{
                  height: '100%',
                  background: '#ffffff',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                }}
              >
                <CardContent sx={{ 
                  p: { xs: 3, md: 4 }, 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <AppleIcon sx={{ fontSize: 40, color: theme.palette.grey[700], mb: 2 }} />
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                      Download for iOS
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Get the full Web3Lancer experience on your iPhone. Receive instant notifications for new opportunities and manage your projects on the go.
                    </Typography>
                  </Box>
                  
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AppleIcon />}
                      sx={{ 
                        mt: 2,
                        py: 1.2,
                        px: 3,
                        borderRadius: '8px',
                        background: theme.palette.grey[800],
                        color: '#ffffff',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        textTransform: 'none',
                        fontWeight: 600,
                        opacity: 0.8,
                        '&:hover': {
                          background: theme.palette.grey[900],
                          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                        }
                      }}
                      disabled
                    >
                      Coming Soon
                    </Button>
                  </motion.div>
                </CardContent>
              </MotionCard>
            </motion.div>
          </Grid>
          
          {/* Android App Card */}
          <Grid item xs={12} sm={8} md={5}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <MotionCard
                whileHover={{ y: -8, boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08)' }}
                transition={{ type: 'spring', stiffness: 300 }}
                sx={{
                  height: '100%',
                  background: '#ffffff',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                }}
              >
                <CardContent sx={{ 
                  p: { xs: 3, md: 4 }, 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <AndroidIcon sx={{ fontSize: 40, color: '#3ddc84', mb: 2 }} />
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                      Download for Android
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Experience Web3Lancer on your Android device with our pre-release app. Be among the first to try out our mobile features and provide feedback.
                    </Typography>
                  </Box>
                  
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AndroidIcon />}
                      sx={{ 
                        mt: 2,
                        py: 1.2,
                        px: 3,
                        borderRadius: '8px',
                        background: 'linear-gradient(45deg, #3ddc84, #32b770)',
                        color: '#ffffff',
                        fontWeight: 600,
                        boxShadow: '0 4px 15px rgba(61, 220, 132, 0.25)',
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #32b770, #2da366)',
                          boxShadow: '0 6px 20px rgba(61, 220, 132, 0.35)',
                        }
                      }}
                      href="https://github.com/web3lancer/web3lancer/releases"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download APK
                    </Button>
                  </motion.div>
                </CardContent>
              </MotionCard>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
