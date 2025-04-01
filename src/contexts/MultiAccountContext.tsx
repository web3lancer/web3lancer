'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { account, signOut, signIn, getCurrentSession } from '@/utils/api';

export interface UserAccount {
  $id: string;
  name?: string;
  email?: string;
  walletId?: string;
  profilePicture?: string;
  isActive: boolean;
  credentials?: {
    email: string;
    hasPassword: boolean;
  };
}

interface MultiAccountContextType {
  accounts: UserAccount[];
  activeAccount: UserAccount | null;
  addAccount: (account: UserAccount, credentials?: { email: string, password?: string }) => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  removeAllAccounts: () => Promise<void>;
  switchAccount: (accountId: string) => Promise<void>;
  clearActiveAccount: () => Promise<void>;
  hasMaxAccounts: boolean;
  MAX_ACCOUNTS: number;
  isAccountSwitching: boolean;
}

const MultiAccountContext = createContext<MultiAccountContextType>({
  accounts: [],
  activeAccount: null,
  addAccount: async () => {},
  removeAccount: async () => {},
  removeAllAccounts: async () => {},
  switchAccount: async () => {},
  clearActiveAccount: async () => {},
  hasMaxAccounts: false,
  MAX_ACCOUNTS: 3,
  isAccountSwitching: false,
});

const MAX_ACCOUNTS = 3;

export const useMultiAccount = () => useContext(MultiAccountContext);

export const MultiAccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(null);
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);
  const hasMaxAccounts = accounts.length >= MAX_ACCOUNTS;

  useEffect(() => {
    const loadAccounts = async () => {
      const savedAccounts = localStorage.getItem('web3lancer_accounts');
      if (savedAccounts) {
        try {
          const parsedAccounts = JSON.parse(savedAccounts);
          setAccounts(parsedAccounts);

          const active = parsedAccounts.find((acc: UserAccount) => acc.isActive);
          if (active) {
            setActiveAccount(active);

            const currentSession = await getCurrentSession();
            if (!currentSession) {
              console.log('No active session found but active account exists in storage');
              const updatedAccounts = parsedAccounts.map((acc: UserAccount) => ({
                ...acc,
                isActive: false,
              }));
              setAccounts(updatedAccounts);
              setActiveAccount(null);
              localStorage.setItem('web3lancer_accounts', JSON.stringify(updatedAccounts));
            }
          }
        } catch (error) {
          console.error('Error parsing saved accounts:', error);
          localStorage.removeItem('web3lancer_accounts');
        }
      }
    };

    loadAccounts();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      const accountsToSave = accounts.map((acc) => {
        const { credentials, ...safeAccount } = acc;
        return safeAccount;
      });
      localStorage.setItem('web3lancer_accounts', JSON.stringify(accountsToSave));
    } else {
      localStorage.removeItem('web3lancer_accounts');
    }
  }, [accounts]);

  const addAccount = async (newAccount: UserAccount, credentials?: { email: string; password?: string }) => {
    const existingAccountIndex = accounts.findIndex((acc) => acc.$id === newAccount.$id);

    if (existingAccountIndex !== -1) {
      const updatedAccounts = [...accounts];
      updatedAccounts.forEach((acc) => (acc.isActive = false));

      if (credentials && credentials.email) {
        updatedAccounts[existingAccountIndex] = {
          ...updatedAccounts[existingAccountIndex],
          ...newAccount,
          isActive: true,
          credentials: {
            email: credentials.email,
            hasPassword: !!credentials.password,
          },
        };
      } else {
        updatedAccounts[existingAccountIndex] = {
          ...updatedAccounts[existingAccountIndex],
          ...newAccount,
          isActive: true,
        };
      }

      setAccounts(updatedAccounts);
      setActiveAccount(updatedAccounts[existingAccountIndex]);
    } else {
      if (accounts.length >= MAX_ACCOUNTS) {
        throw new Error(`Maximum number of accounts (${MAX_ACCOUNTS}) reached`);
      }

      const updatedAccounts = accounts.map((acc) => ({ ...acc, isActive: false }));

      let accountToAdd = { ...newAccount, isActive: true };
      if (credentials && credentials.email) {
        accountToAdd = {
          ...accountToAdd,
          credentials: {
            email: credentials.email,
            hasPassword: !!credentials.password,
          },
        };
      }

      const newAccounts = [...updatedAccounts, accountToAdd];
      setAccounts(newAccounts);
      setActiveAccount(accountToAdd);
    }
  };

  const removeAccount = async (accountId: string) => {
    const accountToRemove = accounts.find((acc) => acc.$id === accountId);
    if (!accountToRemove) return;

    if (accountToRemove.isActive) {
      await signOut().catch(console.error);
    }

    const updatedAccounts = accounts.filter((acc) => acc.$id !== accountId);

    if (accountToRemove.isActive) {
      if (updatedAccounts.length > 0) {
        updatedAccounts[0].isActive = true;
        setActiveAccount(updatedAccounts[0]);
      } else {
        setActiveAccount(null);
      }
    }

    setAccounts(updatedAccounts);
  };

  const removeAllAccounts = async () => {
    await signOut().catch(console.error);

    setAccounts([]);
    setActiveAccount(null);
    localStorage.removeItem('web3lancer_accounts');
  };

  const clearActiveAccount = async () => {
    await signOut().catch(console.error);

    setActiveAccount(null);
    const updatedAccounts = accounts.map((acc) => ({ ...acc, isActive: false }));
    setAccounts(updatedAccounts);
  };

  const switchAccount = async (accountId: string) => {
    const targetAccount = accounts.find((acc) => acc.$id === accountId);
    if (!targetAccount) return;

    try {
      setIsAccountSwitching(true);

      await signOut().catch(console.error);

      const updatedAccounts = accounts.map((acc) => ({
        ...acc,
        isActive: acc.$id === accountId,
      }));

      setAccounts(updatedAccounts);
      setActiveAccount(targetAccount);

      if (targetAccount.credentials?.email && targetAccount.credentials.hasPassword) {
      } else if (targetAccount.walletId) {
      }
    } catch (error) {
      console.error('Error switching accounts:', error);
      throw new Error('Failed to switch accounts');
    } finally {
      setIsAccountSwitching(false);
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
        isAccountSwitching,
      }}
    >
      {children}
    </MultiAccountContext.Provider>
  );
};
