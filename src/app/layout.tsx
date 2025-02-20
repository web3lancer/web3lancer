'use client';
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Box, useMediaQuery } from "@mui/material";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { theme } from "@/utils/theme";
import { motion } from "framer-motion";

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
      </head>
      <body style={{ margin: 0, background: '#f4f4f4' }}>
        <ThemeProvider theme={theme}>
          <Box sx={{ 
            display: 'flex', 
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden'
          }}>
            <Sidebar />
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              sx={{ 
                flexGrow: 1,
                marginLeft: isMobile ? 0 : '240px',
                width: '100%',
                minHeight: '100vh',
                position: 'relative',
                zIndex: 1,
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.5)',
                transition: 'margin 0.3s ease'
              }}
            >
              <Header />
              <Box
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                sx={{
                  padding: { xs: 1, sm: 2, md: 3 },
                  marginTop: '64px',
                  borderRadius: { xs: '12px 12px 0 0', md: '24px 0 0 0' },
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  minHeight: 'calc(100vh - 64px)',
                  overflowX: 'hidden',
                  overflowY: 'auto'
                }}
              >
                {children}
              </Box>
            </Box>
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
