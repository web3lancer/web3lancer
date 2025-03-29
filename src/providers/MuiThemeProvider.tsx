import React, { useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '@/contexts/ThemeContext';

interface MuiThemeProviderProps {
  children: React.ReactNode;
}

export const CustomMuiThemeProvider: React.FC<MuiThemeProviderProps> = ({ children }) => {
  const { theme } = useTheme();
  const [muiTheme, setMuiTheme] = useState(
    createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: '#1E40AF',
        },
        secondary: {
          main: '#3B82F6',
        },
      },
    })
  );

  useEffect(() => {
    setMuiTheme(
      createTheme({
        palette: {
          mode: theme as 'light' | 'dark',
          primary: {
            main: theme === 'dark' ? '#3B82F6' : '#1E40AF',
          },
          secondary: {
            main: theme === 'dark' ? '#60A5FA' : '#3B82F6',
          },
          background: {
            default: theme === 'dark' ? '#121212' : '#ffffff',
            paper: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          },
          text: {
            primary: theme === 'dark' ? '#ffffff' : '#000000',
            secondary: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                backgroundImage: 'none',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                color: theme === 'dark' ? '#ffffff' : '#000000',
              },
            },
          },
        },
      })
    );
  }, [theme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
