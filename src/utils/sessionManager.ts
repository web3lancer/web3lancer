import { account } from './api';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

/**
 * Session Manager
 * 
 * Utilities to manage authentication sessions and ensure proper synchronization.
 * Simplified version without multi-account functionality.
 */

/**
 * Check if the current session is valid
 */
export async function validateSessionStatus(): Promise<boolean> {
  try {
    // Get current user - if this succeeds, the session is valid
    const user = await account.get();
    return !!user.$id;
  } catch (error) {
    return false;
  }
}

/**
 * Hook that provides session management
 */
export function useSessionManager() {
  const { user, refreshUser, signOut } = useAuth();
  
  /**
   * Validate the current session state
   */
  const validateSession = useCallback(async (): Promise<boolean> => {
    if (user) return true;
    return await validateSessionStatus();
  }, [user]);
  
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
  }, [signOut]);

  return {
    validateSession,
    resetSession,
    signOut: resetSession,
    refreshUser,
    isSessionValid: !!user
  };
}

/**
 * A utility to recover from session issues
 */
export async function recoverFromSessionIssue() {
  // Clear out active sessions
  try {
    await account.deleteSession('current');
  } catch (error) {
    // Ignore, no active session
  }
  
  // Clear localStorage data for good measure
  localStorage.removeItem('web3lancer_session');
  
  return true;
}
