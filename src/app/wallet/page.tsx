"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Tab, 
  Tabs, 
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Container,
  Card,
  CardContent,
  Checkbox
} from '@mui/material';
import { Add, Send, Refresh } from '@mui/icons-material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useWallet } from '@/hooks/useWallet';
import WalletCard from '@/components/wallet/WalletCard';
import TransactionList from '@/components/wallet/TransactionList';
import { useAuth } from '@/contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wallet-tabpanel-${index}`}
      aria-labelledby={`wallet-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function WalletPage() {
  const { user } = useAuth();
  const {
    wallets,
    balances,
    transactions,
    paymentMethods,
    loading,
    error,
    refreshWalletData,
    createWallet,
    addPaymentMethod,
    formatBalance,
    getTotalBalance
  } = useWallet();

  const [activeTab, setActiveTab] = useState(0);
  const [openAddPaymentDialog, setOpenAddPaymentDialog] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [isDefaultPayment, setIsDefaultPayment] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleCreateWallet = async () => {
    await createWallet('custodial');
  };

  const handleAddPaymentMethod = () => {
    setOpenAddPaymentDialog(true);
  };

  const handlePaymentDialogClose = () => {
    setOpenAddPaymentDialog(false);
    setNewWalletAddress('');
    setIsDefaultPayment(false);
  };

  const handlePaymentDialogSubmit = async () => {
    if (newWalletAddress) {
      await addPaymentMethod(newWalletAddress, isDefaultPayment);
      handlePaymentDialogClose();
    }
  };

  const primaryWallet = wallets && wallets.length > 0 ? wallets[0] : undefined;
  const primaryBalance = balances && balances.length > 0 ? formatBalance(balances[0]) : '0.00';

  return (
    <Container maxWidth="lg">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          My Wallet
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && wallets.length === 0 && (
          <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              You don't have a wallet yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create a wallet to start receiving and sending cryptocurrency
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleCreateWallet}
            >
              Create Wallet
            </Button>
          </Paper>
        )}

        {((wallets?.length ?? 0) > 0 || loading) && (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <WalletCard 
                  wallet={primaryWallet}
                  balance={primaryBalance}
                  loading={loading}
                  onRefresh={refreshWalletData}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Quick Actions
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<Send />}
                    fullWidth
                    sx={{ mb: 2 }}
                    disabled={loading}
                  >
                    Send
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<Add />}
                    fullWidth
                    sx={{ mb: 2 }}
                    disabled={loading}
                  >
                    Receive
                  </Button>
                  
                  <Button 
                    variant="outlined"
                    startIcon={<Add />}
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={handleAddPaymentMethod}
                    disabled={loading}
                  >
                    Add Payment Method
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<Refresh />}
                    fullWidth
                    onClick={refreshWalletData}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Transactions" />
                <Tab label="Payment Methods" />
              </Tabs>
              
              <TabPanel value={activeTab} index={0}>
                <TransactionList 
                  transactions={transactions} 
                  loading={loading}
                  emptyMessage="No transactions found. Start by sending or receiving crypto."
                />
              </TabPanel>
              
              <TabPanel value={activeTab} index={1}>
                {loading ? (
                  <Alert severity="info">Loading payment methods...</Alert>
                ) : paymentMethods.length === 0 ? (
                  <Alert severity="info">
                    No payment methods found. Add a payment method to get started.
                  </Alert>
                ) : (
                  <Paper>
                    <Box sx={{ bgcolor: 'grey.100', p: 2 }}>
                      <Typography variant="h6">Payment Methods</Typography>
                    </Box>
                    {paymentMethods.map((method) => (
                      <Box key={method.paymentMethodId} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {method.type === 'crypto' ? 'Cryptocurrency Wallet' : method.type}
                          {method.isDefault && (
                            <Typography component="span" sx={{ ml: 1, color: 'primary.main', fontSize: '0.8rem' }}>
                              (Default)
                            </Typography>
                          )}
                        </Typography>
                        {method.type === 'crypto' && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {method.details?.walletAddress || 'No address available'}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Paper>
                )}
              </TabPanel>
            </Box>
          </>
        )}

        {/* Add Payment Method Dialog */}
        <Dialog open={openAddPaymentDialog} onClose={handlePaymentDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Add Crypto Payment Method</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="walletAddress"
              label="Wallet Address"
              type="text"
              fullWidth
              value={newWalletAddress}
              onChange={(e) => setNewWalletAddress(e.target.value)}
              sx={{ mt: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isDefaultPayment}
                  onChange={(e) => setIsDefaultPayment(e.target.checked)}
                  color="primary"
                />
              }
              label="Set as default payment method"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePaymentDialogClose}>Cancel</Button>
            <Button 
              onClick={handlePaymentDialogSubmit} 
              variant="contained" 
              disabled={!newWalletAddress}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
