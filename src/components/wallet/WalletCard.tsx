import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Button, Tabs, Tab } from '@mui/material';
import { useWallet } from '@/hooks/useWallet';
import { getUserPaymentMethods } from '@/utils/api';
import { PaymentMethodForm } from './PaymentMethodForm';
import { WalletDetails } from './WalletDetails';
import { WalletBalances } from './WalletBalances';
import { PaymentMethodsList } from './PaymentMethodsList';

interface WalletCardProps {
  userId: string;
}

export function WalletCard({ userId }: WalletCardProps) {
  const { wallet, balances, loading, error } = useWallet(userId);
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
          <WalletDetails wallet={wallet} />
          <WalletBalances balances={balances} />
          
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
              <PaymentMethodsList 
                paymentMethods={paymentMethods} 
              />
              <PaymentMethodForm userId={userId} onSuccess={fetchPaymentMethods} />
            </>
          )}
        </>
      )}
    </Paper>
  );
}
