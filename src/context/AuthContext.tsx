import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '@/app/api';
import { Models } from 'appwrite';
import profileService from '@/services/profileService';
import { Profile } from '@/types';

interface User {
  $id: string;
  name?: string;
  email: string;
  userId: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const currentUser = await account.get();
        if (currentUser) {
          // Add userId to user object for easier access
          const userWithId = { ...currentUser, userId: currentUser.$id };
          setUser(userWithId);
          setIsLoggedIn(true);
          
          // Get user profile
          try {
            const userProfile = await profileService.getProfileByUserId(currentUser.$id);
            setProfile(userProfile);
            
            // If no profile exists, create one
            if (!userProfile) {
              const newProfile = await profileService.createProfile({
                userId: currentUser.$id,
                displayName: currentUser.name || 'New User',
                username: currentUser.name?.toLowerCase().replace(/\s+/g, '') || `user${Math.floor(Math.random() * 10000)}`,
              });
              setProfile(newProfile);
            }
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
          }
        }
      } catch (err) {
        // No active session, user is not logged in
        console.log('No active session');
        setUser(null);
        setProfile(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await account.createSession(email, password);
      const currentUser = await account.get();
      
      // Add userId to user object for easier access
      const userWithId = { ...currentUser, userId: currentUser.$id };
      setUser(userWithId);
      setIsLoggedIn(true);
      
      // Get user profile
      const userProfile = await profileService.getProfileByUserId(currentUser.$id);
      setProfile(userProfile);
      
      // If no profile exists, create one
      if (!userProfile) {
        const newProfile = await profileService.createProfile({
          userId: currentUser.$id,
          displayName: currentUser.name || 'New User',
          username: currentUser.name?.toLowerCase().replace(/\s+/g, '') || `user${Math.floor(Math.random() * 10000)}`,
        });
        setProfile(newProfile);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create user account
      const newUser = await account.create('unique()', email, password, name);
      
      // Login the user after registration
      await account.createSession(email, password);
      const currentUser = await account.get();
      
      // Add userId to user object for easier access
      const userWithId = { ...currentUser, userId: currentUser.$id };
      setUser(userWithId);
      setIsLoggedIn(true);
      
      // Create user profile
      const newProfile = await profileService.createProfile({
        userId: currentUser.$id,
        displayName: name,
        username: name.toLowerCase().replace(/\s+/g, '') || `user${Math.floor(Math.random() * 10000)}`,
      });
      
      setProfile(newProfile);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await account.deleteSession('current');
      setUser(null);
      setProfile(null);
      setIsLoggedIn(false);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        error,
        login,
        register,
        logout,
        isLoggedIn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;