'use client';
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { getTheme } from '@/theme';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { PaletteMode, CssBaseline } from '@mui/material';

// Custom hook to use theme with MUI
export const useThemeContext = () => {
  const { resolvedTheme, setTheme, theme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  // Convert next-themes theme value to MUI PaletteMode, default to light if undefined
  const mode: PaletteMode = resolvedTheme === 'dark' ? 'dark' : 'light';
  
  return { mode, toggleTheme, currentTheme: theme };
};

// MUI Theme Provider that uses next-themes
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { mode } = useThemeContext();
  const [mounted, setMounted] = useState(false);
  
  // Create the theme based on the current mode
  const muiTheme = getTheme(mode);

  // Ensure theme hydration only happens after mounting on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline /> {/* Apply baseline styles */}
      {children}
    </MUIThemeProvider>
  );
};

// Root provider to wrap your app with
export const ThemeProviderWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      enableColorScheme
      storageKey="web3lancer-theme"
    >
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </NextThemesProvider>
  );
};