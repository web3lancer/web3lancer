"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Grid, 
  Button, 
  TextField, 
  Tabs, 
  Tab, 
  Chip,
  CircularProgress, 
  Snackbar,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Edit, Save, Security } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/utils/api';
import { APPWRITE_CONFIG } from '@/lib/env';
import dynamic from 'next/dynamic';
import MfaSetup from '@/components/profile/MfaSetup';
import CalendarSection from "@/components/profile/CalendarSection";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileForm from "@/components/profile/ProfileForm";
import { useProfileData } from "@/hooks/useProfileData";

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { loading, error, profileData, handleSaveProfile } = useProfileData(user);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Account Settings
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mt: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Profile" />
          <Tab label="Security" />
          <Tab label="Activity" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <ProfileCard user={user} />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <ProfileForm 
                profileData={profileData} 
                onSave={handleSaveProfile} 
                loading={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <CalendarSection />
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ maxWidth: 800, mx: 'auto', py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Manage your account security settings and authentication methods.
            </Typography>
            
            {/* Password Change Section */}
            <Paper
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                mb: 4
              }}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Change Password
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="primary">
                    Update Password
                  </Button>
                </Grid>
              </Grid>
            </Paper>
            
            {/* MFA Setup Section */}
            <MfaSetup />
            
            {/* Sessions Management Section can be added here */}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {/* Profile Activity Tab */}
          <Typography variant="h6" gutterBottom>
            Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View your recent account activity and logs.
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
}
