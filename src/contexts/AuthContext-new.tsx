import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Account, Avatars, ID, Models, Storage } from "appwrite";
import { client } from "@/app/appwrite";
import { useToast } from "@/components/ui/use-toast";
import { APP_URL, PROFILE_AVATARS_BUCKET_ID, LEGACY_PROFILE_PICTURES_BUCKET_ID } from "@/lib/env";
import { CustomUser } from "@/types/appwrite";
import { Profile, ProfileType, UserRole } from "@/types";
import profileService from "@/services/profileService";

const emptyUser = {
  $id: "",
  name: "",
  email: "",
  emailVerification: false,
  phoneVerification: false,
  mfa: false,
  labels: [],
};

export interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  customUser: CustomUser | null;
  profile: Profile | null; // Added profile data from ProfilesDB
  profilePictureIsLoading: boolean;
  refreshUser: () => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string, 
    password: string, 
    name: string, 
    username: string,
    profileType?: ProfileType
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  verifyMagicLink: (userId: string, secret: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    userId: string,
    secret: string,
    password: string,
    passwordAgain: string
  ) => Promise<void>;
  loadingnUser: boolean;
}

// Create the context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  customUser: null,
  profile: null, // Added profile
  profilePictureIsLoading: false,
  refreshUser: async () => {},
  uploadImage: async () => {},
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  sendMagicLink: async () => {},
  verifyMagicLink: async () => {},
  sendVerificationEmail: async () => {},
  logout: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  loadingnUser: false,
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const account = new Account(client);
  const avatars = new Avatars(client);
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [customUser, setCustomUser] = useState<CustomUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // Added profile state
  const [loadingnUser, setLoadingnUser] = useState<boolean>(false);
  const [profilePictureIsLoading, setProfilePictureIsLoading] =
    useState<boolean>(false);

  const storage = new Storage(client);
  const { toast } = useToast();

  // Fetch or create user profile
  const fetchOrCreateProfile = async (userData: Models.User<Models.Preferences>) => {
    try {
      // Try to fetch profile by userId
      const userProfile = await profileService.getProfileByUserId(userData.$id);
      
      // If profile exists, set it to state
      if (userProfile) {
        setProfile(userProfile);
        
        // Update customUser with profile info
        setCustomUser((prev) => ({
          ...prev,
          profilePicture: userProfile.avatarFileId 
            ? profileService.getProfileAvatarUrl(userProfile.avatarFileId) 
            : avatars.getInitials(userData.name).toString(),
          profilePicturePreview: userProfile.avatarFileId 
            ? profileService.getProfileAvatarUrl(userProfile.avatarFileId) 
            : avatars.getInitials(userData.name).toString(),
        }) as CustomUser);
        
        return;
      }
      
      // If profile doesn't exist, create one
      const username = userData.email.split('@')[0]; // Default username from email
      const newProfile = await profileService.createProfile({
        userId: userData.$id,
        username: username,
        profileType: 'individual', // Default type
        displayName: userData.name || username,
        roles: ['freelancer'], // Default role
      });
      
      if (newProfile) {
        setProfile(newProfile);
        
        // Update customUser with profile info
        setCustomUser((prev) => ({
          ...prev,
          profilePicture: avatars.getInitials(userData.name).toString(),
          profilePicturePreview: avatars.getInitials(userData.name).toString(),
        }) as CustomUser);
      }
    } catch (error) {
      console.error("Error fetching or creating profile:", error);
    }
  };

  // refreshUser function
  const refreshUser = async () => {
    setLoadingnUser(true);
    try {
      const data = await account.get();
      setUser(data);
      setCustomUser({
        ...data,
        profilePicture: avatars.getInitials(data.name).toString(),
        profilePicturePreview: avatars.getInitials(data.name).toString(),
      });
      
      // Fetch or create user profile
      await fetchOrCreateProfile(data);
      
      // Legacy profile picture handling - keep for backward compatibility
      try {
        const files = await storage.listFiles(PROFILE_AVATARS_BUCKET_ID || LEGACY_PROFILE_PICTURES_BUCKET_ID);

        if (files.total > 0) {
          const pictures = files.files.filter(
            (file) => file.name.split(".")[0] === data.$id
          );
          if (pictures.length > 0) {
            const previewURL = storage.getFilePreview(
              PROFILE_AVATARS_BUCKET_ID || LEGACY_PROFILE_PICTURES_BUCKET_ID,
              pictures[0]?.$id
            );
            setCustomUser((prev) => ({
              ...prev,
              profilePicture: previewURL.href,
              profilePicturePreview: previewURL.href,
            }) as CustomUser);
          }
        }
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      setUser(null);
      setCustomUser(null);
      setProfile(null); // Reset profile on error
    } finally {
      setLoadingnUser(false);
    }
  };

  const uploadImage = async (file: File) => {
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
      // If we have a profile, use the new profileService to update avatar
      if (profile) {
        const result = await profileService.updateProfileAvatar(profile.$id, file);
        if (result.profile && result.fileId) {
          setProfile(result.profile);
          const avatarUrl = profileService.getProfileAvatarUrl(result.fileId);
          setCustomUser((prev) => ({
            ...prev,
            profilePicture: avatarUrl,
            profilePicturePreview: avatarUrl,
          }) as CustomUser);
          toast({
            title: "Success",
            description: "Profile picture updated!",
            variant: "default",
          });
          return;
        }
      }
      
      // Fallback to legacy method if no profile or update failed
      // Delete existing images with user ID as name
      try {
        const files = await storage.listFiles(PROFILE_AVATARS_BUCKET_ID || LEGACY_PROFILE_PICTURES_BUCKET_ID);
        if (files.total > 0) {
          const pictures = files.files.filter(
            (file) => file.name.split(".")[0] === user.$id
          );
          if (pictures.length > 0) {
            await storage.deleteFile(PROFILE_AVATARS_BUCKET_ID || LEGACY_PROFILE_PICTURES_BUCKET_ID, pictures[0].$id);
          }
        }
      } catch (error) {
        console.log(error);
      }

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
      const previewURL = storage.getFilePreview(PROFILE_AVATARS_BUCKET_ID || LEGACY_PROFILE_PICTURES_BUCKET_ID, response.$id);
      setCustomUser((prev) => ({
        ...prev,
        profilePicture: previewURL.href,
        profilePicturePreview: previewURL.href,
      }) as CustomUser);
      toast({
        title: "Success",
        description: "Profile picture updated!",
        variant: "default",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error uploading profile picture!",
        variant: "destructive",
      });
    } finally {
      setProfilePictureIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await account.createSession(email, password);
      await refreshUser();
      router.push("/home");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error logging in!",
        variant: "destructive",
      });
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    username: string,
    profileType: ProfileType = 'individual'
  ) => {
    try {
      const newUser = await account.create(ID.unique(), email, password, name);
      await login(email, password);
      
      // Profile will be created in refreshUser after login
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error registering!",
        variant: "destructive",
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      account.createOAuth2Session(
        "google",
        `${APP_URL}/home`,
        `${APP_URL}/login`
      );
    } catch (error) {
      console.log(error);
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      await account.createMagicURLSession(
        ID.unique(),
        email,
        `${APP_URL}/verify-magic-link`
      );
      toast({
        title: "Success",
        description: "Magic link sent! Please check your email.",
        variant: "default",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error sending magic link!",
        variant: "destructive",
      });
    }
  };

  const verifyMagicLink = async (userId: string, secret: string) => {
    try {
      await account.updateMagicURLSession(userId, secret);
      await refreshUser();
      router.push("/home");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error verifying magic link!",
        variant: "destructive",
      });
    }
  };

  const sendVerificationEmail = async () => {
    try {
      await account.createVerification(`${APP_URL}/verify-email`);
      toast({
        title: "Success",
        description: "Verification email sent! Please check your email.",
        variant: "default",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error sending verification email!",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setCustomUser(null);
      setProfile(null); // Reset profile on logout
      router.push("/signin");
    } catch (error) {
      console.log(error);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await account.createRecovery(email, `${APP_URL}/reset-password`);
      toast({
        title: "Success",
        description: "Password reset email sent! Please check your email.",
        variant: "default",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error sending password reset email!",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (
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
      await account.updateRecovery(userId, secret, password, passwordAgain);
      toast({
        title: "Success",
        description: "Password reset successfully!",
        variant: "default",
      });
      router.push("/signin");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error resetting password!",
        variant: "destructive",
      });
    }
  };

  // For MFA login if needed
  const completeMFALogin = async (code: string) => {
    try {
      await account.updateMFA(code);
      await refreshUser();
      router.push("/home");
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Error completing MFA login!",
        variant: "destructive",
      });
    }
  };

  // Check if the user is already logged in
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        customUser,
        profile, // Added profile
        profilePictureIsLoading,
        refreshUser,
        uploadImage,
        login,
        register,
        loginWithGoogle,
        sendMagicLink,
        verifyMagicLink,
        sendVerificationEmail,
        logout,
        forgotPassword,
        resetPassword,
        loadingnUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);