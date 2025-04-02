import React from 'react';
import Header from '@/components/Header';
import { Box } from '@mui/material';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout component that wraps page content with header/navigation
 * This is a minimal implementation to fix the build error
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Header />
      <Box component="div" sx={{ pt: { xs: 7, sm: 8 } }}>
        {children}
      </Box>
    </>
  );
}
