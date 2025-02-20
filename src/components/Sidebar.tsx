"use client";

import { Drawer, List, ListItem, ListItemText, ListItemIcon, Box } from "@mui/material";
import { CalendarToday, Dashboard, EventNote, Work, Store } from "@mui/icons-material";
import { useRouter, usePathname } from 'next/navigation';
import { motion } from "framer-motion";
import React from "react";

const menuItems = [
  { text: 'Dashboard', icon: Dashboard, path: '/dashboard' },
  { text: 'Projects', icon: Work, path: '/projects' },
  { text: 'Planning', icon: EventNote, path: '/planning' },
  { text: 'Calendar', icon: CalendarToday, path: '/calendar' },
  { text: 'Marketplace', icon: Store, path: '/marketplace' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(45deg, #1E40AF 30%, #3B82F6 90%)',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto'
        },
      }}
    >
      <Box sx={{ mt: 8, overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <motion.div
                key={item.text}
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                <ListItem 
                  component="li"
                  onClick={() => router.push(item.path)}
                  sx={{
                    my: 0.5,
                    mx: 1,
                    borderRadius: 2,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  {isActive && (
                    <Box
                      component={motion.div}
                      layoutId="activeIndicator"
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
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: isActive ? 600 : 400,
                      },
                    }}
                  />
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}