'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { account, signOut as apiSignOut } from '@/utils/api';
import { useMultiAccount } from './MultiAccountContext';

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  isLoading: boolean;
  isAnonymous: boolean;
  setIsAnonymous: (isAnonymous: boolean) => void;
  isMfaRequired: boolean;
  setIsMfaRequired: (required: boolean) => void;
  signOut: () => Promise<void>;
  handleGitHubOAuth: (code?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  isAnonymous: false,
  setIsAnonymous: () => {},
  isMfaRequired: false,
  setIsMfaRequired: () => {},
  signOut: async () => {},
  handleGitHubOAuth: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  
  const { removeAllAccounts, clearActiveAccount } = useMultiAccount();

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      setIsAnonymous(false);
      return currentUser;
    } catch (error) {
      console.log('No authenticated user:', error);
      setUser(null);
      return null;
    }
  };

  // Check authentication state on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      await apiSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      // Always clear local state even if server logout fails
      setUser(null);
      setIsAnonymous(false);
      clearActiveAccount();
    }
  };

  // Handle GitHub OAuth
  const handleGitHubOAuth = async (code?: string) => {
    // Implementation for GitHub OAuth
    console.log('GitHub OAuth flow with code:', code);
    // After successful OAuth, refresh user
    await refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        isAnonymous,
        setIsAnonymous,
        isMfaRequired,
        setIsMfaRequired,
        signOut,
        handleGitHubOAuth,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
