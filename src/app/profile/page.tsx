"use client";
import React, { useState } from "react";
import { Box, Typography, Avatar, Button, Input } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/utils/storage";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfilePicture(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (profilePicture && user) {
      try {
        const response = await uploadFile('profile-pictures', profilePicture, `users/${user.$id}/profile-pictures/${profilePicture.name}`);
        console.log('Profile picture uploaded:', response);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        User Profile
      </Typography>
      <Avatar sx={{ width: 96, height: 96, mb: 2 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        {user?.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Full-stack Developer
      </Typography>
      <Input type="file" onChange={handleFileChange} sx={{ mb: 2 }} />
      <Button variant="contained" onClick={handleUpload}>
        Upload Profile Picture
      </Button>
    </Box>
  );
}
