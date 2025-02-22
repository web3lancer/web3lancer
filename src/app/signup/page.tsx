"use client";
import React, { useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      await signUp(email, password, name);
      // Redirect to dashboard or profile page after successful sign-up
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
      <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
        Sign Up with GitHub
      </Button>
      <Button variant="outlined" fullWidth>
        Connect Wallet
      </Button>
    </Box>
  );
}
