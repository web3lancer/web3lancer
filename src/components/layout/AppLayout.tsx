"use client";

import React, { ReactNode } from 'react'; // Removed useState
import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import Sidebar from '@/components/Sidebar'; // Import Sidebar
import Header from '@/components/Header';   // Import Header
import { shouldShowSidebar } from '@/utils/navigation'; // Import the utility

// Define sidebar width (consider making this a constant or theme value)
const drawerWidth = 240;

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  // Removed mobileOpen state and handleDrawerToggle function

  // Determine if the sidebar should be shown
  const showSidebar = shouldShowSidebar(pathname);

  // Determine if the page is a pre-auth page (like signin/signup)
  // Adjust this logic based on your actual pre-auth routes if different from sidebar hidden paths
  const isPreAuthPage = ['/signin', '/signup'].includes(pathname);
  const isHomePage = pathname === '/';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header 
        isHomePage={isHomePage} 
        isPreAuthPage={isPreAuthPage} 
        // Removed onToggleDrawer prop
      />
      
      {/* Conditionally render Sidebar - Removed mobileOpen and handleDrawerToggle props */}
      {showSidebar && <Sidebar />}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Apply margin only on md+ screens when sidebar is shown
          ml: { md: showSidebar ? `${drawerWidth}px` : 0 }, 
          // Add padding top to account for the fixed Header height (adjust value as needed)
          pt: { xs: '56px', sm: '64px' }, 
          width: { 
            xs: '100%', 
            // Adjust width calculation for md+ screens when sidebar is shown
            md: showSidebar ? `calc(100% - ${drawerWidth}px)` : '100%' 
          },
          // Add padding bottom to account for bottom navigation on mobile
          pb: { xs: showSidebar ? '70px' : 0, md: 0 },
          // Add transition for theme changes
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        {/* Add inner padding for content */}
        <Box sx={{ p: 3 }}> 
          {children}
        </Box>
      </Box>
    </Box>
  );
}
