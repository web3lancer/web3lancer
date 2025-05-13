"use client";

import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Container, Box, Typography, Paper, Grid, Avatar, Button, Tabs, Tab, Divider, Chip, CircularProgress, Alert, TextField, IconButton, Snackbar } from '@mui/material';
import { 
  PersonOutline, 
  Edit, 
  Check, 
  Close, 
  Send, 
  // EmailOutlined,  // Not used directly, can be removed if not needed elsewhere
  // ContentCopy, // Not used directly
  // VerifiedUser, // Not used directly
  Settings as SettingsIcon, // Renamed for clarity
  BookmarkBorder, 
  WorkOutline, 
  StarBorder,
  Security as SecurityIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Notifications as NotificationsIcon,
  ListAlt as ListAltIcon, // For Activity Log tab
  Assignment as AssignmentIcon // Added import for AssignmentIcon
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { getUserProfile, getUserProfileByUsername, getProfilePictureUrl, updateUserProfile, checkUsernameAvailability } from '@/utils/api';
import { Models } from 'appwrite';

// Import section components from /components/profile
import ProfileSection from '@/components/profile/ProfileSection';
import SecuritySection from '@/components/profile/SecuritySection';
import WalletSection from '@/components/profile/WalletSection';
import NotificationsSection from '@/components/profile/NotificationsSection';
import ActivitySection from '@/components/profile/ActivitySection';

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

  // States for current user's settings sections
  const [securitySubTabValue, setSecuritySubTabValue] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [usernameOrId, user]);

  const loadProfile = async () => {
    if (!usernameOrId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let profileData: Models.Document | null = null;
      // let isUsernameRoute = false; // This variable is not used

      // Try fetching by username first if usernameOrId doesn't look like a typical Appwrite ID
      if (usernameOrId && !usernameOrId.startsWith('user_') && !usernameOrId.match(/^[a-f0-9]{20,}$/i)) {
        try {
          profileData = await getUserProfileByUsername(usernameOrId);
          // isUsernameRoute = true;
        } catch (err) {
          console.log('Profile not found by username, trying as ID or it might not exist.');
        }
      }

      // If not found by username, or if it looked like an ID, try fetching by ID
      if (!profileData) {
        try {
          profileData = await getUserProfile(usernameOrId); // This could be an ID or a username if the above failed
        } catch (err) {
          console.error('Error loading profile by ID/username:', err);
        }
      }
      
      if (profileData) {
        // Redirect to username URL if ID is used and username exists
        // Ensure profileData.username and profileData.userId are valid fields from your Appwrite document
        if (profileData.username && profileData.userId && usernameOrId === profileData.userId && usernameOrId !== profileData.username) {
          router.push(`/u/${profileData.username}`);
          // setLoading(false); // Potentially stop loading here to prevent rendering old data
          return; // Exit after redirecting
        }

        console.log('Profile loaded successfully:', profileData);
        setProfile(profileData);
        
        setEditUsername(profileData.username || '');
        setEditBio(profileData.bio || '');
        setEditSkills(profileData.skills || []);
        
        if (user && (user.$id === profileData.userId)) {
          setIsCurrentUser(true);
        } else {
          setIsCurrentUser(false);
        }
        
        if (profileData.profilePicture) {
          setImagePreview(getProfilePictureUrl(profileData.profilePicture));
        } else {
          setImagePreview(null);
        }
        
        setFollowersCount(profileData.followersCount || Math.floor(Math.random() * 100) + 5); // Use actual data or fallback
        setFollowingCount(profileData.followingCount || Math.floor(Math.random() * 50) + 3);
        setConnectionsCount(profileData.connectionsCount || Math.floor(Math.random() * 20) + 2);

        setTabValue(0);
        setSecuritySubTabValue(0);

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

  const handleSecuritySubTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSecuritySubTabValue(newValue);
  };

  const handleGoToWallet = () => {
    router.push('/wallet');
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
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
      if (editUsername && editUsername !== profile.username) {
        const isAvailable = await checkUsernameAvailability(editUsername);
        if (!isAvailable) {
          setUsernameError('Username is already taken');
          setIsSaving(false);
          return;
        }
      }
      
      await updateUserProfile(user.$id, {
        username: editUsername,
        bio: editBio,
        skills: editSkills,
        // name: profile.name, // Assuming name is handled elsewhere or part of initial profile creation
        updatedAt: new Date().toISOString()
      });
      
      setSaveSuccess(true);
      setIsEditMode(false);
      // await loadProfile(); // Reload profile data
      
      if (editUsername && editUsername !== profile.username) {
        router.push(`/u/${editUsername}`); // Redirect if username changed
      } else {
        await loadProfile(); // Reload if username didn't change
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
    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? Math.max(0, followersCount - 1) : followersCount + 1);
  };

  const toggleConnect = async () => {
    if (!user || !profile || isCurrentUser) return;
    setIsConnected(!isConnected);
    setConnectionsCount(isConnected ? Math.max(0, connectionsCount - 1) : connectionsCount + 1);
  };
  
  const handleMessage = () => {
    if (!user || !profile || !profile.userId) return;
    router.push(`/messages?recipient=${profile.userId}`);
  };

  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
  };

  const publicTabs = useMemo(() => [
    { label: "Portfolio", icon: <WorkOutline /> },
    { label: "Projects", icon: <AssignmentIcon /> },
    { label: "Reviews", icon: <StarBorder /> },
    { label: "Activity", icon: <ListAltIcon /> }
  ], []);

  const currentUserSettingsTabs = useMemo(() => [
    { label: "Profile Settings", icon: <SettingsIcon /> },
    { label: "Security", icon: <SecurityIcon /> },
    { label: "Wallet", icon: <AccountBalanceWalletIcon /> },
    { label: "Notifications", icon: <NotificationsIcon /> }
  ], []);

  const allTabs = useMemo(() => {
    let tabs = [...publicTabs];
    if (isCurrentUser) {
      tabs = tabs.concat(currentUserSettingsTabs);
    }
    return tabs;
  }, [isCurrentUser, profile, publicTabs, currentUserSettingsTabs]); // Added dependencies


  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', flexDirection: 'column', gap: 2 }}>
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">Loading profile...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {error && !profile ? ( // Show error prominently if profile failed to load entirely
          <Alert severity="error" sx={{ mb: 3, p: 2, borderRadius: 2 }}>
            <Typography variant="h6">Profile Error</Typography>
            {error}
          </Alert>
        ) : (
          <>
            {error && profile && ( // Show error as a less intrusive alert if profile data exists but some error occurred
                 <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>
            )}
            <Paper 
              elevation={0} 
              sx={{ p: 3, borderRadius: 3, mb: 4, background: 'linear-gradient(135deg, rgba(32,151,255,0.08) 0%, rgba(120,87,255,0.08) 100%)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)', backdropFilter: 'blur(8px)' }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item={true} xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Box position="relative" display="inline-block">
                    <Avatar 
                      src={imagePreview || undefined} 
                      sx={{ width: { xs: 120, md: 150 }, height: { xs: 120, md: 150 }, border: '4px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    >
                      {profile?.name ? profile.name[0].toUpperCase() : <PersonOutline />}
                    </Avatar>
                    {isCurrentUser && (
                      <IconButton 
                        onClick={toggleEditMode}
                        sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: 'background.paper', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'background.paper' } }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
                
                <Grid item={true} xs={12} md={9}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      {isEditMode && isCurrentUser ? (
                        <Box sx={{ mb: 2 }}>
                          <TextField label="Username" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} variant="outlined" size="small" error={!!usernameError} helperText={usernameError} sx={{ width: { xs: '100%', sm: 300 }, mb:1 }} />
                          <TextField label="Full Name" value={profile?.name || ''} disabled variant="outlined" size="small" sx={{ width: { xs: '100%', sm: 300 }, mb:1 }} helperText="Full name cannot be changed here." />
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography variant="h4" component="h1" fontWeight="bold">
                            {profile?.name || "User Profile"}
                          </Typography>
                          {profile?.username && (
                            <Chip label={`@${profile.username}`} size="small" variant="outlined" sx={{ ml: {xs: 0, sm: 2}, mt: {xs:1, sm:0} }} />
                          )}
                        </Box>
                      )}
                      
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {profile?.email || "No email provided."}
                      </Typography>
                      
                      {isEditMode && isCurrentUser ? (
                        <TextField label="Bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} variant="outlined" size="small" multiline rows={3} fullWidth sx={{ mb: 2 }} />
                      ) : (
                        <Typography variant="body1" paragraph sx={{whiteSpace: 'pre-wrap'}}>
                          {profile?.bio || "No bio provided."}
                        </Typography>
                      )}
                      
                      {isEditMode && isCurrentUser ? (
                        <Box sx={{ mb: 2 }}>
                           <Typography variant="subtitle2" gutterBottom>Skills (comma-separated)</Typography>
                           <TextField
                             label="Skills"
                             value={editSkills.join(', ')}
                             onChange={(e) => setEditSkills(e.target.value.split(',').map(skill => skill.trim()))}
                             variant="outlined"
                             size="small"
                             fullWidth
                           />
                        </Box>
                      ) : profile?.skills && profile.skills.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {profile.skills.map((skill: string, index: number) => (
                            <Chip key={index} label={skill} size="small" color="primary" variant="outlined" />
                          ))}
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: {xs: 'row', sm: 'column'}, gap: 1, mt: { xs: 2, md: 0 }, alignItems: {xs: 'stretch', sm:'flex-end'} }}>
                      {isCurrentUser ? (
                        isEditMode ? (
                          <>
                            <Button variant="contained" color="primary" onClick={handleSaveProfile} disabled={isSaving} startIcon={isSaving ? <CircularProgress size={20} /> : <Check />}>Save</Button>
                            <Button variant="outlined" color="secondary" onClick={toggleEditMode} startIcon={<Close />}>Cancel</Button>
                          </>
                        ) : (
                          // Edit Public Profile button is now the avatar IconButton
                          // This space can be used for other actions if needed or kept clean
                           <Button variant="outlined" onClick={() => setTabValue(publicTabs.length)} startIcon={<SettingsIcon />}>Account Settings</Button>
                        )
                      ) : (
                        <>
                          <Button variant={isFollowing ? "outlined" : "contained"} color="primary" onClick={toggleFollow}>{isFollowing ? "Unfollow" : "Follow"}</Button>
                          <Button variant={isConnected ? "outlined" : "contained"} color="secondary" onClick={toggleConnect}>{isConnected ? "Disconnect" : "Connect"}</Button>
                          <Button variant="outlined" startIcon={<Send />} onClick={handleMessage}>Message</Button>
                        </>
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: {xs:2, sm:4}, mt: 3, flexWrap: 'wrap', justifyContent: {xs: 'center', md: 'flex-start'} }}>
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
              sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', border: '1px solid', borderColor: 'divider' }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="profile tabs"
                sx={{ borderBottom: 1, borderColor: 'divider', '& .MuiTabs-indicator': { height: 3, borderRadius: 1.5, background: 'linear-gradient(90deg, #2097ff 0%, #7857ff 100%)' }, '& .MuiTab-root': { transition: 'all 0.2s', '&.Mui-selected': { color: '#7857ff', fontWeight: 'medium' } } }}
              >
                {allTabs.map((tab, index) => (
                  <Tab key={index} label={tab.label} icon={tab.icon} iconPosition="start" />
                ))}
              </Tabs>

              {/* Public Tab Panels - Rendered based on allTabs structure */}
              {allTabs.slice(0, publicTabs.length).map((tab, index) => (
                <TabPanel key={tab.label} value={tabValue} index={index}>
                  {index === 0 && <Typography variant="body1">{profile?.portfolio || "No portfolio items yet."}</Typography>}
                  {index === 1 && <Typography variant="body1">{profile?.projects?.length ? "Projects will be displayed here." : "No projects yet."}</Typography>}
                  {index === 2 && <Typography variant="body1">{profile?.reviews?.length ? "Reviews will be displayed here." : "No reviews yet."}</Typography>}
                  {index === 3 && <ActivitySection activities={profile?.activities || []} filterCriteria={''} /> /* Pass actual activities */}
                </TabPanel>
              ))}
              
              {/* Current User Settings Tab Panels */}
              {isCurrentUser && allTabs.slice(publicTabs.length).map((tab, index) => {
                const actualIndex = index + publicTabs.length;
                return (
                  <TabPanel key={tab.label} value={tabValue} index={actualIndex}>
                    {actualIndex === publicTabs.length + 0 && <ProfileSection />}
                    {actualIndex === publicTabs.length + 1 && (
                      <Box>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                          <Tabs value={securitySubTabValue} onChange={handleSecuritySubTabChange} variant="scrollable" scrollButtons="auto">
                            <Tab label="Password" />
                            <Tab label="Two-Factor Authentication" />
                            <Tab label="Connected Accounts" />
                            <Tab label="Activity Log" />
                          </Tabs>
                        </Box>
                        {securitySubTabValue === 0 && <SecuritySection section="password" />}
                        {securitySubTabValue === 1 && <SecuritySection section="2fa" />}
                        {securitySubTabValue === 2 && <SecuritySection section="connected" />}
                        {securitySubTabValue === 3 && <ActivitySection activities={profile?.activities || []} filterCriteria={''} />}
                      </Box>
                    )}
                    {actualIndex === publicTabs.length + 2 && <WalletSection onGoToWallet={handleGoToWallet} />}
                    {actualIndex === publicTabs.length + 3 && <NotificationsSection />}
                  </TabPanel>
                )
              })}
            </Paper>
          </>
        )}
      </Box>
      
      <Snackbar open={saveSuccess} autoHideDuration={6000} onClose={handleCloseSnackbar} message="Profile updated successfully" />
    </Container>
  );
}