import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/utils/api';
import { useCallback } from 'react';

/**
 * Ultra-simplified session management hook
 * Avoids passing functions that might cause serialization issues
 */
export function useSessionAccount() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();

  const resetSession = useCallback(async () => {
    try {
      await signOut();
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }, []);

  return {
    user,
    isSessionValid: !!user,
    isLoading: authLoading,
    signOut: resetSession,
    refreshUser
  };
}
