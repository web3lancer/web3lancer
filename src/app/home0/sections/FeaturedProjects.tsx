import React from 'react';
import { Box, Typography, Card, CardContent, Button, Container, useTheme, Chip, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Image from 'next/image';

const projects = [
  { title: 'DeFi Lending Platform', category: 'Blockchain', budget: '$25,000', image: '/placeholders/project1.jpg', tags: ['Solidity', 'React', 'Node.js'] },
  { title: 'NFT Art Marketplace', category: 'Web3', budget: '$18,000', image: '/placeholders/project2.jpg', tags: ['Next.js', 'IPFS', 'Ethers.js'] },
  { title: 'DAO Governance Tool', category: 'Governance', budget: '$30,000', image: '/placeholders/project3.jpg', tags: ['Aragon', 'Snapshot', 'GraphQL'] },
  { title: 'Smart Contract Audit Suite', category: 'Security', budget: '$10,000', image: '/placeholders/project4.jpg', tags: ['Slither', 'MythX', 'Hardhat'] },
];

export default function FeaturedProjects() {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 }, 
        background: theme.palette.background.default,
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: { xs: 6, md: 10 },
              fontWeight: 700,
              color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827',
            }}
          >
            Featured Projects
          </Typography>
          
          <Grid container spacing={{ xs: 3, sm: 4 }}>
            {projects.map((project, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  style={{ height: '100%' }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 3,
                      boxShadow: theme.shadows[3],
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[6],
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', width: '100%', height: 180 }}>
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        style={{ objectFit: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                      <Typography variant="overline" color="text.secondary" gutterBottom>
                        {project.category}
                      </Typography>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1, minHeight: '3em' }}>
                        {project.title}
                      </Typography>
                      <Box sx={{ mb: 1.5 }}>
                        {project.tags.map(tag => (
                          <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5, backgroundColor: 'primary.light', color: 'primary.contrastText' }} />
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        Budget: {project.budget}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0, textAlign: 'right' }}>
                      <Button size="medium" color="primary" component={Link} href={`/projects/${project.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: { xs: 6, md: 8 } }}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                href="/projects"
                sx={{ py: 1.5, px: 5, fontSize: '1rem' }}
              >
                Explore More Projects
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
