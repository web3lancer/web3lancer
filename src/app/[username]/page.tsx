'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Button, 
  CircularProgress, 
  Alert, 
  Divider, 
  Tabs, 
  Tab, 
  Paper, 
  Grid,
  Chip,
  Stack
} from '@mui/material';
import CalendarSection from '@/components/profile/CalendarSection';
import { useAuth } from '@/contexts/AuthContext';
import { getUserByIdentifier } from '@/utils/userUtils';
import { getProfilePictureUrl } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import FollowButton from '@/components/social/FollowButton';
import ConnectButton from '@/components/social/ConnectButton';
import SocialStats from '@/components/social/SocialStats';
import UsernameEditor from '@/components/profile/UsernameEditor';
import EditIcon from '@mui/icons-material/Edit';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

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
        <Box sx={{ py: 3, px: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function UserProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [profileUser, setProfileUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const username = params?.username as string;
  
  // Check if the current logged-in user is viewing their own profile
  const isOwnProfile = user && profileUser && user.$id === profileUser.userId;

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const profile = await getUserByIdentifier(username);
        
        if (profile) {
          setProfileUser(profile);
          
          // If profile picture exists, set the preview
          if (profile.profilePicture) {
            setProfileImage(getProfilePictureUrl(profile.profilePicture));
          }
        } else {
          setError('User not found');
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile information.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [username]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    if (isOwnProfile) {
      router.push('/profile');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profileUser) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          {error || 'User not found'}
        </Alert>
        <Button variant="contained" color="primary" onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Profile Header */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 120, md: 200 },
          bgcolor: 'primary.light',
          backgroundImage: 'linear-gradient(45deg, #7367f0 0%, #ce9ffc 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <Box sx={{ px: { xs: 2, md: 4 }, pb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-end' },
            mt: { xs: -6, md: -8 },
            mb: 3,
            gap: { xs: 1, md: 3 },
          }}
        >
          {/* Profile Avatar */}
          <Avatar
            src={profileImage || undefined}
            alt={profileUser.name || 'User'}
            sx={{
              width: { xs: 100, md: 140 },
              height: { xs: 100, md: 140 },
              border: '4px solid white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          />

          {/* Profile Info */}
          <Box sx={{ 
            flex: 1, 
            pt: { xs: 1, md: 2 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-start' },
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 1, md: 2 },
              mb: 1,
            }}>
              <Typography variant="h4" fontWeight="bold">
                {profileUser.name || 'Anonymous User'}
              </Typography>
              
              {profileUser.username && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    @{profileUser.username}
                  </Typography>
                  
                  {/* Show username editor if viewing own profile */}
                  {isOwnProfile && (
                    <UsernameEditor 
                      userId={user.$id} 
                      currentUsername={profileUser.username} 
                    />
                  )}
                </Box>
              )}
            </Box>

            {/* User bio/headline */}
            <Typography 
              variant="body1" 
              color="text.secondary"
              textAlign={{ xs: 'center', md: 'left' }}
              sx={{ mb: 2, maxWidth: '100%', wordBreak: 'break-word' }}
            >
              {profileUser.bio || 'No bio provided'}
            </Typography>

            {/* Skills */}
            {profileUser.skills && profileUser.skills.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                mb: 2,
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}>
                {profileUser.skills.map((skill: string, index: number) => (
                  <Chip 
                    key={index} 
                    label={skill} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Box>
            )}

            {/* Action buttons */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              sx={{ 
                mt: { xs: 1, md: 2 },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {isOwnProfile ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={handleEditProfile}
                  fullWidth={false}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <FollowButton 
                    targetUserId={profileUser.userId} 
                    variant="contained"
                    size="medium"
                    fullWidth={false}
                  />
                  <ConnectButton 
                    targetUserId={profileUser.userId}
                    size="medium"
                    fullWidth={false}
                  />
                </>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Social stats (followers, following, connections) */}
        <SocialStats userId={profileUser.userId} />

        <Divider sx={{ my: 3 }} />

        {/* Tabs for different sections */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'medium',
              fontSize: '1rem',
            },
          }}
        >
          <Tab 
            icon={<PersonOutlineIcon />} 
            iconPosition="start" 
            label="Overview" 
          />
          <Tab 
            icon={<WorkOutlineIcon />} 
            iconPosition="start" 
            label="Projects" 
          />
          <Tab 
            icon={<StarOutlineIcon />} 
            iconPosition="start" 
            label="Reviews" 
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                About
              </Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  borderRadius: 2, 
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body1">
                  {profileUser.bio || 'This user has not provided any biographical information.'}
                </Typography>

                {/* Education/Experience would go here */}
              </Paper>

              {/* Projects showcase would go here */}
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Activity
              </Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  borderRadius: 2, 
                  border: '1px solid',
                  borderColor: 'divider', 
                }}
              >
                <CalendarSection />
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Projects
          </Typography>
          <Alert severity="info">
            Project showcase is coming soon.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Reviews
          </Typography>
          <Alert severity="info">
            Reviews section is coming soon.
          </Alert>
        </TabPanel>
      </Box>
    </Box>
  );
}