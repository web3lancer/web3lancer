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
    console.log("UserProfilePage useEffect triggered. usernameOrId:", usernameOrId, "Current user ID:", user?.$id);
    loadProfile();
  }, [usernameOrId, user]); // user dependency is for isCurrentUser logic and initial load consistency

  const loadProfile = async () => {
    if (!usernameOrId) {
      setError("No username or ID provided in the URL.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    setProfile(null); // Reset profile state at the beginning of a load
    
    try {
      let fetchedProfile: Models.Document | null = null;
      let fetchedBy: 'username' | 'id' | 'none' = 'none';

      // 1. Try to fetch by usernameOrId as a username
      try {
        console.log(`Attempting to fetch profile by username: ${usernameOrId}`);
        fetchedProfile = await getUserProfileByUsername(usernameOrId);
        if (fetchedProfile) {
          fetchedBy = 'username';
          console.log('Profile found by username:', fetchedProfile);
        } else {
          console.log(`Profile not found by username '${usernameOrId}', will try by ID.`);
        }
      } catch (err) {
        console.warn(`Error during getUserProfileByUsername for '${usernameOrId}':`, err);
        // Do not set main error yet, allow fallback to fetching by ID
      }

      // 2. If not found by username, try to fetch by usernameOrId as an ID
      if (!fetchedProfile) {
        try {
          console.log(`Attempting to fetch profile by ID: ${usernameOrId}`);
          fetchedProfile = await getUserProfile(usernameOrId); // Assumes usernameOrId could be an ID
          if (fetchedProfile) {
            fetchedBy = 'id';
            console.log('Profile found by ID:', fetchedProfile);
          } else {
            console.log(`Profile not found by ID '${usernameOrId}' either.`);
          }
        } catch (err) {
          console.warn(`Error during getUserProfile for ID '${usernameOrId}':`, err);
          // If this also fails, it's likely a true "not found" or other critical error from API
        }
      }

      if (fetchedProfile) {
        const profileUsername = fetchedProfile.username as string | undefined;
        const profileDocumentId = fetchedProfile.$id as string; // Document ID of the profile
        const profileOwnerUserId = fetchedProfile.userId as string; // userId field in the document, should be auth user ID

        // 3. Handle redirection if fetched by ID but a username exists and differs from URL param
        if (fetchedBy === 'id' && profileUsername && profileUsername !== usernameOrId) {
          console.log(`Redirecting from ID-based URL ('${usernameOrId}') to username-based URL ('/u/${profileUsername}')`);
          router.push(`/u/${profileUsername}`);
          // Return early to prevent rendering with old ID-based data; new load will occur after redirect.
          // setLoading(false) will be handled by the new page load's finally block.
          return; 
        }

        // If no redirect, set the profile and related states
        console.log('Setting profile data:', fetchedProfile);
        setProfile(fetchedProfile);
        
        setEditUsername(profileUsername || '');
        setEditBio(fetchedProfile.bio || '');
        setEditSkills(fetchedProfile.skills || []);
        
        // Determine if the viewing user is the owner of this profile
        if (user && user.$id === profileOwnerUserId) {
          setIsCurrentUser(true);
          console.log('Current user is viewing their own profile.');
        } else {
          setIsCurrentUser(false);
          console.log('Viewing another user\'s profile or user not logged in.');
        }
        
        if (fetchedProfile.profilePicture) {
          setImagePreview(getProfilePictureUrl(fetchedProfile.profilePicture));
        } else {
          setImagePreview(null);
        }
        
        // Use actual data or default to 0
        setFollowersCount(fetchedProfile.followersCount || 0); 
        setFollowingCount(fetchedProfile.followingCount || 0);
        setConnectionsCount(fetchedProfile.connectionsCount || 0);

        setTabValue(0); // Reset tab to default
        setSecuritySubTabValue(0); // Reset security sub-tab

      } else {
        // Profile not found after trying both methods
        console.log(`Profile definitively not found for '${usernameOrId}'.`);
        setError('Profile not found. The user may not exist or the link may be incorrect.');
      }
    } catch (err) { 
      // Catch any unexpected errors from the overall process not caught by inner try-catches
      console.error('Unexpected error in loadProfile function:', err);
      setError('Failed to load profile information due to an unexpected server or network error.');
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
      // Ensure profile.userId (owner of the profile) is used for update, not profile.$id if they could differ
      // Though typically for user profiles, document ID ($id) IS the user's auth ID.
      // Here, profile.userId is the explicit field storing the auth ID.
      const ownerUserId = profile.userId as string; 
      if (!ownerUserId) {
        throw new Error("Profile owner user ID is missing.");
      }

      if (editUsername && editUsername !== profile.username) {
        const isAvailable = await checkUsernameAvailability(editUsername);
        if (!isAvailable) {
          setUsernameError('Username is already taken');
          setIsSaving(false);
          return;
        }
      }
      
      await updateUserProfile(ownerUserId, { // Use ownerUserId for the update
        username: editUsername,
        bio: editBio,
        skills: editSkills,
        // name: profile.name, // Name is usually part of Appwrite auth user, not directly in profile doc for edit here
        updatedAt: new Date().toISOString()
      });
      
      setSaveSuccess(true);
      setIsEditMode(false);
      
      // If username changed, redirect to the new username URL
      if (editUsername && editUsername !== profile.username) {
        console.log(`Username changed from '${profile.username}' to '${editUsername}'. Redirecting.`);
        router.push(`/u/${editUsername}`);
        // No need to call loadProfile() here, redirect will trigger it.
      } else {
        // If username didn't change, just reload the current profile data
        console.log('Username did not change. Reloading profile data.');
        await loadProfile(); 
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Check if error is an AppwriteException and has a specific message
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
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