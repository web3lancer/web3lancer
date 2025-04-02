import React from 'react';
import { Box, Alert, Button, Typography } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { shouldShowSignUpPrompt } from '@/utils/guestSession';
import Link from 'next/link';

interface SignInPromptProps {
  variant?: 'inline' | 'alert' | 'minimal';
  message?: string;
}

export default function SignInPrompt({ 
  variant = 'alert',
  message = 'Sign in to access all features and save your progress'
}: SignInPromptProps) {
  const { user, isAnonymous } = useAuth();

  // Don't show if user is signed in and not anonymous
  if (user && !isAnonymous) {
    return null;
  }

  // Don't show if we shouldn't prompt this user
  if (!shouldShowSignUpPrompt(user)) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
        <Button 
          component={Link} 
          href="/signin" 
          variant="text" 
          size="small" 
          color="primary"
        >
          Sign in
        </Button>
      </Box>
    );
  }

  if (variant === 'inline') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2, 
          bgcolor: 'primary.light', 
          color: 'primary.contrastText',
          borderRadius: 1
        }}
      >
        <Typography variant="body2">{message}</Typography>
        <Button 
          component={Link}
          href="/signin"
          variant="contained"
          size="small"
          sx={{ bgcolor: 'white', color: 'primary.main' }}
        >
          Sign in
        </Button>
      </Box>
    );
  }

  // Default alert variant
  return (
    <Alert 
      severity="info" 
      sx={{ mb: 2 }}
      action={
        <Button 
          component={Link}
          href="/signin"
          color="inherit"
          size="small"
          variant="outlined"
        >
          Sign in
        </Button>
      }
    >
      {message}
    </Alert>
  );
}
