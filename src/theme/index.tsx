import { createTheme, ThemeOptions, responsiveFontSizes, PaletteMode } from '@mui/material/styles';

// Create a theme instance for light mode
const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode palette
          primary: {
            main: '#1E40AF',
            light: '#3B82F6',
            dark: '#1E3A8A',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#8B5CF6',
            light: '#A78BFA',
            dark: '#6D28D9',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#F9FAFB',
            paper: '#FFFFFF',
          },
          text: {
            primary: '#111827',
            secondary: '#4B5563',
          },
          error: {
            main: '#EF4444',
          },
          warning: {
            main: '#F59E0B',
          },
          info: {
            main: '#3B82F6',
          },
          success: {
            main: '#10B981',
          },
        }
      : {
          // Dark mode palette
          primary: {
            main: '#3B82F6',
            light: '#60A5FA',
            dark: '#1E40AF',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#8B5CF6',
            light: '#A78BFA',
            dark: '#6D28D9',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#111827',
            paper: '#1F2937',
          },
          text: {
            primary: '#F9FAFB',
            secondary: '#D1D5DB',
          },
          error: {
            main: '#F87171',
          },
          warning: {
            main: '#FBBF24',
          },
          info: {
            main: '#60A5FA',
          },
          success: {
            main: '#34D399',
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: mode === 'light' ? '#2563EB' : '#60A5FA',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: mode === 'light' 
            ? '0 4px 20px rgba(0, 0, 0, 0.05)'
            : '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.Mui-selected': {
            backgroundColor: mode === 'light' 
              ? 'rgba(59, 130, 246, 0.1)'
              : 'rgba(59, 130, 246, 0.2)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light'
            ? 'rgba(255, 255, 255, 0.8)'
            : 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: mode === 'light'
            ? '1px solid rgba(231, 231, 231, 0.8)'
            : '1px solid rgba(55, 65, 81, 0.8)',
          color: mode === 'light' ? '#111827' : '#F9FAFB',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'light'
            ? 'rgba(255, 255, 255, 0.9)'
            : 'rgba(31, 41, 55, 0.9)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#E5E7EB' : '#374151',
          color: mode === 'light' ? '#1F2937' : '#D1D5DB',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            '&.Mui-focused fieldset': {
              borderColor: mode === 'light' ? '#2563EB' : '#60A5FA',
            },
          },
        },
      },
    },
  },
});

// Create and export the theme creation function
export const createAppTheme = (mode: PaletteMode) => {
  let theme = createTheme(getDesignTokens(mode));
  theme = responsiveFontSizes(theme);
  return theme;
};

// Export the theme options for direct access
export const themeOptions = {
  getDesignTokens,
};