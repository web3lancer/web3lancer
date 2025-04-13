'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { getTheme } from '@/theme';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useTheme } from 'next-themes';
import { PaletteMode } from '@mui/material';

// Custom hook to use theme with MUI
export const useThemeContext = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Convert next-themes theme value to MUI PaletteMode
  const mode: PaletteMode = theme === 'dark' ? 'dark' : 'light';
  
  return { mode, toggleTheme };
};

// MUI Theme Provider that uses next-themes
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { mode } = useThemeContext();
  
  // Create the theme based on the current mode
  const muiTheme = getTheme(mode);

  return (
    <MUIThemeProvider theme={muiTheme}>
      {children}
    </MUIThemeProvider>
  );
};

// Root provider to wrap your app with
export const ThemeProviderWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </NextThemesProvider>
  );
};