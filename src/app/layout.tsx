'use client';
import React from "react";
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

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                    <Box sx={{ 
                      display: 'flex',
                      minHeight: '100vh',
                      width: '100%',
                      background: 'linear-gradient(135deg, #f6f7f9 0%, #ffffff 100%)',
                      position: { xs: 'fixed', md: 'relative' },
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      overflow: { xs: 'hidden', md: 'visible' },
                    }}>
                      <Sidebar />
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        sx={{ 
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          minHeight: '100vh',
                          marginLeft: { xs: 0, md: '240px' },
                          transition: 'margin 0.3s ease',
                          position: 'relative',
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      >
                        <Header />
                        <Box
                          component={motion.div}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="scrollable-content"
                          sx={{
                            flex: 1,
                            p: { xs: 2, sm: 3 },
                            pt: { xs: '80px', md: '84px' },
                            pb: { xs: '85px', md: 3 },
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: { xs: '0', md: '24px 0 0 0' },
                            position: 'relative',
                            width: '100%',
                            maxWidth: '100%',
                            boxSizing: 'border-box',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            '& > *': {
                              maxWidth: '100%',
                              boxSizing: 'border-box'
                            }
                          }}
                        >
                          <Box 
                            className="content-wrapper" 
                            sx={{ 
                              maxWidth: { sm: '95%', md: '90%', lg: '85%' },
                              mx: 'auto',
                              width: '100%',
                              position: 'relative',
                              overflowX: 'hidden'
                            }}
                          >
                            {children}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
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
