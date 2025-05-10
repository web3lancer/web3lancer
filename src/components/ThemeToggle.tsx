'use client';

import React, { useEffect, useState } from 'react';
import { IconButton, useTheme as useMuiTheme, Box, CircularProgress } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const [mounted, setMounted] = useState(false);
  
  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
        <CircularProgress size={20} color="inherit" sx={{ opacity: 0.5 }} />
      </Box>
    );
  }

  return (
    <IconButton 
      onClick={toggleTheme} 
      color="inherit"
      sx={{
        transition: 'all 0.3s ease',
        background: resolvedTheme === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.05)',
        '&:hover': {
          background: resolvedTheme === 'dark' 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      {resolvedTheme === 'dark' ? (
        <Brightness7Icon sx={{ color: muiTheme.palette.common.white }} />
      ) : (
        <Brightness4Icon sx={{ color: muiTheme.palette.common.black }} />
      )}
    </IconButton>
  );
}