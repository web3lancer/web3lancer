'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { account } from '@/utils/api'; // For potential deleteSession on critical error
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setIsLoading: setAuthContextIsLoading, refreshUser, setUser } = useAuth();

  useEffect(() => {
    const finalizeSession = async () => {
      if (typeof setAuthContextIsLoading === 'function') {
        setAuthContextIsLoading(true);
      }

      try {
        console.log("AuthCallbackPage: Attempting to finalize OAuth session by calling refreshUser()...");
        // refreshUser should call account.get() internally, which finalizes OAuth from URL parameters,
        // and then updates the AuthContext comprehensively.
        const refreshedUser = await refreshUser(); // refreshUser is from AuthContext

        if (refreshedUser && refreshedUser.$id) {
          console.log("AuthCallbackPage: refreshUser() successful, user:", refreshedUser);
          // setUser and setIsLoading(false) should be handled within refreshUser upon success.
          console.log("AuthCallbackPage: Session finalized by refreshUser. Redirecting to dashboard.");
          router.replace('/dashboard');
        } else {
          // This case means refreshUser completed but didn't find/return a user.
          // refreshUser should have set user to null and isLoading to false in context.
          console.error("AuthCallbackPage: refreshUser() did not return a valid user session.");
          router.replace('/signin?error=oauth_refresh_failed');
        }
      } catch (error) {
        // This catches errors if refreshUser() itself throws an unhandled exception,
        // or if there's an issue calling refreshUser (e.g., if it's undefined).
        console.error("AuthCallbackPage: Critical error during refreshUser() call:", error);
        if (typeof setUser === 'function') {
          setUser(null); // Ensure user is cleared in context
        }
        try {
          await account.deleteSession('current');
          console.log("AuthCallbackPage: Attempted to delete potentially broken session after critical error.");
        } catch (deleteError) {
          console.warn("AuthCallbackPage: Could not delete potentially broken session:", deleteError);
        }
        // Ensure loading is set to false before redirecting from a critical error path.
        if (typeof setAuthContextIsLoading === 'function') {
          setAuthContextIsLoading(false);
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown OAuth finalization error';
        router.replace(`/signin?error=oauth_critical_finalize_failed&message=${encodeURIComponent(errorMessage)}`);
      }
      // Note: refreshUser() is expected to have its own finally block to set isLoading to false.
      // If refreshUser completes (even if it returns null), its finally block should run.
      // The explicit setIsLoading(false) in the catch block here is for when refreshUser itself fails critically.
    };

    // Ensure refreshUser is actually a function from the context before calling.
    if (typeof refreshUser === 'function') {
      finalizeSession();
    } else {
      console.error("AuthCallbackPage: refreshUser function is not available from AuthContext. This indicates a problem with AuthProvider or context linkage.");
      if (typeof setAuthContextIsLoading === 'function') {
        setAuthContextIsLoading(false); // Stop loading indicator if possible
      }
      router.replace('/signin?error=auth_context_setup_error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, setAuthContextIsLoading, refreshUser, setUser]); // Dependencies for useEffect

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
