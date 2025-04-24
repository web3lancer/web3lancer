"use client";
import React, { useState, useEffect } from 'react';
import { Box, Grid, Alert, Snackbar, CircularProgress } from "@mui/material";
import ProfileCard from './ProfileCard';
import ProfileForm from './ProfileForm';
import CalendarSection from './CalendarSection';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, getProfilePictureUrl } from '@/utils/api';

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
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileError('Failed to load profile information. We will create one when you save your details.');
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
          <CircularProgress />
        </Box>
      )}
      
      {profileError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {profileError}
        </Alert>
      )}
      
      {!loading && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ProfileCard 
              user={user}
              imagePreview={imagePreview}
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
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
            
            <Box sx={{ mt: 3 }}>
              <CalendarSection />
            </Box>
          </Grid>
        </Grid>
      )}
      
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
