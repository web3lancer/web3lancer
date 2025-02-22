"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { account } from "@/app/appwrite";

interface AuthContextProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleGitHubOAuth: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  handleGitHubOAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    account.get().then(setUser).catch(() => setUser(null));
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    await account.create("unique()", email, password, name);
    await account.createEmailSession(email, password);
    const userData = await account.get();
    setUser(userData);
  };

  const signIn = async (email: string, password: string) => {
    await account.createEmailSession(email, password);
    const userData = await account.get();
    setUser(userData);
  };

  const signOut = async () => {
    await account.deleteSession("current");
    setUser(null);
  };

  const handleGitHubOAuth = async (code: string) => {
    try {
      const response = await account.createOAuth2Session('github', 'https://your-app-url.com/oauth/callback', 'https://your-app-url.com/oauth/callback', code);
      const userData = await account.get();
      setUser(userData);
    } catch (error) {
      console.error("Error handling GitHub OAuth:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signUp, signIn, signOut, handleGitHubOAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
