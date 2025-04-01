import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper, 
  Divider,
  Link as MuiLink
} from '@mui/material';
import { useMetaMask } from '@/hooks/useMetaMask';
import { parseEther, waitForTransaction } from '@/utils/transactionUtils';

interface SendTransactionProps {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export function SendTransaction({ onSuccess, onError }: SendTransactionProps) {
  const [to, setTo] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [data, setData] = useState<string>('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const { 
    account, 
    chainId,
    sendTransaction,
    estimateGas,
    isPending,
    error
  } = useMetaMask();

  // Form validation
  const isFormValid = to && amount && /^0x[a-fA-F0-9]{40}$/.test(to) && !isNaN(Number(amount));

  // Handle transaction submission
  const handleSend = async () => {
    if (!isFormValid) return;
    
    try {
      // Convert amount from ETH to wei
      const weiValue = parseEther(amount);
      
      // Prepare transaction
      const tx = {
        to,
        value: weiValue,
        data: data || '0x'
      };
      
      // Estimate gas and add buffer
      const gasEstimate = await estimateGas(tx);
      
      // Send transaction with gas estimate
      const hash = await sendTransaction({
        ...tx,
        gas: gasEstimate
      });
      
      setTxHash(hash);
      
      // Wait for transaction confirmation
      setIsConfirming(true);
      const provider = (window as any).ethereum;
      if (provider) {
        try {
          await waitForTransaction(provider, hash);
          setIsConfirmed(true);
          setIsConfirming(false);
          if (onSuccess) onSuccess(hash);
        } catch (err) {
          setConfirmError('Failed to confirm transaction');
          setIsConfirming(false);
          if (onError && err instanceof Error) onError(err);
        }
      }
    } catch (err) {
      console.error('Transaction failed:', err);
      if (onError && err instanceof Error) onError(err);
    }
  };

  // Build explorer URL based on chain ID
  const getExplorerUrl = () => {
    if (!txHash || !chainId) return null;
    
    const chainIdNum = parseInt(chainId, 16);
    let baseUrl = '';
    
    switch (chainIdNum) {
      case 1: // Ethereum Mainnet
        baseUrl = 'https://etherscan.io';
        break;
      case 5: // Goerli
        baseUrl = 'https://goerli.etherscan.io';
        break;
      case 11155111: // Sepolia
        baseUrl = 'https://sepolia.etherscan.io';
        break;
      case 137: // Polygon
        baseUrl = 'https://polygonscan.com';
        break;
      case 80001: // Mumbai (Polygon Testnet)
        baseUrl = 'https://mumbai.polygonscan.com';
        break;
      case 42161: // Arbitrum One
        baseUrl = 'https://arbiscan.io';
        break;
      case 10: // Optimism
        baseUrl = 'https://optimistic.etherscan.io';
        break;
      case 8453: // Base
        baseUrl = 'https://basescan.org';
        break;
      default:
        return null;
    }
    
    return `${baseUrl}/tx/${txHash}`;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Send Transaction
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {confirmError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {confirmError}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Recipient Address"
          fullWidth
          margin="normal"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="0x..."
          error={to !== '' && !/^0x[a-fA-F0-9]{40}$/.test(to)}
          helperText={to !== '' && !/^0x[a-fA-F0-9]{40}$/.test(to) ? "Invalid Ethereum address" : ""}
          disabled={isPending || isConfirming}
        />
        
        <TextField
          label="Amount (ETH)"
          fullWidth
          margin="normal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          inputProps={{ step: "0.0001", min: "0" }}
          disabled={isPending || isConfirming}
        />
        
        <TextField
          label="Data (Optional)"
          fullWidth
          margin="normal"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="0x..."
          disabled={isPending || isConfirming}
        />
      </Box>
      
      <Button
        variant="contained"
        fullWidth
        onClick={handleSend}
        disabled={!isFormValid || isPending || isConfirming}
        sx={{ mb: 2 }}
      >
        {isPending ? "Processing..." : isConfirming ? "Confirming..." : `Send ${amount || '0'} ETH`}
        {(isPending || isConfirming) && (
          <CircularProgress size={20} sx={{ ml: 1 }} />
        )}
      </Button>
      
      {txHash && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Transaction Details:
          </Typography>
          
          <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>
            Hash: {txHash}
          </Typography>
          
          {getExplorerUrl() && (
            <MuiLink href={getExplorerUrl()!} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </MuiLink>
          )}
          
          <Divider sx={{ my: 1 }} />
          
          {isConfirming && (
            <Alert severity="info">
              Waiting for confirmation...
            </Alert>
          )}
          
          {isConfirmed && (
            <Alert severity="success">
              Transaction confirmed successfully!
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
}
