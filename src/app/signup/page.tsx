"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { ConnectWallet } from '@/components/ConnectWallet';
import { useAccount } from 'wagmi';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  const handleSignUp = async () => {
    try {
      await signUp(email, password, name);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      alert(`Sign-up failed: ${error.message}`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Sign Up
      </Typography>
      <TextField
        label="Name"
        type="text"
        fullWidth
        sx={{ mb: 2 }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        label="Email"
        type="email"
        fullWidth
        sx={{ mb: 2 }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        sx={{ mb: 2 }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" fullWidth sx={{ mb: 2 }} onClick={handleSignUp}>
        Sign Up with Email
      </Button>
      <Button
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        href="https://github.com/login/oauth/authorize?client_id=Ov23lik5C96Psa3OrZiM"
      >
        Sign Up with GitHub
      </Button>
      <ConnectWallet />
    </Box>
  );
}
