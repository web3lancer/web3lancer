"use client";

import { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Grid, Avatar, Button, Tabs, Tab, Divider, Chip, CircularProgress, Alert, TextField, IconButton, Snackbar } from '@mui/material';
import { PersonOutline, Edit, Check, Close, Send, EmailOutlined, ContentCopy, VerifiedUser, Settings, BookmarkBorder, WorkOutline, StarBorder } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { getUserProfile, getUserProfileByUsername, getProfilePictureUrl, updateUserProfile, checkUsernameAvailability } from '@/utils/api';
import { Models } from 'appwrite';

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

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const usernameOrId = params?.usernameOrId as string;

  // Profile data state
  const [profile, setProfile] = useState<Models.Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Edit states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Social interaction states
  const [isFollowing, setIsFollowing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [connectionsCount, setConnectionsCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [usernameOrId, user]);

  const loadProfile = async () => {
    if (!usernameOrId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to get profile by username first, then by ID if that fails
      let profileData = null;
      
      // First try to load by username
      try {
        profileData = await getUserProfileByUsername(usernameOrId);
      } catch (err) {
        console.log('Not found by username, trying ID lookup');
      }
      
      // If not found by username, try to load by user ID
      if (!profileData) {
        try {
          profileData = await getUserProfile(usernameOrId);
        } catch (err) {
          console.error('Error loading profile by ID:', err);
          setError('Profile not found.');
        }
      }
      
      if (profileData) {
        console.log('Profile loaded successfully:', profileData);
        setProfile(profileData);
        
        // Set up edit form values
        setEditUsername(profileData.username || '');
        setEditBio(profileData.bio || '');
        setEditSkills(profileData.skills || []);
        
        // Check if this is the current logged-in user's profile
        if (user && (user.$id === profileData.userId)) {
          setIsCurrentUser(true);
        } else {
          setIsCurrentUser(false);
        }
        
        // Set profile picture preview
        if (profileData.profilePicture) {
          setImagePreview(getProfilePictureUrl(profileData.profilePicture));
        } else {
          setImagePreview(null);
        }
        
        // Load mock social data for demonstration
        // These would be real database calls in production
        setFollowersCount(Math.floor(Math.random() * 100) + 5);
        setFollowingCount(Math.floor(Math.random() * 50) + 3);
        setConnectionsCount(Math.floor(Math.random() * 20) + 2);
      } else {
        setError('Profile not found.');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile information.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    
    // Reset form values when entering edit mode
    if (!isEditMode && profile) {
      setEditUsername(profile.username || '');
      setEditBio(profile.bio || '');
      setEditSkills(profile.skills || []);
      setUsernameError(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    setIsSaving(true);
    setUsernameError(null);
    
    try {
      // Check if username is available (only if it changed)
      if (editUsername && editUsername !== profile.username) {
        const isAvailable = await checkUsernameAvailability(editUsername);
        if (!isAvailable) {
          setUsernameError('Username is already taken');
          setIsSaving(false);
          return;
        }
      }
      
      // Update profile
      await updateUserProfile(user.$id, {
        username: editUsername,
        bio: editBio,
        skills: editSkills,
        updatedAt: new Date().toISOString()
      });
      
      // Show success message
      setSaveSuccess(true);
      
      // Exit edit mode
      setIsEditMode(false);
      
      // Reload profile data
      await loadProfile();
      
      // If username was changed, redirect to the new username URL
      if (editUsername && editUsername !== profile.username) {
        router.push(`/${editUsername}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFollow = async () => {
    if (!user || !profile || isCurrentUser) return;
    
    // Here would be API call to follow/unfollow user
    // For demo, we're just toggling the state
    setIsFollowing(!isFollowing);
    
    if (!isFollowing) {
      // Following
      setFollowersCount(followersCount + 1);
    } else {
      // Unfollowing
      setFollowersCount(Math.max(0, followersCount - 1));
    }
  };

  const toggleConnect = async () => {
    if (!user || !profile || isCurrentUser) return;
    
    // Here would be API call to connect/disconnect with user
    // For demo, we're just toggling the state
    setIsConnected(!isConnected);
    
    if (!isConnected) {
      // Connecting
      setConnectionsCount(connectionsCount + 1);
    } else {
      // Disconnecting
      setConnectionsCount(Math.max(0, connectionsCount - 1));
    }
  };

  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '70vh',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            Loading profile...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                mb: 4,
                background: 'linear-gradient(135deg, rgba(32,151,255,0.08) 0%, rgba(120,87,255,0.08) 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Box position="relative" display="inline-block">
                    <Avatar 
                      src={imagePreview || undefined} 
                      sx={{ 
                        width: { xs: 120, md: 150 }, 
                        height: { xs: 120, md: 150 },
                        border: '4px solid white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}
                    >
                      {profile?.name ? profile.name[0].toUpperCase() : <PersonOutline />}
                    </Avatar>
                    {isCurrentUser && (
                      <IconButton 
                        sx={{ 
                          position: 'absolute', 
                          bottom: 5, 
                          right: 5, 
                          bgcolor: 'background.paper',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                          '&:hover': { bgcolor: 'background.paper' }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={9}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Box>
                      {isEditMode ? (
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            label="Username"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            variant="outlined"
                            size="small"
                            error={!!usernameError}
                            helperText={usernameError}
                            sx={{ width: { xs: '100%', sm: 300 } }}
                          />
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="h4" component="h1" fontWeight="bold">
                            {profile?.name}
                          </Typography>
                          {profile?.username && (
                            <Chip 
                              label={`@${profile.username}`} 
                              size="small" 
                              variant="outlined" 
                              sx={{ ml: 2 }} 
                            />
                          )}
                        </Box>
                      )}
                      
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {profile?.email}
                      </Typography>
                      
                      {isEditMode ? (
                        <TextField
                          label="Bio"
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          variant="outlined"
                          size="small"
                          multiline
                          rows={3}
                          fullWidth
                          sx={{ mb: 2 }}
                        />
                      ) : (
                        <Typography variant="body1" paragraph>
                          {profile?.bio || "No bio provided."}
                        </Typography>
                      )}
                      
                      {/* Skills section */}
                      {!isEditMode && profile?.skills && profile.skills.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {profile.skills.map((skill, index) => (
                            <Chip 
                              key={index} 
                              label={skill} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, md: 0 } }}>
                      {isCurrentUser ? (
                        isEditMode ? (
                          <>
                            <Button 
                              variant="contained" 
                              color="primary" 
                              onClick={handleSaveProfile}
                              disabled={isSaving}
                              startIcon={isSaving ? <CircularProgress size={20} /> : <Check />}
                            >
                              Save
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              onClick={toggleEditMode}
                              startIcon={<Close />}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="contained" 
                            onClick={toggleEditMode}
                            startIcon={<Edit />}
                          >
                            Edit Profile
                          </Button>
                        )
                      ) : (
                        <>
                          <Button 
                            variant={isFollowing ? "outlined" : "contained"} 
                            color="primary"
                            onClick={toggleFollow}
                          >
                            {isFollowing ? "Unfollow" : "Follow"}
                          </Button>
                          <Button 
                            variant={isConnected ? "outlined" : "contained"} 
                            color="secondary"
                            onClick={toggleConnect}
                          >
                            {isConnected ? "Disconnect" : "Connect"}
                          </Button>
                          <Button 
                            variant="outlined" 
                            startIcon={<Send />}
                          >
                            Message
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">{followersCount}</Typography>
                      <Typography variant="body2" color="text.secondary">Followers</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">{followingCount}</Typography>
                      <Typography variant="body2" color="text.secondary">Following</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">{connectionsCount}</Typography>
                      <Typography variant="body2" color="text.secondary">Connections</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">{profile?.completedProjects || 0}</Typography>
                      <Typography variant="body2" color="text.secondary">Projects</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3, 
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="profile tabs"
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
                <Tab label="Portfolio" />
                <Tab label="Projects" />
                <Tab label="Reviews" />
                <Tab label="Activity" />
                {isCurrentUser && <Tab label="Settings" />}
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>Portfolio</Typography>
                <Typography variant="body1">
                  {profile?.portfolio || "No portfolio items yet."}
                </Typography>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>Projects</Typography>
                <Typography variant="body1">
                  {profile?.projects?.length ? "Projects will be displayed here." : "No projects yet."}
                </Typography>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>Reviews</Typography>
                <Typography variant="body1">
                  {profile?.reviews?.length ? "Reviews will be displayed here." : "No reviews yet."}
                </Typography>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" gutterBottom>Activity</Typography>
                <Typography variant="body1">
                  Recent activity will be displayed here.
                </Typography>
              </TabPanel>

              {isCurrentUser && (
                <TabPanel value={tabValue} index={4}>
                  <Typography variant="h6" gutterBottom>Profile Settings</Typography>
                  <Typography variant="body1">
                    Additional settings will be displayed here.
                  </Typography>
                </TabPanel>
              )}
            </Paper>
          </>
        )}
      </Box>
      
      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Profile updated successfully"
      />
    </Container>
  );
}