// src/components/StellarWallet.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { generateKeypair, fundTestnetAccount, checkBalance } from '@/utils/stellar';
import { Keypair } from 'stellar-sdk';

export default function StellarWallet() {
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [publicKey, setPublicKey] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [balance, setBalance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create a new wallet
  const handleCreateWallet = () => {
    try {
      const newKeypair = generateKeypair();
      setKeypair(newKeypair);
      setPublicKey(newKeypair.publicKey());
      setSecretKey(newKeypair.secret());
    } catch (error) {
      setError('Failed to create wallet');
      console.error(error);
    }
  };

  // Fund the wallet with testnet XLM
  const handleFundWallet = async () => {
    if (!publicKey) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      await fundTestnetAccount(publicKey);
      setSuccess('Successfully funded account with testnet XLM!');
      
      // Refresh balance
      const balances = await checkBalance(publicKey);
      setBalance(balances);
    } catch (error) {
      setError('Failed to fund wallet. The account may already exist.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Import an existing wallet using secret key
  const handleImportWallet = () => {
    try {
      setError(null);
      
      if (!secretKey) {
        setError('Please enter a secret key');
        return;
      }
      
      const importedKeypair = Keypair.fromSecret(secretKey);
      setKeypair(importedKeypair);
      setPublicKey(importedKeypair.publicKey());
      
      // Refresh balance after import
      refreshBalance(importedKeypair.publicKey());
    } catch (error) {
      setError('Invalid secret key');
      console.error(error);
    }
  };

  const refreshBalance = async (pubKey: string) => {
    try {
      setIsLoading(true);
      const balances = await checkBalance(pubKey);
      setBalance(balances);
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Load wallet from localStorage on component mount
  useEffect(() => {
    const savedSecret = localStorage.getItem('stellar_secret');
    if (savedSecret) {
      try {
        const savedKeypair = Keypair.fromSecret(savedSecret);
        setKeypair(savedKeypair);
        setPublicKey(savedKeypair.publicKey());
        setSecretKey(savedSecret);
        refreshBalance(savedKeypair.publicKey());
      } catch (error) {
        console.error('Error loading saved wallet:', error);
      }
    }
  }, []);

  // Save wallet to localStorage when it changes
  useEffect(() => {
    if (secretKey) {
      localStorage.setItem('stellar_secret', secretKey);
    }
  }, [secretKey]);

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Stellar Testnet Wallet
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCreateWallet}
          sx={{ mr: 2 }}
        >
          Create New Wallet
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => refreshBalance(publicKey)}
          disabled={!publicKey || isLoading}
        >
          Refresh Balance
        </Button>
      </Box>
      
      {publicKey && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Public Key:
          </Typography>
          <TextField
            fullWidth
            value={publicKey}
            variant="outlined"
            size="small"
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="subtitle1" gutterBottom>
            Secret Key (keep this private!):
          </Typography>
          <TextField
            fullWidth
            value={secretKey}
            variant="outlined"
            size="small"
            type="password"
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2 }}
          />
          
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleFundWallet}
            disabled={isLoading}
            sx={{ mt: 1 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Fund with Testnet XLM'}
          </Button>
        </Box>
      )}
      
      {!keypair && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Import Existing Wallet:
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter secret key"
            variant="outlined"
            size="small"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleImportWallet}
          >
            Import Wallet
          </Button>
        </Box>
      )}
      
      {balance.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Balances:
          </Typography>
          {balance.map((b: any, index) => (
            <Typography key={index} variant="body1">
              {b.asset_type === 'native' ? 'XLM' : b.asset_code}: {b.balance}
            </Typography>
          ))}
        </Box>
      )}
    </Paper>
  );
}