"use client";

import React, { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import SecondarySidebar from '@/components/SecondarySidebar';
import { shouldShowSidebar } from '@/utils/navigation';

// Define sidebar widths
const primaryDrawerWidth = 240;
const secondaryDrawerWidth = 320;

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
  // State for secondary sidebar visibility
  const [secondarySidebarWidth, setSecondarySidebarWidth] = useState(secondaryDrawerWidth);
  
  // Determine if the sidebars should be shown
  const showSidebar = shouldShowSidebar(pathname);
  const showSecondarySidebar = showSidebar && isLargeScreen;

  // Determine if the page is a pre-auth page or home page
  const isPreAuthPage = ['/signin', '/signup'].includes(pathname);
  const isHomePage = pathname === '/';

  // Handle resizing of the secondary sidebar
  const handleResizeSecondarySidebar = (newWidth: number) => {
    // Ensure width stays within reasonable bounds
    const boundedWidth = Math.max(200, Math.min(450, newWidth));
    setSecondarySidebarWidth(boundedWidth);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Header 
        isHomePage={isHomePage} 
        isPreAuthPage={isPreAuthPage} 
      />
      
      {/* Primary Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Secondary Sidebar - Only shown on large screens and when primary sidebar is also shown */}
      {showSecondarySidebar && <SecondarySidebar drawerWidth={primaryDrawerWidth} />}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Position relative to the sidebars without margin
          position: 'absolute',
          left: { xs: 0, md: showSidebar ? `${primaryDrawerWidth}px` : 0 },
          right: { xs: 0, lg: showSecondarySidebar ? `${secondaryDrawerWidth}px` : 0 },
          // Account for fixed Header height
          top: { xs: '56px', sm: '64px' },
          bottom: 0,
          // No need for width calculation - it's based on left/right positioning
          // Account for bottom navigation on mobile
          paddingBottom: { xs: showSidebar ? '70px' : 0, md: 0 },
          // Smooth transitions
          transition: theme.transitions.create(
            ['left', 'right', 'background-color', 'color'], 
            {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.standard,
            }
          ),
          // Ensure content doesn't overflow and shows scrollbars when needed
          overflow: 'auto',
          // Prevent content from being obscured by fixed elements
          boxSizing: 'border-box',
        }}
      >
        {/* Inner padding for content */}
        <Box sx={{ 
          p: 3, 
          height: '100%',
          minHeight: '100vh', 
          display: 'flex',
          flexDirection: 'column' 
        }}> 
          {children}
        </Box>
      </Box>
    </Box>
  );
}
