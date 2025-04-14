"use client";
import { useState } from 'react';
import { Container, Box, Typography, Tabs, Tab, Button, Paper, Grid, Avatar, Divider } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle'; // Add this import

// Import your profile section components
import ProfileSection from '@/components/profile/ProfileSection';
import SecuritySection from '@/components/profile/SecuritySection';
import NotificationsSection from '@/components/profile/NotificationsSection';
import ActivitySection from '@/components/profile/ActivitySection';
import WalletSection from '@/components/profile/WalletSection';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);
  const [securitySubtab, setSecuritySubtab] = useState(0);
  const router = useRouter();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSecuritySubtabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSecuritySubtab(newValue);
  };

  const handleGoToWallet = () => {
    router.push('/wallet');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Modified Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Account Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Manage your account settings and preferences
            </Typography>
          </Box>
          {/* Add ThemeToggle here */}
          <ThemeToggle />
        </Box>

        <Paper sx={{ mt: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="profile settings tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<PersonOutlineIcon />} label="Profile" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<AccountBalanceWalletIcon />} label="Wallet" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <ProfileSection />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={securitySubtab} onChange={handleSecuritySubtabChange}>
                <Tab label="Password" />
                <Tab label="Two-Factor Authentication" />
                <Tab label="Connected Accounts" />
                <Tab label="Activity Log" />
              </Tabs>
            </Box>
            {securitySubtab === 0 && (
              <SecuritySection section="password" />
            )}
            {securitySubtab === 1 && (
              <SecuritySection section="2fa" />
            )}
            {securitySubtab === 2 && (
              <SecuritySection section="connected" />
            )}
            {securitySubtab === 3 && (
              <ActivitySection activities={[]} filterCriteria={''} />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <WalletSection onGoToWallet={handleGoToWallet} />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <NotificationsSection />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
}
