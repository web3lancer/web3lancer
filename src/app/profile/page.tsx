"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, // Added missing import
  Alert
} from '@mui/material';
import { useAuth } from "@/contexts/AuthContext";
import CalendarSection from "@/components/profile/CalendarSection";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileForm from "@/components/profile/ProfileForm";
import { useProfileData } from "@/hooks/useProfileData";

export default function ProfilePage() {
  const { user } = useAuth();
  const { loading, error, profileData, handleSaveProfile } = useProfileData(user);

  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        My Profile
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <ProfileCard user={user} />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <ProfileForm 
            profileData={profileData} 
            onSave={handleSaveProfile} 
            loading={loading}
          />
        </Grid>

        <Grid item xs={12}>
          <CalendarSection />
        </Grid>
      </Grid>
    </Box>
  );
}
