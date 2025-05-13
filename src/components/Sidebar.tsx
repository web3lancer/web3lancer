"use client";

import { Drawer, List, ListItemText, ListItemIcon, Box, BottomNavigation, BottomNavigationAction, Divider, ListItemButton, useTheme, useMediaQuery, Avatar, Button, Typography, Menu, MenuItem } from "@mui/material";
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
    if (user) {
      // Ensure user.$id is the correct field for user ID from your AuthContext
      return user.username ? `/u/${user.username}` : (user.$id ? `/u/${user.$id}` : '/login');
    }
    return '/login'; // Fallback if user is null, or redirect to sign-in
  }, [user]);

  const menuItems = useMemo(() => [
    { text: 'Dashboard', icon: Dashboard, path: '/dashboard' },
    { text: 'Projects', icon: Work, path: '/projects' },
    { text: 'Connect', icon: People, path: '/connect' },
    { text: 'Bookmarks', icon: Bookmarks, path: '/bookmarks' },
    { text: 'Profile', icon: Person, path: profilePath },
  ], [profilePath]);

  const [value, setValue] = useState(() => {
    const index = menuItems.findIndex(item => pathname.startsWith(item.path)); // use startsWith for dynamic routes like /u/[username]
    return index !== -1 ? index : 0;
  });

  useEffect(() => {
    const index = menuItems.findIndex(item => pathname.startsWith(item.path));
    if (index !== -1) {
      setValue(index);
    } else if (pathname === profilePath) { // Explicitly check for profile path if it's dynamic
        const profileIndex = menuItems.findIndex(item => item.text === 'Profile');
        if (profileIndex !== -1) setValue(profileIndex);
    }
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
        style={{ padding: '0 8px', flexGrow: 1, overflowY: 'auto' }} // Added overflowY auto for scrolling list items
      >
        <List>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <motion.div
                key={item.text}
                variants={itemVariants}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <ListItemButton 
                  onClick={() => {
                    router.push(item.path);
                  }}
                  sx={{
                    my: 0.5,
                    mx: 0.5,
                    borderRadius: 1.5,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '10px 16px',
                    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <AnimatePresence>
                    {isActive && (
                      <Box
                        component={motion.div}
                        layoutId="activeIndicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          bgcolor: 'primary.contrastText',
                          borderTopRightRadius: 4,
                          borderBottomRightRadius: 4,
                        }}
                      />
                    )}
                  </AnimatePresence>
                  <ListItemIcon sx={{ color: 'primary.contrastText', minWidth: 36 }}>
                    <item.icon sx={{ fontSize: 22 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      ml: 0.5,
                      '& .MuiListItemText-primary': {
                        color: 'primary.contrastText',
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.9rem',
                        transition: 'font-weight 0.2s ease',
                      },
                    }}
                  />
                </ListItemButton>
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