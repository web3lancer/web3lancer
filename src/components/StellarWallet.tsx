"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  CircularProgress, 
  Alert,
  IconButton, 
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import { ContentCopy, Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Keypair } from '@stellar/stellar-sdk';
import { walletStore } from '@/utils/stellar/walletStore';
import { fundWithFriendbot, getAccountBalance, accountExists } from '@/utils/stellar/horizonQueries';
import { ContactsManager } from './stellar/ContactsManager';
import { useContacts } from '@/hooks/useContacts';
import { TruncatedKey } from './stellar/TruncatedKey';
import TrustlineManager from './stellar/TrustlineManager';
import StellarPayment from './stellar/StellarPayment';
import PathPayment from './stellar/PathPayment';

export default function StellarWallet() {
  // State for key management
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [publicKey, setPublicKey] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [showSecretKey, setShowSecretKey] = useState<boolean>(false);
  
  // State for pincode management
  const [pincode, setPincode] = useState<string>('');
  const [confirmPincode, setConfirmPincode] = useState<string>('');
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  
  // State for account and transactions
  const [balance, setBalance] = useState<Array<{asset: string, balance: string}>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // State for confirmation modal
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<() => Promise<void>>(() => Promise.resolve());
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  
  // State to track if the user has a wallet
  const [hasWallet, setHasWallet] = useState<boolean>(false);

  // Add new tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Use contacts hook
  const { lookupContact } = useContacts();

  // Initialize wallet from local storage
  useEffect(() => {
    const unsubscribe = walletStore.subscribe((state) => {
      if (state.publicKey) {
        setPublicKey(state.publicKey);
        setHasWallet(true);
        // Load account balance when we have a public key
        loadAccountBalance(state.publicKey);
      } else {
        setHasWallet(false);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Generate a new random keypair
  const generateKeypair = () => {
    try {
      const newKeypair = Keypair.random();
      setKeypair(newKeypair);
      setPublicKey(newKeypair.publicKey());
      setSecretKey(newKeypair.secret());
      setSuccess('New keypair generated successfully!');
      setError(null);
    } catch (err) {
      setError('Failed to generate keypair');
      console.error(err);
    }
  };

  // Load account balance
  const loadAccountBalance = async (key: string) => {
    setIsLoading(true);
    try {
      const balances = await getAccountBalance(key);
      setBalance(balances);
      setError(null);
    } catch (err) {
      setError('Failed to load account balance');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fund wallet with Friendbot (testnet only)
  const handleFundWallet = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const keyToFund = publicKey || (keypair ? keypair.publicKey() : '');
      if (!keyToFund) {
        setError('No public key available to fund');
        return;
      }
      
      // First check if account already exists
      const exists = await accountExists(keyToFund);
      if (exists) {
        // If it exists, just refresh the balance
        await loadAccountBalance(keyToFund);
        setSuccess('Account already funded. Balance refreshed!');
      } else {
        // Otherwise fund with Friendbot
        await fundWithFriendbot(keyToFund);
        await loadAccountBalance(keyToFund);
        setSuccess('Account funded successfully with Friendbot!');
      }
    } catch (err) {
      setError(`Failed to fund wallet: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Register wallet (save encrypted keypair to local storage)
  const handleRegisterWallet = () => {
    // Validate inputs
    if (!keypair) {
      setError('Please generate a keypair first');
      return;
    }
    
    if (!pincode || pincode.length < 6) {
      setPincodeError('Please enter a pincode of at least 6 characters');
      return;
    }
    
    // Set up confirmation modal
    setModalAction(() => async () => {
      try {
        // Check if pincodes match
        if (pincode !== confirmPincode) {
          throw new Error('Pincodes do not match');
        }
        
        // Register the wallet
        await walletStore.register({
          publicKey: keypair.publicKey(),
          secretKey: keypair.secret(),
          pincode,
        });
        
        // Fund the account if needed
        const exists = await accountExists(keypair.publicKey());
        if (!exists) {
          await fundWithFriendbot(keypair.publicKey());
        }
        
        // Load the balance
        await loadAccountBalance(keypair.publicKey());
        
        setSuccess('Wallet registered and encrypted successfully!');
        // Clear sensitive data
        setPincode('');
        setConfirmPincode('');
        setSecretKey('');
        setKeypair(null);
      } catch (err) {
        throw new Error(`Failed to register wallet: ${err instanceof Error ? err.message : String(err)}`);
      }
    });
    
    setConfirmModalOpen(true);
  };

  // Import wallet from secret key
  const handleImportWallet = () => {
    if (!secretKey) {
      setError('Please enter a secret key');
      return;
    }
    
    if (!pincode || pincode.length < 6) {
      setPincodeError('Please enter a pincode of at least 6 characters');
      return;
    }
    
    try {
      // Create keypair from secret key
      const importedKeypair = Keypair.fromSecret(secretKey);
      setKeypair(importedKeypair);
      setPublicKey(importedKeypair.publicKey());
      
      // Set up confirmation modal
      setModalAction(() => async () => {
        try {
          // Check if pincodes match
          if (pincode !== confirmPincode) {
            throw new Error('Pincodes do not match');
          }
          
          // Register the wallet
          await walletStore.register({
            publicKey: importedKeypair.publicKey(),
            secretKey: importedKeypair.secret(),
            pincode,
          });
          
          // Load the balance
          await loadAccountBalance(importedKeypair.publicKey());
          
          setSuccess('Wallet imported and encrypted successfully!');
          // Clear sensitive data
          setPincode('');
          setConfirmPincode('');
          setSecretKey('');
        } catch (err) {
          throw new Error(`Failed to import wallet: ${err instanceof Error ? err.message : String(err)}`);
        }
      });
      
      setConfirmModalOpen(true);
    } catch (err) {
      setError('Invalid secret key');
      console.error(err);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setSuccess(`${type} copied to clipboard!`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Handle modal confirmation
  const handleConfirmAction = async () => {
    setModalLoading(true);
    setError(null);
    
    try {
      await modalAction();
      setConfirmModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setModalLoading(false);
    }
  };

  // Clear wallet (remove from local storage)
  const handleClearWallet = () => {
    setModalAction(() => async () => {
      walletStore.clear();
      setPublicKey('');
      setSecretKey('');
      setKeypair(null);
      setBalance([]);
      setHasWallet(false);
      setSuccess('Wallet removed successfully');
    });
    
    setConfirmModalOpen(true);
  };

  // Check if a public key is in contacts
  const getContactName = (key: string) => {
    const contactName = lookupContact(key);
    return contactName || null;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Success and Error Messages */}
      {success && (
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)}
          sx={{ mb: 3 }}
        >
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}
      
      {/* Main Content */}
      <Box component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {hasWallet ? (
          /* Wallet Info and Balance Section */
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Your Stellar Wallet
            </Typography>
            
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="Wallet" />
              <Tab label="Contacts" />
              <Tab label="Trustlines" />
              <Tab label="Send Payment" />
              <Tab label="Path Payment" />
            </Tabs>

            {activeTab === 0 && (
              <>
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>Public Key</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                      value={publicKey}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => copyToClipboard(publicKey, 'Public key')}
                              edge="end"
                            >
                              <ContentCopy />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>Account Balance</Typography>
                  {isLoading ? (
                    <CircularProgress size={24} />
                  ) : balance.length > 0 ? (
                    balance.map((b, index) => (
                      <Typography key={index} variant="body1">
                        {b.asset}: {b.balance}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No balance information available
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleFundWallet}
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Fund with Friendbot'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => loadAccountBalance(publicKey)}
                    disabled={isLoading}
                  >
                    Refresh Balance
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleClearWallet}
                  >
                    Remove Wallet
                  </Button>
                </Box>
              </>
            )}

            {activeTab === 1 && (
              <ContactsManager />
            )}

            {activeTab === 2 && (
              <TrustlineManager 
                publicKey={publicKey} 
                balances={balance} 
                onUpdate={() => loadAccountBalance(publicKey)}
              />
            )}

            {activeTab === 3 && (
              <StellarPayment 
                publicKey={publicKey} 
                balances={balance}
                onSuccess={() => loadAccountBalance(publicKey)} 
              />
            )}
            
            {activeTab === 4 && (
              <PathPayment 
                publicKey={publicKey} 
                balances={balance}
                onSuccess={() => loadAccountBalance(publicKey)} 
              />
            )}
          </Paper>
        ) : (
          /* Create or Import Wallet Section */
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Create or Import Stellar Wallet
            </Typography>
            
            <Box sx={{ mt: 3, mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={generateKeypair}
                sx={{ mr: 2, mb: { xs: 2, md: 0 } }}
              >
                Generate New Keypair
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setShowSecretKey(true)}
              >
                Import Existing Wallet
              </Button>
            </Box>
            
            {(keypair || showSecretKey) && (
              <Box sx={{ mt: 4 }}>
                {keypair && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>Public Key</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TextField
                        value={publicKey}
                        fullWidth
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => copyToClipboard(publicKey, 'Public key')}
                                edge="end"
                              >
                                <ContentCopy />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </>
                )}
                
                <Typography variant="subtitle1" gutterBottom>
                  {keypair ? 'Secret Key (Keep this safe!)' : 'Enter Secret Key'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TextField
                    type={keypair && !showSecretKey ? 'password' : 'text'}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    fullWidth
                    InputProps={{
                      readOnly: !!keypair,
                      endAdornment: (
                        <InputAdornment position="end">
                          {keypair ? (
                            <>
                              <IconButton
                                onClick={() => setShowSecretKey(!showSecretKey)}
                                edge="end"
                              >
                                {showSecretKey ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                              <IconButton
                                onClick={() => copyToClipboard(secretKey, 'Secret key')}
                                edge="end"
                              >
                                <ContentCopy />
                              </IconButton>
                            </>
                          ) : null}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    {keypair ? 
                      'Save your secret key in a secure place. If you lose it, you will not be able to access your funds.' :
                      'Never share your secret key with anyone. It provides full access to your account.'
                    }
                  </Typography>
                </Alert>
                
                <Typography variant="subtitle1" gutterBottom>Create a Pincode (min 6 characters)</Typography>
                <TextField
                  type="password"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    setPincodeError(null);
                  }}
                  fullWidth
                  error={!!pincodeError}
                  helperText={pincodeError}
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="subtitle1" gutterBottom>Confirm Pincode</Typography>
                <TextField
                  type="password"
                  value={confirmPincode}
                  onChange={(e) => setConfirmPincode(e.target.value)}
                  fullWidth
                  sx={{ mb: 3 }}
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {keypair ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleRegisterWallet}
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Register Wallet'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleImportWallet}
                      disabled={isLoading || !secretKey}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Import Wallet'}
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        )}
      </Box>
      
      {/* Confirmation Modal */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => !modalLoading && setConfirmModalOpen(false)}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            {hasWallet ? 
              'Are you sure you want to remove this wallet? This action cannot be undone.' : 
              'Please confirm your pincode to securely encrypt and store your wallet.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmModalOpen(false)} 
            disabled={modalLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            variant="contained" 
            color={hasWallet ? "error" : "primary"}
            disabled={modalLoading}
          >
            {modalLoading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}