export const componentStyles = {
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
};
