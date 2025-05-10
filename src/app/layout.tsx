'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AbstraxionProvider } from '@burnt-labs/abstraxion';
import '@burnt-labs/abstraxion/dist/index.css';
import '@burnt-labs/ui/dist/index.css';
import { WEB3LANCER_CONTRACTS } from '@/utils/contractUtils';
import { Suspense } from 'react';
import { ThemeProviderWrapper } from '@/contexts/ThemeContext';
import AppLayout from '@/components/layout/AppLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { Box, CssBaseline } from '@mui/material'; // Import CssBaseline and Box

const inter = Inter({ subsets: ['latin'] });

const xionConfig = {
  rpcUrl: WEB3LANCER_CONTRACTS.XION.RPC_URL,
  restUrl: WEB3LANCER_CONTRACTS.XION.REST_URL
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AbstraxionProvider config={xionConfig}>
          <AuthProvider>
            <ThemeProviderWrapper>
              <Suspense fallback={<div>Loading...</div>}>
                <AppLayout>{children}</AppLayout>
              </Suspense>
            </ThemeProviderWrapper>
          </AuthProvider>
        </AbstraxionProvider>
      </body>
    </html>
  );
}
