import { AppProps } from 'next/app';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CustomMuiThemeProvider } from '@/providers/MuiThemeProvider';
import { GeometricBackground } from '@/components/GeometricBackground';
import '../app/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <CustomMuiThemeProvider>
        <GeometricBackground />
        <Component {...pageProps} />
      </CustomMuiThemeProvider>
    </ThemeProvider>
  );
}
