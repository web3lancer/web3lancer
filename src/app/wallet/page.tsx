"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallets, useTransactions } from '@/hooks/useFinance';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  ArrowUpward as SendIcon,
  ArrowDownward as ReceiveIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Payment as PaymentIcon,
  History as HistoryIcon
} from '@mui/icons-material';

export default function WalletOverviewPage() {
  const router = useRouter();
  const { wallets, loading: loadingWallets, error: walletsError } = useWallets();
  const { transactions, loading: loadingTransactions, error: transactionsError } = useTransactions();
  
  const [primaryWallet, setPrimaryWallet] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    // Find primary wallet
    const primary = wallets.find(wallet => wallet.isPrimary);
    if (primary) {
      setPrimaryWallet(primary);
    } else if (wallets.length > 0) {
      setPrimaryWallet(wallets[0]);
    }
    
    // Get recent transactions (up to 5)
    setRecentTransactions(transactions.slice(0, 5));
  }, [wallets, transactions]);

  const navigateToSend = () => {
    router.push('/wallet/send');
  };

  const navigateToReceive = () => {
    router.push('/wallet/receive');
  };

  const navigateToWalletSettings = () => {
    router.push('/settings/wallets');
  };

  const navigateToPaymentMethods = () => {
    router.push('/settings/payment-methods');
  };

  const navigateToTransactions = () => {
    router.push('/wallet/transactions');
  };

  const navigateToAddWallet = () => {
    router.push('/settings/wallets');
  };

  const formatWalletAddress = (address) => {
    if (!address) return '';
    if (address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatCurrency = (amount, currency) => {
    if (!amount) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'deposit':
      case 'escrow_release':
        return <ArrowDownward color="success" />;
      case 'withdrawal':
      case 'escrow_funding':
      case 'fee':
        return <ArrowUpward color="primary" />;
      case 'escrow_refund':
        return <ArrowDownward color="secondary" />;
      default:
        return <Payment />;
    }
  };

  const getStatusChip = (status) => {
    let color = 'default';
    
    switch (status) {
      case 'pending':
        color = 'warning';
        break;
      case 'completed':
        color = 'success';
        break;
      case 'failed':
        color = 'error';
        break;
      case 'cancelled':
        color = 'default';
        break;
    }
    
    return (
      <Chip 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        size="small" 
        color={color}
      />
    );
  };

  const getWalletTypeLabel = (type) => {
    switch (type) {
      case 'ethereum':
        return 'Ethereum';
      case 'solana':
        return 'Solana';
      case 'xion':
        return 'Xion';
      case 'internal':
        return 'Platform Wallet';
      default:
        return type;
    }
  };

  const isLoading = loadingWallets || loadingTransactions;
  const error = walletsError || transactionsError;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Wallet Overview
        </Typography>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={navigateToWalletSettings}
        >
          Manage Wallets
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* Main wallet card */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="div">
                    Primary Wallet
                  </Typography>
                  <IconButton size="small" onClick={navigateToWalletSettings}>
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                {primaryWallet ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WalletIcon fontSize="large" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {primaryWallet.nickname || 'My Wallet'}
                        </Typography>
                        <Chip
                          label={getWalletTypeLabel(primaryWallet.walletType)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {formatWalletAddress(primaryWallet.walletAddress)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<SendIcon />}
                          onClick={navigateToSend}
                        >
                          Send
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<ReceiveIcon />}
                          onClick={navigateToReceive}
                        >
                          Receive
                        </Button>
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      You haven't added any wallets yet.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={navigateToAddWallet}
                      sx={{ mt: 2 }}
                    >
                      Add Wallet
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Quick actions card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>
                
                <List disablePadding>
                  <ListItem 
                    button 
                    onClick={navigateToTransactions}
                    sx={{ 
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText primary="Transaction History" />
                    <ArrowRightIcon fontSize="small" />
                  </ListItem>
                  
                  <ListItem 
                    button 
                    onClick={navigateToWalletSettings}
                    sx={{ 
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      <WalletIcon />
                    </ListItemIcon>
                    <ListItemText primary="Manage Wallets" />
                    <ArrowRightIcon fontSize="small" />
                  </ListItem>
                  
                  <ListItem 
                    button 
                    onClick={navigateToPaymentMethods}
                    sx={{ 
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      <PaymentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Payment Methods" />
                    <ArrowRightIcon fontSize="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent transactions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    Recent Transactions
                  </Typography>
                  <Button
                    endIcon={<ArrowRightIcon />}
                    onClick={navigateToTransactions}
                  >
                    View All
                  </Button>
                </Box>
                
                {recentTransactions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No recent transactions found.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {recentTransactions.map((transaction) => (
                      <ListItem
                        key={transaction.$id}
                        divider
                        sx={{ px: 0 }}
                      >
                        <ListItemIcon>
                          {getTransactionTypeIcon(transaction.transactionType)}
                        </ListItemIcon>
                        <ListItemText
                          primary={transaction.description || transaction.transactionType.replace(/_/g, ' ')}
                          secondary={formatDate(transaction.createdAt)}
                        />
                        <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {getStatusChip(transaction.status)}
                          </Box>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
