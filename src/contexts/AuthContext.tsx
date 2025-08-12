'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  Account,
  Avatars,
  Models,
  Storage,
} from 'appwrite';
import { useRouter } from 'next/navigation';

import { client } from '@/app/appwrite';
import { useToast } from '@/components/ui/use-toast';
import { envConfig } from '@/config/environment';
import {
  APP_URL,
  PROFILE_AVATARS_BUCKET_ID,
} from '@/lib/env';
import { AppwriteService } from '@/services/appwriteService';
import ProfileService from '@/services/profileService';
import {
  account,
  createGitHubOAuthSession,
  createGoogleOAuthSession,
  getUserProfile,
} from '@/utils/api';
import {
  isAnonymousUser,
} from '@/utils/guestSession'; // Use relative path for guestSession import

const appwriteService = new AppwriteService(envConfig);
const profileService = new ProfileService(appwriteService, envConfig);

// Define UserProfile interface based on the ProfilesDB/user_profiles schema
interface UserProfile {
  $id: string;
  userId: string;
  name: string;
  username?: string;
  email?: string;
  bio?: string;
  tagline?: string;
  location?: string;
  skills?: string[];
  profileType?: 'individual' | 'company' | 'dao'; 
  avatarFileId?: string;
  coverImageFileId?: string;
  isVerified?: boolean;
  verificationLevel?: string;
  portfolioLink?: string;
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    [key: string]: string | undefined;
  };
  reputation?: number;
  wallets?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // For backward compatibility with existing fields
}

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
  userProfile: UserProfile | null; // Add userProfile to context
  profilePictureIsLoading?: boolean;
  setUser: (user: Models.User<Models.Preferences> | null) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setProfilePicture: (url: string | null) => void;
  setUserProfile: (profile: UserProfile | null) => void; // Add profile setter
  refreshUser: () => Promise<Models.User<Models.Preferences> | null>;
  refreshUserProfile: () => Promise<UserProfile | null>; // Add profile refresh function
  signOut: () => Promise<boolean>;
  initiateGitHubLogin: () => Promise<void>;
  initiateGoogleLogin: () => Promise<void>;
  ensureSession: () => Promise<Models.User<Models.Preferences> | null>;
  convertSession: (email: string, password: string, name?: string) => Promise<Models.User<Models.Preferences>>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  // New methods from AuthContext
  uploadImage?: (file: File) => Promise<void>;
  login?: (email: string, password: string) => Promise<void>;
  register?: (email: string, password: string, name: string, username: string, profileType?: string) => Promise<void>;
  sendMagicLink?: (email: string) => Promise<void>;
  verifyMagicLink?: (userId: string, secret: string) => Promise<void>;
  sendVerificationEmail?: () => Promise<void>;
  forgotPassword?: (email: string) => Promise<void>;
  resetPassword?: (userId: string, secret: string, password: string, passwordAgain: string) => Promise<void>;
}

// Create a context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAnonymous: false,
  profilePicture: null,
  userProfile: null,
  setUser: () => {},
  setIsAnonymous: () => {},
  setProfilePicture: () => {},
  setUserProfile: () => {},
  refreshUser: async () => null,
  refreshUserProfile: async () => null,
  signOut: async () => false,
  initiateGitHubLogin: async () => {},
  initiateGoogleLogin: async () => {},
  ensureSession: async () => null,
  convertSession: async () => { throw new Error('convertSession not implemented in default context'); },
  updatePassword: async () => false,
  // New methods from AuthContext
  uploadImage: async () => {},
  login: async () => {},
  register: async () => {},
  sendMagicLink: async () => {},
  verifyMagicLink: async () => {},
  sendVerificationEmail: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
});

