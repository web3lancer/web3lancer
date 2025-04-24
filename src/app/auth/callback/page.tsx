'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { Models } from 'appwrite'; // Import Models

const MAX_REFRESH_ATTEMPTS = 3;
const REFRESH_DELAY_MS = 1000; // 1 second delay between attempts

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This hook handles null automatically in Next.js 13+ App Router
  const { refreshUser, isLoading: authLoading, user, isAnonymous } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true); // Local loading state
  const attemptCount = useRef(0); // Ref to track attempts

  // Helper function (can be moved to a util or kept local)
  const isUserAnonymous = (userToCheck: Models.User<Models.Preferences> | null): boolean => {
    // Adjust this logic based on how anonymous users are identified in your setup.
    // Common checks:
    // - Lack of email verification: !userToCheck?.emailVerification
    // - Specific label/tag: userToCheck?.labels?.includes('anonymous')
    // - Absence of email: !userToCheck?.email
    // For this example, let's assume an anonymous user lacks email verification.
    return !userToCheck?.emailVerification;
  };

  useEffect(() => {
    // Use optional chaining for safety, though useSearchParams should handle it
    const errorParam = searchParams?.get('error');
    const errorDescription = searchParams?.get('error_description');

    if (errorParam) {
      const message = `Authentication failed: ${errorParam}${errorDescription ? ` (${errorDescription})` : ''}`;
      console.error("OAuth Error Parameter:", message);
      setError(message);
      setIsProcessing(false);
      return; // Stop processing
    }

    console.log('AuthCallbackPage: Mount');

    const attemptRefresh = async () => {
      if (attemptCount.current >= MAX_REFRESH_ATTEMPTS) {
        console.error(`AuthCallbackPage: Max refresh attempts (${MAX_REFRESH_ATTEMPTS}) reached.`);
        setError('Authentication failed. Could not retrieve user session after multiple attempts.');
        setIsProcessing(false);
        return;
      }

      attemptCount.current += 1;
      console.log(`AuthCallbackPage: Attempting refreshUser (Attempt ${attemptCount.current})...`);

      try {
        const refreshedUser = await refreshUser();
        console.log(`AuthCallbackPage: refreshUser completed (Attempt ${attemptCount.current}). User:`, refreshedUser);

        // Check the user returned by refreshUser directly
        if (refreshedUser && !isUserAnonymous(refreshedUser)) {
          console.log('AuthCallbackPage: User authenticated successfully.');
          setIsProcessing(false); // Stop retrying, let the next effect handle redirect
        } else {
          // If user is null or anonymous after refresh, wait and retry
          console.warn(`AuthCallbackPage: User not found or anonymous after refresh (Attempt ${attemptCount.current}). Retrying in ${REFRESH_DELAY_MS}ms...`);
          setTimeout(attemptRefresh, REFRESH_DELAY_MS);
        }
      } catch (err: any) {
        console.error(`AuthCallbackPage: Error during refreshUser (Attempt ${attemptCount.current}):`, err);
        // Wait and retry on error as well, up to the limit
        if (attemptCount.current < MAX_REFRESH_ATTEMPTS) {
           setTimeout(attemptRefresh, REFRESH_DELAY_MS);
        } else {
           setError(`Authentication failed after multiple attempts: ${err.message || 'Unknown error'}`);
           setIsProcessing(false);
        }
      }
    };

    // Start the refresh process
    attemptRefresh();

    // Cleanup function to clear timeout if component unmounts
    // (though unlikely on a callback page)
    let timeoutId: NodeJS.Timeout | null = null;
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

  }, [refreshUser, searchParams]);

  // Separate effect to handle redirection based on AuthContext state
  useEffect(() => {
    // Only redirect when processing is finished and auth isn't loading anymore
    if (!isProcessing && !authLoading) {
      console.log(`AuthCallbackPage: State check - authLoading: ${authLoading}, user: ${!!user}, isAnonymous: ${isAnonymous}, error: ${error}`);
      if (user && !isAnonymous) {
        console.log('AuthCallbackPage: User authenticated in context, redirecting to dashboard...');
        router.push('/dashboard');
      } else if (error) {
        // Error already set and displayed
        console.log('AuthCallbackPage: Error state is set, not redirecting.');
      } else {
        // Fallback if processing finished but user is still null/anonymous without a specific error
        console.error('AuthCallbackPage: Processing finished but user is not authenticated. Setting error.');
        // Avoid setting error again if it was already set by max retries
        if (!error) {
            setError('Authentication failed. Unexpected state after processing.');
        }
        // Optionally redirect to signin
        // router.push('/signin');
      }
    }
  }, [isProcessing, authLoading, user, isAnonymous, error, router]);

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
      {isProcessing && !error && (
        <>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Finalizing authentication (Attempt {attemptCount.current})...</Typography>
        </>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, maxWidth: '400px' }}>
          {error} Please <a href="/signin" style={{ color: 'inherit' }}>return to Sign In</a>.
        </Alert>
      )}
      {!isProcessing && !error && user && !isAnonymous && (
         <Typography>Authentication successful. Redirecting...</Typography>
      )}
      {!isProcessing && !error && (!user || isAnonymous) && (
         // This state might be shown briefly if retries failed without setting a specific error message
         <Typography>Verifying session...</Typography>
      )}
    </Box>
  );
}
