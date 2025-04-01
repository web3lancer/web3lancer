import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentSession, signOut } from '@/utils/api';

/**
 * Custom hook for session management - simplified version without multi-account
 */
export function useSessionAccount() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Reset the entire session state and sign out
   */
  const resetSession = async () => {
    try {
      await signOut();
      
      // Clear any local storage related to sessions
      localStorage.removeItem('web3lancer_session');
      
      return true;
    } catch (error) {
      console.error('Error resetting session:', error);
      return false;
    }
  };

  // Return simplified session management functionality
  return {
    user,
    isSessionValid: !!user,
    isValidating,
    authLoading,
    resetSession,
    signOut: resetSession,
    refreshUser
  };
}
