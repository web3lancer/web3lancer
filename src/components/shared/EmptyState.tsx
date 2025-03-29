import React from 'react';
import { Paper, Typography, Button, Box } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Paper 
      sx={{ 
        p: 4, 
        textAlign: 'center',
        backgroundColor: 'background.default',
        borderRadius: 2
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 2 
        }}
      >
        <InfoOutlined 
          sx={{ 
            fontSize: 48, 
            color: 'text.secondary',
            mb: 1 
          }} 
        />
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {message}
        </Typography>
        {actionLabel && onAction && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Paper>
  );
}
