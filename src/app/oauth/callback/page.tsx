"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography, Paper, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { getUserProfile, createUserProfile, account } from '@/utils/api';

const MotionPaper = motion(Paper);

export default function OAuthCallback() {
  const router = useRouter();
  const { handleGitHubOAuth, refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [processingStep, setProcessingStep] = useState<string>('Authenticating...');

  useEffect(() => {
    async function processOAuth() {
      try {
        console.log('Processing OAuth callback...');
        setProcessingStep('Authenticating with GitHub');
        
        // First try using the automatic session that Appwrite creates
        const user = await refreshUser();
        
        if (user) {
          console.log('User session refreshed successfully:', user);
          setProcessingStep('Creating user profile');
          
          try {
            // Ensure user has a profile
            const profile = await getUserProfile(user.$id);
            console.log('User profile after refresh:', profile);
          } catch (profileError) {
            console.error('Error creating profile during callback:', profileError);
            // Still redirect to dashboard even if profile creation fails
          }
          
          router.push('/dashboard');
          return;
        }
        
        console.log('No user found after refresh, checking for code parameter...');
        setProcessingStep('Processing authentication response');
        
        // Fallback to manual handling if needed
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const provider = urlParams.get('provider');

        if (code) {
          console.log('OAuth code found, attempting to handle callback with code');
          const oauthUser = await handleGitHubOAuth(code);
          
          if (oauthUser) {
            setProcessingStep('Setting up your account');
            try {
              // Ensure user has a profile
              const profile = await getUserProfile(oauthUser.$id);
              console.log('User profile after code handling:', profile);
            } catch (profileError) {
              console.error('Error creating profile during code handling:', profileError);
            }
            
            // Force a session refresh to ensure all state is updated correctly
            await refreshUser();
            router.push('/dashboard');
          } else {
            setError("Failed to authenticate with GitHub. Please try again.");
            setTimeout(() => router.push('/signin'), 3000);
          }
        } else if (provider === 'github') {
          // If we have a provider but no code, try refreshing one more time
          console.log('Provider found but no code, attempting to refresh session again');
          setProcessingStep('Finalizing authentication');
          const retryUser = await refreshUser();
          if (retryUser) {
            try {
              const profile = await getUserProfile(retryUser.$id);
              console.log('User profile during retry:', profile);
            } catch (profileError) {
              console.error('Error creating profile during retry:', profileError);
            }
            router.push('/dashboard');
            return;
          }
          
          setError("Authentication incomplete - no session or code found");
          setTimeout(() => router.push('/signin'), 3000);
        } else {
          setError("Authentication failed - no session or code found");
          setTimeout(() => router.push('/signin'), 3000);
        }
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        setError(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setTimeout(() => router.push('/signin'), 3000);
      } finally {
        setIsProcessing(false);
      }
    }

    if (attempts < 3) {
      processOAuth();
      // Increment attempts to avoid infinite loops
      setAttempts(prev => prev + 1);
    }
  }, [handleGitHubOAuth, refreshUser, router, attempts]);

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)',
    }}>
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ 
          p: 4, 
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          width: '100%',
          maxWidth: 400,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        {isProcessing ? (
          <>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {processingStep}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we set up your account
            </Typography>
          </>
        ) : error ? (
          <>
            <Alert severity="error" sx={{ width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
              <Typography variant="body2">
                Redirecting to sign in page...
              </Typography>
            </Alert>
          </>
        ) : null}
      </MotionPaper>
    </Box>
  );
}
