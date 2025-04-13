"use client";

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from './DashboardLayout'; // Assuming DashboardLayout is in the same directory
import { Box } from '@mui/material';

// List of paths that should NOT use the DashboardLayout
const EXCLUDED_PATHS = ['/', '/signin', '/signup', '/home']; 

// Helper function to check if the path starts with any of the excluded paths
const isExcludedPath = (pathname: string | null): boolean => {
  if (!pathname) return false;
  // Check for exact matches or if the path starts with an excluded path followed by a '/' or end of string
  return EXCLUDED_PATHS.some(excludedPath => 
    pathname === excludedPath || pathname.startsWith(excludedPath + '/')
  );
};

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  // Determine if the current path should use the DashboardLayout
  const useDashboardLayout = !isExcludedPath(pathname);

  if (useDashboardLayout) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // For excluded paths, render children directly or within a minimal wrapper
  // Ensure it still occupies the necessary space, e.g., using flex-grow if needed in your global styles
  return <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>{children}</Box>; 
}
