import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Paper,
  Skeleton
} from '@mui/material';
import { useMetaMask } from '@/hooks/useMetaMask';
import { useReadContract, useTokenBalance } from '@/hooks/useContract';
import { ERC20_ABI } from '@/utils/contractUtils';
import { parseEther } from '@/utils/transactionUtils';

interface TokenBalanceProps {
  tokenAddress: string;
  symbol?: string;
}

export function TokenBalance({ 
  tokenAddress,
  symbol: providedSymbol
}: TokenBalanceProps) {
  const { account, isConnected } = useMetaMask();
  const [symbol, setSymbol] = useState<string>(providedSymbol || '');
  const [decimals, setDecimals] = useState<number>(18);
  
  // Get token balance
  const { 
    balance, 
    isLoading: isBalanceLoading, 
    isError: isBalanceError 
  } = useTokenBalance(tokenAddress, account);
  
  // Get token symbol if not provided
  const { 
    data: symbolData,
    isLoading: isSymbolLoading
  } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
    enabled: !providedSymbol && isConnected
  });
  
  // Get token decimals
  const {
    data: decimalsData,
    isLoading: isDecimalsLoading
  } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    enabled: isConnected
  });
  
  // Update symbol from contract data
  useEffect(() => {
    if (symbolData && !providedSymbol) {
      setSymbol(symbolData);
    }
  }, [symbolData, providedSymbol]);
  
  // Update decimals from contract data
  useEffect(() => {
    if (decimalsData) {
      // Convert hex to number if needed
      const decimalValue = typeof decimalsData === 'string'
        ? parseInt(decimalsData, 16)
        : typeof decimalsData === 'number'
          ? decimalsData
          : 18;
          
      setDecimals(decimalValue);
    }
  }, [decimalsData]);
  
  // Format balance based on decimals
  const formatBalance = (balanceValue: string | null): string => {
    if (!balanceValue) return '0';
    
    try {
      // Convert hex to number if needed
      const rawBalance = typeof balanceValue === 'string' && balanceValue.startsWith('0x')
        ? BigInt(balanceValue)
        : BigInt(balanceValue);
        
      // Format with appropriate decimals
      const divisor = BigInt(10) ** BigInt(decimals);
      const integerPart = rawBalance / divisor;
      const fractionalPart = rawBalance % divisor;
      
      // Format to display with up to 4 decimal places
      const formattedFractional = fractionalPart.toString().padStart(decimals, '0').slice(0, 4);
      return `${integerPart}${formattedFractional !== '0000' ? `.${formattedFractional}` : ''}`;
    } catch (e) {
      console.error('Error formatting balance:', e);
      return '0';
    }
  };
  
  const isLoading = isBalanceLoading || isSymbolLoading || isDecimalsLoading;
  
  if (!isConnected) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Connect your wallet to view token balance
      </Alert>
    );
  }
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2, 
        borderRadius: 2, 
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        mb: 2
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary">
          {symbol || 'Token'} Balance
        </Typography>
        
        {isLoading ? (
          <Skeleton width={100} height={24} />
        ) : isBalanceError ? (
          <Typography variant="body2" color="error">
            Error loading balance
          </Typography>
        ) : (
          <Typography variant="h6">
            {formatBalance(balance)} {symbol}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
