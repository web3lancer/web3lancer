'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { account, signOut as apiSignOut, getCurrentSession } from '@/utils/api';

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
  refreshUser: () => Promise<any>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  profilePicture: string | null;
  setProfilePicture: (url: string | null) => void;
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
  refreshUser: async () => null,
  updatePassword: async () => {},
  profilePicture: null,
  setProfilePicture: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      // Check if session exists first
      const session = await getCurrentSession();
      
      if (!session) {
        setUser(null);
        return null;
      }
      
      const currentUser = await account.get();
      setUser(currentUser);
      setIsAnonymous(false);
      return currentUser;
    } catch (error) {
      console.log('No authenticated user:', error);
      setUser(null);
      return null;
    }
  }, []);

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
  }, [refreshUser]);

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
      setProfilePicture(null);
    }
  };

  // Update password
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await account.updatePassword(newPassword, currentPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
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
        updatePassword,
        profilePicture,
        setProfilePicture,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
