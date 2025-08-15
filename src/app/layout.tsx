'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { WEB3LANCER_CONTRACTS } from '@/utils/contractUtils';
import { Suspense } from 'react';
import { ThemeProviderWrapper } from '@/contexts/ThemeContext';
import AppLayout from '@/components/layout/AppLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { SuiWalletProvider } from '@/contexts/SuiWalletContext';
import { Box, CssBaseline, CircularProgress } from '@mui/material';

const inter = Inter({ subsets: ['latin'] });

// Xion integration removed: keep placeholder configuration if needed
const xionConfig = null;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the rendered page component has a static property 'noAppLayout'
  // This works for Next.js layouts where children is a React element
  const shouldSkipAppLayout =
    (Array.isArray(children)
      ? children.some(
          (child: any) => child?.type?.noAppLayout
        )
      : (children as any)?.type?.noAppLayout);

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
          <AuthProvider>
            <SuiWalletProvider>
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
                  {shouldSkipAppLayout
                    ? children
                    : <AppLayout>{children}</AppLayout>
                  }
                </Suspense>
              </ThemeProviderWrapper>
            </SuiWalletProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
