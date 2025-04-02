import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/utils/api';
import { useCallback } from 'react';

/**
 * Custom hook for session management - simplified version without multi-account
 */
export function useSessionAccount() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();

  /**
   * Reset the entire session state and sign out
   */
  const resetSession = useCallback(async () => {
    try {
      await signOut();
      localStorage.removeItem('web3lancer_session');
      return true;
    } catch (error) {
      console.error('Error resetting session:', error);
      return false;
    }
  }, []);

  /**
   * Check if current session is valid - now simplified
   */
  const validateSession = useCallback(async () => {
    return !!user;
  }, [user]);

  return {
    user,
    isSessionValid: !!user,
    isValidating: authLoading,
    authLoading,
    resetSession,
    signOut: resetSession,
    refreshUser
  };
}
