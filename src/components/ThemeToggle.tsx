'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@/providers/ThemeProvider';

interface ThemeToggleProps {
  sx?: any;
}

export default function ThemeToggle({ sx = {} }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Tooltip title={`Toggle ${resolvedTheme === 'light' ? 'Dark' : 'Light'} Mode`}>
      <IconButton onClick={toggleTheme} color="inherit" sx={sx}>
        {resolvedTheme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </Tooltip>
  );
}