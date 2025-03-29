'use client';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { GeometricBackground } from '@/components/GeometricBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Web3Lancer - Blockchain Freelancing Platform',
  description: 'Connect with top blockchain talent and projects in a decentralized workspace',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <GeometricBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
