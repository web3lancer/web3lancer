import React, { useState } from 'react';
import { Box, Typography, Avatar, Button, CircularProgress, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { uploadFile, updateUserProfile } from '@/utils/api';
import { useMultiAccount } from "@/contexts/MultiAccountContext";

const MotionPaper = motion(Paper);

interface ProfileCardProps {
  user: any;
  imagePreview?: string | null;
}

export default function ProfileCard({ user, imagePreview: initialImagePreview }: ProfileCardProps) {
  const { activeAccount, accounts, switchAccount } = useMultiAccount();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImagePreview || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfilePicture(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (profilePicture && user) {
      setIsUploading(true);
      try {
        const response = await uploadFile(
          '67b889200019e3d3519d',
          profilePicture, 
          `users/${user.$id}/profile-pictures/${profilePicture.name}`,
          (progress) => {
            setUploadProgress(progress);
          }
        );
        
        await updateUserProfile(user.$id, {
          profilePicture: response.$id,
          updatedAt: new Date().toISOString()
        });
        
        if (activeAccount) {
          const updatedAccount = { ...activeAccount, profilePicture: response.$id };
          const updatedAccounts = accounts.map(acc => 
            acc.$id === activeAccount.$id ? updatedAccount : acc
          );
          const localStorageAccounts = JSON.parse(localStorage.getItem('web3lancer_accounts') || '[]');
          const updatedLocalStorageAccounts = localStorageAccounts.map((acc: any) => 
            acc.$id === activeAccount.$id ? { ...acc, profilePicture: response.$id } : acc
          );
          localStorage.setItem('web3lancer_accounts', JSON.stringify(updatedLocalStorageAccounts));
          switchAccount(activeAccount.$id);
        }
        
        console.log('Profile picture uploaded:', response);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ p: 3, borderRadius: 2 }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar 
          sx={{ width: 120, height: 120, mb: 2 }} 
          src={imagePreview || undefined}
        />
        <Typography variant="h6" sx={{ mb: 1 }}>
          {user?.name || "User"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {user?.email || user?.walletId || "No contact info"}
        </Typography>
        
        <input
          accept="image/*"
          type="file"
          id="profile-picture-upload"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <label htmlFor="profile-picture-upload">
          <Button variant="outlined" component="span" sx={{ mb: 2 }}>
            Select Image
          </Button>
        </label>
        
        {profilePicture && (
          <Button 
            variant="contained" 
            onClick={handleUpload}
            disabled={isUploading}
            sx={{ mb: 1 }}
          >
            {isUploading ? `Uploading: ${uploadProgress}%` : 'Upload Picture'}
          </Button>
        )}
        {isUploading && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <CircularProgress 
              variant="determinate" 
              value={uploadProgress} 
              size={24}
            />
          </Box>
        )}
      </Box>
    </MotionPaper>
  );
}
