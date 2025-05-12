"use client";
import { useState } from 'react';
import { Container, Box, Typography, Tabs, Tab, Paper, Grid, Avatar, Divider } from '@mui/material';
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
        {/* Modern Header Section with Gradient */}
        <Box 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            background: 'linear-gradient(135deg, rgba(32,151,255,0.08) 0%, rgba(120,87,255,0.08) 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            mb: 4,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2
          }}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(90deg, #2097ff 0%, #7857ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0px 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Account Settings
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Manage your account settings and preferences
              </Typography>
            </Box>
            <ThemeToggle />
          </Box>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="profile settings tabs"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 1.5,
                background: 'linear-gradient(90deg, #2097ff 0%, #7857ff 100%)',
              },
              '& .MuiTab-root': {
                transition: 'all 0.2s',
                '&.Mui-selected': {
                  color: '#7857ff',
                  fontWeight: 'medium'
                }
              }
            }}
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
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              mb: 3,
              '& .MuiTabs-indicator': {
                height: 2,
                borderRadius: 1,
                background: 'linear-gradient(90deg, #2097ff 0%, #7857ff 100%)'
              },
              '& .MuiTab-root': {
                transition: 'all 0.2s',
                fontWeight: 'medium',
                '&.Mui-selected': {
                  background: 'linear-gradient(90deg, rgba(32,151,255,0.08) 0%, rgba(120,87,255,0.08) 100%)',
                  borderRadius: '8px 8px 0 0'
                }
              }
            }}>
              <Tabs 
                value={securitySubtab} 
                onChange={handleSecuritySubtabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
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
