"use client";
import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Container, Button } from '@mui/material';
import { completeEmailVerification, createEmailVerification } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import EmailIcon from '@mui/icons-material/Email';
import Link from 'next/link';

export default function VerifyEmail() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    async function verifyEmail() {
      try {
        const userId = searchParams.get('userId');
        const secret = searchParams.get('secret');

        if (!userId || !secret) {
          setError('Invalid verification link. The link may be incomplete or expired.');
          setLoading(false);
          return;
        }

        // Complete email verification
        await completeEmailVerification(userId, secret);
        setSuccess(true);
        
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          router.push('/home');
        }, 3000);
      } catch (error) {
        console.error('Error verifying email:', error);
        setError('Failed to verify email. The link may have expired or been used already.');
      } finally {
        setLoading(false);
      }
    }

    // Only verify if we have URL parameters
    if (searchParams.has('userId') && searchParams.has('secret')) {
      verifyEmail();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await createEmailVerification();
      setResendSuccess(true);
      setError(null);
    } catch (error) {
      console.error('Error resending verification:', error);
      setError('Failed to resend verification email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
            Email Verification
          </Typography>
          
          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="body1">
                Processing your verification...
              </Typography>
            </Box>
          )}
          
          {error && !loading && (
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
                Email Verified!
              </Typography>
              <Typography variant="body1">
                Your email has been successfully verified. Redirecting to dashboard...
              </Typography>
            </Alert>
          )}
          
          {!loading && !success && !searchParams.has('userId') && (
            <>
              <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <EmailIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Verify Your Email
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {user ? 
                    "Please verify your email to access all features. Check your inbox for the verification link or click below to resend." :
                    "Please verify your email to access all features. If you haven't received the verification email, you can request a new one."}
                </Typography>
                
                {resendSuccess ? (
                  <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
                    Verification email sent! Please check your inbox and spam folders.
                  </Alert>
                ) : null}
                
                {user ? (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleResendVerification}
                    disabled={loading || resendSuccess}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: '12px',
                      background: 'linear-gradient(90deg, #3B82F6 0%, #1E40AF 100%)',
                      boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #2563EB 0%, #1E3A8A 100%)',
                      }
                    }}
                  >
                    Resend Verification Email
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    component={Link} 
                    href="/signin"
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: '12px',
                      background: 'linear-gradient(90deg, #3B82F6 0%, #1E40AF 100%)',
                      boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #2563EB 0%, #1E3A8A 100%)',
                      }
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Need help? <Link href="/contact">Contact support</Link>
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
