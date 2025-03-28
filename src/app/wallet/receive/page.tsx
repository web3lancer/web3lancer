"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ContentCopy, Check } from '@mui/icons-material';

// This would be replaced with a real QR code library
const QRCode = ({ value, size = 200 }: { value: string; size?: number }) => {
  return (
    <Box 
      sx={{ 
        width: size, 
        height: size, 
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        p: 2,
        borderRadius: 2,
      }}
    >
      <Typography variant="caption" color="text.secondary" gutterBottom>
        QR Code Placeholder
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
        {value}
      </Typography>
    </Box>
  );
};

export default function ReceivePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [copied, setCopied] = useState(false);
  
  const { wallet, loading, error: walletError } = user ? useWallet(user.$id) : { 
    wallet: null, 
    loading: false, 
    error: 'No user logged in' 
  };
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      router.push('/signin?redirect=/wallet/receive');
    }
  }, [user, loading, router]);
  
  const handleCopy = () => {
    if (wallet?.walletAddress) {
      navigator.clipboard.writeText(wallet.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4, px: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Link href="/wallet">
          <Button variant="text">← Back to Wallet</Button>
        </Link>
      </Box>
      
      <Typography variant="h4" sx={{ mb: 4 }}>Receive Cryptocurrency</Typography>
      
      {walletError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {walletError}
        </Alert>
      )}
      
      {!wallet && !loading && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No wallet found. Please create a wallet first.
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Select Currency:
          </Typography>
          <FormControl sx={{ minWidth: 120 }}>
            <Select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as string)}
              size="small"
            >
              <MenuItem value="BTC">Bitcoin (BTC)</MenuItem>
              <MenuItem value="ETH">Ethereum (ETH)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {wallet && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <QRCode value={wallet.walletAddress} />
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              Your {selectedCurrency === 'BTC' ? 'Bitcoin' : 'Ethereum'} Address:
            </Typography>
            
            <TextField
              fullWidth
              value={wallet.walletAddress}
              variant="outlined"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopy} edge="end">
                      {copied ? <Check color="success" /> : <ContentCopy />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            
            <Alert severity="info">
              <Typography variant="body2">
                Only send {selectedCurrency} to this address. Sending any other cryptocurrency may result in permanent loss.
              </Typography>
            </Alert>
          </>
        )}
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Important:</strong> Make sure to double-check the address before sending any cryptocurrency. Transactions cannot be reversed.
        </Typography>
      </Box>
    </Box>
  );
}
