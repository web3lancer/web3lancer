import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Container } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

export default function DownloadSection() {
  return (
    <Box sx={{ mb: 8, textAlign: 'center' }}>
      <Container maxWidth="xl">
        <Typography variant="h2" sx={{ mb: 4 }}>
          Download Our App
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {/* iOS App Card */}
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MotionCard
                whileHover={{ y: -10 }}
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* ...existing code... */}
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Download for iOS
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Get Web3Lancer on your iPhone
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled
                  >
                    App Store
                  </Button>
                </CardContent>
              </MotionCard>
            </motion.div>
          </Grid>
          
          {/* Android App Card */}
          <Grid item xs={12} md={5}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <MotionCard
                whileHover={{ y: -10 }}
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Download for Android
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Get Android (pre-release) app
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    href="https://github.com/web3lancer/web3lancer/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download APK
                  </Button>
                </CardContent>
              </MotionCard>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
