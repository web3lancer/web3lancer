import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ServiceFactory from '@/services/serviceFactory';
import ProfileService from '@/services/profileService';
import { Models } from 'appwrite';
import { UserProfile } from '@/types/profiles';
import { useRouter } from 'next/router';
import { defaultEnvConfig } from '@/config/environment';

// Define the context shape
interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

// Provider component that wraps the app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  
  // Get services from the factory
  const serviceFactory = ServiceFactory.getInstance();
  const appwriteService = serviceFactory.getAppwriteService();
  const profileService = new ProfileService(appwriteService, defaultEnvConfig);
  
  // Helper method to set user and get their profile
  const initializeUserAndProfile = async (newUser: Models.User<Models.Preferences>) => {
    setUser(newUser);
    
    try {
      // Fetch the user's profile
      const userProfile = await profileService.getProfileByUserId(newUser.$id);
      
      if (!userProfile) {
        // If profile doesn't exist, create a new one
        const newProfile = await profileService.createProfile({
          userId: newUser.$id,
          username: newUser.name || `user${Math.floor(Math.random() * 10000)}`,
          fullName: newUser.name || '',
          email: newUser.email,
          isFreelancer: false,
          isEmployer: false,
          skills: [],
          onboardingCompleted: false
        });
        setProfile(newProfile);
      } else {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile');
    }
  };

  // Effect to check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const currentUser = await appwriteService.getCurrentUser();
        await initializeUserAndProfile(currentUser);
      } catch (error) {
        setUser(null);
        setProfile(null);
        console.log('No active session found');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login method
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await appwriteService.createEmailSession(email, password);
      const currentUser = await appwriteService.getCurrentUser();
      await initializeUserAndProfile(currentUser);
      router.push('/home');
    } catch (error: any) {
      setError(error.message || 'Failed to login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register method
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newUser = await appwriteService.createAccount(email, password, name);
      await appwriteService.createEmailSession(email, password);
      await initializeUserAndProfile(newUser);
      router.push('/onboarding');
    } catch (error: any) {
      setError(error.message || 'Failed to register');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout method
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await appwriteService.deleteSessions();
      setUser(null);
      setProfile(null);
      
      // Reset all services to ensure clean state
      serviceFactory.resetServices();
      
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'Failed to logout');
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Method to refresh user data
  const refreshUser = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const currentUser = await appwriteService.getCurrentUser();
      
      // Fetch the latest profile
      const userProfile = await profileService.getProfileByUserId(currentUser.$id);
      
      setUser(currentUser);
      setProfile(userProfile);
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      // If session expired, logout
      if (error.code === 401) {
        await logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare the value object with all context properties and methods
  const value = {
    user,
    profile,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuthContext = () => useContext(AuthContext);