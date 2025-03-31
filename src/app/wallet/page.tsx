"use client";
import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Paper, Tab, Tabs } from '@mui/material';
import { motion } from 'framer-motion';
import StellarWallet from '@/components/StellarWallet';
import { useAuth } from '@/contexts/AuthContext';
import { ensureSession } from '@/utils/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wallet-tabpanel-${index}`}
      aria-labelledby={`wallet-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function WalletPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function init() {
      // Ensure a session exists (anonymous or authenticated)
      await ensureSession().catch(console.error);
      setIsLoading(false);
    }
    
    init();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(90deg, #1E40AF 0%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Web3Lancer Wallet
          </Typography>
          
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Manage your crypto assets and transactions securely
          </Typography>
        </motion.div>

        <Paper 
          elevation={0} 
          sx={{ 
            mt: 4, 
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              px: 2,
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 120
              }
            }}
          >
            <Tab label="Stellar Wallet" />
            <Tab label="Connected Wallets" />
            <Tab label="Transactions" />
            <Tab label="Settings" />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <TabPanel value={activeTab} index={0}>
              <StellarWallet />
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              <Typography variant="body1">
                Connected wallets and integration options will appear here.
              </Typography>
            </TabPanel>
            
            <TabPanel value={activeTab} index={2}>
              <Typography variant="body1">
                Your transaction history will appear here.
              </Typography>
            </TabPanel>
            
            <TabPanel value={activeTab} index={3}>
              <Typography variant="body1">
                Wallet settings and preferences will appear here.
              </Typography>
            </TabPanel>
          </Box>
        </Paper>

        <Paper sx={{ 
          mt: 4, 
          p: 3, 
          borderRadius: 2,
          background: 'rgba(59, 130, 246, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <Typography variant="h6" gutterBottom>
            💡 Using Stellar Testnet
          </Typography>
          <Typography variant="body1">
            The wallet above is connected to Stellar Testnet, allowing you to experiment with creating wallets, 
            funding them, and sending transactions without using real funds. Testnet XLM has no real value and is 
            intended for development and testing purposes only.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
