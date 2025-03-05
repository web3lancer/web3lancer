import * as React from 'react';
import { useConnect } from 'wagmi';
import { Box, Button, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const MotionButton = motion(Button);
const MotionPaper = motion(Paper);

export function WalletOptions() {
  const { connectors, connect, status, error } = useConnect();
  const router = useRouter();
  const [connecting, setConnecting] = React.useState<string | null>(null);
  
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

      <Grid container spacing={2}>
        {connectors.map((connector) => (
          <Grid item xs={12} key={connector.id}>
            <MotionButton
              component={motion.button}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleConnect(connector)}
              variant="outlined"
              disabled={!connector.ready || connecting === connector.id}
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
                {getWalletIcon(connector.id)}
              </Box>
              
              <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {connector.name}
                </Typography>
                {!connector.ready && (
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    Not installed
                  </Typography>
                )}
              </Box>

              {connecting === connector.id && (
                <CircularProgress size={24} sx={{ ml: 1 }} />
              )}
            </MotionButton>
          </Grid>
        ))}
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
  switch(id) {
    case 'metaMask':
      return <Image src="/wallets/metamask.svg" alt="MetaMask" fill style={{ objectFit: 'contain' }} />;
    case 'coinbaseWallet':
      return <Image src="/wallets/coinbase.svg" alt="Coinbase Wallet" fill style={{ objectFit: 'contain' }} />;
    case 'walletConnect':
      return <Image src="/wallets/walletconnect.svg" alt="WalletConnect" fill style={{ objectFit: 'contain' }} />;
    case 'injected':
      return <Image src="/wallets/browser-wallet.svg" alt="Browser Wallet" fill style={{ objectFit: 'contain' }} />;
    case 'safe':
      return <Image src="/wallets/safe.svg" alt="Safe" fill style={{ objectFit: 'contain' }} />;
    default:
      return <Box sx={{ bgcolor: 'primary.light', width: '100%', height: '100%', borderRadius: '50%' }} />;
  }
}
