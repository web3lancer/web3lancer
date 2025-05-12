"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography, Paper, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { getUserProfile, account } from '@/utils/api';

const MotionPaper = motion(Paper);

export default function OAuthCallback() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingStep, setProcessingStep] = useState<string>('Authenticating...');

  useEffect(() => {
    async function processOAuth() {
      try {
        console.log('Processing OAuth callback...');
        setProcessingStep('Authenticating your account');
        
        // Try using the automatic session that Appwrite creates
        let user;
        try {
          user = await account.get();
          console.log('User session already exists:', user);
        } catch (sessionError) {
          console.log('No existing session found, will check for URL parameters');
          
          // If no session exists, check URL parameters to handle the OAuth callback manually
          const urlParams = new URLSearchParams(window.location.search);
          const userId = urlParams.get('userId');
          const secret = urlParams.get('secret');
          
          if (userId && secret) {
            console.log('Found userId and secret in URL, creating session manually');
            try {
              await account.createSession(userId, secret);
              user = await account.get();
              console.log('Session created manually:', user);
            } catch (createSessionError) {
              console.error('Error creating session manually:', createSessionError);
              throw new Error(`Failed to create session: ${createSessionError instanceof Error ? createSessionError.message : 'Unknown error'}`);
            }
          } else {
            // If Appwrite redirects without userId and secret, it might have created the session already.
            // Attempt to refreshUser which internally calls account.get()
            console.log('No userId/secret in URL, attempting refreshUser to get session.');
            const refreshedUser = await refreshUser();
            if (refreshedUser) {
              user = refreshedUser;
              console.log('Session obtained via refreshUser:', user);
            } else {
              throw new Error('No authentication parameters found in URL and refreshUser failed to find a session.');
            }
          }
        }
        
        // If we have a user, ensure the profile exists
        if (user) {
          setProcessingStep('Setting up your profile');
          try {
            // Attempt to get user profile. If it fails, it might mean it needs to be created.
            // The AuthContext or another part of the app might handle profile creation if missing.
            // For now, we just log whether it's found or not.
            await getUserProfile(user.$id);
            console.log('User profile verified or already exists');
          } catch (profileError) {
            console.warn('Error verifying user profile (it might be created elsewhere or on first actual need):', profileError);
            // Decide if this is a critical error. For now, proceed.
          }
          
          // Final refresh to ensure all context is updated
          await refreshUser();
          
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          throw new Error('Failed to authenticate user after all attempts.');
        }
      } catch (error) {
        console.error('Error in OAuth callback:', error);
        setError(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Redirect to sign-in after a delay
        setTimeout(() => router.push('/signin'), 3000);
      } finally {
        setIsProcessing(false);
      }
    }
    
    // Process the OAuth callback once when the component mounts
    processOAuth();
  }, [refreshUser, router]);

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
        transition={{ duration: 0.5 }}
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          textAlign: 'center',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}
      >
        {isProcessing ? (
          <>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
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
