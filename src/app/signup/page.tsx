"use client";
import React from "react";
import { Box, Typography, Button, TextField } from "@mui/material";

export default function SignUpPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Sign Up
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
