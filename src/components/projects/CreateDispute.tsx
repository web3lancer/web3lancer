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
import { useAbstraxionAccount, useAbstraxionSigningClient, useModal } from '@burnt-labs/abstraxion';
import { Abstraxion } from "@burnt-labs/abstraxion";
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
  const { data: account, isConnected } = useAbstraxionAccount();
  const { client: signingClient } = useAbstraxionSigningClient();
  const [showModal, setShowModal] = useModal();
  
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Only clients or freelancers on this project can create disputes
  const canCreateDispute = (isClient || isFreelancer) && !disabled;
  
  const handleClickOpen = () => {
    if (!isConnected) {
      setShowModal(true);
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setReason('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!signingClient || !account?.bech32Address) {
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
      const contractAddress = getXionContractAddress();
      
      const response = await signingClient.execute(
        account.bech32Address,
        contractAddress,
        createDisputeMsg(projectId, reason.trim()),
        "auto"
      );

      console.log("Dispute created successfully:", response);
      setSuccess("Dispute has been submitted successfully!");
      
      // Close the dialog after a brief delay
      setTimeout(() => {
        handleClose();
        if (onDisputeCreated) {
          onDisputeCreated();
        }
      }, 2000);
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