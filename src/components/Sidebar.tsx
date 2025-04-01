"use client";

import { Drawer, List, ListItemText, ListItemIcon, Box, BottomNavigation, BottomNavigationAction, Divider, ListItemButton } from "@mui/material";
import { Dashboard, Work, Bookmarks, Storefront, Person, People } from "@mui/icons-material";
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";

const menuItems = [
  { text: 'home', icon: Dashboard, path: '/dashboard' },
  { text: 'Projects', icon: Work, path: '/projects' },
  { text: 'Connect', icon: People, path: '/connect' }, // Updated from "Marketplace" to "Connect"
  { text: 'Bookmarks', icon: Bookmarks, path: '/bookmarks' },
  { text: 'Profile', icon: Person, path: '/profile' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(() => {
    const index = menuItems.findIndex(item => item.path === pathname);
    return index !== -1 ? index : 0;
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Animation variants
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

  return (
    <>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(30, 58, 138, 0.9)',
            backdropFilter: 'blur(10px)',
            position: 'fixed',
            height: '100%',
            zIndex: 1200, // Ensure above content but below header
          },
          width: 240, // Fixed width to push content
          flexShrink: 0,
        }}
      >
        <Box sx={{ mt: 9, overflow: 'auto', height: '100%' }}>
          <motion.div
            initial="hidden"
            animate="show"
            variants={listVariants}
            style={{ padding: '0 8px' }}
          >
            <List>
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                
                return (
                  <motion.div
                    key={item.text}
                    variants={itemVariants}
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ListItemButton 
                      onClick={() => router.push(item.path)}
                      sx={{
                        my: 0.8,
                        mx: 0.5,
                        borderRadius: 2,
                        backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                        position: 'relative',
                        overflow: 'hidden',
                        padding: '12px 16px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
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
                            sx={{
                              position: 'absolute',
                              left: 0,
                              width: 4,
                              height: '100%',
                              bgcolor: 'white',
                              borderRadius: '0 4px 4px 0',
                            }}
                          />
                        )}
                      </AnimatePresence>
                      <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                        <item.icon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: 'white',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease',
                          },
                        }}
                      />
                      {isActive && (
                        <Box
                          component={motion.div}
                          layoutId="activePill"
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            marginLeft: 1,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </motion.div>
                );
              })}
            </List>
          </motion.div>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />

          <Box sx={{ px: 3, mt: 'auto', mb: 4, color: 'white', opacity: 0.7, fontSize: '0.75rem' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              © {new Date().getFullYear()} Web3Lancer
              <br />
              All rights reserved
            </motion.div>
          </Box>
        </Box>
      </Drawer>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(30, 58, 138, 0.9)',
            backdropFilter: 'blur(10px)',
          },
          zIndex: 1300, // Above header on mobile
        }}
      >
        <Box sx={{ mt: 9, overflow: 'auto', height: '100%' }}>
          <motion.div
            initial="hidden"
            animate="show"
            variants={listVariants}
            style={{ padding: '0 8px' }}
          >
            <List>
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                
                return (
                  <motion.div
                    key={item.text}
                    variants={itemVariants}
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ListItemButton 
                      onClick={() => router.push(item.path)}
                      sx={{
                        my: 0.8,
                        mx: 0.5,
                        borderRadius: 2,
                        backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                        position: 'relative',
                        overflow: 'hidden',
                        padding: '12px 16px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
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
                            sx={{
                              position: 'absolute',
                              left: 0,
                              width: 4,
                              height: '100%',
                              bgcolor: 'white',
                              borderRadius: '0 4px 4px 0',
                            }}
                          />
                        )}
                      </AnimatePresence>
                      <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                        <item.icon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: 'white',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease',
                          },
                        }}
                      />
                      {isActive && (
                        <Box
                          component={motion.div}
                          layoutId="activePill"
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            marginLeft: 1,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </motion.div>
                );
              })}
            </List>
          </motion.div>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />

          <Box sx={{ px: 3, mt: 'auto', mb: 4, color: 'white', opacity: 0.7, fontSize: '0.75rem' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              © {new Date().getFullYear()} Web3Lancer
              <br />
              All rights reserved
            </motion.div>
          </Box>
        </Box>
      </Drawer>

      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          router.push(menuItems[newValue].path);
        }}
        showLabels
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          background: 'rgba(30, 58, 138, 0.95)',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 -5px 25px 0 rgba(31, 38, 135, 0.15)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1300,
          height: 70,
          transition: 'none',
          boxSizing: 'border-box',
          '@supports (padding-bottom: env(safe-area-inset-bottom))': {
            paddingBottom: 'env(safe-area-inset-bottom)',
            height: 'calc(70px + env(safe-area-inset-bottom))',
          },
        }}
      >
        {menuItems.map((item, index) => (
          <BottomNavigationAction
            key={item.text}
            label={item.text}
            icon={<item.icon />}
            sx={{ 
              color: index === value ? 'white' : 'rgba(255,255,255,0.6)', 
              '& .MuiBottomNavigationAction-label': {
                fontSize: index === value ? '0.7rem' : '0.65rem',
                fontWeight: index === value ? 600 : 400,
                transition: 'all 0.2s ease',
              },
              '& .MuiSvgIcon-root': {
                transition: 'all 0.3s ease',
                fontSize: index === value ? 24 : 22,
              },
            }}
          />
        ))}
      </BottomNavigation>
    </>
  );
}