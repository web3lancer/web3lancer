import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiAccount } from '@/contexts/MultiAccountContext';
import { getCurrentSession, signOut } from '@/utils/api';

/**
 * Custom hook that combines authentication and multi-account functionality
 * with proper session management
 */
export function useSessionAccount() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const { 
    activeAccount, 
    accounts, 
    switchAccount, 
    addAccount, 
    removeAccount,
    clearActiveAccount
  } = useMultiAccount();
  const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validate session and account alignment
  useEffect(() => {
    const validateSession = async () => {
      if (authLoading) return;
      
      try {
        setIsValidating(true);
        
        // Check if we have a session
        const session = await getCurrentSession();
        const hasSession = !!session;
        
        // If no session but we have active account, clear it
        if (!hasSession && activeAccount) {
          await clearActiveAccount();
          setIsSessionValid(false);
          return;
        }
        
        // If we have a session but no active account, try to refresh user
        if (hasSession && !activeAccount) {
          const refreshedUser = await refreshUser();
          if (refreshedUser) {
            // Find matching account or add it
            const existingAccount = accounts.find(acc => acc.$id === refreshedUser.$id);
            if (existingAccount) {
              await switchAccount(refreshedUser.$id);
            } else {
              await addAccount({
                $id: refreshedUser.$id,
                name: refreshedUser.name || '',
                email: refreshedUser.email || '',
                isActive: true
              });
            }
            setIsSessionValid(true);
          } else {
            setIsSessionValid(false);
          }
          return;
        }
        
        // If we have both session and active account, check if they match
        if (hasSession && activeAccount) {
          if (user && user.$id !== activeAccount.$id) {
            console.log('Session user and active account mismatch - correcting');
            await clearActiveAccount();
            setIsSessionValid(false);
            return;
          }
          
          setIsSessionValid(true);
          return;
        }
        
        // If we have neither session nor active account, we're in a clean state
        if (!hasSession && !activeAccount) {
          setIsSessionValid(true);
          return;
        }
        
        setIsSessionValid(false);
      } catch (error) {
        console.error('Error validating session:', error);
        setIsSessionValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [
    authLoading, 
    user, 
    activeAccount, 
    accounts, 
    refreshUser, 
    clearActiveAccount, 
    switchAccount, 
    addAccount
  ]);

  /**
   * Safe account switching with proper session management
   */
  const safeAccountSwitch = async (accountId: string) => {
    try {
      // Sign out from current session first
      await signOut();
      
      // Then switch the account
      await switchAccount(accountId);
      
      // Session will be established by login in AccountSwitcher
      return true;
    } catch (error) {
      console.error('Error safely switching accounts:', error);
      return false;
    }
  };

  /**
   * Safely remove an account with proper session cleanup
   */
  const safeRemoveAccount = async (accountId: string) => {
    try {
      const isActiveAccount = activeAccount && activeAccount.$id === accountId;
      
      // If removing the active account, sign out first
      if (isActiveAccount) {
        await signOut();
      }
      
      // Remove the account
      await removeAccount(accountId);
      
      return true;
    } catch (error) {
      console.error('Error safely removing account:', error);
      return false;
    }
  };

  /**
   * Reset the entire session state and sign out
   */
  const resetSession = async () => {
    try {
      await signOut();
      await clearActiveAccount();
      
      // Clear any local storage related to sessions
      localStorage.removeItem('web3lancer_session');
      
      return true;
    } catch (error) {
      console.error('Error resetting session:', error);
      return false;
    }
  };

  return {
    user,
    activeAccount,
    accounts,
    isSessionValid,
    isValidating,
    authLoading,
    safeAccountSwitch,
    safeRemoveAccount,
    resetSession,
    signOut: resetSession,
    refreshUser
  };
}
