import React from 'react';
import { Paper, Typography, Button, Box } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <ErrorOutline sx={{ mr: 1 }} />
        <Typography variant="h6">Error</Typography>
      </Box>
      <Typography variant="body1" sx={{ mb: onRetry ? 2 : 0 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      )}
    </Paper>
  );
}
