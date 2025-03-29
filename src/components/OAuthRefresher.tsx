"use client";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ensureValidOAuthToken } from '@/utils/api';

// This component silently refreshes OAuth tokens when they're about to expire
export default function OAuthRefresher() {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user || !user.provider) return;
    
    // Check token validity when component mounts
    ensureValidOAuthToken();
    
    // Set up interval to periodically check and refresh token
    // Check every 5 minutes
    const intervalId = setInterval(() => {
      ensureValidOAuthToken();
    }, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [user]);
  
  // This component doesn't render anything
  return null;
}
