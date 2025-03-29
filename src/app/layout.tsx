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
    setIsMounted(true);
  }, []);
  
  return isMounted ? <>{children}</> : null;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  // Check if the current route is a pre-auth page
  const isPreAuthPage = PRE_AUTH_ROUTES.some(route => pathname?.startsWith(route));
  
  // Determine if sidebar should be shown
  const showSidebar = !isHomePage && !isPreAuthPage;

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
      </head>
      <body style={{ margin: 0, background: '#f4f4f4' }}>
        <ThemeProvider theme={theme}>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <MultiAccountProvider>
                <AuthProvider>
                  <WalletProvider>
                    <SafeHydrate>
                      <Box sx={{ 
                        display: 'flex',
                        minHeight: '100vh',
                        width: '100%',
                        background: 'linear-gradient(135deg, #f6f7f9 0%, #ffffff 100%)',
                        position: { xs: isHomePage || isPreAuthPage ? 'relative' : 'fixed', md: 'relative' },
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflow: { xs: isHomePage || isPreAuthPage ? 'visible' : 'hidden', md: 'visible' },
                      }}>
                        {/* Only render sidebar if it should be shown */}
                        {showSidebar && <Sidebar />}
                        
                        <Box
                          component={motion.div}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          sx={{ 
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '100vh',
                            marginLeft: { xs: 0, md: showSidebar ? '240px' : 0 },
                            width: { xs: '100%', md: showSidebar ? 'calc(100% - 240px)' : '100%' },
                            transition: 'margin 0.3s ease',
                            position: 'relative',
                          }}
                        >
                          {/* Conditionally render Header if not on homepage or with adjusted properties for pre-auth pages */}
                          <Header isHomePage={isHomePage} isPreAuthPage={isPreAuthPage} />
                          
                          <Box
                            component={motion.div}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="scrollable-content"
                            sx={{
                              flex: 1,
                              p: isHomePage || isPreAuthPage ? 0 : { xs: 1, sm: 2, md: 3 },
                              pt: isHomePage || isPreAuthPage ? 0 : { xs: '80px', md: '84px' },
                              pb: isHomePage || isPreAuthPage ? 0 : { xs: '85px', md: 3 },
                              background: isHomePage || isPreAuthPage ? 'transparent' : 'rgba(255, 255, 255, 0.7)',
                              backdropFilter: isHomePage || isPreAuthPage ? 'none' : 'blur(10px)',
                              borderRadius: isHomePage || isPreAuthPage ? 0 : { xs: '0', md: '24px 0 0 0' },
                              position: 'relative',
                              width: '100%',
                              boxSizing: 'border-box',
                              overflowY: { xs: 'auto', md: 'auto' },
                              overflowX: 'hidden',
                              WebkitOverflowScrolling: 'touch',
                            }}
                          >
                            <Box className="content-wrapper">
                              {children}
                            </Box>
                          </Box>
                          
                          {/* Only render bottom navigation on mobile when not on pre-auth pages or homepage */}
                          {isMobile && showSidebar && (
                            <Box sx={{ 
                              position: 'fixed', 
                              bottom: 0, 
                              left: 0, 
                              right: 0, 
                              zIndex: 1000,
                              background: 'rgba(255, 255, 255, 0.9)',
                              backdropFilter: 'blur(10px)',
                              borderTop: '1px solid rgba(231, 231, 231, 0.8)'
                            }}>
                              {/* Mobile bottom navigation component */}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </SafeHydrate>
                  </WalletProvider>
                </AuthProvider>
              </MultiAccountProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
