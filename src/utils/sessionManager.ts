import { account, databases, getCurrentSession } from './api';
import { useMultiAccount } from '@/contexts/MultiAccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { APPWRITE_CONFIG } from '@/lib/env';

/**
 * Session Manager
 * 
 * Utilities to manage authentication sessions and ensure proper synchronization
 * between Appwrite sessions and the application state.
 */

/**
 * Check if the current session matches the active account
 * @param activeAccountId The ID of the currently active account
 */
export async function validateSessionMatchesAccount(activeAccountId?: string): Promise<boolean> {
  try {
    // Get current session
    const session = await getCurrentSession();
    if (!session) {
      return false;
    }
    
    // Get current user
    const user = await account.get();
    
    // Check if user ID matches active account ID
    return activeAccountId ? user.$id === activeAccountId : !!user.$id;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

/**
 * Ensure proper synchronization between session and active account
 * @param refreshUser Function to refresh user data
 * @param clearActiveAccount Function to clear active account
 */
export async function synchronizeSessionWithAccount(
  refreshUser: () => Promise<any>,
  clearActiveAccount: () => Promise<void>
): Promise<boolean> {
  try {
    const user = await refreshUser();
    if (!user) {
      await clearActiveAccount();
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to synchronize session:', error);
    await clearActiveAccount();
    return false;
  }
}

/**
 * Hook that combines session and account management
 * This hook provides utilities for components that need to manage sessions
 */
export function useSessionManager() {
  const { activeAccount, clearActiveAccount, switchAccount, removeAccount } = useMultiAccount();
  const { user, refreshUser, signOut } = useAuth();
  
  /**
   * Validate the current session state
   */
  const validateSession = async (): Promise<boolean> => {
    // If there's no active account, nothing to validate
    if (!activeAccount) return false;
    
    return await validateSessionMatchesAccount(activeAccount.$id);
  };
  
  /**
   * Force synchronization between session and account state
   */
  const synchronizeSession = async (): Promise<boolean> => {
    return await synchronizeSessionWithAccount(refreshUser, clearActiveAccount);
  };
  
  /**
   * Handle account switching with proper session management
   */
  const safeAccountSwitch = async (accountId: string): Promise<void> => {
    await signOut(); // Ensure clean state first
    await switchAccount(accountId);
    await synchronizeSession();
  };
  
  /**
   * Safely remove an account with proper cleanup
   */
  const safeRemoveAccount = async (accountId: string): Promise<void> => {
    if (activeAccount && activeAccount.$id === accountId) {
      await signOut();
    }
    await removeAccount(accountId);
  };
  
  return {
    validateSession,
    synchronizeSession,
    safeAccountSwitch,
    safeRemoveAccount,
    isSessionValid: !!user && !!activeAccount,
  };
}

/**
 * A utility to recover from session/account mismatch
 */
export async function recoverFromSessionMismatch() {
  // Clear out active sessions
  try {
    await account.deleteSession('current');
  } catch (error) {
    // Ignore, no active session
  }
  
  // Clear localStorage data for good measure
  localStorage.removeItem('web3lancer_session');
  
  // Keep accounts but remove active flag
  const savedAccounts = localStorage.getItem('web3lancer_accounts');
  if (savedAccounts) {
    try {
      const accounts = JSON.parse(savedAccounts);
      const updatedAccounts = accounts.map((acc: any) => ({
        ...acc,
        isActive: false
      }));
      localStorage.setItem('web3lancer_accounts', JSON.stringify(updatedAccounts));
    } catch (error) {
      // If parse fails, just remove it
      localStorage.removeItem('web3lancer_accounts');
    }
  }
  
  return true;
}
