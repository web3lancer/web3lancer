'use client';

import React, { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/utils/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SessionSync from '@/components/SessionSync';
import { AnimatePresence } from 'framer-motion';
import { Box } from '@mui/material';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar'; // Import the Sidebar component
import { WalletProvider } from '@/components/WalletProvider';
import { shouldShowSidebar } from '@/utils/navigation'; // Import our new utility function
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Determine if sidebar should be shown based on the current path
  useEffect(() => {
    setShowSidebar(shouldShowSidebar(pathname));
  }, [pathname]);

  // Determine if the current page is a pre-auth page (for Header prop)
  const isPreAuthPage = !showSidebar && pathname !== '/';
  // Determine if this is the homepage
  const isHomePage = pathname === '/';

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <WalletProvider>
            <AppRouterCacheProvider>
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
                      <Header isHomePage={isHomePage} isPreAuthPage={isPreAuthPage} />
                      
                      <Box sx={{ display: 'flex', flexGrow: 1 }}>
                        {showSidebar && <Sidebar />}
                        
                        <Box 
                          component="main" 
                          sx={{ 
                            flexGrow: 1, 
                            pt: { xs: 7, sm: 8 },
                            ml: showSidebar ? { xs: 0, md: '240px' } : 0,
                            width: showSidebar ? { xs: '100%', md: 'calc(100% - 240px)' } : '100%',
                            transition: 'margin 0.3s ease, width 0.3s ease'
                          }}
                        >
                          <AnimatePresence mode="wait">
                            {children}
                          </AnimatePresence>
                        </Box>
                      </Box>
                    </MotionDiv>
                  </SessionSync>
                </LocalizationProvider>
              </AuthProvider>
            </AppRouterCacheProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
