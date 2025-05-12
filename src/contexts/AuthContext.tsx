'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { account, validateSession, createGitHubOAuthSession, createGoogleOAuthSession, handleGitHubOAuthCallback, getUserProfile, signUp, convertAnonymousSession as apiConvertAnonymousSession } from '@/utils/api'; // Renamed convertAnonymousSession to avoid conflict
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
  initiateGoogleLogin: () => Promise<void>; // Add this line
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
  initiateGoogleLogin: async () => {}, // Add this line
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

  // Function to ensure user has a valid session (anonymous if needed)
  const ensureSession = useCallback(async (): Promise<Models.User<Models.Preferences> | null> => {
    setIsLoading(true);
    try {
      // Try to get the current user
      const currentUser = await account.get();
      console.log('Found existing user session:', currentUser);
      const anonymousStatus = isAnonymousUser(currentUser);
      console.log('User anonymous status:', anonymousStatus);
      setUser(currentUser);
      setIsAnonymous(anonymousStatus);
      // If authenticated user, ensure profile exists and load profile picture
      if (!anonymousStatus && currentUser) {
        try {
          const userProfile = await getUserProfile(currentUser.$id);
          if (userProfile?.profilePicture) {
            setProfilePicture(userProfile.profilePicture);
          }
        } catch (profileError) {
          console.error('Error fetching profile during session ensure:', profileError);
        }
      }
      return currentUser;
    } catch (error) {
      console.log('No authenticated session found, attempting to create anonymous session...');
      // Create anonymous session if no existing session
      try {
        const guestUser = await ensureGuestSession();
        if (guestUser) {
          console.log('Created anonymous session:', guestUser);
          setUser(guestUser);
          setIsAnonymous(true);
          return guestUser;
        }
      } catch (anonError) {
        console.error('Failed to create anonymous session:', anonError);
      }
      // If all fails, set user to null
      setUser(null);
      setIsAnonymous(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to refresh the user data from Appwrite
  const refreshUser = useCallback(async (): Promise<Models.User<Models.Preferences> | null> => {
    console.log('Attempting to refresh user session...'); // Added log
    setIsLoading(true);
    try {
      const currentUser = await account.get();
      console.log('Successfully fetched current user:', currentUser); // Added log
      const anonymousStatus = isAnonymousUser(currentUser);
      console.log('User anonymous status:', anonymousStatus); // Added log
      setUser(currentUser);
      setIsAnonymous(anonymousStatus);
      // Load profile picture if authenticated
      if (!anonymousStatus && currentUser) {
        try {
          const userProfile = await getUserProfile(currentUser.$id);
          setProfilePicture(userProfile?.profilePicture || null);
        } catch (profileError) {
          console.error('Error fetching profile during refresh:', profileError);
          setProfilePicture(null);
        }
      } else {
        setProfilePicture(null); // Clear profile picture for anonymous users
      }
      return currentUser;
    } catch (error) {
      console.log('No active session found during refresh. Setting user to null.', error); // Updated log
      // If refresh fails (e.g., after OAuth redirect before session is fully ready, or session expired),
      // set user to null instead of falling back to anonymous session.
      setUser(null);
      setIsAnonymous(false);
      setProfilePicture(null);
      return null; // Indicate failure to refresh to an authenticated state
    } finally {
      setIsLoading(false);
      console.log('refreshUser finished.'); // Added log
    }
  }, []); // Removed ensureSession dependency

  // Function to handle sign out
  const handleSignOut = useCallback(async (): Promise<boolean> => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setIsAnonymous(false);
      return true;
    } catch (error) {
      console.error('Error during sign out:', error);
      return false;
    }
  }, []);
  
  // Function to initiate GitHub OAuth login
  const initiateGitHubLogin = useCallback(async () => {
    try {
      console.log('Initiating GitHub login from AuthContext...');
      await createGitHubOAuthSession(['user:email']);
      // The page will redirect to GitHub login
    } catch (error) {
      console.error('Error starting GitHub login:', error);
      throw error; // Re-throw to allow handling by the calling component
    }
  }, []);

  const initiateGoogleLogin = useCallback(async () => { // Add this function
    try {
      console.log('Initiating Google login from AuthContext...');
      await createGoogleOAuthSession(['email', 'profile']);
      // The page will redirect to Google login
    } catch (error) {
      console.error('Error starting Google login:', error);
      throw error; // Re-throw to allow handling by the calling component
    }
  }, []);
  
  // Effect to check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Use ensureSession which handles both existing and anonymous cases
        await ensureSession();
      } catch (error) {
        console.error('Initialization error:', error);
        setUser(null);
        setIsAnonymous(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [ensureSession]);

  // Expose convertAnonymousSession from guestSession.ts via context
  const convertSession = useCallback(async (email: string, password: string, name?: string): Promise<Models.User<Models.Preferences>> => {
    // Use the function imported from api.ts (assuming it's correctly imported)
    // Provide a default empty string for name if it's undefined
    const updatedUser = await apiConvertAnonymousSession(email, password, name || '');
    // Refresh user state after conversion
    await refreshUser();
    return updatedUser;
  }, [refreshUser]);

  // Wrap state and functions to prevent serialization issues
  const contextValue = {
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
    initiateGoogleLogin, // Add this line
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
