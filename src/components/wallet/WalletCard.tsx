import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Button, Tabs, Tab, Divider, Chip } from '@mui/material';
import { useWallet } from '@/hooks/useWallet';
import { getUserPaymentMethods } from '@/utils/api';
import { PaymentMethodForm } from './PaymentMethodForm';

interface WalletCardProps {
  userId: string;
}

export function WalletCard({ userId }: WalletCardProps) {
  const { wallet, balances, loading, error, sendCrypto, addFunds } = useWallet(userId);
  const [tab, setTab] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  
  useEffect(() => {
    if (userId) {
      fetchPaymentMethods();
    }
  }, [userId]);
  
  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const methods = await getUserPaymentMethods(userId);
      setPaymentMethods(methods);
    } catch (err) {
      console.error("Error fetching payment methods:", err);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Typography>Error: {error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Tabs value={tab} onChange={handleChangeTab} sx={{ mb: 3 }}>
        <Tab label="Wallet" />
        <Tab label="Payment Methods" />
      </Tabs>
      
      {tab === 0 && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Wallet Address</Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                bgcolor: 'background.paper',
                p: 1.5,
                borderRadius: 1,
                overflow: 'auto',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {wallet?.walletAddress || 'No wallet address available'}
            </Typography>
          </Box>
          
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
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="contained" color="primary" onClick={() => window.location.href = '/wallet/send'}>
              Send
            </Button>
            <Button variant="outlined" color="primary" onClick={() => window.location.href = '/wallet/receive'}>
              Receive
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => window.location.href = '/wallet/add-funds'}>
              Add Funds
            </Button>
          </Box>
        </>
      )}
      
      {tab === 1 && (
        <>
          <Typography variant="h6" gutterBottom>Your Payment Methods</Typography>
          
          {loadingPaymentMethods ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {paymentMethods.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  No payment methods found. Add one below.
                </Typography>
              ) : (
                <Box sx={{ mb: 3 }}>
                  {paymentMethods.map((method) => (
                    <Box 
                      key={method.$id}
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
                      <Box>
                        <Typography variant="body1">
                          {method.type.replace('_', ' ').toUpperCase()}
                          {method.isDefault && (
                            <Chip 
                              label="DEFAULT" 
                              size="small" 
                              sx={{ ml: 1, bgcolor: 'success.light', color: 'success.contrastText' }} 
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Added: {new Date(method.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Button size="small" color="primary">
                        Edit
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              <PaymentMethodForm userId={userId} onSuccess={fetchPaymentMethods} />
            </>
          )}
        </>
      )}
    </Paper>
  );
}
