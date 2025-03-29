'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '@/utils/api';
import { useAccount } from 'wagmi';
import { useMultiAccount, UserAccount } from './MultiAccountContext';

interface User {
  $id: string;
  name?: string;
  email?: string;
  walletId?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  signOut: () => Promise<void>;
  handleGitHubOAuth?: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();
  const { activeAccount, addAccount, switchAccount, accounts } = useMultiAccount();

  // Check for existing user session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        setIsLoading(true);
        const session = await account.get();
        
        if (session) {
          // If we have a session, set the user
          setUser(session);
          
          // Check if this user is already in our accounts list
          const existingAccount = accounts.find(acc => acc.$id === session.$id);
          if (existingAccount) {
            // If it exists but isn't active, make it active
            if (!existingAccount.isActive) {
              switchAccount(session.$id);
            }
          } else {
            // If it doesn't exist in our accounts list, add it
            const newAccount: UserAccount = {
              $id: session.$id,
              name: session.name,
              email: session.email,
              isActive: true
            };
            try {
              addAccount(newAccount);
            } catch (error) {
              console.error('Error adding account to multi-account context:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  // Handle wallet connection
  useEffect(() => {
    if (address && !user) {
      const walletId = `wallet-${address}`;
      const walletUser = {
        $id: walletId,
        walletId: address
      };
      setUser(walletUser);
      
      // Add this wallet to our accounts
      const existingAccount = accounts.find(acc => acc.$id === walletId || acc.walletId === address);
      if (!existingAccount) {
        try {
          const newAccount: UserAccount = {
            $id: walletId,
            walletId: address,
            isActive: true
          };
          addAccount(newAccount);
        } catch (error) {
          console.error('Error adding wallet account:', error);
        }
      } else if (!existingAccount.isActive) {
        switchAccount(existingAccount.$id);
      }
    } else if (!address && user?.walletId) {
      // User disconnected their wallet
      setUser(null);
    }
  }, [address, user]);

  // When activeAccount changes, update the user accordingly
  useEffect(() => {
    if (activeAccount && (!user || user.$id !== activeAccount.$id)) {
      setUser({
        $id: activeAccount.$id,
        name: activeAccount.name,
        email: activeAccount.email,
        walletId: activeAccount.walletId,
        profilePicture: activeAccount.profilePicture
      });
    }
  }, [activeAccount]);

  // Mock GitHub OAuth handler (add if you need this functionality)
  const handleGitHubOAuth = async (code: string) => {
    // Implementation would go here
    console.log("Processing GitHub OAuth with code:", code);
  };

  const signOut = async () => {
    try {
      // Only call destroy session if it's not a wallet connection
      if (user && !user.walletId) {
        await account.deleteSession('current');
      }
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, signOut, handleGitHubOAuth }}>
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
