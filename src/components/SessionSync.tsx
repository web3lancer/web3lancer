'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiAccount } from '@/contexts/MultiAccountContext';
import { getCurrentSession } from '@/utils/api';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { SyncProblem } from '@mui/icons-material';

/**
 * SessionSync component
 * 
 * This component synchronizes the authentication session with the active account.
 * It ensures that the user is always logged in with the correct account and
 * prevents session/account mismatches.
 */
export default function SessionSync({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth();
  const { activeAccount, clearActiveAccount } = useMultiAccount();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();

  // Check session on initial load and when active account changes
  useEffect(() => {
    const syncSession = async () => {
      try {
        setSyncing(true);
        setError(false);
        
        // Check if we have an active session
        const session = await getCurrentSession();
        
        // If no session but we have an active account, clear it
        if (!session && activeAccount) {
          console.log('No session found but active account exists - clearing active account');
          await clearActiveAccount();
          return;
        }
        
        // If session exists but no user in context, refresh user
        if (session && !user) {
          console.log('Session exists but no user in context - refreshing user');
          await refreshUser();
          return;
        }
        
        // If session and user but they don't match the active account
        if (session && user && activeAccount) {
          if (user.$id !== activeAccount.$id) {
            console.log('Session user and active account mismatch - clearing active account');
            await clearActiveAccount();
            return;
          }
        }
      } catch (error) {
        console.error('Error syncing session:', error);
        setError(true);
      } finally {
        setSyncing(false);
      }
    };

    syncSession();
  }, [activeAccount, user, refreshUser, clearActiveAccount]);

  const handleReset = async () => {
    try {
      await clearActiveAccount();
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
