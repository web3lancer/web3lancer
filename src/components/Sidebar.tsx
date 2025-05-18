"use client";

import { Drawer, List, ListItemText, ListItemIcon, Box, BottomNavigation, BottomNavigationAction, Divider, ListItemButton, useTheme, useMediaQuery, Avatar, Button, Typography, Menu, MenuItem, ListItem, Tooltip, Fade, ButtonBase, Popper, Paper, ClickAwayListener, MenuList } from "@mui/material";
import { Dashboard, Work, Bookmarks, Storefront, Person, People, Groups, Loyalty, CampaignOutlined, MoreHoriz } from "@mui/icons-material";
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for "More" dropdown menu
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreButtonRef = useRef<HTMLDivElement>(null);
  const moreBottomNavRef = useRef<HTMLDivElement>(null);
  
  const profilePath = useMemo(() => {
    if (user && user.$id) {
      return `/u/${user.$id}`;
    }
    return '/login';
  }, [user]);

  // Define menu items for the sidebar
  const mainMenuItems = useMemo(() => [
    { text: 'Home', icon: Dashboard, path: '/home' },
    { text: 'Projects', icon: Work, path: '/projects' },
    { text: 'Connect', icon: People, path: '/connect' },
    { text: 'Groups', icon: Groups, path: '/groups' },
    { text: 'Lancelot', icon: Loyalty, path: '/lancelot' }
  ], []);
  
  // Items to show in "More" dropdown on smaller screens
  const moreMenuItems = useMemo(() => [
    { text: 'Ads', icon: CampaignOutlined, path: '/ads' },
    { text: 'Bookmarks', icon: Bookmarks, path: '/bookmarks' },
    { text: 'Profile', icon: Person, path: profilePath }
  ], [profilePath]);
  
  // All menu items combined for larger screens and mobile bottom nav
  const allMenuItems = useMemo(() => [
    ...mainMenuItems,
    ...moreMenuItems
  ], [mainMenuItems, moreMenuItems]);
  
  // Mobile nav items (Dashboard, Projects, Connect, Lancelot, Profile)
  const mobileNavItems = useMemo(() => [
    { text: 'Home', icon: Dashboard, path: '/home' },
    { text: 'Projects', icon: Work, path: '/projects' },
    { text: 'Connect', icon: People, path: '/connect' },
    { text: 'Lancelot', icon: Loyalty, path: '/lancelot' },
    { text: 'Profile', icon: Person, path: profilePath }
  ], [profilePath]);

  const [value, setValue] = useState(() => {
    const currentPath = pathname ?? '';
    
    // Match /u/[id] or /u/[usernameOrId] 
    if (currentPath.startsWith('/u/')) {
      const profileIndex = allMenuItems.findIndex(item => item.text === 'Profile');
      if (profileIndex !== -1) return profileIndex;
    }
    
    const index = allMenuItems.findIndex(item => item.path !== '/' && currentPath.startsWith(item.path));
    return index !== -1 ? index : (currentPath === '/' ? 0 : -1);
  });

  useEffect(() => {
    const currentPath = pathname ?? '';
    let activeIndex = -1;

    // Special handling for dynamic profile paths /u/[usernameOrId]
    if (currentPath.startsWith('/u/')) {
      const profileItemIndex = allMenuItems.findIndex(item => item.text === 'Profile');
      if (profileItemIndex !== -1) {
        activeIndex = profileItemIndex;
      }
    } else {
      // Standard path matching
      const exactMatchIndex = allMenuItems.findIndex(item => item.path === currentPath);
      if (exactMatchIndex !== -1) {
        activeIndex = exactMatchIndex;
      } else {
        // Fallback to startsWith for parent paths
        const startsWithIndex = allMenuItems.findIndex(item => item.path !== '/' && currentPath.startsWith(item.path));
        if (startsWithIndex !== -1) {
          activeIndex = startsWithIndex;
        }
      }
    }
    
    // If still no match and on root path, select Dashboard
    if (activeIndex === -1 && currentPath === '/' && allMenuItems[0]?.path === '/home') {
        activeIndex = 0;
    }

    setValue(activeIndex);
  }, [pathname, allMenuItems, profilePath]);

  const handleMoreClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setMoreMenuOpen(prev => !prev);
  };

  const handleMoreItemClick = (path: string) => {
    router.push(path);
    setMoreMenuOpen(false);
  };

  const handleClickAway = () => {
    setMoreMenuOpen(false);
  };

  // Check if an item from the More menu is active
  const isMoreActive = useMemo(() => {
    const currentPath = pathname ?? '';
    return moreMenuItems.some(item => 
      item.path === currentPath || 
      (item.path !== '/' && currentPath.startsWith(item.path)) ||
      (item.text === 'Profile' && currentPath.startsWith('/u/'))
    );
  }, [pathname, moreMenuItems]);

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

  const renderMainMenuItems = () => (
    mainMenuItems.map((item, index) => {
      const isActive = mainMenuItems.findIndex(mItem => mItem.path === pathname) === index || 
                      (pathname && pathname.startsWith(item.path) && item.path !== '/');
      
      return (
        <motion.div key={item.text} variants={itemVariants}>
          <ListItemButton
            component="a"
            href={item.path}
            onClick={(e) => {
              e.preventDefault();
              router.push(item.path);
            }}
            sx={{
              borderRadius: '12px',
              mb: 0.5,
              py: 1.5,
              color: 'primary.contrastText',
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : undefined,
              '&:hover': {
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <item.icon />
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: isActive ? 600 : 400,
                sx: { letterSpacing: '0.025em' }
              }} 
            />
          </ListItemButton>
        </motion.div>
      );
    })
  );

  const renderMoreButton = () => (
    <motion.div variants={itemVariants}>
      <ListItemButton
        ref={moreButtonRef}
        onClick={handleMoreClick}
        sx={{
          borderRadius: '12px',
          mb: 0.5,
          py: 1.5,
          color: 'primary.contrastText',
          backgroundColor: isMoreActive || moreMenuOpen ? 'rgba(255, 255, 255, 0.15)' : undefined,
          '&:hover': {
            backgroundColor: isMoreActive || moreMenuOpen ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
          <MoreHoriz />
        </ListItemIcon>
        <ListItemText 
          primary="More" 
          primaryTypographyProps={{ 
            fontWeight: isMoreActive ? 600 : 400,
            sx: { letterSpacing: '0.025em' }
          }} 
        />
      </ListItemButton>

      <Popper
        open={moreMenuOpen}
        anchorEl={moreButtonRef.current}
        placement="right-start"
        transition
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper 
              elevation={6}
              sx={{ 
                borderRadius: '12px',
                mt: 0.5,
                minWidth: 200,
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                color: theme.palette.primary.contrastText
              }}
            >
              <ClickAwayListener onClickAway={handleClickAway}>
                <MenuList autoFocusItem={moreMenuOpen}>
                  {moreMenuItems.map((item) => {
                    const isItemActive = pathname === item.path || 
                                        (pathname && pathname.startsWith(item.path) && item.path !== '/') ||
                                        (item.text === 'Profile' && pathname && pathname.startsWith('/u/'));
                    
                    return (
                      <MenuItem
                        key={item.text}
                        onClick={() => handleMoreItemClick(item.path)}
                        sx={{
                          borderRadius: '8px',
                          mx: 1,
                          my: 0.5,
                          backgroundColor: isItemActive ? 'rgba(255, 255, 255, 0.15)' : undefined,
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                          <item.icon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </motion.div>
  );

  const drawerContent = (
    <Box sx={{ 
      mt: { xs: 1, md: 1 }, // Minimal top margin to push content to the top
      height: 'calc(100% - 32px)',
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' // Container doesn't scroll, but allows inner content to scroll
    }}>
      <motion.div
        initial="hidden"
        animate="show"
        variants={listVariants}
        style={{ 
          padding: '0 8px', 
          flexGrow: 1, 
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
        }}
      >
        <List disablePadding>
          {/* Main menu items */}
          {renderMainMenuItems()}
          
          {/* More dropdown for small screens */}
          {isMediumScreen && renderMoreButton()}
          
          {/* Secondary items displayed directly on larger screens */}
          {!isMediumScreen && moreMenuItems.map((item, index) => {
            const isActive = value === mainMenuItems.length + index;
            
            return (
              <motion.div key={item.text} variants={itemVariants}>
                <ListItemButton
                  component="a"
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.path);
                  }}
                  sx={{
                    borderRadius: '12px',
                    mb: 0.5,
                    py: 1.5,
                    color: 'primary.contrastText',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : undefined,
                    '&:hover': {
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 600 : 400,
                      sx: { letterSpacing: '0.025em' }
                    }} 
                  />
                </ListItemButton>
              </motion.div>
            );
          })}
        </List>
      </motion.div>
      
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />
      
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

  // Mobile bottom navigation with five fixed items
  const bottomNavigation = (
    <Box>
      <BottomNavigation
        value={(() => {
          const currentPath = pathname ?? '';
          
          // Special handling for profile path
          if (currentPath.startsWith('/u/')) {
            return 4; // Profile is the 5th item (index 4)
          }
          
          // Find matching path in mobile items
          return mobileNavItems.findIndex(item => 
            item.path === currentPath || 
            (item.path !== '/' && currentPath.startsWith(item.path))
          );
        })()}
        onChange={(event, newValue) => {
          router.push(mobileNavItems[newValue].path);
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
          '& .MuiBottomNavigationAction-root': {
             color: theme.palette.text.secondary,
             paddingTop: '8px',
             paddingBottom: '8px',
             '&.Mui-selected': {
               color: theme.palette.primary.main,
               '& .MuiBottomNavigationAction-label': {
                 fontSize: '0.75rem',
                 fontWeight: 500,
               },
             },
          }
        }}
      >
        {mobileNavItems.map((item) => (
          <BottomNavigationAction
            key={item.text}
            label={item.text}
            icon={<item.icon />}
          />
        ))}
      </BottomNavigation>
    </Box>
  );

  return (
    <>
      <Drawer
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
            height: 'calc(100% - 104px)',
            zIndex: theme.zIndex.appBar - 1,
            transition: 'background-color 0.3s ease',
            marginTop: '92px',
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

      {/* Mobile Bottom Navigation */}
      {isSmallScreen && bottomNavigation}
    </>
  );
}