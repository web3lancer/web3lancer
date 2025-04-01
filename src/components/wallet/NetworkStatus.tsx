import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { useMetaMask } from '@/hooks/useMetaMask';
import { chainNames, blockExplorers } from '@/utils/config';

export function NetworkStatus() {
  const { chainId, isConnected } = useMetaMask();
  const theme = useTheme();
  
  // Convert hex chainId to number if needed
  const numericChainId = chainId ? 
    (chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId)) : 
    null;
  
  // Determine chain name from config
  const chainName = numericChainId ? 
    (chainNames[numericChainId] || 'Unknown Network') : 
    'Not Connected';
  
  // Determine explorer URL
  const explorerUrl = numericChainId ? blockExplorers[numericChainId] : undefined;

  // Color map for different networks
  const getNetworkColor = () => {
    if (!numericChainId) return theme.palette.grey[500];
    
    switch(numericChainId) {
      case 1: return '#627EEA'; // Ethereum
      case 10: return '#FF0420'; // Optimism
      case 137: return '#8247E5'; // Polygon
      case 8453: return '#0052FF'; // Base
      case 42161: return '#2D374B'; // Arbitrum
      default: return theme.palette.primary.main;
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Chip 
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: getNetworkColor(),
                display: 'inline-block'
              }} 
            />
            <Typography variant="caption" fontWeight={500}>
              {chainName}
            </Typography>
          </Box>
        }
        size="small"
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.8)', 
          '& .MuiChip-label': { px: 1 }
        }}
      />
    </Box>
  );
}
