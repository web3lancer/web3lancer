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
  FormHelperText,
  Alert,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { walletStore } from '@/utils/stellar/walletStore';
import { contactsStore } from '@/utils/stellar/contactsStore';
import { 
  fetchAccount, 
  submit,
  fetchAccountBalances
} from '@/utils/stellar/horizonQueries';
import { 
  createPaymentTransaction, 
  createCreateAccountTransaction 
} from '@/utils/stellar/transactions';
import ConfirmationModal from './ConfirmationModal';

interface StellarPaymentProps {
  publicKey: string;
  balances: Array<{asset: string, balance: string}>;
  onSuccess?: () => void;
}

export default function StellarPayment({ publicKey, balances, onSuccess }: StellarPaymentProps) {
  // For destination selection
  const [destination, setDestination] = useState<string>('');
  const [otherDestination, setOtherDestination] = useState<boolean>(false);
  const [otherPublicKey, setOtherPublicKey] = useState<string>('');
  
  // For payment details
  const [sendAsset, setSendAsset] = useState<string>('native');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  
  // For showing alerts and status
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // For transaction details
  const [createAccountOp, setCreateAccountOp] = useState<boolean | null>(null);
  const [paymentXDR, setPaymentXDR] = useState<string>('');
  const [paymentNetwork, setPaymentNetwork] = useState<string>('');
  
  // For contact selection
  const [contacts, setContacts] = useState<Array<{id: string, name: string, address: string, favorite: boolean}>>([]);
  
  // For modal
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  // Load contacts when component mounts
  useEffect(() => {
    const unsubscribe = contactsStore.subscribe((newContacts) => {
      setContacts(newContacts);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Handle destination change
  const handleDestinationChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setDestination(value);
    setOtherDestination(value === 'other');
    
    if (value !== 'other') {
      checkDestination(value);
    } else {
      setOtherPublicKey('');
      setCreateAccountOp(null);
    }
  };

  // Check if destination account exists
  const checkDestination = async (publicKey: string) => {
    if (publicKey !== 'other') {
      setIsLoading(true);
      setError(null);
      setInfo(null);
      
      try {
        // If the account returns successfully, it exists
        await fetchAccount(publicKey);
        setCreateAccountOp(false);
      } catch (err: any) {
        // If error is 404, account doesn't exist, so we'll create it
        if (err.status === 404) {
          setCreateAccountOp(true);
          setSendAsset('native');
          setInfo('Account Not Funded: You are sending a payment to an account that does not yet exist on the Stellar ledger. Your payment will take the form of a createAccount operation, and the amount you send must be at least 1 XLM.');
        } else {
          setError(`Error checking destination: ${err.message || 'Unknown error'}`);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle other public key change
  const handleOtherPublicKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOtherPublicKey(value);
    
    if (value.length >= 56) { // Stellar public keys are 56 characters long
      checkDestination(value);
    }
  };

  // Preview and prepare payment transaction
  const previewPaymentTransaction = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Determine the actual destination address
      const finalDestination = otherDestination ? otherPublicKey : destination;
      
      // Make sure we have all required fields
      if (!finalDestination) {
        throw new Error('Please select a destination');
      }
      
      if (!sendAmount || parseFloat(sendAmount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Create the appropriate transaction
      let result;
      if (createAccountOp) {
        result = await createCreateAccountTransaction({
          source: publicKey,
          destination: finalDestination,
          amount: sendAmount,
          memo: memo || undefined
        });
      } else {
        result = await createPaymentTransaction({
          source: publicKey,
          destination: finalDestination,
          asset: sendAsset,
          amount: sendAmount,
          memo: memo || undefined
        });
      }
      
      // Set the transaction details for signing
      setPaymentXDR(result.transaction);
      setPaymentNetwork(result.network_passphrase);
      
      // Open confirmation modal
      setConfirmModalOpen(true);
    } catch (err) {
      setError(`Failed to create transaction: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle transaction confirmation
  const handleConfirmTransaction = async (pincode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Sign the transaction
      const signedTransaction = await walletStore.sign({
        transactionXDR: paymentXDR,
        network: paymentNetwork,
        pincode
      });
      
      // Submit the transaction to the network
      await submit(signedTransaction);
      
      // Reset form
      setDestination('');
      setOtherPublicKey('');
      setSendAsset('native');
      setSendAmount('');
      setMemo('');
      setCreateAccountOp(null);
      
      // Show success message
      setInfo('Payment sent successfully!');
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(`Transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Send Payment
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {info && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setInfo(null)}>
          <div dangerouslySetInnerHTML={{ __html: info }} />
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="destination-label">Select Destination</InputLabel>
          <Select
            labelId="destination-label"
            value={destination}
            onChange={handleDestinationChange}
            label="Select Destination"
          >
            <MenuItem value="">
              <em>Select a contact</em>
            </MenuItem>
            {contacts.map(contact => (
              <MenuItem key={contact.id} value={contact.address}>
                {contact.name} ({contact.address.substring(0, 6)}...{contact.address.substring(contact.address.length - 6)})
              </MenuItem>
            ))}
            <MenuItem value="other">Other (Enter public key)</MenuItem>
          </Select>
        </FormControl>
        
        {otherDestination && (
          <TextField
            label="Destination Public Key"
            value={otherPublicKey}
            onChange={handleOtherPublicKeyChange}
            fullWidth
            sx={{ mb: 3 }}
            error={otherPublicKey.length > 0 && otherPublicKey.length < 56}
            helperText={otherPublicKey.length > 0 && otherPublicKey.length < 56 ? "Please enter a valid Stellar public key" : ""}
          />
        )}
        
        {/* Asset selection - only available if NOT creating a new account */}
        {createAccountOp === false && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="asset-label">Select Asset</InputLabel>
            <Select
              labelId="asset-label"
              value={sendAsset}
              onChange={(e) => setSendAsset(e.target.value)}
              label="Select Asset"
            >
              <MenuItem value="native">XLM (Native Asset)</MenuItem>
              {balances
                .filter(b => b.asset !== 'XLM')
                .map(b => (
                  <MenuItem key={b.asset} value={b.asset}>
                    {b.asset}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        )}
        
        <TextField
          label="Amount"
          type="number"
          value={sendAmount}
          onChange={(e) => setSendAmount(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
          InputProps={{
            inputProps: { 
              min: createAccountOp ? 1 : 0,
              step: "0.0000001"
            }
          }}
          error={createAccountOp === true && parseFloat(sendAmount || '0') < 1}
          helperText={createAccountOp === true ? "Minimum amount is 1 XLM for creating a new account" : ""}
        />
        
        <TextField
          label="Memo (Optional)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
        
        <Button
          variant="contained"
          color="primary"
          onClick={previewPaymentTransaction}
          disabled={isLoading || 
            !((destination && destination !== 'other') || (otherDestination && otherPublicKey.length >= 56)) || 
            !sendAmount || 
            (createAccountOp === true && parseFloat(sendAmount) < 1)}
          sx={{ mt: 2 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Send Payment'}
        </Button>
      </Box>
      
      <ConfirmationModal
        transactionXDR={paymentXDR}
        transactionNetwork={paymentNetwork}
        onConfirm={handleConfirmTransaction}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
      />
    </Box>
  );
}
