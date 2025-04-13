import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useMetaMask } from '../../hooks/useMetaMask';
import { NetworkSwitcher } from './NetworkSwitcher';

export function NetworkStatus() {
  const { isConnected, getChainName } = useMetaMask();
  
  if (!isConnected) {
    return null;
  }
  
  const networkName = getChainName();
  const isKnownNetwork = networkName !== 'Unknown Network'; 
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <NetworkSwitcher />
    </Box>
  );
}
