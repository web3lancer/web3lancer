import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// import profileService from '@/services/profileService';
import { Profile, VerificationType } from '@/types';

import ProfileService from "@/services/profileService";
import { AppwriteService } from "@/services/appwriteService";
import { envConfig } from "@/config/environment";

const appwriteService = new AppwriteService(envConfig);
const profileService = new ProfileService(appwriteService, envConfig);

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the profile when the user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const userProfile = await profileService.getProfileByUserId(user.$id);
        setProfile(userProfile);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Update profile function
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!profile) {
      setError('No profile available to update');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await profileService.updateProfile(profile.$id, updates);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Update avatar function
  const updateAvatar = useCallback(async (file: File) => {
    if (!profile) {
      setError('No profile available to update avatar');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await profileService.updateProfileAvatar(profile.$id, file);
      if (result.profile) {
        setProfile(result.profile);
      }
      return result;
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError('Failed to update avatar');
      return { profile: null, fileId: null };
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Update cover image function
  const updateCoverImage = useCallback(async (file: File) => {
    if (!profile) {
      setError('No profile available to update cover image');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await profileService.updateProfileCoverImage(profile.$id, file);
      if (result.profile) {
        setProfile(result.profile);
      }
      return result;
    } catch (err) {
      console.error('Error updating cover image:', err);
      setError('Failed to update cover image');
      return { profile: null, fileId: null };
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Submit verification request function
  const submitVerification = useCallback(async (
    verificationType: VerificationType,
    documents: File[]
  ) => {
    if (!profile) {
      setError('No profile available to submit verification');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await profileService.submitVerificationRequest(
        profile.$id,
        verificationType,
        documents
      );
      return result;
    } catch (err) {
      console.error('Error submitting verification:', err);
      setError('Failed to submit verification request');
      return null;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Get verification requests function
  const getVerificationRequests = useCallback(async () => {
    if (!profile) {
      setError('No profile available to get verification requests');
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const requests = await profileService.getVerificationRequests(profile.$id);
      return requests;
    } catch (err) {
      console.error('Error getting verification requests:', err);
      setError('Failed to get verification requests');
      return [];
    } finally {
      setLoading(false);
    }
  }, [profile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateAvatar,
    updateCoverImage,
    submitVerification,
    getVerificationRequests
  };
};

export default useProfile;