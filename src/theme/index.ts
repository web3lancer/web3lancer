import { createTheme, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Properly augment the theme types
declare module '@mui/material/styles' {
  interface Palette {
    discord: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  }
  
  interface PaletteOptions {
    discord?: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  }
}

// Augment ButtonPropsColorOverrides
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    discord: true;
  }
}

// Common theme options shared between light and dark themes
const commonOptions: Partial<ThemeOptions> = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
        },
      },
    },
  },
};

// Create light theme options
const lightTheme: ThemeOptions = {
  ...commonOptions,
  palette: {
    mode: 'light',
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
    divider: 'rgba(0, 0, 0, 0.12)',
    discord: {
      main: '#5865F2',
      light: '#7b85f5', // Lighter shade for hover/focus
      dark: '#4f5bda',  // Darker shade for active/pressed
      contrastText: '#FFFFFF',
    },
  },
  components: {
    ...commonOptions.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.05)', // Light theme track
            borderRadius: '5px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)', // Light theme thumb
            borderRadius: '5px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)', // Darker for hover
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        },
      },
    },
  },
};

// Create dark theme options by extending common options and overriding specific values
const darkTheme: ThemeOptions = {
  ...commonOptions,
  palette: {
    mode: 'dark',
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
    divider: 'rgba(255, 255, 255, 0.12)',
    discord: {
      main: '#5865F2',
      light: '#7b85f5',
      dark: '#4f5bda',
      contrastText: '#FFFFFF',
    },
  },
  components: {
    ...commonOptions.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)', // Dark theme track
            borderRadius: '5px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', // Dark theme thumb
            borderRadius: '5px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)', // Lighter for hover
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(31, 41, 55, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#111827',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
  },
};

// Function to get the theme based on the selected mode
export const getTheme = (mode: PaletteMode) => {
  return createTheme(mode === 'dark' ? darkTheme : lightTheme);
};

// For backwards compatibility
export const createAppTheme = (mode: PaletteMode) => getTheme(mode);

export { lightTheme, darkTheme };