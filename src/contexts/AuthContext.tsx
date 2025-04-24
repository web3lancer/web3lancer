'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { account, validateSession, createGitHubOAuthSession, handleGitHubOAuthCallback, getUserProfile, signUp, convertAnonymousSession as apiConvertAnonymousSession } from '@/utils/api'; // Renamed convertAnonymousSession to avoid conflict
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
  handleGitHubOAuth: (code?: string) => Promise<Models.User<Models.Preferences> | null>;
  initiateGitHubLogin: () => Promise<void>;
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
  handleGitHubOAuth: async () => null,
  initiateGitHubLogin: async () => {},
  ensureSession: async () => null,
  convertSession: async () => null,
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
    setIsLoading(true);
    try {
      const currentUser = await account.get();
      const anonymousStatus = isAnonymousUser(currentUser);
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
      console.log('No active session found during refresh.');
      // Attempt to ensure an anonymous session exists if refresh fails
      return await ensureSession();
    } finally {
      setIsLoading(false);
    }
  }, [ensureSession]);

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
  
  // Function to handle GitHub OAuth callback
  const handleGitHubOAuth = useCallback(async (code?: string): Promise<Models.User<Models.Preferences> | null> => {
    try {
      setIsLoading(true);
      
      console.log('Handling GitHub OAuth callback, code present:', !!code);
      
      // If we have a code, we need to process it manually
      // Otherwise we rely on Appwrite's automatic session handling
      let currentUser;
      
      try {
        if (code) {
          // For manual handling - this is generally not needed with Appwrite
          console.log('Using manual code handling');
          currentUser = await handleGitHubOAuthCallback(code);
        } else {
          // Get current user after OAuth redirect
          console.log('Using automatic session handling');
          currentUser = await account.get();
        }
        
        if (currentUser) {
          console.log('GitHub authentication successful:', currentUser);
          
          // Important: Properly identify if this is an anonymous user
          const anonymousStatus = isAnonymousUser(currentUser);
          console.log('User anonymous status:', anonymousStatus);
          
          setUser(currentUser);
          setIsAnonymous(anonymousStatus);
          
          // Ensure user has a profile in the database
          try {
            // This will create a profile if it doesn't exist
            const userProfile = await getUserProfile(currentUser.$id);
            console.log('User profile after GitHub login:', userProfile);
            
            // Update profile picture if available
            if (userProfile?.profilePicture) {
              setProfilePicture(userProfile.profilePicture);
            }
          } catch (profileError) {
            console.error('Error ensuring user profile exists:', profileError);
            // Continue even if profile creation fails, we'll retry later
          }
          
          return currentUser;
        } else {
          console.error('GitHub authentication failed: No user returned');
          return null;
        }
      } catch (authError) {
        console.error('Error during GitHub authentication:', authError);
        return null;
      }
    } catch (error) {
      console.error('Error handling GitHub OAuth:', error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
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
    // Use the function imported from guestSession.ts
    const updatedUser = await apiConvertAnonymousSession(email, password, name);
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
    handleGitHubOAuth,
    initiateGitHubLogin,
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
