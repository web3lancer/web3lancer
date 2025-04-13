import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography,
  CircularProgress 
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { useMetaMask } from '../../hooks/useMetaMask';

// Network configurations
const networks = {
  1: { // Ethereum Mainnet
    chainId: "0x1",
    name: "Ethereum Mainnet"
  },
  10: { // Optimism
    chainId: "0xA",
    name: "Optimism",
    rpcUrls: ["https://mainnet.optimism.io"],
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://optimistic.etherscan.io"]
  },
  137: { // Polygon
    chainId: "0x89",
    name: "Polygon",
    rpcUrls: ["https://polygon-rpc.com"],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    blockExplorerUrls: ["https://polygonscan.com"]
  },
  8453: { // Base
    chainId: "0x2105",
    name: "Base",
    rpcUrls: ["https://mainnet.base.org"],
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://basescan.org"]
  },
  42161: { // Arbitrum
    chainId: "0xa4b1",
    name: "Arbitrum One",
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://arbiscan.io"]
  }
};

export function NetworkSwitcher() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const { provider, chainId, isConnected } = useMetaMask();
  
  // Convert hex chainId to number
  const numericChainId = chainId ? 
    (chainId.startsWith('0x') ? parseInt(chainId, 16) : Number(chainId)) : 
    null;
  
  // Get current chain name using the local networks object
  const currentChainName = numericChainId && networks[numericChainId as keyof typeof networks] ?
    networks[numericChainId as keyof typeof networks].name :
    (isConnected ? 'Unknown Network' : 'Not Connected');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchNetwork = async (networkId: number) => {
    if (!provider) return;
    
    const network = networks[networkId as keyof typeof networks];
    if (!network) return;
    
    setSwitchingTo(network.chainId);
    
    try {
      // Try to switch to the network
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.chainId }]
      });
    } catch (err: any) {
      // If the error code is 4902, the network needs to be added
      // Also check if rpcUrls exist before attempting to add
      if (err.code === 4902 && network.rpcUrls) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: network.chainId,
              chainName: network.name,
              rpcUrls: network.rpcUrls,
              nativeCurrency: network.nativeCurrency,
              blockExplorerUrls: network.blockExplorerUrls
            }]
          });
        } catch (addErr) {
          console.error("Error adding network:", addErr);
        }
      } else {
        console.error("Error switching network:", err);
      }
    } finally {
      setSwitchingTo(null);
      handleClose();
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<KeyboardArrowDown />}
        size="small"
        sx={{ 
          borderRadius: 2, 
          color: 'text.primary',
          borderColor: 'divider',
          textTransform: 'none',
          px: 1.5,
          '&:hover': { 
            borderColor: 'primary.main', 
            bgcolor: 'background.paper' 
          }
        }}
      >
        {currentChainName}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'network-button',
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ px: 2, py: 1, color: 'text.secondary' }}
        >
          Select Network
        </Typography>
        
        {Object.entries(networks).map(([id, network]) => (
          <MenuItem 
            key={id}
            onClick={() => handleSwitchNetwork(Number(id))}
            selected={numericChainId === Number(id)}
            disabled={switchingTo === network.chainId}
          >
            <ListItemIcon>
              {switchingTo === network.chainId ? (
                <CircularProgress size={18} />
              ) : (
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: numericChainId === Number(id) ? 'primary.main' : 'grey.300'
                  }} 
                />
              )}
            </ListItemIcon>
            <ListItemText primary={network.name} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
