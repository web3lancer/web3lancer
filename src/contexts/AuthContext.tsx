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