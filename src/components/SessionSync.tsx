'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentSession } from '@/utils/api';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { SyncProblem } from '@mui/icons-material';

/**
 * SessionSync component
 * 
 * This component synchronizes the authentication session.
 * It ensures that the user is always logged in correctly.
 */
export default function SessionSync({ children }: { children: React.ReactNode }) {
  const { user, refreshUser, signOut } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();

  // Check session on initial load
  useEffect(() => {
    const syncSession = async () => {
      try {
        setSyncing(true);
        setError(false);
        
        // Check if we have an active session
        const session = await getCurrentSession();
        
        // If session exists but no user in context, refresh user
        if (session && !user) {
          console.log('Session exists but no user in context - refreshing user');
          await refreshUser();
          return;
        }
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
        <Typography variant="caption">Syncing session...</Typography>
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
          There was a problem synchronizing your session. This may happen if you're logged in from multiple browsers or if your session has expired.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleReset}>
          Reset and Sign In Again
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}
