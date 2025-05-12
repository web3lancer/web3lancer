"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { account } from '@/utils/api'; // Direct import for Appwrite account instance
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AuthCallbackPage() {
  const router = useRouter();
  // Get setUser and setIsLoading to update auth state directly from here
  const { refreshUser, setUser, setIsLoading: setAuthIsLoading } = useAuth();

  useEffect(() => {
    const finalizeSession = async () => {
      setAuthIsLoading(true); // Indicate loading state
      try {
        console.log("AuthCallbackPage: Attempting to finalize OAuth session...");
        // The Appwrite SDK's account.get() method, when called on the redirect URI,
        // should automatically detect OAuth parameters in the URL and complete the session.
        const userSession = await account.get();
        console.log("AuthCallbackPage: account.get() successful", userSession);

        if (userSession && userSession.$id) { // Check if a valid session is returned
          setUser(userSession); // Update context with the new session

          // Optionally, call refreshUser if it does more (e.g., fetches extended profile)
          // await refreshUser(); 
          // For now, setUser should be enough to establish the session in the context.
          // refreshUser will be called by components that need the latest full profile.

          console.log("AuthCallbackPage: Session finalized. Redirecting to dashboard.");
          router.replace('/dashboard');
        } else {
          console.error("AuthCallbackPage: No valid user session returned from account.get().");
          router.replace('/signin?error=oauth_session_not_found');
        }
      } catch (error) {
        console.error("AuthCallbackPage: Error finalizing OAuth session:", error);
        // Attempt to delete any potentially broken session that might have been created
        try {
          await account.deleteSession('current');
        } catch (deleteError) {
          console.warn("AuthCallbackPage: Could not delete potentially broken session", deleteError);
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during OAuth finalization';
        router.replace(`/signin?error=oauth_finalize_failed&message=${encodeURIComponent(errorMessage)}`);
      } finally {
        // setAuthIsLoading(false); // Loading state will be managed by redirection or next page load
      }
    };

    finalizeSession();
  }, [router, refreshUser, setUser, setAuthIsLoading]); // Added dependencies

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        p: 2, // Add some padding
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 2, textAlign: 'center' }}>
        Finalizing authentication, please wait...
      </Typography>
    </Box>
  );
}
