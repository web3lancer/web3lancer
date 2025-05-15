"use client";

import { useState, useEffect } from 'react';
import { useWallets } from '@/hooks/useFinance';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

export default function WalletsSettingsPage() {
  const {
    wallets,
    loading,
    error,
    createWallet,
    updateWallet,
    deleteWallet,
    refreshWallets
  } = useWallets();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentWallet, setCurrentWallet] = useState(null);
  const [formData, setFormData] = useState({
    walletAddress: '',
    walletType: 'ethereum',
    nickname: '',
    isPrimary: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

  // Reset form data when dialogs are opened/closed
  useEffect(() => {
    if (!isAddDialogOpen && !isEditDialogOpen) {
      setFormData({
        walletAddress: '',
        walletType: 'ethereum',
        nickname: '',
        isPrimary: false
      });
      setFormErrors({});
    }
  }, [isAddDialogOpen, isEditDialogOpen]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.walletAddress.trim()) {
      errors.walletAddress = 'Wallet address is required';
    } else if (formData.walletType === 'ethereum' && !/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)) {
      errors.walletAddress = 'Invalid Ethereum address format';
    }
    
    if (!formData.nickname.trim()) {
      errors.nickname = 'Nickname is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddWallet = async () => {
    if (!validateForm()) return;
    
    setFormSubmitting(true);
    setStatusMessage({ type: '', message: '' });
    
    try {
      await createWallet({
        walletAddress: formData.walletAddress,
        walletType: formData.walletType,
        nickname: formData.nickname,
        isPrimary: formData.isPrimary
      });
      
      setIsAddDialogOpen(false);
      setStatusMessage({ type: 'success', message: 'Wallet added successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', message: err.message || 'Failed to add wallet' });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditWallet = async () => {
    if (!validateForm()) return;
    
    setFormSubmitting(true);
    setStatusMessage({ type: '', message: '' });
    
    try {
      await updateWallet(currentWallet.$id, {
        nickname: formData.nickname,
        isPrimary: formData.isPrimary
      });
      
      setIsEditDialogOpen(false);
      setStatusMessage({ type: 'success', message: 'Wallet updated successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', message: err.message || 'Failed to update wallet' });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteWallet = async () => {
    setFormSubmitting(true);
    setStatusMessage({ type: '', message: '' });
    
    try {
      await deleteWallet(currentWallet.$id);
      
      setIsDeleteDialogOpen(false);
      setStatusMessage({ type: 'success', message: 'Wallet deleted successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', message: err.message || 'Failed to delete wallet' });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSetPrimary = async (wallet) => {
    setStatusMessage({ type: '', message: '' });
    
    try {
      await updateWallet(wallet.$id, { isPrimary: true });
      setStatusMessage({ type: 'success', message: 'Primary wallet updated successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', message: err.message || 'Failed to update primary wallet' });
    }
  };

  // Dialog open handlers
  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (wallet) => {
    setCurrentWallet(wallet);
    setFormData({
      walletAddress: wallet.walletAddress,
      walletType: wallet.walletType,
      nickname: wallet.nickname || '',
      isPrimary: wallet.isPrimary || false
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (wallet) => {
    setCurrentWallet(wallet);
    setIsDeleteDialogOpen(true);
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isPrimary' ? checked : value
    }));
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

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Wallet Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
        >
          Add Wallet
        </Button>
      </Box>

      {statusMessage.message && (
        <Alert 
          severity={statusMessage.type} 
          sx={{ mb: 3 }}
          onClose={() => setStatusMessage({ type: '', message: '' })}
        >
          {statusMessage.message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : wallets.length === 0 ? (
        <Card sx={{ mb: 3, p: 2, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              You haven't added any wallets yet.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={openAddDialog}
              sx={{ mt: 2 }}
            >
              Add Your First Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {wallets.map((wallet) => (
            <Grid item xs={12} md={6} key={wallet.$id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {wallet.nickname || 'My Wallet'}
                      {wallet.isPrimary && (
                        <Chip
                          icon={<StarIcon />}
                          label="Primary"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Box>
                      {!wallet.isPrimary && (
                        <IconButton
                          color="primary"
                          onClick={() => handleSetPrimary(wallet)}
                          title="Set as primary"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <StarBorderIcon />
                        </IconButton>
                      )}
                      <IconButton
                        color="primary"
                        onClick={() => openEditDialog(wallet)}
                        title="Edit wallet"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => openDeleteDialog(wallet)}
                        title="Delete wallet"
                        size="small"
                        disabled={wallet.isPrimary}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Chip
                    label={getWalletTypeLabel(wallet.walletType)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      wordBreak: 'break-all',
                      bgcolor: 'background.paper',
                      p: 1,
                      borderRadius: 1,
                      fontFamily: 'monospace'
                    }}
                  >
                    {wallet.walletAddress}
                  </Typography>
                  
                  {wallet.isVerified && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <CheckIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="success.main">
                        Verified
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Wallet Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Wallet</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" error={!!formErrors.walletType}>
            <InputLabel id="wallet-type-label">Wallet Type</InputLabel>
            <Select
              labelId="wallet-type-label"
              name="walletType"
              value={formData.walletType}
              onChange={handleInputChange}
              label="Wallet Type"
            >
              <MenuItem value="ethereum">Ethereum</MenuItem>
              <MenuItem value="solana">Solana</MenuItem>
              <MenuItem value="xion">Xion</MenuItem>
              <MenuItem value="internal">Platform Wallet</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            margin="normal"
            label="Wallet Address"
            name="walletAddress"
            value={formData.walletAddress}
            onChange={handleInputChange}
            error={!!formErrors.walletAddress}
            helperText={formErrors.walletAddress}
            placeholder={formData.walletType === 'ethereum' ? '0x...' : 'Enter wallet address'}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            error={!!formErrors.nickname}
            helperText={formErrors.nickname || 'A friendly name to identify this wallet'}
            placeholder="e.g. My Main Wallet"
          />
          
          <FormControl fullWidth margin="normal">
            <Typography component="div" variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="isPrimary"
                checked={formData.isPrimary}
                onChange={handleInputChange}
                id="is-primary-checkbox"
                style={{ marginRight: '8px' }}
              />
              <label htmlFor="is-primary-checkbox">Set as primary wallet</label>
            </Typography>
            <FormHelperText>
              Primary wallets are used as the default for transactions
            </FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)} disabled={formSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAddWallet}
            color="primary"
            variant="contained"
            disabled={formSubmitting}
          >
            {formSubmitting ? <CircularProgress size={24} /> : 'Add Wallet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Wallet Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Wallet</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Wallet Type"
            value={getWalletTypeLabel(formData.walletType)}
            disabled
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Wallet Address"
            value={formData.walletAddress}
            disabled
          />
          
          <Divider sx={{ my: 2 }} />
          
          <TextField
            fullWidth
            margin="normal"
            label="Nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            error={!!formErrors.nickname}
            helperText={formErrors.nickname}
          />
          
          <FormControl fullWidth margin="normal">
            <Typography component="div" variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="isPrimary"
                checked={formData.isPrimary}
                onChange={handleInputChange}
                id="edit-is-primary-checkbox"
                style={{ marginRight: '8px' }}
                disabled={currentWallet?.isPrimary}
              />
              <label htmlFor="edit-is-primary-checkbox">Set as primary wallet</label>
            </Typography>
            {currentWallet?.isPrimary && (
              <FormHelperText>
                This is already your primary wallet
              </FormHelperText>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} disabled={formSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleEditWallet}
            color="primary"
            variant="contained"
            disabled={formSubmitting}
          >
            {formSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Wallet Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Wallet Removal</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to remove this wallet?
          </Typography>
          {currentWallet?.nickname && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {currentWallet.nickname} ({currentWallet.walletAddress.substr(0, 6)}...{currentWallet.walletAddress.substr(-4)})
            </Typography>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)} disabled={formSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteWallet}
            color="error"
            variant="contained"
            disabled={formSubmitting}
          >
            {formSubmitting ? <CircularProgress size={24} /> : 'Delete Wallet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}