"use client";
import { useEffect, useState } from 'react';
import { Container, Box, Typography, Paper, Button, Skeleton, Alert, Chip, Avatar, Divider, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  getUserProfileByUsername,
  getUserProfile,
  getProfilePictureUrl,
  isFollowing,
  getConnectionStatus,
  getFollowersCount,
  getFollowingCount,
  toggleFollowUser,
  toggleConnectUsers,
  isLoggedIn
} from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MessageIcon from '@mui/icons-material/Message';
import EditIcon from '@mui/icons-material/Edit';
import ThemeToggle from '@/components/ThemeToggle';
import PublicProfileView from '@/components/profile/PublicProfileView';
import ProfileEditView from '@/components/profile/ProfileEditView';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [profileOwner, setProfileOwner] = useState<any>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Social connections state
  const [isUserFollowing, setIsUserFollowing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'active' | 'disconnected'>('none');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loadingSocial, setLoadingSocial] = useState(false);

  // Username identifier from URL
  const usernameOrId = params?.username as string;

  // Load profile data on component mount
  useEffect(() => {
    if (!usernameOrId) return;
    
    loadProfileData();
  }, [usernameOrId, user]);

  // Load social connection data
  useEffect(() => {
    if (profile && user && !isCurrentUser) {
      loadSocialData();
    }
  }, [profile, user, isCurrentUser]);

  // Function to load the profile data
  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if this is a username or user ID
      let fetchedProfile = null;
      let profileOwnerId = '';
      
      // Try to load by username first (this is more likely in most cases)
      if (usernameOrId.startsWith('user_')) {
        // This appears to be a user ID, not a username
        fetchedProfile = await getUserProfile(usernameOrId);
        profileOwnerId = usernameOrId;
      } else {
        // Try to load by username
        fetchedProfile = await getUserProfileByUsername(usernameOrId);
        if (fetchedProfile) {
          profileOwnerId = fetchedProfile.userId;
        }
      }

      // If neither approach worked, show error
      if (!fetchedProfile) {
        setError('User profile not found');
        setLoading(false);
        return;
      }

      // Set profile data
      setProfile(fetchedProfile);
      setProfileOwner({ $id: profileOwnerId });
      
      // Set profile image if it exists
      if (fetchedProfile.profilePicture) {
        setImageUrl(getProfilePictureUrl(fetchedProfile.profilePicture));
      }
      
      // Check if this is the current logged-in user's profile
      if (user && profileOwnerId === user.$id) {
        setIsCurrentUser(true);
      } else {
        setIsCurrentUser(false);
      }
      
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile information.');
    } finally {
      setLoading(false);
    }
  };

  // Load social connection data between current user and profile owner
  const loadSocialData = async () => {
    if (!user || !profile || !profile.userId) return;
    
    try {
      setLoadingSocial(true);
      
      // Check if logged-in user is following this profile
      const following = await isFollowing(user.$id, profile.userId);
      setIsUserFollowing(following);
      
      // Get connection status
      const connStatus = await getConnectionStatus(user.$id, profile.userId);
      setConnectionStatus(connStatus);
      
      // Get followers and following counts
      const followers = await getFollowersCount(profile.userId);
      const following2 = await getFollowingCount(profile.userId);
      
      setFollowersCount(followers);
      setFollowingCount(following2);
      
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setLoadingSocial(false);
    }
  };

  // Handle follow/unfollow action
  const handleFollowToggle = async () => {
    if (!user || !profile) {
      router.push('/login');
      return;
    }
    
    try {
      setLoadingSocial(true);
      
      // Toggle follow status
      const action = isUserFollowing ? 'unfollow' : 'follow';
      await toggleFollowUser(user.$id, profile.userId, action);
      
      // Update UI state
      setIsUserFollowing(!isUserFollowing);
      
      // Update follower count
      setFollowersCount(prev => isUserFollowing ? prev - 1 : prev + 1);
      
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setLoadingSocial(false);
    }
  };

  // Handle connect/disconnect action
  const handleConnectToggle = async () => {
    if (!user || !profile) {
      router.push('/login');
      return;
    }
    
    try {
      setLoadingSocial(true);
      
      // Determine action based on current connection status
      let action: 'connect' | 'disconnect' = 'connect';
      
      if (connectionStatus === 'active') {
        action = 'disconnect';
      }
      
      // Toggle connection
      await toggleConnectUsers(user.$id, profile.userId, action);
      
      // Update connection status
      setConnectionStatus(action === 'connect' ? 'pending' : 'none');
      
    } catch (error) {
      console.error('Error toggling connection status:', error);
    } finally {
      setLoadingSocial(false);
    }
  };

  // Handle navigating to messaging
  const handleMessage = () => {
    if (!user || !profile) {
      router.push('/login');
      return;
    }
    
    // Navigate to message page with the recipient ID
    router.push(`/messages?recipient=${profile.userId}`);
  };

  // Handle toggling edit mode (for current user viewing their own profile)
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  // Function to determine what button label to show for connection
  const getConnectionButtonText = () => {
    switch (connectionStatus) {
      case 'active':
        return 'Connected';
      case 'pending':
        return 'Request Pending';
      case 'disconnected':
        return 'Reconnect';
      default:
        return 'Connect';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 4 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
            }}
          >
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Profile Header */}
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
                {profile?.name || 'User Profile'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                @{profile?.username || usernameOrId}
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
          {/* Profile Content */}
          <Box sx={{ p: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container spacing={3}>
                {/* Left Column - Profile Picture & Basic Info */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center', 
                      p: 3,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      height: '100%'
                    }}
                  >
                    {/* Profile Picture */}
                    <Avatar 
                      src={imageUrl || undefined} 
                      alt={profile?.name || 'User'} 
                      sx={{ 
                        width: 150, 
                        height: 150, 
                        mb: 2,
                        border: '4px solid',
                        borderColor: 'primary.light',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
                      }}
                    />
                    
                    {/* Name & Username */}
                    <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
                      {profile?.name || 'Anonymous User'}
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      color="primary" 
                      align="center" 
                      gutterBottom
                      sx={{ mb: 2 }}
                    >
                      @{profile?.username || usernameOrId}
                    </Typography>
                    
                    {/* Skills */}
                    {profile?.skills && profile.skills.length > 0 && (
                      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                        {profile.skills.map((skill: string, index: number) => (
                          <Chip 
                            key={index} 
                            label={skill}
                            size="small"
                            sx={{ 
                              borderRadius: '4px',
                              backgroundColor: 'rgba(120, 87, 255, 0.1)',
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'rgba(120, 87, 255, 0.2)',
                              }
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    
                    {/* Social Stats */}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        width: '100%', 
                        justifyContent: 'space-around',
                        mb: 3,
                        px: 2
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">{followersCount}</Typography>
                        <Typography variant="body2" color="text.secondary">Followers</Typography>
                      </Box>
                      
                      <Divider orientation="vertical" flexItem />
                      
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">{followingCount}</Typography>
                        <Typography variant="body2" color="text.secondary">Following</Typography>
                      </Box>
                    </Box>
                    
                    {/* Action Buttons - only show if not current user */}
                    {!isCurrentUser ? (
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          startIcon={<PersonAddIcon />}
                          onClick={handleFollowToggle}
                          disabled={loadingSocial}
                          sx={{ mb: 2 }}
                        >
                          {isUserFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                        
                        <Button
                          variant="outlined"
                          color="primary"
                          fullWidth
                          startIcon={<GroupAddIcon />}
                          onClick={handleConnectToggle}
                          disabled={loadingSocial || connectionStatus === 'pending'}
                          sx={{ mb: 2 }}
                        >
                          {getConnectionButtonText()}
                        </Button>
                        
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<MessageIcon />}
                          onClick={handleMessage}
                          sx={{ mb: 2 }}
                        >
                          Message
                        </Button>
                      </Box>
                    ) : (
                      /* Edit Profile Button - only for current user */
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          startIcon={<EditIcon />}
                          onClick={handleToggleEdit}
                          sx={{ mb: 2 }}
                        >
                          {isEditing ? 'View Profile' : 'Edit Profile'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Grid>
                
                {/* Right Column - Profile Content */}
                <Grid item xs={12} md={8}>
                  {isCurrentUser && isEditing ? (
                    <ProfileEditView 
                      profile={profile} 
                      onSaved={() => {
                        setIsEditing(false);
                        loadProfileData(); // Reload data after save
                      }}
                    />
                  ) : (
                    <PublicProfileView 
                      profile={profile}
                      isCurrentUser={isCurrentUser}
                      onEdit={handleToggleEdit}
                    />
                  )}
                </Grid>
              </Grid>
            </motion.div>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}