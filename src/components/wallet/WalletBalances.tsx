import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

interface WalletBalancesProps {
  balances: any[];
}

export function WalletBalances({ balances }: WalletBalancesProps) {
  return (
    <>
      <Typography variant="h6" gutterBottom>Balances</Typography>
      
      {balances.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No balances found</Typography>
      ) : (
        <Box sx={{ mb: 3 }}>
          {balances.map((balance) => (
            <Box 
              key={balance.currency}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                mb: 1,
                borderRadius: 1,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1">{balance.currency}</Typography>
                {balance.currency === 'USD' && (
                  <Chip 
                    label="FIAT" 
                    size="small" 
                    sx={{ ml: 1, bgcolor: 'info.light', color: 'info.contrastText' }} 
                  />
                )}
                {(balance.currency === 'BTC' || balance.currency === 'ETH') && (
                  <Chip 
                    label="CRYPTO" 
                    size="small" 
                    sx={{ ml: 1, bgcolor: 'warning.light', color: 'warning.contrastText' }} 
                  />
                )}
              </Box>
              <Typography variant="body1" fontWeight="bold">
                {balance.amount} {balance.currency}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
