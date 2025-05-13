"use client";

import React, { ReactNode, useState, useEffect } from 'react';
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
  
  const [secondarySidebarWidth, setSecondarySidebarWidth] = useState(() => {
    // Try to load stored width from localStorage or use default
    if (typeof window !== 'undefined') {
      const storedWidth = localStorage.getItem('secondarySidebarWidth');
      return storedWidth ? parseInt(storedWidth, 10) : secondaryDrawerWidth;
    }
    return secondaryDrawerWidth;
  });
  
  // Handle resizing of the secondary sidebar
  const handleResizeSecondarySidebar = (newWidth: number) => {
    // Ensure width stays within reasonable bounds
    const boundedWidth = Math.max(200, Math.min(450, newWidth));
    setSecondarySidebarWidth(boundedWidth);
    
    // Store width in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('secondarySidebarWidth', boundedWidth.toString());
    }
  };

  // Determine if the sidebars should be shown
  const showSidebar = shouldShowSidebar(pathname);
  const showSecondarySidebar = showSidebar && isLargeScreen;

  // Determine if the page is a pre-auth page or home page
  const isPreAuthPage = ['/signin', '/signup'].includes(pathname);
  const isHomePage = pathname === '/';

  // Add a listener for secondary sidebar resize events
  useEffect(() => {
    const handleSecondarySidebarResize = (e: CustomEvent) => {
      if (e.detail && e.detail.width) {
        setSecondarySidebarWidth(e.detail.width);
      }
    };

    window.addEventListener('secondarySidebarResize', handleSecondarySidebarResize as EventListener);
    return () => {
      window.removeEventListener('secondarySidebarResize', handleSecondarySidebarResize as EventListener);
    };
  }, []);

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
      {showSecondarySidebar && 
        <SecondarySidebar 
          drawerWidth={primaryDrawerWidth} 
          width={secondarySidebarWidth}
          onWidthChange={handleResizeSecondarySidebar}
        />
      }

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Position relative to the sidebars without margin
          position: 'fixed', // Changed from 'absolute' to 'fixed' for better layout stability
          left: { xs: 0, md: showSidebar ? `${primaryDrawerWidth}px` : 0 },
          right: { xs: 0, lg: showSecondarySidebar ? `${secondarySidebarWidth}px` : 0 },
          // Account for fixed Header height
          top: { xs: '56px', sm: '64px' },
          bottom: 0,
          // No need for width calculation - it's based on left/right positioning
          // Account for bottom navigation on mobile
          paddingBottom: { xs: showSidebar ? '70px' : 0, md: 0 },
          // Smooth transitions
          transition: theme.transitions.create(
            ['left', 'right', 'width', 'background-color', 'color'], // Added 'width' to transitions
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
          flexDirection: 'column',
          // Make sure content adapts to available space
          '& > *': {
            maxWidth: '100%',
            boxSizing: 'border-box',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }
        }}> 
          {children}
        </Box>
      </Box>
    </Box>
  );
}
