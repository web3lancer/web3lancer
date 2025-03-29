'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { account, ensureSession, ensureValidOAuthToken, createGitHubOAuthSession } from '@/utils/api';
import { useAccount as useWagmiAccount } from 'wagmi';
import { useMultiAccount, UserAccount } from './MultiAccountContext';

interface User {
  $id: string;
  name?: string;
  email?: string;
  walletId?: string;
  profilePicture?: string;
  provider?: string;
  providerUid?: string;
  githubUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  signOut: () => Promise<void>;
  handleGitHubOAuth?: () => Promise<void>;
  isAnonymous: boolean;
  setIsAnonymous: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { address } = useWagmiAccount();
  const { activeAccount, addAccount, switchAccount, accounts } = useMultiAccount();

  // Check for existing user session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        setIsLoading(true);
        
        // Use ensureSession to get current session or create anonymous session
        const session = await ensureSession().catch(error => {
          console.log('Error ensuring session:', error);
          return null;
        });
        
        if (session) {
          // Check if this is an anonymous session
          if (session.$id && (!session.name || !session.email)) {
            setIsAnonymous(true);
            console.log('Anonymous session active');
          } else {
            setIsAnonymous(false);
          }
          
          // Set user from session
          setUser(session);
          
          // Check for GitHub OAuth session
          if (session.provider === 'github') {
            // Ensure OAuth token is valid
            await ensureValidOAuthToken();
            
            // Store GitHub details in user object
            setUser(prevUser => ({
              ...prevUser,
              provider: session.provider,
              providerUid: session.providerUid,
              // Add GitHub-specific fields
              githubUser: true
            }));
          }
          
          // Only add to multi-account if not anonymous
          if (!isAnonymous && session.$id) {
            // Handle multi-account management
            const existingAccount = accounts.find(acc => acc.$id === session.$id);
            if (existingAccount) {
              if (!existingAccount.isActive) {
                switchAccount(session.$id);
              }
            } else {
              const newAccount: UserAccount = {
                $id: session.$id,
                name: session.name || '',
                email: session.email || '',
                isActive: true
              };
              
              try {
                addAccount(newAccount);
              } catch (error) {
                console.error('Error adding account to multi-account context:', error);
              }
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

  // Add GitHub OAuth handler
  const handleGitHubOAuth = async () => {
    try {
      await createGitHubOAuthSession(['user:email', 'read:user']);
      // Note: This will redirect the user to GitHub, so we don't need to handle the response here
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      throw error;
    }
  };

  // Sign out matches Appwrite docs for deleting session
  const signOut = async () => {
    try {
      // Only call destroy session if it's not a wallet connection
      if (user && !user.walletId) {
        // Follows Appwrite docs for session deletion
        await account.deleteSession('current');
      }
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isLoading, 
      signOut, 
      isAnonymous,
      setIsAnonymous,
      handleGitHubOAuth
    }}>
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
