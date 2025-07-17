import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  IconButton, 
  Grid,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { walletStore } from '@/utils/stellar/walletStore';
import { TruncatedKey } from '@/components/stellar/TruncatedKey';
import { submit } from '@/utils/stellar/horizonQueries';
import { createChangeTrustTransaction } from '@/utils/stellar/transactions';
import { fetchAssets, StellarAsset } from '@/utils/stellar/stellarExpert';
import ConfirmationModal from '@/components/stellar/ConfirmationModal';

interface Balance {
  asset: string;
  balance: string;
}

interface TrustlineManagerProps {
  publicKey: string;
  balances: Balance[];
  onUpdate: () => void;
}

export default function TrustlineManager({ 
  publicKey, 
  balances, 
  onUpdate 
}: TrustlineManagerProps) {
  const [assets, setAssets] = useState<StellarAsset[]>([]);
  const [addAsset, setAddAsset] = useState<string>('');
  const [customAssetCode, setCustomAssetCode] = useState('');
  const [customAssetIssuer, setCustomAssetIssuer] = useState('');
  const [changeTrustXDR, setChangeTrustXDR] = useState('');
  const [changeTrustNetwork, setChangeTrustNetwork] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Computed asset based on selection or custom input
  const asset = addAsset !== 'custom'
    ? addAsset
    : `${customAssetCode}:${customAssetIssuer}`;

  // Load popular assets on component mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const fetchedAssets = await fetchAssets();
        setAssets(fetchedAssets);
      } catch (err) {
        console.error('Failed to load assets', err);
      }
    };
    
    loadAssets();
  }, []);

  // Handle asset selection change
  const handleAssetChange = (event: SelectChangeEvent) => {
    setAddAsset(event.target.value);
  };

  // Handle trustline confirmation action
  const handleConfirm = async (pincode: string) => {
    try {
      // Use the walletStore to sign the transaction
      const signedTransaction = await walletStore.sign({
        transactionXDR: changeTrustXDR,
        network: changeTrustNetwork,
        pincode
      });
      
      // Submit the transaction to the Stellar network
      await submit(signedTransaction);
      
      // Clear form and show success message
      setAddAsset('');
      setCustomAssetCode('');
      setCustomAssetIssuer('');
      setSuccess('Trustline updated successfully!');
      
      // Refresh balances data
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trustline');
      throw err; // Rethrow to be caught by the modal
    }
  };

  // Preview and prepare change trust transaction
  const previewChangeTrustTransaction = async (
    addingAsset: boolean = true,
    removeAsset?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const assetToModify = removeAsset ?? asset;
      
      // Validate asset
      if (!assetToModify || (assetToModify === 'custom' && (!customAssetCode || !customAssetIssuer))) {
        setError('Please select or enter a valid asset');
        setLoading(false);
        return;
      }
      
      // Generate the transaction
      const { transaction, network_passphrase } = await createChangeTrustTransaction({
        source: publicKey,
        asset: assetToModify,
        limit: addingAsset ? undefined : "0", // Limit of 0 removes the trustline
      });
      
      // Set the transaction details and open confirmation modal
      setChangeTrustXDR(transaction);
      setChangeTrustNetwork(network_passphrase);
      setConfirmModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prepare transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Manage Trustlines
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add Trustline
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Select
              value={addAsset}
              onChange={handleAssetChange}
              displayEmpty
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="" disabled>
                Select an asset
              </MenuItem>
              <MenuItem value="custom">Custom Asset</MenuItem>
              {assets.map((asset) => (
                <MenuItem 
                  key={`${asset.code}:${asset.issuer}`} 
                  value={`${asset.code}:${asset.issuer}`}
                >
                  {asset.code} - {asset.name || asset.domain || 'Unknown'}
                </MenuItem>
              ))}
            </Select>
            
            {addAsset === 'custom' && (
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="Asset Code"
                  value={customAssetCode}
                  onChange={(e) => setCustomAssetCode(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Issuer Account"
                  value={customAssetIssuer}
                  onChange={(e) => setCustomAssetIssuer(e.target.value)}
                  fullWidth
                />
              </Box>
            )}
          </Box>
          
          <Button
            variant="contained"
            onClick={() => previewChangeTrustTransaction(true)}
            disabled={loading || !addAsset || (addAsset === 'custom' && (!customAssetCode || !customAssetIssuer))}
          >
            Add Trustline
          </Button>
        </CardContent>
      </Card>
      
      <Typography variant="h6" gutterBottom>
        Current Trustlines
      </Typography>
      
      <Grid container spacing={2}>
        {balances
          .filter(b => b.asset !== 'XLM') // Filter out native XLM
          .map((balance, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6">
                        {balance.asset.includes(':') 
                          ? balance.asset.split(':')[0] 
                          : balance.asset}
                      </Typography>
                      
                      {balance.asset.includes(':') && (
                        <Typography variant="body2" color="textSecondary">
                          Issuer: <TruncatedKey publicKey={balance.asset.split(':')[1]} />
                        </Typography>
                      )}
                      
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Balance: {balance.balance}
                      </Typography>
                    </Box>
                    
                    <IconButton 
                      color="error" 
                      onClick={() => previewChangeTrustTransaction(false, balance.asset)}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
      
      {balances.filter(b => b.asset !== 'XLM').length === 0 && (
        <Alert severity="info">
          No trustlines found. You can add trustlines to hold non-native assets.
        </Alert>
      )}
      
      <ConfirmationModal
        transactionXDR={changeTrustXDR}
        transactionNetwork={changeTrustNetwork}
        onConfirm={handleConfirm}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
      />
    </Box>
  );
}
