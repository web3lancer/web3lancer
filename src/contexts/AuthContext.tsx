'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// Remove handleGitHubOAuthCallback from this import as it does not exist in api.ts
import { account, validateSession, createGitHubOAuthSession, createGoogleOAuthSession, getUserProfile, signUp, convertAnonymousSession as apiConvertAnonymousSession } from '@/utils/api'; 
import { ensureGuestSession, isAnonymousUser } from '../utils/guestSession'; // Use relative path for guestSession import
import { Models } from 'appwrite';

interface User {
  $id: string;
  name?: string;
  email?: string;
  emailVerification?: boolean;
  provider?: string;
  providerUid?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  isAnonymous: boolean;
  profilePicture: string | null;
  setUser: (user: Models.User<Models.Preferences> | null) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setProfilePicture: (url: string | null) => void;
  refreshUser: () => Promise<Models.User<Models.Preferences> | null>;
  signOut: () => Promise<boolean>;
  initiateGitHubLogin: () => Promise<void>;
  initiateGoogleLogin: () => Promise<void>;
  ensureSession: () => Promise<Models.User<Models.Preferences> | null>;
  convertSession: (email: string, password: string, name?: string) => Promise<Models.User<Models.Preferences>>;
}

// Create a context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAnonymous: false,
  profilePicture: null,
  setUser: () => {},
  setIsAnonymous: () => {},
  setProfilePicture: () => {},
  refreshUser: async () => null,
  signOut: async () => false,
  initiateGitHubLogin: async () => {},
  initiateGoogleLogin: async () => {},
  ensureSession: async () => null,
  // Provide a default implementation that matches the type, e.g., throw an error
  convertSession: async () => { throw new Error('convertSession not implemented in default context'); },
});

// Provider component that wraps the app
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const refreshUser = useCallback(async (): Promise<Models.User<Models.Preferences> | null> => {
    console.log("AuthContext: refreshUser called");
    setIsLoading(true);
    try {
      const currentUser = await account.get();
      console.log("AuthContext: account.get() successful. Raw currentUser:", JSON.stringify(currentUser, null, 2));
      
      setUser(currentUser);
      setIsAnonymous(false);
      
      console.log(`AuthContext: User Name from currentUser: ${currentUser.name}`);
      console.log(`AuthContext: User Email from currentUser: ${currentUser.email}`);
      console.log("AuthContext: User Preferences from currentUser:", currentUser.prefs);

      try {
        const currentSession = await account.getSession('current');
        console.log("AuthContext: account.getSession('current') successful. Raw currentSession:", JSON.stringify(currentSession, null, 2));
        if (currentSession.provider) {
          console.log(`AuthContext: OAuth session detected. Provider: ${currentSession.provider}, Provider UID: ${currentSession.providerUid}`);
          console.log(`AuthContext: Provider Access Token (first 15 chars): ${currentSession.providerAccessToken?.substring(0, 15)}...`);
          console.log(`AuthContext: Provider Access Token Expiry: ${currentSession.providerAccessTokenExpiry ? new Date(currentSession.providerAccessTokenExpiry) : 'N/A'}`);
          if (!currentUser.name && currentSession.provider) {
            console.warn("AuthContext: OAuth user has no name. Check scopes and Appwrite provider attribute settings.");
          }
          if (!currentUser.email && currentSession.provider) {
            console.warn("AuthContext: OAuth user has no email. Check scopes and Appwrite provider attribute settings.");
          }
        }
      } catch (sessionError) {
        console.warn("AuthContext: Could not retrieve current session details:", sessionError);
      }

      if (currentUser.prefs && currentUser.prefs.profilePictureUrl) {
        setProfilePicture(currentUser.prefs.profilePictureUrl as string);
        console.log("AuthContext: Profile picture URL found in prefs:", currentUser.prefs.profilePictureUrl);
      } else {
        setProfilePicture(null);
        console.log("AuthContext: No profile picture URL in prefs.");
      }
      return currentUser;
    } catch (error) {
      console.warn('AuthContext: Error in refreshUser (likely no active session or session expired):', error);
      setUser(null);
      setProfilePicture(null);
      setIsAnonymous(true); 
      return null;
    } finally {
      setIsLoading(false);
      console.log("AuthContext: refreshUser finished. Current isLoading state:", false);
    }
  }, [setIsLoading, setUser, setIsAnonymous, setProfilePicture]); // Added setters to dependency array

  const handleSignOut = useCallback(async (): Promise<boolean> => {
    console.log("AuthContext: handleSignOut called");
    setIsLoading(true);
    try {
      await account.deleteSession('current');
      setUser(null);
      setProfilePicture(null);
      setIsAnonymous(true);
      console.log("AuthContext: User signed out.");
      return true;
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
      setUser(null);
      setProfilePicture(null);
      setIsAnonymous(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setUser, setIsAnonymous, setProfilePicture]);

  const ensureSession = useCallback(async () => {
    console.log("AuthContext: ensureSession called. Current user:", user, "isLoading:", isLoading);
    if (!user && !isLoading) {
      return await refreshUser();
    }
    return user;
  }, [user, isLoading, refreshUser]);
  
  useEffect(() => {
    console.log("AuthContext: Initial session check on mount");
    refreshUser();
  }, [refreshUser]);

  const initiateGitHubLogin = useCallback(async () => {
    try {
      await createGitHubOAuthSession();
    } catch (error) {
      console.error('Error starting GitHub login:', error);
      throw error;
    }
  }, []);

  const initiateGoogleLogin = useCallback(async () => {
    try {
      await createGoogleOAuthSession();
    } catch (error) {
      console.error('Error starting Google login:', error);
      throw error;
    }
  }, []);

  const convertSession = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const sessionUser = await apiConvertAnonymousSession(email, password, name ?? '');
      await refreshUser();
      return sessionUser;
    } catch (error) {
      console.error("Error converting anonymous session:", error);
      await refreshUser();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser, setIsLoading]); // Added setIsLoading

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAnonymous,
    profilePicture,
    setUser, 
    setIsAnonymous,
    setProfilePicture,
    refreshUser,
    signOut: handleSignOut,
    initiateGitHubLogin,
    initiateGoogleLogin,
    ensureSession,
    convertSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
