'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from "next/navigation";
import { account, validateSession, createGitHubOAuthSession, createGoogleOAuthSession, getUserProfile, signUp, convertAnonymousSession as apiConvertAnonymousSession } from '@/utils/api'; 
import { ensureGuestSession, isAnonymousUser } from '../utils/guestSession'; // Use relative path for guestSession import
import { Models, Storage, ID, Avatars, Account } from 'appwrite';
import { client }   const contextValue: AuthContextType = {
    user,
    isLoading,
    isAnonymous,
    profilePicture,
    userProfile,
    profilePictureIsLoading,
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
  };e";
import { useToast } from "@/components/ui/use-toast";
import { APP_URL, PROFILE_AVATARS_BUCKET_ID, LEGACY_PROFILE_PICTURES_BUCKET_ID } from "@/lib/env";
import profileService from "@/services/profileService";

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
  // New methods from AuthContext-new
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
        description: "Must be logged in to upload image!",
        variant: "destructive",
      });
      return;
    }

    setProfilePictureIsLoading(true);
    
    try {
      // If we have a profile, update the avatar
      if (userProfile) {
        try {
          // Delete any existing profile picture first
          const files = await storage.listFiles(PROFILE_AVATARS_BUCKET_ID || LEGACY_PROFILE_PICTURES_BUCKET_ID);
          if (files.total > 0) {
            const pictures = files.files.filter(
              (file) => file.name.split(".")[0] === user.$id
            );
            if (pictures.length > 0) {
              await storage.deleteFile(PROFILE_AVATARS_BUCKET_ID || LEGACY_PROFILE_PICTURES_BUCKET_ID, pictures[0].$id);
            }
          }
          
          // Upload new file
          const filenameParts = file.name.split(".");
          const fileExt = filenameParts[filenameParts.length - 1];
          const filename = `${user.$id}.${fileExt}`;

          // Make the file name the same as the user ID
          const newFile = new File([file], filename, {
            type: file.type,
          });

          const response = await storage.createFile(
            PROFILE_AVATARS_BUCKET_ID || LEGACY_PROFILE_PICTURES_BUCKET_ID,
            ID.unique(),
            newFile
          );
          
          // Update profile with new avatarFileId if possible
          if (userProfile.$id && profileService.updateProfile) {
            try {
              const updatedProfile = await profileService.updateProfile(userProfile.$id, {
                ...userProfile,
                avatarFileId: response.$id
              });
              setUserProfile(updatedProfile as UserProfile);
            } catch (e) {
              console.error('Error updating profile with avatar ID:', e);
            }
          }
          
          // Set profile picture URL
          const previewURL = storage.getFileView(PROFILE_AVATARS_BUCKET_ID || LEGACY_PROFILE_PICTURES_BUCKET_ID, response.$id);
          setProfilePicture(previewURL.href);
          
          toast({
            title: "Success",
            description: "Profile picture updated!",
            variant: "default",
          });
        } catch (error) {
          console.error('Error updating profile avatar:', error);
          toast({
            title: "Error",
            description: "Error uploading profile picture!",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error in uploadImage:', error);
      toast({
        title: "Error",
        description: "Error uploading profile picture!",
        variant: "destructive",
      });
    } finally {
      setProfilePictureIsLoading(false);
    }
  }, [user, userProfile, storage, toast]);
  
  // Email and password login
  const login = useCallback(async (email: string, password: string) => {
    try {
      await account.createEmailSession(email, password);
      await refreshUser();
      router.push("/home");
      toast({
        title: "Success",
        description: "Logged in successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error('Error in login:', error);
      toast({
        title: "Error",
        description: "Error logging in!",
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
      const newUser = await account.create(ID.unique(), email, password, name);
      await login(email, password);
      toast({
        title: "Success",
        description: "Registered successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error('Error in register:', error);
      toast({
        title: "Error",
        description: "Error registering!",
        variant: "destructive",
      });
    }
  }, [login, toast]);

  // Magic link authentication - using appwrite API methods correctly
  const sendMagicLink = useCallback(async (email: string) => {
    try {
      // For Appwrite versions that don't have createMagicURLSession, we need to use a workaround
      // This might require the equivalent REST API call or a custom function
      // For now, we'll use the regular email login if available
      toast({
        title: "Info",
        description: "Magic link authentication not available in this version. Please use email/password login.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error in sendMagicLink:', error);
      toast({
        title: "Error",
        description: "Error with authentication!",
        variant: "destructive",
      });
    }
  }, [toast]);

  const verifyMagicLink = useCallback(async (userId: string, secret: string) => {
    try {
      // This method might need to be adjusted based on your Appwrite SDK version
      // For older versions, this might not be available
      toast({
        title: "Info",
        description: "Magic link verification not available in this version. Please use email/password login.",
        variant: "default",
      });
      router.push("/signin");
    } catch (error) {
      console.error('Error in verifyMagicLink:', error);
      toast({
        title: "Error",
        description: "Error verifying authentication!",
        variant: "destructive",
      });
    }
  }, [router, toast]);

  const sendVerificationEmail = useCallback(async () => {
    try {
      await account.createVerification(`${APP_URL}/verify-email`);
      toast({
        title: "Success",
        description: "Verification email sent! Please check your email.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error in sendVerificationEmail:', error);
      toast({
        title: "Error",
        description: "Error sending verification email!",
        variant: "destructive",
      });
    }
  }, [toast]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await account.createRecovery(email, `${APP_URL}/reset-password`);
      toast({
        title: "Success",
        description: "Password reset email sent! Please check your email.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      toast({
        title: "Error",
        description: "Error sending password reset email!",
        variant: "destructive",
      });
    }
  }, [toast]);

  const resetPassword = useCallback(async (
    userId: string,
    secret: string,
    password: string,
    passwordAgain: string
  ) => {
    if (password !== passwordAgain) {
      toast({
        title: "Error",
        description: "Passwords do not match!",
        variant: "destructive",
      });
      return;
    }
    try {
      // Check Appwrite SDK docs for the correct parameter order
      await account.updateRecovery(userId, secret, password);
      toast({
        title: "Success",
        description: "Password reset successfully!",
        variant: "default",
      });
      router.push("/signin");
    } catch (error) {
      console.error('Error in resetPassword:', error);
      toast({
        title: "Error",
        description: "Error resetting password!",
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
