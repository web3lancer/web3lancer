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
  Alert,
  CircularProgress,
  SelectChangeEvent,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { walletStore } from '@/utils/stellar/walletStore';
import { contactsStore } from '@/utils/stellar/contactsStore';
import { 
  fetchAccount, 
  submit,
  findStrictSendPaths,
  findStrictReceivePaths
} from '@/utils/stellar/horizonQueries';
import { 
  createPathPaymentStrictSendTransaction, 
  createPathPaymentStrictReceiveTransaction 
} from '@/utils/stellar/transactions';
import ConfirmationModal from './ConfirmationModal';

interface PathPaymentProps {
  publicKey: string;
  balances: Array<{asset: string, balance: string}>;
  onSuccess?: () => void;
}

export default function PathPayment({ publicKey, balances, onSuccess }: PathPaymentProps) {
  // For destination selection
  const [destination, setDestination] = useState<string>('');
  const [otherDestination, setOtherDestination] = useState<boolean>(false);
  const [otherPublicKey, setOtherPublicKey] = useState<string>('');
  
  // For payment details
  const [sendAsset, setSendAsset] = useState<string>('native');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [receiveAsset, setReceiveAsset] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  
  // For path finding
  const [strictReceive, setStrictReceive] = useState<boolean>(false);
  const [availablePaths, setAvailablePaths] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<any | null>(null);
  
  // For showing alerts and status
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [findingPaths, setFindingPaths] = useState<boolean>(false);
  
  // For transaction details
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
    }
  };

  // Check if destination account exists
  const checkDestination = async (publicKey: string) => {
    if (publicKey !== 'other') {
      setIsLoading(true);
      setError(null);
      
      try {
        // If the account returns successfully, it exists
        await fetchAccount(publicKey);
      } catch (err: any) {
        setError(`Error checking destination: ${err.message || 'Unknown error'}`);
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

  // Handle asset and amount changes
  const handleAssetChange = (type: 'send' | 'receive', event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (type === 'send') {
      setSendAsset(value);
    } else {
      setReceiveAsset(value);
    }
    
    // Reset paths when asset changes
    setAvailablePaths([]);
    setSelectedPath(null);
  };

  const handleAmountChange = (type: 'send' | 'receive', event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (type === 'send') {
      setSendAmount(value);
    } else {
      setReceiveAmount(value);
    }
    
    // Reset paths when amount changes
    setAvailablePaths([]);
    setSelectedPath(null);
  };

  // Handle strict receive toggle
  const handleStrictReceiveToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStrictReceive(event.target.checked);
    setAvailablePaths([]);
    setSelectedPath(null);
  };

  // Find paths based on current inputs
  const findPaths = async () => {
    const actualDestination = otherDestination ? otherPublicKey : destination;
    
    if (!actualDestination) {
      setError('Please select a destination');
      return;
    }
    
    if (strictReceive) {
      if (!receiveAsset || !receiveAmount) {
        setError('Please specify the receiving asset and amount');
        return;
      }
    } else {
      if (!sendAsset || !sendAmount) {
        setError('Please specify the sending asset and amount');
        return;
      }
    }
    
    setFindingPaths(true);
    setError(null);
    
    try {
      const paths = strictReceive
        ? await findStrictReceivePaths({
            sourcePublicKey: publicKey,
            destinationAsset: receiveAsset,
            destinationAmount: receiveAmount,
          })
        : await findStrictSendPaths({
            sourceAsset: sendAsset,
            sourceAmount: sendAmount,
            destinationPublicKey: actualDestination,
          });
          
      setAvailablePaths(paths);
      
      if (paths.length === 0) {
        setError('No paths found for this conversion. Try different assets or amounts.');
      } else {
        // Auto-select the first path
        setSelectedPath(paths[0]);
        
        // Update the corresponding amount based on the selected path
        if (strictReceive) {
          const matchingPath = paths.find(path => 
            path.source_asset_type === 'native' && sendAsset === 'native' ||
            path.source_asset_code && sendAsset.startsWith(path.source_asset_code)
          );
          if (matchingPath) {
            setSendAmount(matchingPath.source_amount);
          }
        } else {
          const matchingPath = paths.find(path => 
            path.destination_asset_type === 'native' && receiveAsset === 'native' ||
            path.destination_asset_code && receiveAsset.startsWith(path.destination_asset_code)
          );
          if (matchingPath) {
            setReceiveAmount(matchingPath.destination_amount);
          }
        }
      }
    } catch (err) {
      setError(`Error finding paths: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setFindingPaths(false);
    }
  };

  // Preview and prepare path payment transaction
  const previewPathPaymentTransaction = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Determine the actual destination address
      const finalDestination = otherDestination ? otherPublicKey : destination;
      
      // Make sure we have all required fields
      if (!finalDestination) {
        throw new Error('Please select a destination');
      }
      
      if (!sendAsset || !sendAmount || !receiveAsset || !receiveAmount) {
        throw new Error('Please ensure all assets and amounts are specified');
      }
      
      // Create the appropriate transaction based on strict send/receive
      let result;
      if (strictReceive) {
        result = await createPathPaymentStrictReceiveTransaction({
          source: publicKey,
          sourceAsset: sendAsset,
          sourceAmount: sendAmount,
          destination: finalDestination,
          destinationAsset: receiveAsset,
          destinationAmount: receiveAmount,
          memo: memo || undefined
        });
      } else {
        result = await createPathPaymentStrictSendTransaction({
          source: publicKey,
          sourceAsset: sendAsset,
          sourceAmount: sendAmount,
          destination: finalDestination,
          destinationAsset: receiveAsset,
          destinationAmount: receiveAmount,
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
      setReceiveAsset('');
      setReceiveAmount('');
      setMemo('');
      setAvailablePaths([]);
      setSelectedPath(null);
      
      // Show success message
      setInfo('Path payment sent successfully!');
      
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
        Path Payment
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Send one asset and have the recipient receive another asset through automatic conversion on the Stellar network.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {info && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setInfo(null)}>
          {info}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        {/* Destination Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="destination-label">Recipient</InputLabel>
          <Select
            labelId="destination-label"
            value={destination}
            onChange={handleDestinationChange}
            label="Recipient"
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
            label="Recipient Public Key"
            value={otherPublicKey}
            onChange={handleOtherPublicKeyChange}
            fullWidth
            sx={{ mb: 3 }}
            error={otherPublicKey.length > 0 && otherPublicKey.length < 56}
            helperText={otherPublicKey.length > 0 && otherPublicKey.length < 56 ? "Please enter a valid Stellar public key" : ""}
          />
        )}
        
        {/* Path Payment Configuration */}
        <FormControlLabel
          control={
            <Switch
              checked={strictReceive}
              onChange={handleStrictReceiveToggle}
              name="strictReceive"
            />
          }
          label={strictReceive ? "Receiving an exact amount" : "Sending an exact amount"}
          sx={{ mb: 2 }}
        />
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>You Send</Typography>
            <FormControl fullWidth sx={{ mb: 1 }}>
              <InputLabel id="send-asset-label">Asset</InputLabel>
              <Select
                labelId="send-asset-label"
                value={sendAsset}
                onChange={(e) => handleAssetChange('send', e)}
                label="Asset"
                disabled={strictReceive && !!selectedPath}
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
            
            <TextField
              label="Amount"
              type="number"
              value={sendAmount}
              onChange={(e) => handleAmountChange('send', e)}
              fullWidth
              disabled={strictReceive && !!selectedPath}
              InputProps={{
                inputProps: { min: 0, step: "0.0000001" }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>They Receive</Typography>
            <FormControl fullWidth sx={{ mb: 1 }}>
              <InputLabel id="receive-asset-label">Asset</InputLabel>
              <Select
                labelId="receive-asset-label"
                value={receiveAsset}
                onChange={(e) => handleAssetChange('receive', e)}
                label="Asset"
                disabled={!strictReceive && !!selectedPath}
              >
                <MenuItem value="native">XLM (Native Asset)</MenuItem>
                {/* Include all common Stellar assets, even those not in your balances */}
                <MenuItem value="USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5">USDC</MenuItem>
                <MenuItem value="BTC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5">BTC</MenuItem>
                <MenuItem value="ETH:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5">ETH</MenuItem>
                {/* Include user's assets as well */}
                {balances
                  .filter(b => b.asset !== 'XLM' && b.asset !== receiveAsset)
                  .map(b => (
                    <MenuItem key={`receive-${b.asset}`} value={b.asset}>
                      {b.asset}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            
            <TextField
              label="Amount"
              type="number"
              value={receiveAmount}
              onChange={(e) => handleAmountChange('receive', e)}
              fullWidth
              disabled={!strictReceive && !!selectedPath}
              InputProps={{
                inputProps: { min: 0, step: "0.0000001" }
              }}
            />
          </Grid>
        </Grid>
        
        <Button
          variant="outlined"
          color="primary"
          onClick={findPaths}
          disabled={
            findingPaths || 
            (!otherDestination && !destination) || 
            (otherDestination && (!otherPublicKey || otherPublicKey.length < 56)) ||
            (strictReceive ? (!receiveAsset || !receiveAmount) : (!sendAsset || !sendAmount))
          }
          sx={{ mb: 3 }}
        >
          {findingPaths ? <CircularProgress size={24} /> : 'Find Path'}
        </Button>
        
        {/* Show found paths */}
        {availablePaths.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Available Paths
            </Typography>
            
            <List sx={{ bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
              {availablePaths.length === 1 ? (
                <ListItem>
                  <ListItemText
                    primary={`Convert ${strictReceive ? selectedPath?.source_amount : sendAmount} ${sendAsset} to ${strictReceive ? receiveAmount : selectedPath?.destination_amount} ${receiveAsset}`}
                    secondary="Direct conversion"
                  />
                </ListItem>
              ) : (
                availablePaths.map((path, index) => (
                  <ListItem key={index} button onClick={() => setSelectedPath(path)} selected={selectedPath === path}>
                    <ListItemText
                      primary={`Path ${index + 1}: ${strictReceive ? path.source_amount : sendAmount} ${sendAsset} → ${strictReceive ? receiveAmount : path.destination_amount} ${receiveAsset}`}
                      secondary={`Through ${path.path.length} intermediary ${path.path.length === 1 ? 'asset' : 'assets'}`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        )}
        
        {/* Memo field */}
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
          onClick={previewPathPaymentTransaction}
          disabled={
            isLoading || 
            (!otherDestination && !destination) || 
            (otherDestination && (!otherPublicKey || otherPublicKey.length < 56)) ||
            !sendAsset || !sendAmount || !receiveAsset || !receiveAmount || !selectedPath
          }
        >
          {isLoading ? <CircularProgress size={24} /> : 'Send Path Payment'}
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
