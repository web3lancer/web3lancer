import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useMetaMask } from '@/hooks/useMetaMask';
import { NetworkSwitcher } from './NetworkSwitcher';
import { chainNames } from '@/utils/config';

export function NetworkStatus() {
  const { chainId, isConnected } = useMetaMask();
  
  if (!isConnected) {
    return null;
  }
  
  // Convert hex chainId to number
  const numericChainId = chainId ? 
    (chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId)) : 
    null;
  
  // Get network name from chainId
  const networkName = numericChainId && chainNames[numericChainId] ? 
    chainNames[numericChainId] : 
    'Unknown Network';
  
  // Determine if on a supported network
  const isKnownNetwork = numericChainId && chainNames[numericChainId];
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <NetworkSwitcher />
    </Box>
  );
}
