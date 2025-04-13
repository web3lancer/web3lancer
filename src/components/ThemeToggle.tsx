'use client';

import React from 'react';
import { IconButton, useTheme as useMuiTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from 'next-themes'; // Use next-themes hook

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const muiTheme = useMuiTheme(); // Use MUI theme for styling consistency if needed

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
      {resolvedTheme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}