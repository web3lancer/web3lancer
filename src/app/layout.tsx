'use client';
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Box, useMediaQuery } from "@mui/material";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { theme } from "@/utils/theme";
import { motion } from "framer-motion";
import { AuthProvider } from '@/contexts/AuthContext';
import { MultiAccountProvider } from '@/contexts/MultiAccountContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/utils/config';
import { WalletProvider } from '@/components/WalletProvider';
import { usePathname } from 'next/navigation';
import OAuthRefresher from '@/components/OAuthRefresher';
import { checkConfigValues, checkDatabaseConfig } from '@/utils/configChecker';
import SessionSync from '@/components/SessionSync';

const queryClient = new QueryClient();

// Define pre-auth pages where sidebar and bottom bar should not appear
const PRE_AUTH_ROUTES = [
  '/signin', 
  '/signup', 
  '/reset-password', 
  '/verify-email',
  '/verify-magic-link',
  '/forgot-password'
];

// Ensure MUI components are loaded properly
function SafeHydrate({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // Check configuration in development mode
    if (process.env.NODE_ENV === 'development') {
      checkConfigValues();
      checkDatabaseConfig().catch(console.error);
    }
    
    setIsMounted(true);
  }, []);
  
  return isMounted ? <>{children}</> : null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // For sidebar visibility
  const pathname = usePathname();
  const isPreAuthPage = PRE_AUTH_ROUTES.includes(pathname || '');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Web3Lancer</title>
      </head>
      <body>
        <SafeHydrate>
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
              <ThemeProvider theme={theme}>
                <MultiAccountProvider>
                  <AuthProvider>
                    <SessionSync>
                      <WalletProvider>
                        <OAuthRefresher />
                        <Header />
                        <Box
                          sx={{
                            display: 'flex',
                            minHeight: '100vh',
                            position: 'relative'
                          }}
                        >
                          {!isPreAuthPage && !isMobile && (
                            <Sidebar />
                          )}
                          
                          <Box
                            component={motion.main}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            sx={{
                              flexGrow: 1,
                              width: { sm: `calc(100% - ${isPreAuthPage ? 0 : (isMobile ? 0 : 250)}px)` },
                              ml: { sm: isPreAuthPage ? 0 : (isMobile ? 0 : `250px`) },
                              pt: '64px', // Header height
                              minHeight: '100vh',
                            }}
                          >
                            {children}
                          </Box>
                          
                        </Box>
                      </WalletProvider>
                    </SessionSync>
                  </AuthProvider>
                </MultiAccountProvider>
              </ThemeProvider>
            </WagmiProvider>
          </QueryClientProvider>
        </SafeHydrate>
      </body>
    </html>
  );
}
