import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Checkbox, 
  Divider, 
  Paper, 
  Alert 
} from '@mui/material';
import { Delete, Star, StarBorder, PersonAdd } from '@mui/icons-material';
import { useContacts } from '@/hooks/useContacts';
import { TruncatedKey } from '@/components/stellar/TruncatedKey';
import { StrKey } from '@stellar/stellar-sdk';

export function ContactsManager() {
  const { contacts, favoriteContacts, addContact, removeContact, toggleFavorite } = useContacts();
  const [newContact, setNewContact] = useState({ name: '', address: '', favorite: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddContact = () => {
    setError(null);
    setSuccess(null);
    
    if (!newContact.name.trim()) {
      setError('Please enter a contact name');
      return;
    }
    
    if (!newContact.address.trim()) {
      setError('Please enter a Stellar address');
      return;
    }
    
    if (!StrKey.isValidEd25519PublicKey(newContact.address)) {
      setError('Please enter a valid Stellar public key');
      return;
    }
    
    try {
      addContact(newContact);
      setNewContact({ name: '', address: '', favorite: false });
      setSuccess('Contact added successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Stellar Contacts
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
      
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Add New Contact
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Contact Name"
            fullWidth
            value={newContact.name}
            onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter contact name"
          />
          
          <TextField
            label="Stellar Address"
            fullWidth
            value={newContact.address}
            onChange={(e) => setNewContact(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Enter Stellar public key"
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={newContact.favorite}
              onChange={(e) => setNewContact(prev => ({ ...prev, favorite: e.target.checked }))}
              icon={<StarBorder />}
              checkedIcon={<Star />}
            />
            <Typography variant="body2">Mark as favorite</Typography>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddContact}
            startIcon={<PersonAdd />}
          >
            Add Contact
          </Button>
        </Box>
      </Paper>
      
      {favoriteContacts.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Favorite Contacts
          </Typography>
          
          <List>
            {favoriteContacts.map((contact) => (
              <React.Fragment key={contact.id}>
                <ListItem>
                  <ListItemText
                    primary={contact.name}
                    secondary={<TruncatedKey publicKey={contact.address} />}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => toggleFavorite(contact.id)}>
                      <Star color="primary" />
                    </IconButton>
                    <IconButton edge="end" onClick={() => removeContact(contact.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
      
      {contacts.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            All Contacts
          </Typography>
          
          <List>
            {contacts.map((contact) => (
              <React.Fragment key={contact.id}>
                <ListItem>
                  <ListItemText
                    primary={contact.name}
                    secondary={<TruncatedKey publicKey={contact.address} />}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => toggleFavorite(contact.id)}>
                      {contact.favorite ? <Star color="primary" /> : <StarBorder />}
                    </IconButton>
                    <IconButton edge="end" onClick={() => removeContact(contact.id)}>
                      <Delete color="error" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
      
      {contacts.length === 0 && (
        <Alert severity="info">
          No contacts yet. Add your first Stellar contact above.
        </Alert>
      )}
    </Box>
  );
}
