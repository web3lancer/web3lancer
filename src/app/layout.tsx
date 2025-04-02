'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SessionSync from '@/components/SessionSync';
import { AnimatePresence } from 'framer-motion'; // Import AnimatePresence but not motion
import { Box } from '@mui/material';
import Header from '@/components/Header';  // Import Header directly instead of MainLayout

// Importing motion properly to avoid SSR serialization issues
import dynamic from 'next/dynamic';
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <SessionSync>
                  <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
                  >
                    <Header />
                    <Box component="main" sx={{ flexGrow: 1, pt: { xs: 7, sm: 8 } }}>
                      <AnimatePresence mode="wait">
                        {children}
                      </AnimatePresence>
                    </Box>
                  </MotionDiv>
                </SessionSync>
              </LocalizationProvider>
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
