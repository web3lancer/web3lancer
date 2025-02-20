"use client";
import React, { useState } from "react";
import { Box, Typography, Button, TextField, Link } from "@mui/material";
import { account } from "@/utils/api";
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const signInWithEmail = async () => {
    try {
      await account.createEmailPasswordSession(email, password);
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
      <Button variant="contained" fullWidth sx={{ mb: 2 }} onClick={signInWithEmail}>
        Sign In with Email
      </Button>
      <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
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
