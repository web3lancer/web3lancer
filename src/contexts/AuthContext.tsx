"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { account, databases, ID, Query } from "@/app/appwrite";
import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';

interface User {
  $id: string;
  name?: string;
  email?: string;
  walletId?: string;
  profileImage?: string;
  bio?: string;
  skills?: string[];
  // Add any other user properties
}

interface AuthContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  handleGitHubOAuth: (code: string) => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  isLoading: false,
  isAuthenticated: false,
  signUp: async () => ({ $id: '' }),
  signIn: async () => ({ $id: '' }),
  signOut: async () => {},
  handleGitHubOAuth: async () => {},
  updateUserProfile: async () => ({ $id: '' }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const currentUser = await account.get();
        setUser(currentUser as User);
      } catch (error) {
        console.error('Error checking user session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (address && !user) {
      handleWalletAuth(address);
    }
  }, [address, user]);

  const signUp = async (email: string, password: string, name: string): Promise<User> => {
    setIsLoading(true);
    try {
      await account.create("unique()", email, password, name);
      await account.createEmailSession(email, password);
      const userData = await account.get();
      setUser(userData as User);
      return userData as User;
    } catch (error) {
      console.error('Error during signup:', error);
      throw new Error(`Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      await account.createEmailSession(email, password);
      const userData = await account.get();
      setUser(userData as User);
      return userData as User;
    } catch (error) {
      console.error('Error during signin:', error);
      throw new Error(`Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await account.deleteSession("current");
      setUser(null);
      if (router) {
        router.push('/signin');
      }
    } catch (error) {
      console.error('Error during signout:', error);
      throw new Error(`Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubOAuth = async (code: string) => {
    setIsLoading(true);
    try {
      // Use the appropriate endpoint URLs for your app
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Create OAuth2 session - note that this is a server-side operation in production
      // This is a simplified client-side implementation for development
      await fetch('/api/auth/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      // Get user data after OAuth is complete
      const userData = await account.get();
      setUser(userData as User);
      return userData;
    } catch (error) {
      console.error("Error handling GitHub OAuth:", error);
      throw new Error(`GitHub OAuth failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletAuth = async (walletAddress: string) => {
    setIsLoading(true);
    try {
      // Check if user with this wallet already exists
      const existingUsers = await databases.listDocuments(
        '67b885280000d2cb5411',
        '67b8853c003c55c82ff6',
        [Query.equal('walletId', walletAddress)]
      );

      let userData;
      
      if (existingUsers.documents.length > 0) {
        // User exists, load their data
        userData = existingUsers.documents[0];
      } else {
        // Create new user with wallet
        userData = await databases.createDocument(
          '67b885280000d2cb5411',
          '67b8853c003c55c82ff6',
          ID.unique(),
          {
            walletId: walletAddress,
            createdAt: new Date().toISOString(),
          }
        );
      }
      
      setUser(userData as User);
    } catch (error) {
      console.error("Error handling wallet authentication:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User> => {
    setIsLoading(true);
    try {
      const updatedUser = await databases.updateDocument(
        '67b885280000d2cb5411',
        '67b8853c003c55c82ff6',
        userId,
        data
      );
      setUser(updatedUser as User);
      return updatedUser as User;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isLoading, 
      isAuthenticated,
      signUp, 
      signIn, 
      signOut, 
      handleGitHubOAuth,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
