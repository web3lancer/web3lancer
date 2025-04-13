'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { SessionProvider } from 'next-auth/react';
import { ThemeProviderWrapper } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProviderWrapper>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProviderWrapper>
    </SessionProvider>
  );
}
