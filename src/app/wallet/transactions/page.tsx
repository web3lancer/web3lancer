"use client";

import { useState, useEffect } from 'react';
import { useTransactions } from '@/hooks/useFinance';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Info as InfoIcon,
  Receipt as ReceiptIcon,
  KeyboardArrowDown as ExpandMoreIcon
} from '@mui/icons-material';

export default function TransactionHistoryPage() {
  const {
    transactions,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  } = useTransactions();

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    if (filterType !== 'all' && tx.transactionType !== filterType) {
      return false;
    }
    if (filterStatus !== 'all' && tx.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const handleViewDetails = (transaction) => {
    setCurrentTransaction(transaction);
    setIsDetailsDialogOpen(true);
  };

  const handleRefresh = () => {
    refresh();
  };

  const handleLoadMore = () => {
    loadMore();
  };

  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const formatCurrency = (amount, currency) => {
    if (!amount) return '0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'fee':
        return 'Platform Fee';
      case 'escrow_funding':
        return 'Escrow Funding';
      case 'escrow_release':
        return 'Escrow Release';
      case 'escrow_refund':
        return 'Escrow Refund';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
    }
  };

  const getStatusChip = (status) => {
    let color = 'default';
    
    switch (status) {
      case 'pending':
        color = 'warning';
        break;
      case 'completed':
        color = 'success';
        break;
      case 'failed':
        color = 'error';
        break;
      case 'cancelled':
        color = 'default';
        break;
    }
    
    return (
      <Chip 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        size="small" 
        color={color}
      />
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Transaction History
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="filter-type-label">Transaction Type</InputLabel>
              <Select
                labelId="filter-type-label"
                value={filterType}
                onChange={handleFilterTypeChange}
                label="Transaction Type"
                size="small"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="deposit">Deposits</MenuItem>
                <MenuItem value="withdrawal">Withdrawals</MenuItem>
                <MenuItem value="fee">Fees</MenuItem>
                <MenuItem value="escrow_funding">Escrow Funding</MenuItem>
                <MenuItem value="escrow_release">Escrow Release</MenuItem>
                <MenuItem value="escrow_refund">Escrow Refund</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="filter-status-label">Status</InputLabel>
              <Select
                labelId="filter-status-label"
                value={filterStatus}
                onChange={handleFilterStatusChange}
                label="Status"
                size="small"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {loading && transactions.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredTransactions.length === 0 ? (
        <Card sx={{ mb: 3, p: 2, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No transactions found. {filterType !== 'all' || filterStatus !== 'all' ? 'Try adjusting your filters.' : ''}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table aria-label="transaction history table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.$id}>
                    <TableCell>
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      {getTransactionTypeLabel(transaction.transactionType)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>
                      {getStatusChip(transaction.status)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewDetails(transaction)}
                        title="View details"
                      >
                        <InfoIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loading}
                endIcon={loading ? <CircularProgress size={16} /> : <ExpandMoreIcon />}
              >
                Load More
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Transaction Details Dialog */}
      <Dialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {currentTransaction && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
              <ReceiptIcon sx={{ mr: 1 }} />
              Transaction Details
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  Transaction Type
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {getTransactionTypeLabel(currentTransaction.transactionType)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(currentTransaction.amount, currentTransaction.currency)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  Status
                </Typography>
                <Box>
                  {getStatusChip(currentTransaction.status)}
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Transaction ID
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {currentTransaction.$id}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Date Created
                </Typography>
                <Typography variant="body2">
                  {formatDate(currentTransaction.createdAt)}
                </Typography>
              </Box>
              
              {currentTransaction.completedAt && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Date Completed
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(currentTransaction.completedAt)}
                  </Typography>
                </Box>
              )}
              
              {currentTransaction.relatedEntityId && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Related To
                  </Typography>
                  <Typography variant="body2">
                    {currentTransaction.transactionType.includes('escrow') 
                      ? `Contract #${currentTransaction.relatedEntityId}` 
                      : currentTransaction.relatedEntityId}
                  </Typography>
                </Box>
              )}
              
              {currentTransaction.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {currentTransaction.description}
                  </Typography>
                </Box>
              )}
              
              {currentTransaction.txHash && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Transaction Hash
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {currentTransaction.txHash}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}