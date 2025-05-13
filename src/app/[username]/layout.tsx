'use client';

import React from 'react';
import { Box, Container, Paper } from '@mui/material';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            border: '1px solid',
            borderColor: 'divider',
            p: 0
          }}
        >
          {children}
        </Paper>
      </Box>
    </Container>
  );
}