import React, { useState } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, FormHelperText, Typography, Alert } from '@mui/material';
import { addPaymentMethod } from '@/utils/api';

interface PaymentMethodFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function PaymentMethodForm({ userId, onSuccess }: PaymentMethodFormProps) {
  const [type, setType] = useState('');
  const [details, setDetails] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!type || !details) {
      setError('Please fill out all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Encrypt sensitive details (in a real app, you'd use proper encryption)
      const encryptedDetails = JSON.stringify({
        details: details,
        timestamp: new Date().toISOString()
      });
      
      await addPaymentMethod(userId, type, encryptedDetails, isDefault);
      setSuccess(true);
      
      // Reset form
      setType('');
      setDetails('');
      setIsDefault(false);
      
      // Callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Payment method added successfully!
        </Alert>
      )}
      
      <Typography variant="h6" gutterBottom>
        Add Payment Method
      </Typography>
      
      <FormControl fullWidth margin="normal" required>
        <InputLabel id="payment-type-label">Payment Type</InputLabel>
        <Select
          labelId="payment-type-label"
          id="payment-type"
          value={type}
          label="Payment Type"
          onChange={(e) => setType(e.target.value)}
        >
          <MenuItem value="credit_card">Credit Card</MenuItem>
          <MenuItem value="debit_card">Debit Card</MenuItem>
          <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
          <MenuItem value="crypto">Cryptocurrency</MenuItem>
          <MenuItem value="paypal">PayPal</MenuItem>
        </Select>
        <FormHelperText>Select the type of payment method</FormHelperText>
      </FormControl>
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="details"
        label="Payment Details"
        name="details"
        multiline
        rows={4}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder={type === 'crypto' ? 'Enter wallet address' : 'Enter payment details'}
        helperText="Never share sensitive financial information in plain text"
      />
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="is-default-label">Set as Default</InputLabel>
        <Select
          labelId="is-default-label"
          id="is-default"
          value={isDefault.toString()}
          label="Set as Default"
          onChange={(e) => setIsDefault(e.target.value === 'true')}
        >
          <MenuItem value="true">Yes</MenuItem>
          <MenuItem value="false">No</MenuItem>
        </Select>
        <FormHelperText>Set this as your default payment method?</FormHelperText>
      </FormControl>
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Add Payment Method'}
      </Button>
    </Box>
  );
}
