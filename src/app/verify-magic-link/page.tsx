"use client";
import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Container } from '@mui/material';
import { createMagicURLSession } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export default function VerifyMagicLink() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    async function verifyMagicLink() {
      try {
        const userId = searchParams.get('userId');
        const secret = searchParams.get('secret');

        if (!userId || !secret) {
          setError('Invalid verification link. Please request a new magic link.');
          setLoading(false);
          return;
        }

        // Create session using the magic URL token
        const user = await createMagicURLSession(userId, secret);
        setUser(user);
        setSuccess(true);
        
        // Redirect to dashboard after successful authentication
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (error) {
        console.error('Error verifying magic link:', error);
        setError('Failed to verify magic link. The link may have expired or been used already.');
      } finally {
        setLoading(false);
      }
    }

    verifyMagicLink();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
          pt: { xs: '80px', sm: '100px' }, // Add padding-top to account for header
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Verifying Magic Link
          </Typography>
          
          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="body1">
                Please wait while we verify your magic link...
              </Typography>
            </Box>
          )}
          
          {error && (
            <Alert 
              severity="error" 
              icon={<ErrorIcon fontSize="large" />}
              sx={{ my: 4, py: 2 }}
            >
              <Typography variant="h6" component="div">
                Verification Failed
              </Typography>
              <Typography variant="body1">
                {error}
              </Typography>
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success"
              icon={<CheckCircleIcon fontSize="large" />}
              sx={{ my: 4, py: 2 }}
            >
              <Typography variant="h6" component="div">
                Verification Successful!
              </Typography>
              <Typography variant="body1">
                You are now signed in. Redirecting to your dashboard...
              </Typography>
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
