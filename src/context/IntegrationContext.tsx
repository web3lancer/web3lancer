import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { checkPaymentApiHealth } from '@/services/payment';

interface IntegrationContextType {
  paymentApiAvailable: boolean;
  checkPaymentApi: () => Promise<void>;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export function IntegrationProvider({ children }: { children: ReactNode }) {
  const [paymentApiAvailable, setPaymentApiAvailable] = useState(false);

  const checkPaymentApi = async () => {
    const available = await checkPaymentApiHealth();
    setPaymentApiAvailable(available);
  };

  useEffect(() => {
    // Check the payment API on initial load
    checkPaymentApi();
    
    // Set up a periodic check (every 5 minutes)
    const interval = setInterval(checkPaymentApi, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <IntegrationContext.Provider
      value={{
        paymentApiAvailable,
        checkPaymentApi,
      }}
    >
      {children}
    </IntegrationContext.Provider>
  );
}

export function useIntegration() {
  const context = useContext(IntegrationContext);
  if (context === undefined) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  return context;
}
