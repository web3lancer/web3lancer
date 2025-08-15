'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import { getXionContractAddress, createDisputeMsg } from '@/utils/xionContractUtils';

interface CreateDisputeProps {
  projectId: number;
  isClient: boolean;
  isFreelancer: boolean;
  disabled?: boolean;
  onDisputeCreated?: () => void;
}

export const CreateDispute: React.FC<CreateDisputeProps> = ({
  projectId,
  isClient,
  isFreelancer,
  disabled = false,
  onDisputeCreated
}) => {
  // Abstraxion/Xion wallet integration removed - use app wallet flows instead
  const account = null;
  const signingClient = null;
  const [showModal, setShowModal] = React.useState(false);
  
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Only clients or freelancers on this project can create disputes
  const canCreateDispute = (isClient || isFreelancer) && !disabled;
  
  const handleClickOpen = () => {
    // If no wallet connected, show app modal or prompt (implementation-specific)
    setShowModal(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setReason('');
    setError(null);
  };

  const handleSubmit = async () => {
    // Use app-specific signing client - Xion signing removed
    if (!signingClient || !(account as any)?.bech32Address) {
      setError("Wallet not connected. Please connect your wallet.");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for the dispute");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Xion transaction flow removed. Store dispute in app backend instead.
      // Implement actual API call to submit dispute via projectService or API route
      try {
        // Example placeholder - replace with real API call
        await fetch(`/api/projects/${projectId}/disputes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: reason.trim() }),
        });
        setSuccess("Dispute has been submitted successfully!");

        setTimeout(() => {
          handleClose();
          if (onDisputeCreated) onDisputeCreated();
        }, 1500);
      } catch (err) {
        console.error(err);
        setError('Failed to submit dispute to server');
      }
    } catch (err) {
      console.error("Error creating dispute:", err);
      setError(`Failed to create dispute: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="warning"
        startIcon={<GavelIcon />}
        onClick={handleClickOpen}
        disabled={!canCreateDispute}
        sx={{ mt: 2 }}
      >
        {disabled ? "Dispute Already Exists" : "Create Dispute"}
      </Button>
      
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <GavelIcon sx={{ mr: 1 }} />
            Create a Dispute
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Creating a dispute will initiate a community voting process to resolve issues with this project. 
            Please provide details about why you're creating this dispute.
          </DialogContentText>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2, mb: 1 }}>
              {success}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Dispute"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Submit Dispute"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Abstraxion Modal */}
      <Abstraxion onClose={() => setShowModal(false)} />
    </>
  );
};