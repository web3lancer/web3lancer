"use client";

import { Drawer, List, ListItemText, ListItemIcon, Box, BottomNavigation, BottomNavigationAction, Divider, ListItemButton, useTheme, useMediaQuery, Avatar, Button, Typography, Menu, MenuItem, ListItem } from "@mui/material";
import { Dashboard, Work, Bookmarks, Storefront, Person, People } from "@mui/icons-material";
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import { useAuth } from '@/contexts/AuthContext';
import SidebarAccountWidget from './SidebarAccountWidget';

// Add ethereum window type declaration
declare global {
  interface Window {
    ethereum?: {
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
    };
  }
}

const drawerWidth = 240;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { user } = useAuth(); // Get user from AuthContext

  const profilePath = useMemo(() => {
    if (user && user.$id) {
      // Use user.$id for the link. UserProfilePage will handle redirecting to username if available.
      return `/u/${user.$id}`;
    }
    return '/login'; // Fallback if user or user.$id is null/undefined
  }, [user]);

  const menuItems = useMemo(() => [
    { text: 'Dashboard', icon: Dashboard, path: '/dashboard' },
    { text: 'Projects', icon: Work, path: '/projects' },
    { text: 'Connect', icon: People, path: '/connect' },
    { text: 'Bookmarks', icon: Bookmarks, path: '/bookmarks' },
    { text: 'Profile', icon: Person, path: profilePath }, // Uses dynamic profile path
  ], [profilePath]);

  const [value, setValue] = useState(() => {
    const currentPath = pathname ?? '';
    // Match /u/[id] or /u/[username] by checking if currentPath starts with /u/ and item.text is Profile
    if (currentPath.startsWith('/u/')) {
      const profileIndex = menuItems.findIndex(item => item.text === 'Profile');
      if (profileIndex !== -1) return profileIndex;
    }
    const index = menuItems.findIndex(item => item.path !== '/' && currentPath.startsWith(item.path));
    return index !== -1 ? index : (currentPath === '/' ? 0 : -1); // Default to -1 if no match, 0 for dashboard on root
  });

  useEffect(() => {
    const currentPath = pathname ?? '';
    let activeIndex = -1;

    // Special handling for dynamic profile paths /u/[usernameOrId]
    if (currentPath.startsWith('/u/')) {
      const profileItemIndex = menuItems.findIndex(item => item.text === 'Profile');
      if (profileItemIndex !== -1) {
        activeIndex = profileItemIndex;
      }
    } else {
      // Standard path matching
      const exactMatchIndex = menuItems.findIndex(item => item.path === currentPath);
      if (exactMatchIndex !== -1) {
        activeIndex = exactMatchIndex;
      } else {
        // Fallback to startsWith for parent paths, ensuring it's not just root '/'
        const startsWithIndex = menuItems.findIndex(item => item.path !== '/' && currentPath.startsWith(item.path));
        if (startsWithIndex !== -1) {
          activeIndex = startsWithIndex;
        }
      }
    }
    // If still no match and on root path, select Dashboard (index 0)
    if (activeIndex === -1 && currentPath === '/' && menuItems[0]?.path === '/dashboard') {
        activeIndex = 0;
    }

    setValue(activeIndex);

  }, [pathname, menuItems, profilePath]);

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  const drawerContent = (
    <Box sx={{ 
      mt: { xs: 8, md: 9 }, 
      height: 'calc(100% - 72px)', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' // Changed from 'auto' to 'hidden' to prevent scrolling
    }}>
      <motion.div
        initial="hidden"
        animate="show"
        variants={listVariants}
        style={{ padding: '0 8px', flexGrow: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }} // Added overflowY auto for scrolling list items
      >
        <List>
          {menuItems.map((item, index) => {
            const isActive = value === index;
            return (
              <motion.div key={item.text} variants={itemVariants}>
                <ListItem 
                  disablePadding 
                  sx={{ 
                    mb: 0.5,
                    borderRadius: '8px',
                    transition: 'background-color 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  <ListItemButton
                    selected={isActive}
                    onClick={() => {
                      // setValue(index); // Optimistically set, or rely on useEffect after navigation
                      router.push(item.path);
                    }}
                    sx={{
                      borderRadius: '8px',
                      py: 1.2, 
                      px: 2,
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        '&:hover': {
                           backgroundColor: 'rgba(255, 255, 255, 0.20)',
                        },
                        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                          color: theme.palette.common.white,
                          fontWeight: '600',
                        },
                      },
                      '& .MuiListItemIcon-root': {
                        minWidth: '40px',
                        color: isActive ? theme.palette.common.white : 'rgba(255, 255, 255, 0.8)',
                        transition: 'color 0.2s ease-in-out',
                      },
                      '& .MuiListItemText-primary': {
                        color: isActive ? theme.palette.common.white : 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.9rem',
                        fontWeight: isActive ? '600' : 'normal',
                        transition: 'color 0.2s ease-in-out, font-weight 0.2s ease-in-out',
                      }
                    }}
                  >
                    <ListItemIcon>
                      <item.icon />
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </motion.div>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />

      {/* Account widget for desktop */}
      <Box 
        sx={{ 
          px: 2, 
          py: 2, 
          mt: 'auto',
          mx: 1,
          mb: 2,
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <SidebarAccountWidget />
      </Box>
      
      {/* Copyright */}
      <Box sx={{ px: 2, py: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          © {new Date().getFullYear()} Web3Lancer
        </motion.div>
      </Box>
    </Box>
  );

  return (
    <>        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              background: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              position: 'fixed',
              height: 'calc(100% - 104px)', // Adjusted to leave more space for navbar
              zIndex: theme.zIndex.appBar - 1,
              transition: 'background-color 0.3s ease',
              marginTop: '92px', // Increased spacing from navbar
              marginBottom: '12px',
              marginLeft: '12px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            },
            width: drawerWidth,
            flexShrink: 0,
          }}
      >
        {drawerContent}
      </Drawer>

      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          router.push(menuItems[newValue].path);
        }}
        showLabels
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[3],
          borderTop: `1px solid ${theme.palette.divider}`,
          zIndex: theme.zIndex.appBar,
          height: 'auto',
          minHeight: 56,
          pb: 'env(safe-area-inset-bottom)',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
          '& .MuiBottomNavigationAction-root': {
             color: theme.palette.text.secondary,
             paddingTop: '8px',
             paddingBottom: '8px',
             minWidth: 'auto',
             flex: 1,
             '&.Mui-selected': {
               color: theme.palette.primary.main,
               paddingTop: '6px',
               '& .MuiBottomNavigationAction-label': {
                 fontSize: '0.75rem',
                 fontWeight: 500,
               },
               '& .MuiSvgIcon-root': {
                 fontSize: 24,
               },
             },
             '& .MuiBottomNavigationAction-label': {
               fontSize: '0.65rem',
               fontWeight: 400,
               transition: 'font-size 0.2s ease, color 0.2s ease',
               mt: '2px',
             },
             '& .MuiSvgIcon-root': {
               fontSize: 22,
               transition: 'font-size 0.2s ease, color 0.2s ease',
             },
          }
        }}
      >
        {menuItems.map((item) => (
          <BottomNavigationAction
            key={item.text}
            label={item.text}
            icon={<item.icon />}
          />
        ))}
      </BottomNavigation>
    </>
  );
}