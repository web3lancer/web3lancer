"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, Link, Paper, CircularProgress, Divider, Alert, IconButton } from "@mui/material";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectWallet } from '@/components/ConnectWallet';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { GitHub, Visibility, VisibilityOff } from "@mui/icons-material";
import { account } from '@/app/appwrite';

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

export default function SignInPage() {
  const { signIn, setUser, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    setError("");
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      const user = await account.get();
      setUser(user);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      setError(error.message || "Sign-in failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)',
        p: 2
      }}
    >
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        elevation={3}
        sx={{ 
          p: 4, 
          maxWidth: 450, 
          width: '100%',
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          sx={{ textAlign: 'center', mb: 4 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Sign in to continue working
          </Typography>
        </MotionBox>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          </motion.div>
        )}

        <form onSubmit={handleSignIn}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2.5 }}
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={togglePasswordVisibility}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="contained" 
              fullWidth 
              type="submit"
              disabled={isSubmitting || isLoading}
              sx={{ 
                mb: 2.5,
                py: 1.5,
                position: 'relative',
                fontWeight: 600
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : "Sign In"}
            </Button>
          </motion.div>
        </form>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GitHub />}
            sx={{ mb: 3, py: 1.5, fontWeight: 600 }}
            href="https://github.com/login/oauth/authorize?client_id=Ov23lik5C96Psa3OrZiM"
          >
            Sign In with GitHub
          </Button>
        </motion.div>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            or
          </Typography>
        </Divider>

        <Box sx={{ mb: 3 }}>
          <ConnectWallet />
        </Box>

        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link href="/signup" sx={{ 
            color: 'primary.main', 
            fontWeight: 600,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}>
            Sign Up
          </Link>
        </Typography>
      </MotionPaper>
    </Box>
  );
}
