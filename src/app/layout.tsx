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
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {!isMobile && <Sidebar />}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ 
                flexGrow: 1,
                marginLeft: isMobile ? 0 : 240,
                minHeight: '100vh',
                position: 'relative',
                zIndex: 1,
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              <Header />
              <Box
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                sx={{
                  padding: theme.spacing(3),
                  marginTop: '64px',
                  borderRadius: '24px 0 0 0',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  minHeight: 'calc(100vh - 64px)',
                }}
              >
                {children}
              </Box>
            </motion.div>
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
