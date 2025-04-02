'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Simplified SessionSync component
 * 
 * Provides a minimal approach to ensuring initial authentication state is loaded
 * while avoiding recursive rendering issues.
 */
export default function SessionSync({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth();
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
        // Only refresh user if we don't already have a user in context
        if (!user) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Error syncing session:', error);
      } finally {
        syncAttempted.current = true;
      }
    };

    syncSession();
  }, [user, refreshUser]);

  // Just render children immediately to avoid potential flickering
  return <>{children}</>;
}
