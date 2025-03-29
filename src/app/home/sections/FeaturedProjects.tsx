import React from 'react';
import { Box, Typography, Card, CardContent, Button, Container, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
        py: 12, 
        background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth={false} sx={{ width: '100%', px: { xs: 2, md: 4, lg: 6 } }}>
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
              mb: 8,
              fontWeight: 800,
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
              mx: 'auto',
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
              <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2, px: 1 }}>
                {projects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -10 }}
                  >
                    <Card sx={{ 
                      minWidth: 280, 
                      maxWidth: 280,
                      height: 320,
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        height: 140, 
                        background: `linear-gradient(135deg, 
                          ${theme.palette.primary.light} 0%, 
                          ${theme.palette.primary.main} 100%)`,
                        position: 'relative'
                      }}>
                        <Box sx={{ 
                          position: 'absolute', 
                          bottom: -20, 
                          right: 20,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: theme.palette.primary.dark,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          {index + 1}
                        </Box>
                      </Box>
                      <CardContent sx={{ flexGrow: 1, position: 'relative', pt: 3 }}>
                        <Typography variant="overline" color="primary.main">
                          {project.category}
                        </Typography>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                          {project.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          A cutting-edge {project.category.toLowerCase()} project looking for skilled developers.
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" sx={{ mt: 'auto' }}>
                          Budget: {project.budget}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: '30px',
                  py: 1.5,
                  px: 4,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
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
