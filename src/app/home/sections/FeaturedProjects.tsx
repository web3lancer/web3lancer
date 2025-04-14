import React from 'react';
import { Box, Typography, Card, CardContent, Button, Container, useTheme, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const projects = [
  { title: 'DeFi Platform', category: 'Blockchain', budget: '$15,000' },
  { title: 'NFT Marketplace', category: 'Web3', budget: '$12,000' },
  { title: 'DAO Infrastructure', category: 'Governance', budget: '$20,000' },
  { title: 'Smart Contract Audit', category: 'Security', budget: '$8,000' },
  { title: 'Metaverse Experience', category: 'VR/AR', budget: '$18,000' }
];

export default function FeaturedProjects() {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 }, 
        background: theme.palette.background.paper,
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: 10,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Featured Projects
          </Typography>
          
          <Box 
            sx={{ 
              position: 'relative',
              overflow: 'hidden',
              pb: 4,
              width: '100%'
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 2, md: 3 },
                overflowX: 'auto', 
                pb: 3,
                px: 1,
                scrollSnapType: 'x mandatory',
                '& > *': {
                  scrollSnapAlign: 'start',
                },
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
                '-ms-overflow-style': 'none',
              }}>
                {projects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, boxShadow: '0 12px 35px rgba(0,0,0,0.08)' }}
                  >
                    <Card sx={{ 
                      minWidth: { xs: 280, sm: 300, md: 320 },
                      maxWidth: { xs: 280, sm: 300, md: 320 },
                      height: 'auto',
                      minHeight: 300,
                      borderRadius: 3,
                      background: '#ffffff',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease-out',
                    }}>
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        position: 'relative', 
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Chip 
                          label={project.category} 
                          color="primary" 
                          size="small" 
                          sx={{ 
                            mb: 1.5, 
                            alignSelf: 'flex-start', 
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                            fontWeight: 600
                          }} 
                        />
                        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ flexGrow: 1 }}>
                          {project.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '3em' }}>
                          A cutting-edge {project.category.toLowerCase()} project looking for skilled developers.
                        </Typography>
                        <Typography variant="h6" fontWeight="600" sx={{ mt: 'auto', color: 'primary.main' }}>
                          {project.budget}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  px: 5,
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: 'primary.main',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                  }
                }}
                component={Link}
                href="/projects"
              >
                View All Projects
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
