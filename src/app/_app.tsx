import '../app/globals.css';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as AppThemeProvider } from '@/contexts/ThemeContext';
import { GeometricBackground } from '@/components/GeometricBackground';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

// Create a MUI theme provider that uses our theme context
const AppThemeWrapper = ({ children }) => {
  const { theme } = useTheme();
  const [muiTheme, setMuiTheme] = useState(
    createTheme({
      palette: {
        mode: 'light',
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

function MyApp({ Component, pageProps }) {
  return (
    <AppThemeProvider>
      <AppThemeWrapper>
        <GeometricBackground />
        <Component {...pageProps} />
      </AppThemeWrapper>
    </AppThemeProvider>
  );
}

export default MyApp;
