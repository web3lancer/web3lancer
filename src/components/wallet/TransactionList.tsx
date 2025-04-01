import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Divider, 
  Skeleton,
  useTheme
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

interface TransactionListProps {
  transactions: any[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function TransactionList({ 
  transactions = [], 
  loading = false, 
  emptyMessage = 'No transactions found' 
}: TransactionListProps) {
  const theme = useTheme();

  // Format the transaction hash for display
  const formatTxHash = (hash: string) => {
    if (!hash) return '';
    if (hash.length <= 12) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          <Skeleton width={150} />
        </Typography>
        <List>
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <ListItem>
                <ListItemText
                  primary={<Skeleton width={200} />}
                  secondary={<Skeleton width={150} />}
                />
                <Skeleton width={80} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    );
  }

  if (transactions.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ mb: 3 }}>
      <Box sx={{ bgcolor: 'grey.100', p: 2 }}>
        <Typography variant="h6">Transaction History</Typography>
      </Box>
      <List>
        {transactions.map((tx, index) => (
          <React.Fragment key={tx.cryptoTxId || tx.$id || index}>
            <ListItem
              sx={{
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" component="span">
                      Transaction {formatTxHash(tx.txHash)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box component="span">
                    <Typography variant="body2" component="span">
                      {tx.network} • {formatDate(tx?.createdAt || new Date())}
                    </Typography>
                  </Box>
                }
              />
              <Chip
                label={tx.status || 'Unknown'}
                size="small"
                color={getStatusColor(tx.status || '') as any}
              />
            </ListItem>
            {index < transactions.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}
