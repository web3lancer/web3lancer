import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider, Button, Skeleton } from '@mui/material';
import { AccountBalanceWallet, ContentCopy, Refresh } from '@mui/icons-material';

interface WalletCardProps {
  wallet?: {
    walletAddress: string;
    walletType: string;
    createdAt: string;
  };
  balance?: string;
  currency?: string;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function WalletCard({ wallet, balance = '0.00', currency = 'ETH', loading = false, onRefresh }: WalletCardProps) {
  const copyToClipboard = () => {
    if (wallet?.walletAddress) {
      navigator.clipboard.writeText(wallet.walletAddress);
      alert('Wallet address copied to clipboard');
    }
  };

  // Format the wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };

  return (
    <Card sx={{ mb: 3, overflow: 'hidden' }}>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalanceWallet sx={{ mr: 1 }} />
          <Typography variant="h6">
            {loading ? <Skeleton width={120} /> : 'My Wallet'}
          </Typography>
        </Box>
        <Chip 
          label={loading ? <Skeleton width={80} /> : (wallet?.walletType === 'custodial' ? 'Custodial' : 'Non-Custodial')} 
          size="small"
          color="secondary"
        />
      </Box>
      
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Wallet Address
          </Typography>
          {loading ? (
            <Skeleton width="100%" height={28} />
          ) : wallet?.walletAddress ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" component="div" sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}>
                {formatAddress(wallet.walletAddress)}
              </Typography>
              <Button
                onClick={copyToClipboard}
                size="small"
                startIcon={<ContentCopy fontSize="small" />}
              >
                Copy
              </Button>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No wallet address available
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Balance
            </Typography>
            {loading ? (
              <Skeleton width={100} height={40} />
            ) : (
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {balance} <Typography component="span" variant="body1">{currency}</Typography>
              </Typography>
            )}
          </Box>
          <Button
            onClick={handleRefresh}
            startIcon={<Refresh />}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
