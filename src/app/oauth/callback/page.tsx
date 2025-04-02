"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export default function OAuthCallback() {
  const router = useRouter();
  const { handleGitHubOAuth, refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    async function processOAuth() {
      try {
        // First try using the automatic session that Appwrite creates
        const user = await refreshUser();
        
        if (user) {
          router.push('/dashboard');
          return;
        }
        
        // Fallback to manual handling if needed
        // Get the code from the URL (though Appwrite typically handles this automatically)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
          await handleGitHubOAuth(code);
          router.push('/dashboard');
        } else {
          setError("Authentication failed - no session or code found");
          setTimeout(() => router.push('/signin'), 3000);
        }
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        setError("Authentication failed");
        setTimeout(() => router.push('/signin'), 3000);
      } finally {
        setIsProcessing(false);
      }
    }

    processOAuth();
  }, [handleGitHubOAuth, refreshUser, router]);

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
              Authenticating...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your GitHub credentials
            </Typography>
          </>
        ) : error ? (
          <>
            <Typography variant="h6" color="error" sx={{ fontWeight: 600 }}>
              {error}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to sign in page...
            </Typography>
          </>
        ) : null}
      </MotionPaper>
    </Box>
  );
}
