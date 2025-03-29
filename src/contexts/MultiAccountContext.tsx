'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Define the type for a user account
export interface UserAccount {
  $id: string;
  name?: string;
  email?: string;
  walletId?: string;
  profilePicture?: string;
  isActive: boolean;
}

interface MultiAccountContextType {
  accounts: UserAccount[];
  activeAccount: UserAccount | null;
  addAccount: (account: UserAccount) => void;
  removeAccount: (accountId: string) => void;
  switchAccount: (accountId: string) => void;
  hasMaxAccounts: boolean;
}

const MultiAccountContext = createContext<MultiAccountContextType | undefined>(undefined);

const MAX_ACCOUNTS = 3;

export function MultiAccountProvider({ children }: { children: React.ReactNode }) {
  const [savedAccounts, setSavedAccounts] = useLocalStorage<UserAccount[]>('web3lancer_accounts', []);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(null);
  
  // Use a ref to track initialization
  const initialized = useRef(false);

  // Initialize accounts from localStorage on mount - only once
  useEffect(() => {
    if (!initialized.current && savedAccounts && savedAccounts.length > 0) {
      initialized.current = true;
      setAccounts(savedAccounts);
      const active = savedAccounts.find(account => account.isActive) || savedAccounts[0];
      if (active) {
        setActiveAccount({...active, isActive: true});
      }
    }
  }, [savedAccounts]);

  // Save accounts to localStorage when they change - with dependency on accounts
  useEffect(() => {
    // Skip initial render and only save when accounts actually change
    if (initialized.current && accounts.length > 0) {
      // Prevent saving to localStorage if we're just loading from it
      if (JSON.stringify(accounts) !== JSON.stringify(savedAccounts)) {
        setSavedAccounts(accounts);
      }
    }
  }, [accounts, setSavedAccounts]);

  // Add a new account
  const addAccount = (newAccount: UserAccount) => {
    if (accounts.length >= MAX_ACCOUNTS) {
      throw new Error(`Maximum number of accounts (${MAX_ACCOUNTS}) reached`);
    }

    // Check if the account already exists
    const exists = accounts.some(acc => acc.$id === newAccount.$id);
    if (exists) {
      // If the account exists but isn't active, make it active
      switchAccount(newAccount.$id);
      return;
    }

    // Add the new account and set it as active
    const updatedAccounts = accounts.map(acc => ({ ...acc, isActive: false }));
    const accountToAdd = { ...newAccount, isActive: true };
    
    setAccounts([...updatedAccounts, accountToAdd]);
    setActiveAccount(accountToAdd);
  };

  // Remove an account
  const removeAccount = (accountId: string) => {
    const updatedAccounts = accounts.filter(acc => acc.$id !== accountId);
    
    // If we removed the active account, set a new active account
    if (activeAccount?.$id === accountId && updatedAccounts.length > 0) {
      updatedAccounts[0].isActive = true;
      setActiveAccount(updatedAccounts[0]);
    } else if (updatedAccounts.length === 0) {
      setActiveAccount(null);
    }
    
    setAccounts(updatedAccounts);
  };

  // Switch to a different account
  const switchAccount = (accountId: string) => {
    const updatedAccounts = accounts.map(acc => ({
      ...acc,
      isActive: acc.$id === accountId
    }));
    
    setAccounts(updatedAccounts);
    const newActive = updatedAccounts.find(acc => acc.$id === accountId) || null;
    setActiveAccount(newActive);
  };

  return (
    <MultiAccountContext.Provider value={{
      accounts,
      activeAccount,
      addAccount,
      removeAccount,
      switchAccount,
      hasMaxAccounts: accounts.length >= MAX_ACCOUNTS
    }}>
      {children}
    </MultiAccountContext.Provider>
  );
}

export function useMultiAccount() {
  const context = useContext(MultiAccountContext);
  if (context === undefined) {
    throw new Error('useMultiAccount must be used within a MultiAccountProvider');
  }
  return context;
}
