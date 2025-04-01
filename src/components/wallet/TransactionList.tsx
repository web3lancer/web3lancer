import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Paper,
  Alert,
  Link
} from '@mui/material';
import { ArrowUpward, ArrowDownward, Pending } from '@mui/icons-material';

interface Transaction {
  $id: string;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  status?: string;
  amount?: string;
  createdAt?: string;
  network?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function TransactionList({ 
  transactions, 
  loading = false, 
  emptyMessage = "No transactions found" 
}: TransactionListProps) {

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return <ArrowUpward fontSize="small" />;
      case 'pending': return <Pending fontSize="small" />;
      case 'failed': return <ArrowDownward fontSize="small" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Alert severity="info">{emptyMessage}</Alert>
    );
  }

  return (
    <Paper>
      <Box sx={{ bgcolor: 'grey.100', p: 2 }}>
        <Typography variant="h6">Recent Transactions</Typography>
      </Box>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {transactions.map((tx, index) => (
          <React.Fragment key={tx.$id || index}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" component="span">
                      {tx.txHash ? formatAddress(tx.txHash) : 'Transaction'}
                    </Typography>
                    <Chip 
                      icon={getStatusIcon(tx.status)} 
                      label={tx.status || 'Unknown'} 
                      color={getStatusColor(tx.status) as any} 
                      size="small" 
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    {tx.amount && (
                      <Typography variant="body2" color="text.primary" component="span">
                        Amount: {tx.amount} ETH
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(tx.createdAt)}
                      </Typography>
                      {tx.network && (
                        <Typography variant="body2" color="text.secondary">
                          {tx.network}
                        </Typography>
                      )}
                    </Box>
                    
                    {(tx.fromAddress || tx.toAddress) && (
                      <Box sx={{ mt: 1, fontSize: '0.75rem' }}>
                        {tx.fromAddress && (
                          <Typography variant="body2" color="text.secondary">
                            From: {formatAddress(tx.fromAddress)}
                          </Typography>
                        )}
                        {tx.toAddress && (
                          <Typography variant="body2" color="text.secondary">
                            To: {formatAddress(tx.toAddress)}
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    {tx.txHash && (
                      <Link 
                        href={`https://etherscan.io/tx/${tx.txHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        color="primary"
                        sx={{ fontSize: '0.75rem', mt: 1, display: 'inline-block' }}
                      >
                        View on Explorer
                      </Link>
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < transactions.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}
