"use client";

import { Drawer, List, ListItemText, ListItemIcon, Box, BottomNavigation, BottomNavigationAction, Divider, ListItemButton, useTheme, useMediaQuery, Avatar, Button, Typography, Menu, MenuItem } from "@mui/material";
import { Dashboard, Work, Bookmarks, Storefront, Person, People } from "@mui/icons-material";
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
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

const menuItems = [
  { text: 'Dashboard', icon: Dashboard, path: '/dashboard' },
  { text: 'Projects', icon: Work, path: '/projects' },
  { text: 'Connect', icon: People, path: '/connect' },
  { text: 'Bookmarks', icon: Bookmarks, path: '/bookmarks' },
  { text: 'Profile', icon: Person, path: '/profile' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const [value, setValue] = useState(() => {
    const index = menuItems.findIndex(item => item.path === pathname);
    return index !== -1 ? index : 0;
  });

  useEffect(() => {
    const index = menuItems.findIndex(item => item.path === pathname);
    if (index !== -1) {
      setValue(index);
    }
  }, [pathname]);

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

  // Create the AccountCircleWidget component for the sidebar
  const AccountCircleWidget = () => {
    const { user } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
    
    useEffect(() => {
      // Fetch wallet info if needed
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts.length > 0) {
              setWalletAddress(accounts[0]);
            }
          })
          .catch(console.error);
      }
    }, []);
    
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const formatWalletAddress = (address: string) => {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          {user && (
            <>
              <Avatar
                sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.light }}
                alt={user.displayName || "User"}
                src={user.photoURL || undefined}
              >
                {(user.displayName || "U")[0].toUpperCase()}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
                  {user.displayName || "User"}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {user.email || ""}
                </Typography>
              </Box>
            </>
          )}
          {!user && (
            <Button
              variant="contained"
              fullWidth
              href="/signin"
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.25)',
                }
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
        
        {/* Wallet Connection Button */}
        <Button
          variant="outlined"
          onClick={handleClick}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: '#fff',
            fontSize: '0.8rem',
            mt: 1,
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              background: 'rgba(255, 255, 255, 0.05)',
            }
          }}
        >
          {walletAddress ? formatWalletAddress(walletAddress) : 'Connect Wallet'}
        </Button>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: '12px',
              minWidth: '180px',
              overflow: 'visible',
              mt: 1.5,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClose}>Wallet</MenuItem>
          <MenuItem onClick={() => {
            // Disconnect wallet
            if (window.ethereum && typeof window.ethereum.request === 'function') {
              // This is more of a UI disconnect, actual implementation depends on wallet
              setWalletAddress(undefined);
            }
            handleClose();
          }}>Disconnect</MenuItem>
        </Menu>
      </Box>
    );
  };

  const drawerContent = (
    <Box sx={{ mt: { xs: 8, md: 9 }, overflow: 'auto', height: 'calc(100% - 72px)', display: 'flex', flexDirection: 'column' }}>
      <motion.div
        initial="hidden"
        animate="show"
        variants={listVariants}
        style={{ padding: '0 8px', flexGrow: 1 }}
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

      {/* Add account widget before the copyright */}
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

      <Box sx={{ px: 2, py: 2, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          © {new Date().getFullYear()} Web3Lancer
        </motion.div>
      </Box>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mt: 2, mb: 2 }} />
      
      {/* Account circle widget for desktop only */}
      <Box 
        sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column',
          px: 2,
          py: 1.5,
          mx: 1,
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <SidebarAccountWidget />
      </Box>
      
      <AccountCircleWidget />
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