"use client";
import React, { useState, useEffect } from 'react';
import { Box, Grid, Alert, Snackbar, CircularProgress } from "@mui/material";
import ProfileCard from './ProfileCard';
import ProfileForm from './ProfileForm';
import CalendarSection from './CalendarSection';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, getProfilePictureUrl } from '@/utils/api';
import { motion } from 'framer-motion';

export default function ProfileSection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setProfileError(null);
      console.log('Loading profile for user:', user.$id);
      
      // This will create a profile if it doesn't exist
      const profile = await getUserProfile(user.$id);
      
      if (profile) {
        console.log('Profile loaded successfully:', profile);
        setBio(profile.bio || '');
        setSkills(profile.skills || []);
        
        // If profile picture exists, set the preview
        if (profile.profilePicture) {
          setImagePreview(getProfilePictureUrl(profile.profilePicture));
        } else {
          setImagePreview(null);
        }
      } else {
        console.log('No profile found, will create on save');
        // Set defaults for a new user
        setBio('');
        setSkills([]);
        setImagePreview(null);
      }
    } catch (error: any) { // Type error for better handling
      console.error('Error loading profile:', error);
      // Default error message
      let specificMessage = 'Failed to load profile information. We will create one when you save your details.';
      
      // Refined error message extraction
      let rawErrorMessage = '';
      if (typeof error === 'string') {
        rawErrorMessage = error;
      } else if (error && error.message && typeof error.message === 'string') {
        rawErrorMessage = error.message;
      } else if (error && typeof error.toString === 'function') { // Added this fallback
        const errorString = error.toString();
        if (typeof errorString === 'string') {
          rawErrorMessage = errorString;
        }
      }

      // Check if the error is related to MetaMask using the extracted message
      if (rawErrorMessage.includes('MetaMask') || rawErrorMessage.includes('eth_requestAccounts')) {
        specificMessage = 'A wallet-related issue occurred while loading your profile. If you use MetaMask or another Ethereum wallet with this site, please ensure it is connected and configured correctly. Some profile features might be unavailable otherwise.';
        console.warn('MetaMask related error caught while loading profile:', rawErrorMessage);
      }
      
      setProfileError(specificMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setProfileError(null);
      
      await updateUserProfile(user.$id, {
        bio,
        skills,
        updatedAt: new Date().toISOString()
      });
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) {
    return <Alert severity="info">Please sign in to view and edit your profile.</Alert>;
  }

  return (
    <Box>
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress
            sx={{
              color: 'primary.main',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
        </Box>
      )}
      
      {profileError && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            background: 'linear-gradient(135deg, rgba(255, 190, 83, 0.1) 0%, rgba(255, 143, 0, 0.1) 100%)',
            border: '1px solid',
            borderColor: 'warning.light',
            '& .MuiAlert-icon': {
              color: 'warning.main'
            }
          }}
        >
          {profileError}
        </Alert>
      )}
      
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <ProfileCard 
                  user={user}
                  imagePreview={imagePreview}
                />
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <ProfileForm 
                  profileData={{
                    skills,
                    setSkills,
                    bio,
                    setBio
                  }}
                  onSave={handleSaveProfile}
                  loading={loading}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                style={{ marginTop: '24px' }}
              >
                <CalendarSection />
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ 
          '& .MuiAlert-root': {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            background: snackbar.severity === 'success' 
              ? 'linear-gradient(135deg, rgba(46, 213, 115, 0.95) 0%, rgba(37, 187, 112, 0.95) 100%)' 
              : 'linear-gradient(135deg, rgba(255, 71, 87, 0.95) 0%, rgba(231, 61, 77, 0.95) 100%)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
