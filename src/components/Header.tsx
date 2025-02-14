"use client";

import { AppBar, Toolbar, Typography, Button, IconButton, Avatar, Box } from "@mui/material";
import { AccountCircle, Notifications } from "@mui/icons-material";
import React, { useState } from "react";
import Image from 'next/image';
import { motion } from "framer-motion";

export default function Header() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <AppBar position="fixed">
      <Toolbar>
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          style={{ position: 'relative', width: 40, height: 40 }}
        >
          <Image 
            src="/logo/web3lancer.jpg"
            alt="Web3Lancer Logo"
            fill
            style={{ objectFit: 'contain', borderRadius: '8px' }}
          />
        </motion.div>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            ml: 2,
            fontWeight: 600,
            background: 'linear-gradient(45deg, #1E40AF, #3B82F6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Web3Lancer
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            color="inherit"
            sx={{
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.1)' }
            }}
          >
            <Notifications />
          </IconButton>
          
          <Button 
            color="inherit"
            variant="outlined"
            sx={{
              borderRadius: '20px',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                background: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            Sign In
          </Button>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar 
              sx={{ 
                cursor: 'pointer',
                background: 'linear-gradient(45deg, #1E40AF, #3B82F6)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              }}
            >
              <AccountCircle />
            </Avatar>
          </motion.div>
        </Box>
      </Toolbar>
    </AppBar>
  );
}