'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Sui Wallet Context Interface
interface SuiWalletContextType {
  isConnected: boolean;
  currentAccount: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signAndExecuteTransaction: (transaction: any) => Promise<any>;
}

const SuiWalletContext = createContext<SuiWalletContextType | undefined>(undefined);

interface SuiWalletProviderProps {
  children: ReactNode;
}

export const SuiWalletProvider: React.FC<SuiWalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  const connect = async () => {
    // This will be implemented once @mysten/dapp-kit is installed
    console.log('Sui wallet connection will be implemented');
  };

  const disconnect = () => {
    setIsConnected(false);
    setCurrentAccount(null);
  };

  const signAndExecuteTransaction = async (transaction: any) => {
    // This will be implemented once @mysten/dapp-kit is installed
    console.log('Transaction signing will be implemented');
    return null;
  };

  const value = {
    isConnected,
    currentAccount,
    connect,
    disconnect,
    signAndExecuteTransaction,
  };

  return (
    <SuiWalletContext.Provider value={value}>
      {children}
    </SuiWalletContext.Provider>
  );
};

export const useSuiWallet = () => {
  const context = useContext(SuiWalletContext);
  if (context === undefined) {
    throw new Error('useSuiWallet must be used within a SuiWalletProvider');
  }
  return context;
};