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
            background: 'linear-gradient(135deg, #f6f7f9 0%, #ffffff 100%)',
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
              }}
            >
              <Header />
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                sx={{
                  flex: 1,
                  p: { xs: 1, sm: 2, md: 3 },
                  pt: '64px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: { xs: '0', md: '24px 0 0 0' },
                  overflow: 'auto',
                  position: 'relative',
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
