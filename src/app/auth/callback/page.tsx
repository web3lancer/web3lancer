'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, isLoading, user, isAnonymous } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
      // Optionally redirect after showing error
      // setTimeout(() => router.push('/signin'), 5000);
      return; // Stop processing if there's an error param
    }

    console.log('AuthCallbackPage: useEffect triggered');
    
    // Attempt to refresh the user state, which should pick up the new session
    refreshUser()
      .then(refreshedUser => {
        console.log('AuthCallbackPage: refreshUser completed. User:', refreshedUser);
        if (!refreshedUser) {
          // This case might happen if the OAuth flow failed silently server-side
          // or if the session couldn't be established correctly after redirect.
          console.error('AuthCallbackPage: No user found after refresh.');
          setError('Authentication failed. Could not retrieve user session.');
          // Redirect back to signin after a delay
          // setTimeout(() => router.push('/signin'), 3000);
        }
        // Redirect logic is handled in the second useEffect based on user state
      })
      .catch(err => {
        console.error('AuthCallbackPage: Error during refreshUser:', err);
        setError(`Authentication failed: ${err.message || 'An unknown error occurred.'}`);
        // Redirect back to signin after a delay
        // setTimeout(() => router.push('/signin'), 3000);
      });
      
  }, [refreshUser, router, searchParams]); // Add searchParams dependency

  useEffect(() => {
    // This effect runs when isLoading, user, or isAnonymous changes
    console.log(`AuthCallbackPage: State check - isLoading: ${isLoading}, user: ${!!user}, isAnonymous: ${isAnonymous}`);
    
    if (!isLoading) {
      if (user && !isAnonymous) {
        console.log('AuthCallbackPage: User authenticated, redirecting to dashboard...');
        router.push('/dashboard');
      } else if (user && isAnonymous) {
         // This shouldn't typically happen after a successful OAuth login,
         // but handle it just in case.
         console.warn('AuthCallbackPage: User is anonymous after OAuth callback? Redirecting to signin.');
         setError('Authentication incomplete. Please try signing in again.');
         // setTimeout(() => router.push('/signin'), 3000);
      } else if (!user && !error) {
         // If still loading or refreshUser hasn't completed/failed yet, do nothing.
         // If refreshUser failed, the error state will be set.
         // If refreshUser succeeded but returned null, the error is set in the first useEffect.
         console.log('AuthCallbackPage: No user and no error yet, waiting...');
      } else if (error) {
         // If an error occurred (set in the first useEffect or catch block), redirect.
         console.log('AuthCallbackPage: Error detected, redirecting to signin.');
         // Optional: Add a delay before redirecting
         // setTimeout(() => router.push('/signin'), 3000);
         // Or redirect immediately:
         // router.push('/signin'); 
         // For now, just display the error message. User can manually navigate.
      }
    }
  }, [isLoading, user, isAnonymous, router, error]); // Add error dependency

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        textAlign: 'center',
        p: 3
      }}
    >
      {isLoading && !error && (
        <>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Finalizing authentication...</Typography>
        </>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, maxWidth: '400px' }}>
          {error} Please <a href="/signin">return to Sign In</a>.
        </Alert>
      )}
      {!isLoading && !user && !error && (
         // This state might occur briefly or if something unexpected happened
         <Typography>Verifying session...</Typography>
      )}
    </Box>
  );
}
