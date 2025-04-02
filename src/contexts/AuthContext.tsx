'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { account, validateSession, createGitHubOAuthSession, handleGitHubOAuthCallback, getUserProfile } from '@/utils/api';
import { ensureGuestSession, isAnonymousUser } from '@/utils/guestSession';

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
  user: User | null;
  isLoading: boolean;
  isAnonymous: boolean;
  profilePicture: string | null;
  setUser: (user: User | null) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setProfilePicture: (url: string | null) => void;
  refreshUser: () => Promise<User | null>;
  signOut: () => Promise<boolean>;
  handleGitHubOAuth: (code?: string) => Promise<User | null>;
  initiateGitHubLogin: () => Promise<void>;
  ensureSession: () => Promise<User | null>;
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
});

// Provider component that wraps the app
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Function to refresh the user data from Appwrite
  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      setIsAnonymous(isAnonymousUser(currentUser));
      return currentUser;
    } catch (error) {
      console.log('No active session found during refresh');
      setUser(null);
      setIsAnonymous(false);
      return null;
    }
  }, []);

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
  const handleGitHubOAuth = useCallback(async (code?: string): Promise<User | null> => {
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

  // Function to ensure user has a valid session (anonymous if needed)
  const ensureSession = useCallback(async (): Promise<User | null> => {
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
      console.log('No authenticated session found, creating anonymous session...');
      
      // Create anonymous session if no existing session
      try {
        const guestUser = await ensureGuestSession();
        if (guestUser) {
          setUser(guestUser);
          setIsAnonymous(true);
          return guestUser;
        }
      } catch (anonError) {
        console.error('Failed to create anonymous session:', anonError);
      }
      
      setUser(null);
      setIsAnonymous(false);
      return null;
    }
  }, []);

  // Effect to check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // First, try to validate existing session
        const isValid = await validateSession();
        
        if (isValid) {
          const currentUser = await refreshUser();
          
          // If we have a valid user that's not anonymous, ensure their profile exists
          if (currentUser && !isAnonymousUser(currentUser)) {
            try {
              const userProfile = await getUserProfile(currentUser.$id);
              if (userProfile?.profilePicture) {
                setProfilePicture(userProfile.profilePicture);
              }
            } catch (profileError) {
              console.error('Error fetching profile during init:', profileError);
            }
          }
        } else {
          // If no valid session, create anonymous session
          await ensureSession();
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshUser, ensureSession]);

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
    ensureSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
