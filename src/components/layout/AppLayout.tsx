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
  
  // Check if this is the 404 page (using the body class added in not-found.tsx)
  const [isNotFoundPage, setIsNotFoundPage] = useState(false);
  
  useEffect(() => {
    // Check if the not-found-page class exists on the body
    setIsNotFoundPage(document.body.classList.contains('not-found-page'));
  }, [pathname]); // Re-run when pathname changes

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Header 
        isHomePage={isHomePage} 
        isPreAuthPage={isPreAuthPage || isNotFoundPage} 
      />
      
      {showSidebar && !isNotFoundPage && <Sidebar />}

      {showSecondarySidebar && !isNotFoundPage && 
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
          left: { xs: 0, md: (showSidebar && !isNotFoundPage) ? `${primaryDrawerWidth + 12}px` : 0 },
          right: { xs: 0, lg: (showSecondarySidebar && !isNotFoundPage) ? `${secondarySidebarWidth}px` : 0 },
          top: { xs: '84px', sm: '92px' },
          bottom: 0,
          paddingLeft: { xs: '12px' },
          paddingRight: { xs: '12px' },
          paddingBottom: { xs: (showSidebar && !isNotFoundPage) ? '70px' : 0, md: 0 },
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
            md: (showSidebar && !isNotFoundPage) ? `calc(100% - ${primaryDrawerWidth + 12}px)` : '100%',
            lg: (showSecondarySidebar && !isNotFoundPage) 
              ? `calc(100% - ${primaryDrawerWidth + 12 + secondarySidebarWidth}px)` 
              : ((showSidebar && !isNotFoundPage) ? `calc(100% - ${primaryDrawerWidth + 12}px)` : '100%')
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
