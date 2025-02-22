"use client";
import React, { useState } from "react";
import { Box, Typography, Button, TextField, Link } from "@mui/material";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const { signIn, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      const user = await account.get();
      setUser(user);
      // Redirect to dashboard or profile page after successful sign-in
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      alert(`Sign-in failed: ${error.message}`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Sign In
      </Typography>
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
      <Button variant="contained" fullWidth sx={{ mb: 2 }} onClick={handleSignIn}>
        Sign In with Email
      </Button>
      <Button
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        href="https://github.com/login/oauth/authorize?client_id=Ov23lik5C96Psa3OrZiM"
      >
        Sign In with GitHub
      </Button>
      <Button variant="outlined" fullWidth>
        Connect Wallet
      </Button>
      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
        Don't have an account? <Link href="/signup">Sign Up</Link>
      </Typography>
    </Box>
  );
}
