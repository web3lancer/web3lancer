"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Paper,
  Alert,
  CircularProgress,
  FormHelperText,
  InputAdornment
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SendPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    currency: 'BTC',
    memo: ''
  });
  
  const [errors, setErrors] = useState<{
    recipient?: string;
    amount?: string;
    general?: string;
  }>({});
  
  const { wallet, balances, loading, error: walletError, sendCrypto } = user ? useWallet(user.$id) : { 
    wallet: null, 
    balances: [], 
    loading: false, 
    error: 'No user logged in', 
    sendCrypto: async () => ({ success: false, error: 'Not logged in' })
  };
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      router.push('/signin?redirect=/wallet/send');
    }
  }, [user, loading, router]);
  
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.recipient) {
      newErrors.recipient = 'Recipient address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.recipient)) {
      newErrors.recipient = 'Please enter a valid wallet address';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else {
      // Check if user has enough balance
      const selectedBalance = balances.find(b => b.currency === formData.currency);
      if (selectedBalance && Number(formData.amount) > selectedBalance.amount) {
        newErrors.amount = `Insufficient ${formData.currency} balance`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const result = await sendCrypto(
        Number(formData.amount),
        formData.currency,
        formData.recipient
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        recipient: '',
        amount: '',
        currency: 'BTC',
        memo: ''
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/wallet');
      }, 3000);
      
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4, px: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Link href="/wallet">
          <Button variant="text">← Back to Wallet</Button>
        </Link>
      </Box>
      
      <Typography variant="h4" sx={{ mb: 4 }}>Send Cryptocurrency</Typography>
      
      {walletError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {walletError}
        </Alert>
      )}
      
      {errors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.general}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Transaction sent successfully! Redirecting to wallet page...
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Recipient Address"
            fullWidth
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            margin="normal"
            error={!!errors.recipient}
            helperText={errors.recipient}
            disabled={isSubmitting || success}
            placeholder="0x..."
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Amount"
              fullWidth
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              margin="normal"
              error={!!errors.amount}
              helperText={errors.amount}
              disabled={isSubmitting || success}
              type="number"
              inputProps={{ min: 0, step: 'any' }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="currency-label">Currency</InputLabel>
              <Select
                labelId="currency-label"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                label="Currency"
                disabled={isSubmitting || success}
              >
                {balances.map(balance => (
                  <MenuItem key={balance.currency} value={balance.currency}>
                    {balance.currency} - Balance: {balance.amount}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <TextField
            label="Memo (Optional)"
            fullWidth
            name="memo"
            value={formData.memo}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            disabled={isSubmitting || success}
          />
          
          <Box sx={{ mt: 4, p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle2" gutterBottom>
              Transaction Summary
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Amount:</Typography>
              <Typography variant="body2">
                {formData.amount || '0'} {formData.currency}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Network Fee:</Typography>
              <Typography variant="body2">
                ~0.0001 {formData.currency}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="subtitle2">Total:</Typography>
              <Typography variant="subtitle2">
                {formData.amount ? 
                  (Number(formData.amount) + 0.0001).toFixed(
                    formData.currency === 'BTC' ? 8 : formData.currency === 'ETH' ? 18 : 2
                  ) : 
                  '0.0001'
                } {formData.currency}
              </Typography>
            </Box>
          </Box>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={isSubmitting || success}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Send Transaction'}
          </Button>
        </form>
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="caption" color="text.secondary">
          Note: All blockchain transactions are irreversible. Please double-check the recipient address before sending.
        </Typography>
      </Box>
    </Box>
  );
}
