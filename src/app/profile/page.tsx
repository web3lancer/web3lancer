"use client";
import React from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";

export default function ProfilePage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        User Profile
      </Typography>
      <Avatar sx={{ width: 96, height: 96, mb: 2 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        John Doe
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Full-stack Developer
      </Typography>
      <Button variant="contained">Edit Profile</Button>
    </Box>
  );
}
