'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { SyncProblem } from '@mui/icons-material';

/**
 * SessionSync component
 * 
 * This component ensures initial authentication state is loaded.
 * Simplified version without multi-account functionality.
 */
export default function SessionSync({ children }: { children: React.ReactNode }) {
  const { user, refreshUser, signOut } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();
  const syncAttempted = useRef(false);

  // Check session only once on initial load
  useEffect(() => {
    // Skip if we've already attempted to sync or if user is already loaded
    if (syncAttempted.current || user) {
      syncAttempted.current = true;
      return;
    }

    const syncSession = async () => {
      try {
        setSyncing(true);
        // Only refresh user if we don't already have a user in context
        if (!user) {
          await refreshUser();
        }
        syncAttempted.current = true;
      } catch (error) {
        console.error('Error syncing session:', error);
        setError(true);
      } finally {
        setSyncing(false);
      }
    };

    syncSession();
  }, [user, refreshUser]);

  const handleReset = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Error resetting session:', error);
    }
  };

  if (syncing) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          p: 1,
          backgroundColor: 'action.disabledBackground',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress size={16} sx={{ mr: 1 }} />
        <Typography variant="caption">Loading session...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 3,
          textAlign: 'center'
        }}
      >
        <SyncProblem sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>Session Error</Typography>
        <Typography variant="body1" paragraph>
          There was a problem loading your session. Please try signing in again.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleReset}>
          Sign In
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}
