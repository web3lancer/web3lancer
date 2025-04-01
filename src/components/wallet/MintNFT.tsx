import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Link
} from '@mui/material';
import { useMetaMask } from '@/hooks/useMetaMask';
import { useWriteContract, useWaitForTransactionReceipt } from '@/hooks/useContract';
import { ERC721_ABI } from '@/utils/contractUtils';

interface MintNFTProps {
  contractAddress: string;
  onSuccess?: (txHash: string, tokenId: bigint) => void;
  onError?: (error: Error) => void;
}

export function MintNFT({ 
  contractAddress,
  onSuccess,
  onError 
}: MintNFTProps) {
  const [tokenId, setTokenId] = useState<string>('');
  const { account, isConnected, chainId } = useMetaMask();
  
  const { 
    writeContract, 
    data: hash,
    error,
    isPending 
  } = useWriteContract();
  
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed
  } = useWaitForTransactionReceipt({ hash });
  
  const handleMint = async () => {
    if (!tokenId || !isConnected) return;
    
    try {
      const tokenIdBigInt = BigInt(tokenId);
      const txHash = await writeContract({
        address: contractAddress,
        abi: ERC721_ABI,
        functionName: 'mint',
        args: [tokenIdBigInt],
      });
      
      if (onSuccess) {
        onSuccess(txHash, tokenIdBigInt);
      }
    } catch (err) {
      if (err instanceof Error && onError) {
        onError(err);
      }
      console.error('Mint error:', err);
    }
  };

  // Get explorer URL for transaction
  const getExplorerUrl = () => {
    if (!hash || !chainId) return null;
    
    const chainIdNum = parseInt(chainId, 16);
    let baseUrl = '';
    
    switch (chainIdNum) {
      case 1: baseUrl = 'https://etherscan.io'; break;
      case 5: baseUrl = 'https://goerli.etherscan.io'; break;
      case 137: baseUrl = 'https://polygonscan.com'; break;
      default: return null;
    }
    
    return `${baseUrl}/tx/${hash}`;
  };
  
  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Mint New NFT
      </Typography>
      
      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please connect your wallet to mint NFTs
        </Alert>
      )}
      
      <Box component="form" noValidate sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Token ID"
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          disabled={isPending || isConfirming}
          sx={{ mb: 2 }}
          InputProps={{ inputProps: { min: 1 } }}
          required
        />
        
        <Button
          fullWidth
          variant="contained"
          color="primary"
          disabled={!tokenId || isPending || isConfirming || !isConnected}
          onClick={handleMint}
          sx={{ mb: 2 }}
        >
          {isPending ? 'Confirming...' : isConfirming ? 'Minting...' : 'Mint NFT'}
          {(isPending || isConfirming) && (
            <CircularProgress size={24} sx={{ ml: 1 }} color="inherit" />
          )}
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error: {error.message}
          </Alert>
        )}
        
        {hash && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Transaction Hash:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}
            >
              {hash}
            </Typography>
            
            {getExplorerUrl() && (
              <Link 
                href={getExplorerUrl()!} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ mt: 1, display: 'block' }}
              >
                View on Explorer
              </Link>
            )}
            
            {isConfirming && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Waiting for confirmation...
              </Alert>
            )}
            
            {isConfirmed && (
              <Alert severity="success" sx={{ mt: 2 }}>
                NFT Minted Successfully!
              </Alert>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
