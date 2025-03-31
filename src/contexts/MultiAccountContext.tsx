'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { account, signOut } from '@/utils/api';

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
  removeAllAccounts: () => void;
  switchAccount: (accountId: string) => void;
  clearActiveAccount: () => void;
  hasMaxAccounts: boolean;
  MAX_ACCOUNTS: number;
}

const MultiAccountContext = createContext<MultiAccountContextType>({
  accounts: [],
  activeAccount: null,
  addAccount: () => {},
  removeAccount: () => {},
  removeAllAccounts: () => {},
  switchAccount: () => {},
  clearActiveAccount: () => {},
  hasMaxAccounts: false,
  MAX_ACCOUNTS: 3,
});

const MAX_ACCOUNTS = 3;

export const useMultiAccount = () => useContext(MultiAccountContext);

export const MultiAccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(null);
  const hasMaxAccounts = accounts.length >= MAX_ACCOUNTS;

  // Initialize accounts from localStorage on component mount
  useEffect(() => {
    const savedAccounts = localStorage.getItem('web3lancer_accounts');
    if (savedAccounts) {
      try {
        const parsedAccounts = JSON.parse(savedAccounts);
        setAccounts(parsedAccounts);
        
        // Find and set active account
        const active = parsedAccounts.find((acc: UserAccount) => acc.isActive);
        if (active) {
          setActiveAccount(active);
        }
      } catch (error) {
        console.error('Error parsing saved accounts:', error);
        localStorage.removeItem('web3lancer_accounts');
      }
    }
  }, []);

  // Save accounts to localStorage when they change
  useEffect(() => {
    localStorage.setItem('web3lancer_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const addAccount = (newAccount: UserAccount) => {
    // Check if we already have this account
    const existingAccountIndex = accounts.findIndex(acc => acc.$id === newAccount.$id);
    
    if (existingAccountIndex !== -1) {
      // If account exists, update it and set as active
      const updatedAccounts = [...accounts];
      updatedAccounts.forEach(acc => acc.isActive = false);
      updatedAccounts[existingAccountIndex] = { ...updatedAccounts[existingAccountIndex], ...newAccount, isActive: true };
      setAccounts(updatedAccounts);
      setActiveAccount(updatedAccounts[existingAccountIndex]);
    } else {
      // Check max accounts limit
      if (accounts.length >= MAX_ACCOUNTS) {
        throw new Error(`Maximum number of accounts (${MAX_ACCOUNTS}) reached`);
      }
      
      // If adding new account, set all accounts as inactive first
      const updatedAccounts = accounts.map(acc => ({ ...acc, isActive: false }));
      
      // Then add the new account as active
      const newAccounts = [...updatedAccounts, { ...newAccount, isActive: true }];
      setAccounts(newAccounts);
      setActiveAccount(newAccount);
    }
  };

  const removeAccount = (accountId: string) => {
    const updatedAccounts = accounts.filter(acc => acc.$id !== accountId);
    
    // If we removed the active account, set a new active account if available
    if (activeAccount && activeAccount.$id === accountId) {
      if (updatedAccounts.length > 0) {
        updatedAccounts[0].isActive = true;
        setActiveAccount(updatedAccounts[0]);
      } else {
        setActiveAccount(null);
      }
    }
    
    setAccounts(updatedAccounts);
  };

  const removeAllAccounts = () => {
    setAccounts([]);
    setActiveAccount(null);
    localStorage.removeItem('web3lancer_accounts');
  };

  const clearActiveAccount = () => {
    setActiveAccount(null);
    const updatedAccounts = accounts.map(acc => ({...acc, isActive: false}));
    setAccounts(updatedAccounts);
  };

  const switchAccount = async (accountId: string) => {
    // First, find the account we want to switch to
    const targetAccount = accounts.find(acc => acc.$id === accountId);
    if (!targetAccount) return;
    
    try {
      // Sign out from current session if there is one
      await signOut().catch(console.error);
      
      // Update active status for all accounts
      const updatedAccounts = accounts.map(acc => ({
        ...acc,
        isActive: acc.$id === accountId
      }));
      
      setAccounts(updatedAccounts);
      setActiveAccount(targetAccount);
      
      // Local storage update is handled by the useEffect above
    } catch (error) {
      console.error('Error switching accounts:', error);
      throw new Error('Failed to switch accounts');
    }
  };

  return (
    <MultiAccountContext.Provider
      value={{
        accounts,
        activeAccount,
        addAccount,
        removeAccount,
        removeAllAccounts,
        switchAccount,
        clearActiveAccount,
        hasMaxAccounts,
        MAX_ACCOUNTS,
      }}
    >
      {children}
    </MultiAccountContext.Provider>
  );
};
