'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { Models } from 'appwrite'; // Import Models

const MAX_REFRESH_ATTEMPTS = 5; // Increased from 3
const REFRESH_DELAY_MS = 1500; // Increased from 1000

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
    // For OAuth users, the presence of an email is often a better indicator
    // of a successful, non-anonymous login than emailVerification status.
    return !userToCheck?.email; // Check for email presence instead
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
        console.error(`AuthCallbackPage: Max refresh attempts (${MAX_REFRESH_ATTEMPTS}) reached without fetching user.`);
        setError('Authentication failed. Could not retrieve user session after multiple attempts.');
        setIsProcessing(false);
        return;
      }

      attemptCount.current += 1;
      console.log(`AuthCallbackPage: Attempting refreshUser (Attempt ${attemptCount.current})...`);

      try {
        const refreshedUser = await refreshUser();
        console.log(`AuthCallbackPage: refreshUser completed (Attempt ${attemptCount.current}). User:`, refreshedUser);

        // Stop retrying AND navigate if we successfully fetched a user *with an email*.
        if (refreshedUser && refreshedUser.email) {
          console.log(`AuthCallbackPage: User session with email obtained (Attempt ${attemptCount.current}). Navigating...`);
          setIsProcessing(false); // Stop local processing state
          router.push('/home'); // Navigate immediately
          return; // Stop further attempts/timeouts in this effect
        } else if (refreshedUser) {
          // User found, but no email yet (might be anonymous or OAuth still processing)
          console.warn(`AuthCallbackPage: User found but without email (Attempt ${attemptCount.current}). Retrying in ${REFRESH_DELAY_MS}ms...`);
          setTimeout(attemptRefresh, REFRESH_DELAY_MS);
        } else {
          // If user is still null after refresh, wait and retry
          console.warn(`AuthCallbackPage: User not found after refresh (Attempt ${attemptCount.current}). Retrying in ${REFRESH_DELAY_MS}ms...`);
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

  // REMOVE THE SECOND useEffect - Navigation/Error is handled in the first effect
  // useEffect(() => {
  //   // ... removed code ...
  // }, [isProcessing, authLoading, user, error, router]);

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
          {/* Display attempt count dynamically */}
          <Typography>Finalizing authentication (Attempt {attemptCount.current})...</Typography>
        </>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, maxWidth: '400px' }}>
          {error} Please <a href="/signin" style={{ color: 'inherit' }}>return to Sign In</a>.
        </Alert>
      )}
      {/* Remove success message - navigation should happen before this renders */}
      {/* {!isProcessing && !error && user && !isAnonymous && (
         <Typography>Authentication successful. Redirecting...</Typography>
      )} */}
      {/* Remove verification message - covered by loading/error states */}
      {/* {!isProcessing && !error && (!user || isAnonymous) && (
         <Typography>Verifying session...</Typography>
      )} */}
    </Box>
  );
}
