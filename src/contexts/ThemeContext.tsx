'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { getTheme } from '@/theme';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { PaletteMode, CssBaseline } from '@mui/material';

// Custom hook to use theme with MUI
export const useThemeContext = () => {
  const { resolvedTheme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Convert next-themes theme value to MUI PaletteMode, default to light if undefined
  const mode: PaletteMode = resolvedTheme === 'dark' ? 'dark' : 'light';
  
  return { mode, toggleTheme };
};

// MUI Theme Provider that uses next-themes
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { mode } = useThemeContext();
  
  // Create the theme based on the current mode
  const muiTheme = getTheme(mode);

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline /> {/* Add CssBaseline here */}
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