"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { useMetaMask } from '@/hooks/useMetaMask';
import { useAbstraxionAccount, useModal } from '@burnt-labs/abstraxion';
import { Abstraxion } from "@burnt-labs/abstraxion";
import { TokenBalance } from '@/components/wallet/TokenBalance';
import { MintNFT } from '@/components/wallet/MintNFT';
import Link from 'next/link';
import { WEB3LANCER_CONTRACTS } from '@/utils/contractUtils';

// Example tokens for demo - we'd use a proper token list in production
const EXAMPLE_TOKENS = [
  { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH" }, // Wrapped ETH
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC" }, // USDC
  { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI" }, // DAI
];

export default function TokensPage() {
  const { isConnected: isMetaMaskConnected, account: metaMaskAccount } = useMetaMask();
  const { data: xionAccount, isConnected: isXionConnected } = useAbstraxionAccount();
  const [showXionModal, setShowXionModal] = useModal();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Show a loading state until MetaMask connection status is determined
  if (typeof isMetaMaskConnected === 'undefined') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Tokens & NFTs</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setShowXionModal(true)}
            sx={{ ml: 2 }}
          >
            {isXionConnected ? `Xion: ${xionAccount?.bech32Address.substring(0, 6)}...${xionAccount?.bech32Address.substring(xionAccount?.bech32Address.length - 4)}` : 'Connect Xion'}
          </Button>
          <Link href="/wallet" passHref>
            <Button variant="outlined" sx={{ ml: 2 }}>Back to Wallet</Button>
          </Link>
        </Box>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Tokens" />
          <Tab label="NFTs" />
          <Tab label="Mint NFT" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabIndex === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Your Tokens
              </Typography>

              {!isMetaMaskConnected && (
                <Typography color="text.secondary" sx={{ my: 4 }}>
                  Please connect your wallet to view your tokens
                </Typography>
              )}

              {isMetaMaskConnected && (
                <Grid container spacing={2}>
                  {/* Native ETH Balance would go here */}
                  
                  {/* ERC-20 Token Balances */}
                  {EXAMPLE_TOKENS.map((token) => (
                    <Grid item xs={12} sm={6} md={4} key={token.address}>
                      <TokenBalance 
                        tokenAddress={token.address}
                        symbol={token.symbol}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {tabIndex === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Your NFTs
              </Typography>

              {!isMetaMaskConnected && (
                <Typography color="text.secondary" sx={{ my: 4 }}>
                  Please connect your wallet to view your NFTs
                </Typography>
              )}

              {isMetaMaskConnected && (
                <Typography color="text.secondary" sx={{ my: 4 }}>
                  NFT display functionality coming soon...
                </Typography>
              )}
            </Box>
          )}

          {tabIndex === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Mint a New NFT
              </Typography>

              <MintNFT 
                contractAddress={WEB3LANCER_CONTRACTS.ETHEREUM.ADDRESS}
                onSuccess={(hash, tokenId) => {
                  console.log(`Successfully minted token ID ${tokenId} with transaction ${hash}`);
                }}
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* Information about Stellar contracts */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Stellar Contract Integration
        </Typography>
        
        <Typography variant="body1" paragraph>
          Web3Lancer uses Stellar smart contracts for its reputation system and payments.
        </Typography>
        
        <Typography variant="subtitle2">Contract Details:</Typography>
        <Box 
          component="pre" 
          sx={{ 
            p: 2, 
            bgcolor: 'background.default', 
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem'
          }}
        >
          Contract ID: {WEB3LANCER_CONTRACTS.STELLAR.CONTRACT_ID}
        </Box>
        
        <Button
          variant="outlined"
          component="a"
          href={WEB3LANCER_CONTRACTS.STELLAR.EXPLORER_URL}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mt: 2 }}
        >
          View on Stellar Explorer
        </Button>
      </Paper>

      {/* Information about Xion contracts */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Xion Contract Integration
        </Typography>

        <Typography variant="body1" paragraph>
          Web3Lancer utilizes the Xion blockchain for core functionalities like project management, proposals, and dispute resolution via the `xioncontract`.
        </Typography>

        <Typography variant="subtitle2">Contract Details:</Typography>
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem'
          }}
        >
          Contract Address: {WEB3LANCER_CONTRACTS.XION?.CONTRACT_ID || 'N/A - Update contractUtils.ts'}
        </Box>

        {isXionConnected && (
           <Typography sx={{ mt: 2, wordBreak: 'break-all' }}>Connected Xion Address: {xionAccount?.bech32Address}</Typography>
        )}
      </Paper>

      {/* Abstraxion Modal Component */}
      <Abstraxion
        onClose={() => setShowXionModal(false)}
      />
    </Box>
  );
}
