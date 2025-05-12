'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Models } from 'appwrite'; // Ensure Models is imported for User type
import { account, getUserProfile, signUp, convertAnonymousSession as apiConvertAnonymousSession, signOut as apiSignOut, getCurrentSession, createGitHubOAuthSession, createGoogleOAuthSession } from '@/utils/api';
// Assuming ensureGuestSession and checkIsAnonymous are correctly defined elsewhere
// import { ensureGuestSession, checkIsAnonymous } from '../utils/guestSession';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  isAnonymous: boolean;
  profilePicture: string | null;
  setUser: (user: Models.User<Models.Preferences> | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setProfilePicture: (url: string | null) => void;
  refreshUser: () => Promise<Models.User<Models.Preferences> | null>;
  signOut: () => Promise<boolean>;
  initiateGitHubLogin: () => Promise<void>;
  initiateGoogleLogin: () => Promise<void>;
  ensureSession: () => Promise<Models.User<Models.Preferences> | null>;
  convertSession: (email: string, password: string, name?: string) => Promise<Models.User<Models.Preferences>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const refreshUser = useCallback(async (): Promise<Models.User<Models.Preferences> | null> => {
    console.log("AuthContext: refreshUser called");
    setIsLoading(true);
    try {
      // account.get() fetches the current logged-in user's data.
      // If no session exists, it throws an error.
      const currentUser = await account.get(); 
      console.log("AuthContext: account.get() successful", currentUser);
      setUser(currentUser);
      setIsAnonymous(false);
      // Example: Extract profile picture from preferences if stored there
      if (currentUser.prefs && currentUser.prefs.profilePictureUrl) {
        setProfilePicture(currentUser.prefs.profilePictureUrl as string);
      } else {
        // Potentially fetch avatar using avatars.getInitials() or similar if no custom pic
        setProfilePicture(null); // Or a default avatar
      }
      return currentUser;
    } catch (error) {
      // This error typically means no active session (401)
      console.warn('AuthContext: Error refreshing user session (likely no session or expired):', error);
      setUser(null);
      setProfilePicture(null);
      // Check if it should be an anonymous session
      // const anonymousState = await checkIsAnonymous();
      // setIsAnonymous(anonymousState);
      // if (anonymousState) {
      //   await ensureGuestSession(); // Ensure guest session is active if user is anonymous
      // }
      setIsAnonymous(true); // Default to anonymous on error for now
      return null;
    } finally {
      setIsLoading(false);
      console.log("AuthContext: refreshUser finished, isLoading:", false);
    }
  }, []); // Removed dependencies that might cause issues, will be stable due to definition order

  const handleSignOut = useCallback(async () => {
    console.log("AuthContext: handleSignOut called");
    setIsLoading(true);
    try {
      await apiSignOut();
      setUser(null);
      setProfilePicture(null);
      setIsAnonymous(true); // After sign out, user becomes anonymous
      // await ensureGuestSession(); // Establish a new guest session
      console.log("AuthContext: User signed out.");
      return true;
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
      // Even on error, try to clear local state
      setUser(null);
      setProfilePicture(null);
      setIsAnonymous(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ensureSession = useCallback(async () => {
    console.log("AuthContext: ensureSession called");
    if (!user && !isLoading) { // Only refresh if no user and not already loading
      console.log("AuthContext: No user and not loading, calling refreshUser from ensureSession");
      return await refreshUser();
    }
    console.log("AuthContext: User exists or already loading, skipping refreshUser from ensureSession. User:", user, "Loading:", isLoading);
    return user;
  }, [user, isLoading, refreshUser]);
  
  useEffect(() => {
    console.log("AuthContext: Initial session check on mount (calling refreshUser)");
    refreshUser();
  }, [refreshUser]); // refreshUser is stable due to its own useCallback with empty deps

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
      // apiConvertAnonymousSession expects name to be string, provide empty if undefined
      const session = await apiConvertAnonymousSession(email, password, name ?? '');
      await refreshUser(); // Refresh user data after conversion
      return session;
    } catch (error) {
      console.error("Error converting anonymous session:", error);
      await refreshUser(); // Also refresh user on error to reset state if needed
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAnonymous,
    profilePicture,
    setUser, // Exposing setUser for direct manipulation by callback page
    setIsLoading, // Exposing setIsLoading for direct manipulation by callback page
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
