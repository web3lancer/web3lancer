'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { CssBaseline } from '@mui/material';
import { ThemeWrapper } from '@/providers/ThemeWrapper';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="system" attribute="class">
        <ThemeWrapper>
          <CssBaseline />
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeWrapper>
      </ThemeProvider>
    </SessionProvider>
  );
}
