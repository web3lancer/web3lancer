import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Container, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import Image from 'next/image';

const MotionCard = motion(Card);

export default function DownloadSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 }, 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)',
        borderRadius: { md: '0 0 30px 30px' },
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration elements */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        width: '300px', 
        height: '300px', 
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)',
        zIndex: 0
      }} />
      
      <Box sx={{ 
        position: 'absolute', 
        bottom: -50, 
        left: -50, 
        width: '200px', 
        height: '200px', 
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30, 64, 175, 0.1) 0%, rgba(30, 64, 175, 0) 70%)',
        zIndex: 0
      }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
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
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Get Web3Lancer on Your Device
          </Typography>

          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ 
              mb: 6, 
              maxWidth: 700, 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.25rem' },
              lineHeight: 1.5
            }}
          >
            Take your Web3 freelancing journey to the next level with our mobile apps.
            Access projects, communicate with clients, and manage your crypto earnings on the go.
          </Typography>
        </motion.div>

        <Grid container spacing={{ xs: 4, md: 6 }} justifyContent="center">
          {/* iOS App Card */}
          <Grid item xs={12} sm={10} md={5}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <MotionCard
                whileHover={{ y: -10, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)' }}
                transition={{ type: 'spring', stiffness: 300 }}
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: 4,
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    p: 1.5,
                    opacity: 0.7
                  }}
                >
                  <AppleIcon sx={{ fontSize: 36 }} />
                </Box>

                <CardContent sx={{ 
                  p: { xs: 3, md: 4 }, 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <PhoneIphoneIcon sx={{ fontSize: 48, color: '#1E40AF', mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Download for iOS
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Get the full Web3Lancer experience on your iPhone. Receive instant notifications for new opportunities and manage your projects on the go.
                    </Typography>
                  </Box>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AppleIcon />}
                      sx={{ 
                        mt: 2,
                        py: 1.5,
                        px: 3,
                        borderRadius: '12px',
                        background: 'linear-gradient(45deg, #333, #666)',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                        opacity: 0.7,
                        '&:hover': {
                          background: 'linear-gradient(45deg, #444, #777)',
                          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
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
          <Grid item xs={12} sm={10} md={5}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <MotionCard
                whileHover={{ y: -10, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)' }}
                transition={{ type: 'spring', stiffness: 300 }}
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: 4,
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    p: 1.5,
                    color: '#3ddc84', 
                  }}
                >
                  <AndroidIcon sx={{ fontSize: 36 }} />
                </Box>

                <CardContent sx={{ 
                  p: { xs: 3, md: 4 }, 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <AndroidIcon sx={{ fontSize: 48, color: '#3ddc84', mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Download for Android
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Experience Web3Lancer on your Android device with our pre-release app. Be among the first to try out our mobile features and provide feedback.
                    </Typography>
                  </Box>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AndroidIcon />}
                      sx={{ 
                        mt: 2,
                        py: 1.5,
                        px: 3,
                        borderRadius: '12px',
                        background: 'linear-gradient(45deg, #3ddc84, #32b770)',
                        color: '#000',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(61, 220, 132, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #32b770, #2da366)',
                          boxShadow: '0 6px 20px rgba(61, 220, 132, 0.4)',
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
