"use client";
import React, { useState, useEffect } from 'react';
import { Box, Grid, Alert, Snackbar } from "@mui/material";
import ProfileCard from './ProfileCard';
import ProfileForm from './ProfileForm';
import CalendarSection from './CalendarSection';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/utils/api';

export default function ProfileSection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const profile = await getUserProfile(user.$id);
      if (profile) {
        setBio(profile.bio || '');
        setSkills(profile.skills || []);
        
        // If profile picture exists, set the preview
        if (profile.profilePicture) {
          // You would need to implement a function to get the image URL
          // setImagePreview(getProfilePictureUrl(profile.profilePicture));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load profile information',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
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
