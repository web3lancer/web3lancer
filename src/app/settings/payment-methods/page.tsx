"use client";

import { useState } from 'react';
import { usePaymentMethods } from '@/hooks/useFinance';
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
  CheckCircle as CheckCircleIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  Wallet as WalletIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';

export default function PaymentMethodsSettingsPage() {
  const {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  } = usePaymentMethods();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);
  const [formData, setFormData] = useState({
    paymentType: 'card',
    isDefault: false,
    details: {
      cardNumber: '',
      cardHolderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      accountNumber: '',
      routingNumber: '',
      accountHolderName: '',
      bankName: '',
      paypalEmail: '',
      walletAddress: '',
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

  // Reset form data when dialogs are opened/closed
  const resetForm = () => {
    setFormData({
      paymentType: 'card',
      isDefault: false,
      details: {
        cardNumber: '',
        cardHolderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        accountNumber: '',
        routingNumber: '',
        accountHolderName: '',
        bankName: '',
        paypalEmail: '',
        walletAddress: '',
      }
    });
    setFormErrors({});
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    const { paymentType, details } = formData;
    
    if (paymentType === 'card') {
      if (!details.cardNumber.trim()) {
        errors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(details.cardNumber.replace(/\s/g, ''))) {
        errors.cardNumber = 'Invalid card number format';
      }
      
      if (!details.cardHolderName.trim()) {
        errors.cardHolderName = 'Card holder name is required';
      }
      
      if (!details.expiryMonth.trim()) {
        errors.expiryMonth = 'Expiry month is required';
      } else if (!/^(0?[1-9]|1[0-2])$/.test(details.expiryMonth)) {
        errors.expiryMonth = 'Invalid month (1-12)';
      }
      
      if (!details.expiryYear.trim()) {
        errors.expiryYear = 'Expiry year is required';
      } else if (!/^\d{4}$/.test(details.expiryYear)) {
        errors.expiryYear = 'Invalid year format (YYYY)';
      }
      
      if (!details.cvv.trim()) {
        errors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(details.cvv)) {
        errors.cvv = 'Invalid CVV format';
      }
    } else if (paymentType === 'bank_account') {
      if (!details.accountNumber.trim()) {
        errors.accountNumber = 'Account number is required';
      }
      
      if (!details.routingNumber.trim()) {
        errors.routingNumber = 'Routing number is required';
      }
      
      if (!details.accountHolderName.trim()) {
        errors.accountHolderName = 'Account holder name is required';
      }
      
      if (!details.bankName.trim()) {
        errors.bankName = 'Bank name is required';
      }
    } else if (paymentType === 'paypal') {
      if (!details.paypalEmail.trim()) {
        errors.paypalEmail = 'PayPal email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.paypalEmail)) {
        errors.paypalEmail = 'Invalid email format';
      }
    } else if (paymentType === 'crypto') {
      if (!details.walletAddress.trim()) {
        errors.walletAddress = 'Wallet address is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPaymentMethod = async () => {
    if (!validateForm()) return;
    
    setFormSubmitting(true);
    setStatusMessage({ type: '', message: '' });
    
    try {
      // Extract only the relevant details for the selected payment type
      const relevantDetails = {};
      const { paymentType, details, isDefault } = formData;
      
      if (paymentType === 'card') {
        relevantDetails.cardNumber = details.cardNumber.replace(/\s/g, '');
        relevantDetails.cardHolderName = details.cardHolderName;
        relevantDetails.expiryMonth = details.expiryMonth;
        relevantDetails.expiryYear = details.expiryYear;
        relevantDetails.last4 = details.cardNumber.slice(-4);
      } else if (paymentType === 'bank_account') {
        relevantDetails.accountNumber = details.accountNumber;
        relevantDetails.routingNumber = details.routingNumber;
        relevantDetails.accountHolderName = details.accountHolderName;
        relevantDetails.bankName = details.bankName;
        relevantDetails.last4 = details.accountNumber.slice(-4);
      } else if (paymentType === 'paypal') {
        relevantDetails.paypalEmail = details.paypalEmail;
      } else if (paymentType === 'crypto') {
        relevantDetails.walletAddress = details.walletAddress;
      }
      
      await addPaymentMethod({
        paymentType,
        details: relevantDetails,
        isDefault
      });
      
      setIsAddDialogOpen(false);
      resetForm();
      setStatusMessage({ type: 'success', message: 'Payment method added successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', message: err.message || 'Failed to add payment method' });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditPaymentMethod = async () => {
    setFormSubmitting(true);
    setStatusMessage({ type: '', message: '' });
    
    try {
      await updatePaymentMethod(currentPaymentMethod.$id, {
        isDefault: formData.isDefault
      });
      
      setIsEditDialogOpen(false);
      setStatusMessage({ type: 'success', message: 'Payment method updated successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', message: err.message || 'Failed to update payment method' });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeletePaymentMethod = async () => {
    setFormSubmitting(true);
    setStatusMessage({ type: '', message: '' });
    
    try {
      await deletePaymentMethod(currentPaymentMethod.$id);
      
      setIsDeleteDialogOpen(false);
      setStatusMessage({ type: 'success', message: 'Payment method deleted successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', message: err.message || 'Failed to delete payment method' });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSetDefault = async (paymentMethod) => {
    setStatusMessage({ type: '', message: '' });
    
    try {
      await updatePaymentMethod(paymentMethod.$id, { isDefault: true });
      setStatusMessage({ type: 'success', message: 'Default payment method updated successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', message: err.message || 'Failed to update default payment method' });
    }
  };

  // Dialog open handlers
  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (paymentMethod) => {
    setCurrentPaymentMethod(paymentMethod);
    setFormData({
      paymentType: paymentMethod.paymentType,
      isDefault: paymentMethod.isDefault || false,
      details: paymentMethod.details || {}
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (paymentMethod) => {
    setCurrentPaymentMethod(paymentMethod);
    setIsDeleteDialogOpen(true);
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'paymentType') {
      setFormData(prev => ({
        ...prev,
        paymentType: value
      }));
    } else if (name === 'isDefault') {
      setFormData(prev => ({
        ...prev,
        isDefault: checked
      }));
    } else {
      // For details fields
      setFormData(prev => ({
        ...prev,
        details: {
          ...prev.details,
          [name]: value
        }
      }));
    }
  };

  // Helper function to mask sensitive data
  const maskData = (data, type) => {
    if (type === 'card' && data.last4) {
      return `•••• •••• •••• ${data.last4}`;
    } else if (type === 'bank_account' && data.last4) {
      return `••••••${data.last4}`;
    } else if (type === 'paypal' && data.paypalEmail) {
      const [username, domain] = data.paypalEmail.split('@');
      return `${username.charAt(0)}${'•'.repeat(username.length - 1)}@${domain}`;
    } else if (type === 'crypto' && data.walletAddress) {
      const addr = data.walletAddress;
      return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    }
    return '••••••••••••';
  };

  // Helper function to get payment method icon
  const getPaymentMethodIcon = (type) => {
    switch (type) {
      case 'card':
        return <CreditCardIcon />;
      case 'bank_account':
        return <AccountBalanceIcon />;
      case 'paypal':
        return <PaymentIcon />;
      case 'crypto':
        return <WalletIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  // Helper function to get payment method label
  const getPaymentMethodLabel = (method) => {
    switch (method.paymentType) {
      case 'card':
        return `${method.details.cardHolderName || 'Credit Card'} (${maskData(method.details, 'card')})`;
      case 'bank_account':
        return `${method.details.bankName || 'Bank Account'} (${maskData(method.details, 'bank_account')})`;
      case 'paypal':
        return `PayPal (${method.details.paypalEmail || 'Connected Account'})`;
      case 'crypto':
        return `Crypto Wallet (${maskData(method.details, 'crypto')})`;
      default:
        return 'Payment Method';
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Payment Methods
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
        >
          Add Payment Method
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
      ) : paymentMethods.length === 0 ? (
        <Card sx={{ mb: 3, p: 2, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              You haven't added any payment methods yet.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={openAddDialog}
              sx={{ mt: 2 }}
            >
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {paymentMethods.map((method) => (
            <Grid item xs={12} md={6} key={method.$id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getPaymentMethodIcon(method.paymentType)}
                      <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                        {method.paymentType === 'card' ? 'Credit/Debit Card' : 
                         method.paymentType === 'bank_account' ? 'Bank Account' : 
                         method.paymentType === 'paypal' ? 'PayPal' : 'Crypto Wallet'}
                      </Typography>
                      {method.isDefault && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Default"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    <Box>
                      {!method.isDefault && (
                        <IconButton
                          color="primary"
                          onClick={() => handleSetDefault(method)}
                          title="Set as default"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      <IconButton
                        color="primary"
                        onClick={() => openEditDialog(method)}
                        title="Edit payment method"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => openDeleteDialog(method)}
                        title="Delete payment method"
                        size="small"
                        disabled={method.isDefault}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1">
                    {getPaymentMethodLabel(method)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Added on {new Date(method.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Payment Method Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="payment-type-label">Payment Type</InputLabel>
            <Select
              labelId="payment-type-label"
              name="paymentType"
              value={formData.paymentType}
              onChange={handleInputChange}
              label="Payment Type"
            >
              <MenuItem value="card">Credit/Debit Card</MenuItem>
              <MenuItem value="bank_account">Bank Account</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="crypto">Crypto Wallet</MenuItem>
            </Select>
          </FormControl>
          
          {/* Credit Card Fields */}
          {formData.paymentType === 'card' && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Card Number"
                name="cardNumber"
                value={formData.details.cardNumber}
                onChange={handleInputChange}
                error={!!formErrors.cardNumber}
                helperText={formErrors.cardNumber}
                placeholder="1234 5678 9012 3456"
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Cardholder Name"
                name="cardHolderName"
                value={formData.details.cardHolderName}
                onChange={handleInputChange}
                error={!!formErrors.cardHolderName}
                helperText={formErrors.cardHolderName}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Expiry Month (MM)"
                    name="expiryMonth"
                    value={formData.details.expiryMonth}
                    onChange={handleInputChange}
                    error={!!formErrors.expiryMonth}
                    helperText={formErrors.expiryMonth}
                    placeholder="MM"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Expiry Year (YYYY)"
                    name="expiryYear"
                    value={formData.details.expiryYear}
                    onChange={handleInputChange}
                    error={!!formErrors.expiryYear}
                    helperText={formErrors.expiryYear}
                    placeholder="YYYY"
                  />
                </Grid>
              </Grid>
              
              <TextField
                fullWidth
                margin="normal"
                label="CVV"
                name="cvv"
                value={formData.details.cvv}
                onChange={handleInputChange}
                error={!!formErrors.cvv}
                helperText={formErrors.cvv}
                type="password"
              />
            </>
          )}
          
          {/* Bank Account Fields */}
          {formData.paymentType === 'bank_account' && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Bank Name"
                name="bankName"
                value={formData.details.bankName}
                onChange={handleInputChange}
                error={!!formErrors.bankName}
                helperText={formErrors.bankName}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Account Holder Name"
                name="accountHolderName"
                value={formData.details.accountHolderName}
                onChange={handleInputChange}
                error={!!formErrors.accountHolderName}
                helperText={formErrors.accountHolderName}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Account Number"
                name="accountNumber"
                value={formData.details.accountNumber}
                onChange={handleInputChange}
                error={!!formErrors.accountNumber}
                helperText={formErrors.accountNumber}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Routing Number"
                name="routingNumber"
                value={formData.details.routingNumber}
                onChange={handleInputChange}
                error={!!formErrors.routingNumber}
                helperText={formErrors.routingNumber}
              />
            </>
          )}
          
          {/* PayPal Fields */}
          {formData.paymentType === 'paypal' && (
            <TextField
              fullWidth
              margin="normal"
              label="PayPal Email"
              name="paypalEmail"
              value={formData.details.paypalEmail}
              onChange={handleInputChange}
              error={!!formErrors.paypalEmail}
              helperText={formErrors.paypalEmail}
            />
          )}
          
          {/* Crypto Fields */}
          {formData.paymentType === 'crypto' && (
            <TextField
              fullWidth
              margin="normal"
              label="Wallet Address"
              name="walletAddress"
              value={formData.details.walletAddress}
              onChange={handleInputChange}
              error={!!formErrors.walletAddress}
              helperText={formErrors.walletAddress}
            />
          )}
          
          <FormControl fullWidth margin="normal">
            <Typography component="div" variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                id="is-default-checkbox"
                style={{ marginRight: '8px' }}
              />
              <label htmlFor="is-default-checkbox">Set as default payment method</label>
            </Typography>
            <FormHelperText>
              Default payment methods are used for automatic payments
            </FormHelperText>
          </FormControl>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Your payment information is stored securely. We do not store full card details on our servers.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)} disabled={formSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAddPaymentMethod}
            color="primary"
            variant="contained"
            disabled={formSubmitting}
          >
            {formSubmitting ? <CircularProgress size={24} /> : 'Add Payment Method'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Payment Method Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Payment Method</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            For security reasons, you cannot edit the details of an existing payment method. 
            You can only change its default status. To update details, please remove this 
            payment method and add a new one.
          </Alert>
          
          <Typography variant="subtitle1">
            {currentPaymentMethod ? getPaymentMethodLabel(currentPaymentMethod) : 'Payment Method'}
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <Typography component="div" variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                id="edit-is-default-checkbox"
                style={{ marginRight: '8px' }}
                disabled={currentPaymentMethod?.isDefault}
              />
              <label htmlFor="edit-is-default-checkbox">Set as default payment method</label>
            </Typography>
            {currentPaymentMethod?.isDefault && (
              <FormHelperText>
                This is already your default payment method
              </FormHelperText>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} disabled={formSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleEditPaymentMethod}
            color="primary"
            variant="contained"
            disabled={formSubmitting || currentPaymentMethod?.isDefault}
          >
            {formSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Payment Method Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to remove this payment method?
          </Typography>
          {currentPaymentMethod && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {getPaymentMethodLabel(currentPaymentMethod)}
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
            onClick={handleDeletePaymentMethod}
            color="error"
            variant="contained"
            disabled={formSubmitting}
          >
            {formSubmitting ? <CircularProgress size={24} /> : 'Remove Payment Method'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}