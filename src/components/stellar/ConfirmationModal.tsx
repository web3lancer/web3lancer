import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  DialogActions, 
  Button, 
  TextField, 
  CircularProgress, 
  Box,
  Alert
} from '@mui/material';

interface ConfirmationModalProps {
  transactionXDR: string;
  transactionNetwork: string;
  onConfirm: (pincode: string) => Promise<void>;
  onReject?: () => void;
  open: boolean;
  onClose: () => void;
}

export default function ConfirmationModal({
  transactionXDR,
  transactionNetwork,
  onConfirm,
  onReject,
  open,
  onClose
}: ConfirmationModalProps) {
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!pincode) {
      setError('Please enter your pincode');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(pincode);
      setPincode('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject();
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Transaction</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Please enter your pincode to sign and submit this transaction.
        </DialogContentText>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          label="Pincode"
          type="password"
          fullWidth
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          sx={{ mb: 2 }}
          autoFocus
        />
        
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 1, 
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          wordBreak: 'break-all',
          maxHeight: '100px',
          overflow: 'auto'
        }}>
          {transactionXDR}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReject} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={loading} color="primary">
          {loading ? <CircularProgress size={24} /> : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
