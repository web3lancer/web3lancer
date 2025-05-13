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

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname() || ''; // Ensure pathname is always a string
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [secondarySidebarWidth, setSecondarySidebarWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedWidth = localStorage.getItem('secondarySidebarWidth');
      return storedWidth ? parseInt(storedWidth, 10) : 320; // Default to 320 if nothing in localStorage
    }
    return 320; // Default for SSR or if window is not defined
  });
  
  // Handle resizing of the secondary sidebar
  const handleResizeSecondarySidebar = React.useCallback((newWidth: number) => {
    const boundedWidth = Math.max(200, Math.min(450, newWidth)); // AppLayout's bounds
    setSecondarySidebarWidth(boundedWidth);
    if (typeof window !== 'undefined') {
      localStorage.setItem('secondarySidebarWidth', boundedWidth.toString());
    }
  }, []); // No dependencies, safe for useCallback

  // Determine if the sidebars should be shown
  const showSidebar = shouldShowSidebar(pathname);
  const showSecondarySidebar = showSidebar && isLargeScreen;

  // Determine if the page is a pre-auth page or home page
  const isPreAuthPage = ['/signin', '/signup'].includes(pathname);
  const isHomePage = pathname === '/';

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
      
      {showSidebar && <Sidebar />}

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
          position: 'fixed', 
          left: { xs: 0, md: showSidebar ? `${primaryDrawerWidth + 12}px` : 0 },
          right: { xs: 0, lg: showSecondarySidebar ? `${secondarySidebarWidth}px` : 0 },
          top: { xs: '84px', sm: '92px' },
          bottom: 0,
          paddingLeft: { xs: '12px' },
          paddingRight: { xs: '12px' },
          paddingBottom: { xs: showSidebar ? '70px' : 0, md: 0 },
          paddingTop: isHomePage ? 0 : { xs: 2, sm: 3 },
          transition: theme.transitions.create(
            ['left', 'right', 'width', 'background-color', 'color', 'padding'],
            {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.standard,
            }
          ),
          overflow: 'auto',
          boxSizing: 'border-box',
          width: {
            xs: '100%',
            md: showSidebar ? `calc(100% - ${primaryDrawerWidth + 12}px)` : '100%',
            lg: showSecondarySidebar 
              ? `calc(100% - ${primaryDrawerWidth + 12 + secondarySidebarWidth}px)` 
              : (showSidebar ? `calc(100% - ${primaryDrawerWidth + 12}px)` : '100%')
          } // Explicitly set width to respect sidebars
        }}
      >
        {/* Inner padding for content */}
        <Box sx={{ 
          p: 3, 
          height: '100%',
          minHeight: '100vh', 
          display: 'flex',
          flexDirection: 'column',
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
