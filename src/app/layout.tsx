import "server-only";
import { ThemeRegistry } from '@/providers/theme-registry';
import '@/app/globals.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { motion } from "framer-motion";
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/utils/config';
import SessionSync from '@/components/SessionSync';

export const metadata = {
  title: 'Web3Lancer',
  description: 'A Web3 Freelancing Platform',
}

// Create a client for TanStack Query
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <SessionSync>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {children}
                    </motion.div>
                  </SessionSync>
                </LocalizationProvider>
              </AuthProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </ThemeRegistry>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
