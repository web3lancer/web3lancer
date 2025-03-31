import * as React from 'react';
import { useConnect } from 'wagmi';
import { Box, Button, Typography, Grid, Paper, CircularProgress, Alert, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const MotionButton = motion(Button);
const MotionPaper = motion(Paper);

export function WalletOptions() {
  const { connectors, connect, status, error, isLoading } = useConnect();
  const router = useRouter();
  const [connecting, setConnecting] = React.useState<string | null>(null);
  
  // Handle injected wallets - detect Ethereum provider
  const [detectedWallets, setDetectedWallets] = React.useState<string[]>([]);
  
  // Reset connection state when component mounts or is re-rendered
  React.useEffect(() => {
    setConnecting(null);
    
    // Function to detect wallets
    const detectWallets = () => {
      const ethereum = window.ethereum;
      const detectedProviders: string[] = [];
      
      if (ethereum) {
        // Check for multiple providers in window.ethereum
        if (ethereum.providers?.length) {
          ethereum.providers.forEach((provider: any) => {
            if (provider.isMetaMask) detectedProviders.push('MetaMask');
            if (provider.isCoinbaseWallet) detectedProviders.push('Coinbase Wallet');
            if (provider.isBraveWallet) detectedProviders.push('Brave Wallet');
            if (provider.isOKXWallet) detectedProviders.push('OKX Wallet');
            if (provider.isPhantom) detectedProviders.push('Phantom');
            // Add other wallet detections as needed
          });
        } else {
          // Single provider
          if (ethereum.isMetaMask) detectedProviders.push('MetaMask');
          if (ethereum.isCoinbaseWallet) detectedProviders.push('Coinbase Wallet');
          if (ethereum.isBraveWallet) detectedProviders.push('Brave Wallet');
          if (ethereum.isOKXWallet) detectedProviders.push('OKX Wallet');
          if (ethereum.isPhantom) detectedProviders.push('Phantom');
          // Add other wallet detections as needed
        }
        
        // If we can't identify the specific wallet but Ethereum is available
        if (detectedProviders.length === 0) {
          detectedProviders.push('Browser Wallet');
        }
      }
      
      setDetectedWallets(detectedProviders);
    };
    
    // Run detection
    if (typeof window !== 'undefined') {
      detectWallets();
    }
    
    // Clean up function
    return () => {
      setConnecting(null);
    };
  }, []);
  
  const handleConnect = (connector: any) => {
    setConnecting(connector.id);
    connect({ connector });
    
    // Reset connecting state after a timeout in case of silent failure
    setTimeout(() => {
      setConnecting(null);
    }, 5000);
  };
  
  React.useEffect(() => {
    if (status === 'success') {
      setConnecting(null);
      router.push('/dashboard');
    }
  }, [status, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <MotionPaper
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        p: 3,
        borderRadius: 4,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
        Connect your wallet
      </Typography>
      
      {error && (
        <MotionPaper
          component={motion.div}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: 'error.light', 
            color: 'error.contrastText',
            borderRadius: 2
          }}
        >
          <Typography variant="body2">{error.message}</Typography>
        </MotionPaper>
      )}

      {detectedWallets.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Detected wallet(s): {detectedWallets.join(', ')}
        </Alert>
      )}

      <Grid container spacing={2}>
        {connectors.map((connector) => {
          // Determine if this is an injected connector
          const isInjected = connector.id === 'injected';
          // For injected connector, check if we detected a wallet
          const isDetected = isInjected && detectedWallets.length > 0;
          // Display injected connector differently if we detected a specific wallet
          const displayName = isInjected ? 
            (detectedWallets[0] || 'Default Browser Wallet') : 
            connector.name;

          return (
            <Grid item xs={12} key={connector.id}>
              <Tooltip 
                title={
                  isInjected 
                    ? "Connect to your browser's built-in wallet or extension" 
                    : `Connect with ${connector.name}`
                }
              >
                <span style={{ display: 'block', width: '100%' }}>
                  <MotionButton
                    component={motion.button}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleConnect(connector)}
                    variant="outlined"
                    disabled={connecting === connector.id}
                    sx={{
                      py: 1.5,
                      px: 3,
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 3,
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      textTransform: 'none',
                      fontSize: '1rem',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ 
                      position: 'relative', 
                      width: 32, 
                      height: 32,
                      flexShrink: 0,
                    }}>
                      {getWalletIcon(isInjected ? (detectedWallets[0]?.toLowerCase() || 'default') : connector.id)}
                    </Box>
                    
                    <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {displayName}
                      </Typography>
                      {isDetected && (
                        <Typography variant="caption" sx={{ display: 'block', color: 'success.main' }}>
                          Detected
                        </Typography>
                      )}
                    </Box>
  
                    {connecting === connector.id && (
                      <CircularProgress size={24} sx={{ ml: 1 }} />
                    )}
                  </MotionButton>
                </span>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
      
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
        New to Ethereum wallets?{' '}
        <Typography
          component="a"
          variant="body2"
          href="https://ethereum.org/wallets/"
          target="_blank"
          rel="noopener"
          sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
        >
          Learn more
        </Typography>
      </Typography>
    </MotionPaper>
  );
}

function getWalletIcon(id: string) {
  // Handle some common wallet types
  switch(id.toLowerCase()) {
    case 'metamask':
      return <Image src="/wallets/metamask.svg" alt="MetaMask" fill style={{ objectFit: 'contain' }} />;
    case 'coinbase wallet':
    case 'coinbasewallet':
      return <Image src="/wallets/coinbase.svg" alt="Coinbase Wallet" fill style={{ objectFit: 'contain' }} />;
    case 'walletconnect':
      return <Image src="/wallets/walletconnect.svg" alt="WalletConnect" fill style={{ objectFit: 'contain' }} />;
    case 'brave wallet':
    case 'brave':
      return <Image src="/wallets/brave.svg" alt="Brave Wallet" fill style={{ objectFit: 'contain' }} />;
    case 'okx wallet':
    case 'okx':
      return <Image src="/wallets/okx.svg" alt="OKX Wallet" fill style={{ objectFit: 'contain' }} />;
    case 'phantom':
      return <Image src="/wallets/phantom.svg" alt="Phantom" fill style={{ objectFit: 'contain' }} />;
    case 'injected':
    case 'browser':
    case 'browser wallet':
    case 'default':
      return <Image src="/wallets/browser-wallet.svg" alt="Browser Wallet" fill style={{ objectFit: 'contain' }} />;
    default:
      return <Box sx={{ bgcolor: 'primary.light', width: '100%', height: '100%', borderRadius: '50%' }} />;
  }
}
