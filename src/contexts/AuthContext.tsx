"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { account } from '@/app/appwrite';

// Define User type based on Appwrite account structure
export type User = {
  $id: string;
  email: string;
  name: string;
  // Add any other user properties from Appwrite here
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const userData = await account.get();
      setUser(userData as User);
    } catch (error) {
      // User is not logged in, that's okay
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      // FIX: Use createEmailPasswordSession instead of createEmailSession
      await account.createEmailPasswordSession(email, password);
      const userData = await account.get();
      setUser(userData as User);
      return userData as User;
    } catch (error) {
      throw new Error(`Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<User> => {
    setIsLoading(true);
    try {
      await account.create('unique()', email, password, name);
      // After sign up, automatically sign in
      return await signIn(email, password);
    } catch (error) {
      throw new Error(`Sign up failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      throw new Error(`Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
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
