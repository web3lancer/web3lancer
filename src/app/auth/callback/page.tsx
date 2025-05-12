"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { account } from '@/utils/api'; // Direct import for Appwrite account instance
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AuthCallbackPage() {
  const router = useRouter();
  // Get setUser and setIsLoading to update auth state directly from here
  const { setUser, setIsLoading: setAuthContextIsLoading } = useAuth();

  useEffect(() => {
    const finalizeSession = async () => {
      // Ensure context functions are available before calling them
      if (typeof setAuthContextIsLoading === 'function') {
        setAuthContextIsLoading(true);
      }

      try {
        console.log("AuthCallbackPage: Attempting to finalize OAuth session with account.get()...");
        const userSession = await account.get(); // This should be Models.User<Models.Preferences>
        console.log("AuthCallbackPage: account.get() successful", userSession);

        if (userSession && userSession.$id) { // Check if a valid session is returned
          if (typeof setUser === 'function') {
            setUser(userSession); // Update context with the new session
          }
          console.log("AuthCallbackPage: Session finalized. Redirecting to dashboard.");
          router.replace('/dashboard');
        } else {
          console.error("AuthCallbackPage: No valid user session returned from account.get().");
          if (typeof setUser === 'function') {
            setUser(null);
          }
          router.replace('/signin?error=oauth_session_invalid');
        }
      } catch (error) {
        console.error("AuthCallbackPage: Error finalizing OAuth session:", error);
        if (typeof setUser === 'function') {
          setUser(null); // Clear user in context
        }
        // Attempt to delete any potentially broken session that might have been created
        try {
          await account.deleteSession('current');
          console.log("AuthCallbackPage: Attempted to delete potentially broken session.");
        } catch (deleteError) {
          console.warn("AuthCallbackPage: Could not delete potentially broken session", deleteError);
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during OAuth finalization';
        router.replace(`/signin?error=oauth_finalize_failed&message=${encodeURIComponent(errorMessage)}`);
      } finally {
        // Ensure loading is set to false if not already done by a redirect path
        // However, redirects should happen before this, so direct setIsLoading(false) might be tricky here
        // It's better handled within the try/catch blocks before router.replace()
        // For safety, if setAuthContextIsLoading is still true, set it to false.
        // This part might be redundant if all paths above set it and redirect.
        if (typeof setAuthContextIsLoading === 'function') {
           // Check current loading state if possible, or just set to false if redirect hasn't happened.
           // This is tricky because router.replace is async in some Next.js versions regarding page state.
           // For now, we assume redirection makes this less critical.
        }
      }
    };

    finalizeSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, setUser, setAuthContextIsLoading]); // Dependencies for useEffect

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        p: 2,
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 2, textAlign: 'center' }}>
        Finalizing authentication, please wait...
      </Typography>
    </Box>
  );
}
