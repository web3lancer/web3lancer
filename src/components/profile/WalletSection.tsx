import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Divider, Chip, CircularProgress, Alert } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ShieldIcon from '@mui/icons-material/Shield';
import { useWalletStore } from '@/utils/stellar/walletStore';
import { getAccountBalance } from '@/utils/stellar/horizonQueries';

interface WalletSectionProps {
  onGoToWallet: () => void;
}

export default function WalletSection({ onGoToWallet }: WalletSectionProps) {
  const { publicKey, isConnected } = useWalletStore();
  const [balances, setBalances] = useState<Array<{ asset: string, balance: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBalance = async (key: string) => {
      if (!key) {
        setBalances([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedBalances = await getAccountBalance(key);
        if (fetchedBalances) {
          setBalances(fetchedBalances);
        } else {
          setError('Failed to load balance.');
          setBalances([]);
        }
      } catch (err) {
        console.error("Error in loadBalance:", err);
        setError('Error loading balance');
        setBalances([]);
      } finally {
        setLoading(false);
      }
    };

    if (publicKey) {
      loadBalance(publicKey);
    } else {
      setBalances([]);
      setLoading(false);
      setError(null);
    }
  }, [publicKey]);

  const truncateKey = (key: string) => {
    if (!key) return '';
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Wallet Management</Typography>
        <Button
          variant="contained"
          onClick={onGoToWallet}
          endIcon={<ArrowForwardIcon />}
        >
          Go to Wallet Dashboard
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWalletIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Stellar Wallet</Typography>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : isConnected && publicKey ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Public Key</Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {truncateKey(publicKey)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Balances
                  </Typography>

                  {balances.length > 0 ? (
                    <Box>
                      {balances.map((balance, index) => (
                        <Box key={index} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{balance.asset}</Typography>
                          <Typography variant="body2" fontWeight="medium">{balance.balance}</Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No assets found or balance could not be loaded.
                    </Typography>
                  )}
                </>
              ) : (
                <Box sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    You haven't connected a Stellar wallet yet.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={onGoToWallet}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Connect Wallet
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CurrencyExchangeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Payment Settings</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Default Currency</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="XLM" color="primary" variant="outlined" />
                  <Chip label="USD" variant="outlined" />
                  <Chip label="EUR" variant="outlined" />
                  <Chip label="BTC" variant="outlined" />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>Payment Protection</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShieldIcon sx={{ color: 'success.main', mr: 1, fontSize: '1rem' }} />
                  <Typography variant="body2">Escrow protection enabled</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Wallet Features</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Multi-Currency Support</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Accept payments in various currencies through seamless conversion
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Secure Escrow</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Protected payments with milestone-based releases
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Cross-Border Payments</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Instant global transfers with minimal fees
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