// Provider component that wraps the app
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false); // Initial state can be false, refreshUser will set it.
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profilePictureIsLoading, setProfilePictureIsLoading] = useState<boolean>(false);
  
  const router = useRouter();
  const storage = new Storage(client);
  const avatars = new Avatars(client);
  const { toast } = useToast();

  const refreshUser = useCallback(async (): Promise<Models.User<Models.Preferences> | null> => {
    console.log("AuthContext: refreshUser called");
    setIsLoading(true);
    try {
      const currentUser = await account.get();
      console.log("AuthContext: account.get() successful. Raw currentUser:", JSON.stringify(currentUser, null, 2));
      
      setUser(currentUser);
      // Ensure isAnonymous is correctly set based on the currentUser object
      setIsAnonymous(isAnonymousUser(currentUser)); 
      
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
      
      // Fetch user profile after getting the current user
      await refreshUserProfile();
      
      return currentUser;
    } catch (error) {
      console.warn('AuthContext: Error in refreshUser (likely no active session or session expired):', error);
      setUser(null);
      setProfilePicture(null);
      setUserProfile(null);
      // Ensure isAnonymous is true if account.get() fails
      setIsAnonymous(true); 
      return null;
    } finally {
      setIsLoading(false);
      console.log("AuthContext: refreshUser finished. Current isLoading state:", false);
    }
  }, []);
  
  const refreshUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) {
      setUserProfile(null);
      return null;
    }
    
    try {
      // First try to get profile using the profileService
      let profile = await profileService.getProfileByUserId(user.$id);
      
      // If profile doesn't exist, try the legacy method
      if (!profile) {
        profile = await getUserProfile(user.$id) as unknown as UserProfile;
      }
      
      // If we still don't have a profile, create one
      if (!profile) {
        const username = user.email?.split('@')[0] || user.$id;
        profile = await profileService.createProfile({
          userId: user.$id,
          username: username,
          profileType: 'individual',
          displayName: user.name || username,
          roles: ['freelancer'],
        });
      }
      
      if (profile) {
        setUserProfile(profile as UserProfile);
        
        // Update profile picture if avatarFileId is available
        if (profile.avatarFileId) {
          const avatarUrl = profileService.getProfileAvatarUrl(profile.avatarFileId);
          setProfilePicture(avatarUrl);
        }
        
        return profile as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, [user]);

  const handleSignOut = useCallback(async (): Promise<boolean> => {
    console.log("AuthContext: handleSignOut called");
    setIsLoading(true);
    try {
      await account.deleteSession('current');
      setUser(null);
      setProfilePicture(null);
      setUserProfile(null);
      setIsAnonymous(true);
      console.log("AuthContext: User signed out.");
      router.push("/signin");
      return true;
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
      setUser(null);
      setProfilePicture(null);
      setUserProfile(null);
      setIsAnonymous(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await account.updatePassword(newPassword, currentPassword);
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  }, []);

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
  }, [refreshUser]);

  // Upload profile image
  const uploadImage = useCallback(async (file: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload an image",
        variant: "destructive",
      });
      return;
    }

    setProfilePictureIsLoading(true);
    
    try {
      // For profile service integration
      if (userProfile && userProfile.$id) {
        const formData = new FormData();
        formData.append('avatar', file);
        
        // Call the profile service to upload avatar
        const updatedProfile = await fetch(`/api/profile/avatar/${userProfile.$id}`, {
          method: 'POST',
          body: formData,
        });
        
        if (!updatedProfile.ok) {
          throw new Error('Failed to upload profile picture');
        }
        
        // Refresh the user profile to get the updated avatar
        await refreshUserProfile();
        
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
      } else {
        // Legacy storage upload
        if (PROFILE_AVATARS_BUCKET_ID) {
          // Check if user already has a picture and delete it
          const { files } = await storage.listFiles(PROFILE_AVATARS_BUCKET_ID);
          const pictures = files.filter(f => f.name === `profile-${user.$id}`);
          
          if (pictures.length > 0) {
            await storage.deleteFile(PROFILE_AVATARS_BUCKET_ID, pictures[0].$id);
          }
          
          // Upload the new picture
          const response = await storage.createFile(
            PROFILE_AVATARS_BUCKET_ID,
            'unique()',
            file,
            [`user:${user.$id}`]
          );
          
          // Get the file view URL
          const previewURL = storage.getFileView(PROFILE_AVATARS_BUCKET_ID, response.$id);
          
          // Update profile picture state
          setProfilePicture(previewURL);
          
          toast({
            title: "Success",
            description: "Profile picture updated successfully",
          });
        } else {
          throw new Error('Storage bucket not configured');
        }
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setProfilePictureIsLoading(false);
    }
  }, [user, userProfile, storage, toast, refreshUserProfile]);
  
  // Email and password login
  const login = useCallback(async (email: string, password: string) => {
    try {
      // Create email session
      const account = new Account(client);
      await account.createSession(email, password);
      
      // Refresh user data
      await refreshUser();
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      // Navigate to dashboard
      router.push('/home');
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
    }
  }, [refreshUser, router, toast]);

  // Registration
  const register = useCallback(async (
    email: string, 
    password: string, 
    name: string, 
    username: string,
    profileType: string = 'individual'
  ) => {
    try {
      // Create user account
      const account = new Account(client);
      await account.create('unique()', email, password, name);
      
      // Log in the user
      await account.createSession(email, password);
      
      // Refresh user data
      const userData = await refreshUser();
      
      if (userData && userData.$id) {
        // Create user profile
        try {
          await fetch('/api/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username,
              profileType,
              displayName: name,
            }),
          });
        } catch (profileError) {
          console.error("Error creating profile:", profileError);
        }
      }
      
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      
      // Navigate to dashboard
      router.push('/home');
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    }
  }, [refreshUser, router, toast]);

  // Magic link authentication
  const sendMagicLink = useCallback(async (email: string) => {
    try {
      const account = new Account(client);
      const baseUrl = APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      await account.createMagicURLSession('unique()', email, `${baseUrl}/verify-magic-link`);
      toast({
        title: "Success",
        description: "Magic link sent to your email",
      });
    } catch (error) {
      console.error("Magic link error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send magic link",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Verify magic link
  const verifyMagicLink = useCallback(async (userId: string, secret: string) => {
    try {
      const account = new Account(client);
      await account.updateMagicURLSession(userId, secret);
      
      // Refresh user data
      await refreshUser();
      
      toast({
        title: "Success",
        description: "Authentication successful",
      });
      
      // Navigate to dashboard
      router.push('/home');
    } catch (error) {
      console.error("Magic link verification error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify magic link",
        variant: "destructive",
      });
      
      // Navigate to login page
      router.push('/signin');
    }
  }, [refreshUser, router, toast]);

  // Send verification email
  const sendVerificationEmail = useCallback(async () => {
    try {
      const account = new Account(client);
      const baseUrl = APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      await account.createVerification(`${baseUrl}/verify-email`);
      
      toast({
        title: "Success",
        description: "Verification email sent",
      });
    } catch (error) {
      console.error("Verification email error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification email",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Forgot password
  const forgotPassword = useCallback(async (email: string) => {
    try {
      const account = new Account(client);
      const baseUrl = APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      await account.createRecovery(email, `${baseUrl}/reset-password`);
      
      toast({
        title: "Success",
        description: "Password reset link sent to your email",
      });
    } catch (error) {
      console.error("Password recovery error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send recovery email",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Reset password
  const resetPassword = useCallback(async (
    userId: string,
    secret: string,
    password: string,
    passwordAgain: string
  ) => {
    if (password !== passwordAgain) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const account = new Account(client);
      await account.updateRecovery(userId, secret, password, passwordAgain);
      
      toast({
        title: "Success",
        description: "Password has been reset successfully",
      });
      
      // Navigate to login page
      router.push('/signin');
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    }
  }, [router, toast]);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAnonymous,
    profilePicture,
    userProfile,
    setUser, 
    setIsAnonymous,
    setProfilePicture,
    setUserProfile,
    refreshUser,
    refreshUserProfile,
    signOut: handleSignOut,
    initiateGitHubLogin,
    initiateGoogleLogin,
    ensureSession,
    convertSession,
    updatePassword,
    uploadImage,
    login,
    register,
    sendMagicLink,
    verifyMagicLink,
    sendVerificationEmail,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
