import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1E40AF',
      light: '#3B82F6',
      dark: '#1E3A8A',
    },
    secondary: { 
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#2563EB",
    },
    background: {
      default: '#f8fafc',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#10b981',
    },
    info: {
      main: '#0ea5e9',
    },
    warning: {
      main: '#f59e0b',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 10px 40px 0 rgba(31, 38, 135, 0.15)',
          transform: 'perspective(1000px)',
          transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          overflow: 'hidden',
          '&:hover': {
            transform: 'perspective(1000px) rotateX(5deg) translateY(-8px)',
            boxShadow: '0 18px 50px 0 rgba(31, 38, 135, 0.25)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 64, 175, 0.85)',
          backdropFilter: 'blur(15px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(30, 58, 138, 0.9)',
          backdropFilter: 'blur(15px)',
          boxShadow: '5px 0 30px rgba(0, 0, 0, 0.15)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'fixed',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '14px',
          textTransform: 'none',
          padding: '12px 28px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: '0 15px 25px rgba(0, 0, 0, 0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
          boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1E40AF 20%, #3B82F6 100%)',
            boxShadow: '0 15px 25px rgba(59, 130, 246, 0.4)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
            },
            '&:hover': {
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          fontWeight: 500,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.005em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 14,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 8px rgba(0,0,0,0.08)',
    '0 8px 16px rgba(0,0,0,0.08)',
    '0 12px 24px rgba(0,0,0,0.1)',
    '0 16px 32px rgba(0,0,0,0.1)',
    '0 20px 40px rgba(0,0,0,0.12)',
    '0 24px 48px rgba(0,0,0,0.12)',
    '0 32px 64px rgba(0,0,0,0.12)',
    '0 40px 80px rgba(0,0,0,0.15)',
    '0 48px 96px rgba(0,0,0,0.15)',
    '0 56px 112px rgba(0,0,0,0.15)',
    '0 64px 128px rgba(0,0,0,0.15)',
    '0 72px 144px rgba(0,0,0,0.15)',
    '0 80px 160px rgba(0,0,0,0.15)',
    '0 88px 176px rgba(0,0,0,0.15)',
    '0 96px 192px rgba(0,0,0,0.15)',
    '0 104px 208px rgba(0,0,0,0.15)',
    '0 112px 224px rgba(0,0,0,0.15)',
    '0 120px 240px rgba(0,0,0,0.15)',
    '0 128px 256px rgba(0,0,0,0.15)',
    '0 136px 272px rgba(0,0,0,0.15)',
    '0 144px 288px rgba(0,0,0,0.15)',
    '0 152px 304px rgba(0,0,0,0.15)',
    '0 160px 320px rgba(0,0,0,0.15)',
  ],
});