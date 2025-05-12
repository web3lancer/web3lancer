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
        <Typography variant="h5" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          fontWeight: 'medium',
          color: 'primary.main'
        }}>
          <AccountBalanceWalletIcon sx={{ mr: 1 }} />
          Wallet Management
        </Typography>
        <Button
          variant="contained"
          onClick={onGoToWallet}
          endIcon={<ArrowForwardIcon />}
          sx={{ 
            borderRadius: 2, 
            py: 1,
            px: { xs: 2, sm: 3 },
            background: 'linear-gradient(90deg, #2097ff 0%, #7857ff 100%)',
            boxShadow: '0 4px 12px rgba(32, 151, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(32, 151, 255, 0.25)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          Go to Wallet Dashboard
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(255, 84, 112, 0.05) 0%, rgba(255, 84, 112, 0.1) 100%)',
            border: '1px solid',
            borderColor: 'error.light'
          }}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)'
            },
            background: 'linear-gradient(135deg, rgba(32,151,255,0.02) 0%, rgba(120,87,255,0.02) 100%)',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceWalletIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Stellar Wallet</Typography>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress 
                    size={24} 
                    sx={{
                      color: 'primary.main',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      }
                    }}
                  />
                </Box>
              ) : isConnected && publicKey ? (
                <>
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(32,151,255,0.05)',
                    border: '1px solid',
                    borderColor: 'primary.light'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Public Key
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontWeight: 'medium'
                    }}>
                      {truncateKey(publicKey)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ ml: 1 }}>
                    Balances
                  </Typography>

                  {balances.length > 0 ? (
                    <Box sx={{ mt: 1 }}>
                      {balances.map((balance, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            mb: 1, 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            p: 1.5,
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.02)'
                            }
                          }}
                        >
                          <Typography variant="body2">{balance.asset}</Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {balance.balance}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'rgba(0,0,0,0.02)',
                      border: '1px dashed',
                      borderColor: 'divider',
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        No assets found or balance could not be loaded.
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ 
                  my: 2, 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(0,0,0,0.02)',
                  border: '1px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    You haven't connected a Stellar wallet yet.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={onGoToWallet}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      borderColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(32,151,255,0.05)',
                        borderColor: 'primary.dark',
                      }
                    }}
                  >
                    Connect Wallet
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)'
            },
            background: 'linear-gradient(135deg, rgba(32,151,255,0.02) 0%, rgba(120,87,255,0.02) 100%)',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CurrencyExchangeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Payment Settings</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Default Currency</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label="XLM" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: 1,
                      background: 'linear-gradient(90deg, rgba(32,151,255,0.1) 0%, rgba(120,87,255,0.1) 100%)',
                      borderColor: 'primary.main',
                      fontWeight: 'medium'
                    }}
                  />
                  <Chip label="USD" variant="outlined" sx={{ borderRadius: 1 }} />
                  <Chip label="EUR" variant="outlined" sx={{ borderRadius: 1 }} />
                  <Chip label="BTC" variant="outlined" sx={{ borderRadius: 1 }} />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>Payment Protection</Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'rgba(46,213,115,0.1)',
                  border: '1px solid',
                  borderColor: 'success.light'
                }}>
                  <ShieldIcon sx={{ color: 'success.main', mr: 1, fontSize: '1.2rem' }} />
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    Escrow protection enabled
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, rgba(32,151,255,0.02) 0%, rgba(120,87,255,0.02) 100%)',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Wallet Features</Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(32,151,255,0.03)',
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(32,151,255,0.05)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }
                  }}>
                    <Typography variant="subtitle2" gutterBottom color="primary.main">Multi-Currency Support</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Accept payments in various currencies through seamless conversion
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(32,151,255,0.03)',
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(32,151,255,0.05)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }
                  }}>
                    <Typography variant="subtitle2" gutterBottom color="primary.main">Secure Escrow</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Protected payments with milestone-based releases
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(32,151,255,0.03)',
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(32,151,255,0.05)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }
                  }}>
                    <Typography variant="subtitle2" gutterBottom color="primary.main">Cross-Border Payments</Typography>
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
