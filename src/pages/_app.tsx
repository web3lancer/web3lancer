import { IntegrationProvider } from '@/context/IntegrationContext';
import { AppProps } from 'next/app';

// ... other imports

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <IntegrationProvider>
      {/* Other providers */}
      <Component {...pageProps} />
    </IntegrationProvider>
  );
}

export default MyApp;
