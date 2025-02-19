"use client";
import React from "react";
import { Box, Typography, Button, TextField, Link } from "@mui/material";

export default function SignInPage() {
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
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button variant="contained" fullWidth sx={{ mb: 2 }}>
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
