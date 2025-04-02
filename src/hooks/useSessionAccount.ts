import { useAuth } from '@/contexts/AuthContext';
import { getCurrentSession, signOut } from '@/utils/api';

/**
 * Custom hook for session management - simplified version without multi-account
 */
export function useSessionAccount() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();

  /**
   * Reset the entire session state and sign out
   */
  const resetSession = async () => {
    try {
      await signOut();
      localStorage.removeItem('web3lancer_session');
      return true;
    } catch (error) {
      console.error('Error resetting session:', error);
      return false;
    }
  };

  /**
   * Check if current session is valid
   */
  const validateSession = async () => {
    try {
      const session = await getCurrentSession();
      return !!session;
    } catch (error) {
      return false;
    }
  };

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
