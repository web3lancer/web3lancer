'use client';

import { Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        flexDirection: 'column'
      }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading user profile...
        </Typography>
      </Box>
    }>
      {children}
    </Suspense>
  );
}