import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import SuiWalletConnection from '@/components/sui/SuiWalletConnection';
import SuiProjectCreation from '@/components/sui/SuiProjectCreation';

const SuiIntegrationPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Sui Blockchain Integration
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Manage your Web3Lancer projects on the Sui blockchain
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <SuiWalletConnection />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <SuiProjectCreation />
        </Grid>
      </Grid>
    </Container>
  );
};

export default SuiIntegrationPage;