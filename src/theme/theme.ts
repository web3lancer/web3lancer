import { createTheme, PaletteMode } from '@mui/material';

// Create a theme instance for both light and dark modes
export const getTheme = (mode: PaletteMode) => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode palette
            primary: {
              main: '#1E40AF',
              light: '#3B82F6',
              dark: '#1E3A8A',
              contrastText: '#fff',
            },
            secondary: {
              main: '#8B5CF6',
              light: '#A78BFA',
              dark: '#6D28D9',
              contrastText: '#fff',
            },
            background: {
              default: '#f6f7f9',
              paper: '#ffffff',
            },
            text: {
              primary: '#333333',
              secondary: '#666666',
            },
          }
        : {
            // Dark mode palette
            primary: {
              main: '#3B82F6',
              light: '#60A5FA',
              dark: '#1E40AF',
              contrastText: '#fff',
            },
            secondary: {
              main: '#8B5CF6',
              light: '#A78BFA',
              dark: '#6D28D9',
              contrastText: '#fff',
            },
            background: {
              default: '#111827',
              paper: '#1F2937',
            },
            text: {
              primary: '#F9FAFB',
              secondary: '#D1D5DB',
            },
          }),
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.mode === 'light' 
              ? 'rgba(255, 255, 255, 0.8)' 
              : 'rgba(31, 41, 55, 0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'none',
            borderBottom: `1px solid ${
              theme.palette.mode === 'light' 
                ? 'rgba(231, 231, 231, 0.8)' 
                : 'rgba(55, 65, 81, 0.8)'
            }`,
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.mode === 'light'
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(31, 41, 55, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 16,
            border: `1px solid ${
              theme.palette.mode === 'light'
                ? 'rgba(255, 255, 255, 0.5)'
                : 'rgba(55, 65, 81, 0.5)'
            }`,
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            ...(theme.palette.mode === 'dark' && {
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            }),
          }),
        },
      },
    },
  });
};