import { account, databases, getCurrentSession } from './api';
import { useAuth } from '@/contexts/AuthContext';
import { APPWRITE_CONFIG } from '@/lib/env';

/**
 * Session Manager
 * 
 * Utilities to manage authentication sessions and ensure proper synchronization.
 */

/**
 * Check if the current session is valid
 */
export async function validateSessionStatus(): Promise<boolean> {
  try {
    // Get current session
    const session = await getCurrentSession();
    if (!session) {
      return false;
    }
    
    // Get current user
    const user = await account.get();
    return !!user.$id;
  } catch (error) {
    console.error('Error validating session:', error);
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
  const validateSession = async (): Promise<boolean> => {
    return await validateSessionStatus();
  };
  
  /**
   * Reset the entire session state and sign out
   */
  const resetSession = async () => {
    try {
      await signOut();
      
      // Clear localStorage data for good measure
      localStorage.removeItem('web3lancer_session');
      
      return true;
    } catch (error) {
      console.error('Error resetting session:', error);
      return false;
    }
  };

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
