"use client";
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  Switch,
  Divider,
  FormGroup,
  FormControlLabel,
  Button,
  Snackbar,
  Alert,
  Chip,
  Grid
} from '@mui/material';
import { 
  Notifications, 
  Email, 
  PhoneAndroid, 
  Web, 
  Campaign,
  Assignment,
  Payment,
  Message,
  Save
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function NotificationsSection() {
  // State for different notification categories
  const [emailNotifications, setEmailNotifications] = useState({
    projectUpdates: true,
    messages: true,
    payments: true,
    marketing: false,
    systemUpdates: true
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    projectUpdates: true,
    messages: true,
    payments: true,
    marketing: false,
    systemUpdates: false
  });
  
  const [smsNotifications, setSmsNotifications] = useState({
    projectUpdates: false,
    messages: false,
    payments: true,
    marketing: false,
    systemUpdates: false
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: 'success' as 'success' | 'error',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  // Handler for email notification toggles
  const handleEmailToggle = (setting: keyof typeof emailNotifications) => {
    setEmailNotifications({
      ...emailNotifications,
      [setting]: !emailNotifications[setting]
    });
  };
  
  // Handler for push notification toggles
  const handlePushToggle = (setting: keyof typeof pushNotifications) => {
    setPushNotifications({
      ...pushNotifications,
      [setting]: !pushNotifications[setting]
    });
  };
  
  // Handler for SMS notification toggles
  const handleSmsToggle = (setting: keyof typeof smsNotifications) => {
    setSmsNotifications({
      ...smsNotifications,
      [setting]: !smsNotifications[setting]
    });
  };
  
  // Save all notification settings
  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({
        open: true,
        severity: 'success',
        message: 'Notification preferences saved successfully'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        severity: 'error',
        message: 'Failed to save notification preferences'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Helper function to count enabled notifications by type
  const countEnabledNotifications = (notificationSettings: Record<string, boolean>) => {
    return Object.values(notificationSettings).filter(Boolean).length;
  };
  
  return (
    <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Notifications sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5">Notification Preferences</Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Customize how and when you receive notifications from Web3Lancer. You can choose different notification methods for different types of activities.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Email Notifications */}
        <Grid item xs={12} md={4}>
          <Paper
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            sx={{ p: 3, height: '100%' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Email color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Email Notifications</Typography>
              <Chip 
                size="small" 
                label={`${countEnabledNotifications(emailNotifications)}/5`} 
                color="primary" 
                sx={{ ml: 'auto' }} 
              />
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={emailNotifications.projectUpdates} 
                    onChange={() => handleEmailToggle('projectUpdates')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Project Updates</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Milestones, deadlines, and status changes
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={emailNotifications.messages} 
                    onChange={() => handleEmailToggle('messages')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Messages</Typography>
                    <Typography variant="caption" color="text.secondary">
                      New messages and chat notifications
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={emailNotifications.payments} 
                    onChange={() => handleEmailToggle('payments')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Payments</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Invoices, payments, and escrow releases
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={emailNotifications.systemUpdates} 
                    onChange={() => handleEmailToggle('systemUpdates')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">System Updates</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Security alerts and account changes
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={emailNotifications.marketing} 
                    onChange={() => handleEmailToggle('marketing')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Marketing</Typography>
                    <Typography variant="caption" color="text.secondary">
                      News, promotions, and platform updates
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>
          </Paper>
        </Grid>
        
        {/* Push Notifications */}
        <Grid item xs={12} md={4}>
          <Paper
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            sx={{ p: 3, height: '100%' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Web color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Push Notifications</Typography>
              <Chip 
                size="small" 
                label={`${countEnabledNotifications(pushNotifications)}/5`} 
                color="primary" 
                sx={{ ml: 'auto' }} 
              />
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={pushNotifications.projectUpdates} 
                    onChange={() => handlePushToggle('projectUpdates')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Project Updates</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Milestones, deadlines, and status changes
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={pushNotifications.messages} 
                    onChange={() => handlePushToggle('messages')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Messages</Typography>
                    <Typography variant="caption" color="text.secondary">
                      New messages and chat notifications
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={pushNotifications.payments} 
                    onChange={() => handlePushToggle('payments')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Payments</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Invoices, payments, and escrow releases
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={pushNotifications.systemUpdates} 
                    onChange={() => handlePushToggle('systemUpdates')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">System Updates</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Security alerts and account changes
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={pushNotifications.marketing} 
                    onChange={() => handlePushToggle('marketing')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Marketing</Typography>
                    <Typography variant="caption" color="text.secondary">
                      News, promotions, and platform updates
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>
          </Paper>
        </Grid>
        
        {/* SMS Notifications */}
        <Grid item xs={12} md={4}>
          <Paper
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            sx={{ p: 3, height: '100%' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneAndroid color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">SMS Notifications</Typography>
              <Chip 
                size="small" 
                label={`${countEnabledNotifications(smsNotifications)}/5`} 
                color="primary" 
                sx={{ ml: 'auto' }} 
              />
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={smsNotifications.projectUpdates} 
                    onChange={() => handleSmsToggle('projectUpdates')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Project Updates</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Milestones, deadlines, and status changes
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={smsNotifications.messages} 
                    onChange={() => handleSmsToggle('messages')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Messages</Typography>
                    <Typography variant="caption" color="text.secondary">
                      New messages and chat notifications
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={smsNotifications.payments} 
                    onChange={() => handleSmsToggle('payments')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Payments</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Invoices, payments, and escrow releases
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={smsNotifications.systemUpdates} 
                    onChange={() => handleSmsToggle('systemUpdates')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">System Updates</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Security alerts and account changes
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={smsNotifications.marketing} 
                    onChange={() => handleSmsToggle('marketing')}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2">Marketing</Typography>
                    <Typography variant="caption" color="text.secondary">
                      News, promotions, and platform updates
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Save />}
          onClick={handleSaveSettings}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Notification Preferences'}
        </Button>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
