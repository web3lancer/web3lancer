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
import { Box, CssBaseline, CircularProgress } from '@mui/material';

const inter = Inter({ subsets: ['latin'] });

const xionConfig = {
  treasury: WEB3LANCER_CONTRACTS.XION.TREASURY_CONTRACT_ID,
  rpcUrl: WEB3LANCER_CONTRACTS.XION.RPC_URL,
  restUrl: WEB3LANCER_CONTRACTS.XION.REST_URL
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} style={{ 
        margin: 0, 
        padding: 0, 
        overflowX: 'hidden', 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        <style jsx global>{`
          ::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <AbstraxionProvider config={xionConfig}>
          <AuthProvider>
            <ThemeProviderWrapper>
              <CssBaseline />
              <Suspense fallback={
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100vh',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <CircularProgress size={40} />
                  <Box sx={{ mt: 2, fontSize: '1rem', color: 'text.secondary' }}>
                    Loading Web3Lancer...
                  </Box>
                </Box>
              }>
                <AppLayout>{children}</AppLayout>
              </Suspense>
            </ThemeProviderWrapper>
          </AuthProvider>
        </AbstraxionProvider>
      </body>
    </html>
  );
}
