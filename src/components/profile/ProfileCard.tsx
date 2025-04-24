import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, CircularProgress, Paper, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete'; // Import Delete icon
import { motion } from "framer-motion";
import { uploadFile, updateUserProfile, deleteProfilePictureFile } from '@/utils/api'; // Assuming deleteProfilePictureFile exists or will be added
import { storage } from '@/lib/appwrite'; // Assuming storage is exported from your client setup
import { ID } from 'appwrite'; // Import ID for unique file IDs

const MotionPaper = motion(Paper);

interface ProfileCardProps {
  user: any; // Consider defining a stricter type for user
  // Remove initialImagePreview if we fetch it based on user.profilePicture
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [existingFileId, setExistingFileId] = useState<string | null>(user?.profilePicture || null);

  // Fetch initial preview if user has a profile picture ID
  useEffect(() => {
    if (user?.profilePicture && !imagePreview) {
      try {
        const previewUrl = storage.getFilePreview(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, // Your bucket ID from .env
          user.profilePicture
        ).toString();
        setImagePreview(previewUrl);
        setExistingFileId(user.profilePicture);
      } catch (error) {
        console.error("Error fetching initial profile picture preview:", error);
        // Optionally clear the profile picture in the user's profile if fetching fails
        // updateUserProfile(user.$id, { profilePicture: null });
        setExistingFileId(null);
      }
    }
     // Clear preview if user object doesn't have profilePicture anymore
     else if (!user?.profilePicture) {
        setImagePreview(null);
        setExistingFileId(null);
     }
  }, [user?.profilePicture]); // Re-run if the user object's picture ID changes

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfilePictureFile(file);
      setExistingFileId(null); // Clear existing file ID when new file is selected

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Renamed handleUpload to handleUpdate for clarity
  const handleUpdate = async () => {
    if (profilePictureFile && user) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        // Optional: Delete the old picture first if it exists
        if (user.profilePicture) {
          try {
            await deleteProfilePictureFile(user.profilePicture);
            console.log('Old profile picture deleted:', user.profilePicture);
          } catch (deleteError) {
            console.error('Could not delete old profile picture, proceeding with upload:', deleteError);
          }
        }

        // Use ID.unique() for a unique file ID
        const newFileId = ID.unique();
        const response = await uploadFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, // Bucket ID from .env
          newFileId, // Use unique ID
          profilePictureFile,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        // Update user profile with the NEW file ID
        await updateUserProfile(user.$id, {
          profilePicture: response.$id, // Use the ID from the upload response
          updatedAt: new Date().toISOString()
        });

        console.log('Profile picture updated:', response);
        setProfilePictureFile(null); // Clear the selected file state
        setExistingFileId(response.$id); // Set the new file ID as existing
        // Preview should already be set by handleFileChange

      } catch (error) {
        console.error('Error uploading/updating profile picture:', error);
        // Revert preview if upload fails?
        // setImagePreview(user.profilePicture ? storage.getFilePreview(...).toString() : null);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleDelete = async () => {
    if (!existingFileId || !user) return;

    setIsDeleting(true);
    try {
      await deleteProfilePictureFile(existingFileId);
      await updateUserProfile(user.$id, {
        profilePicture: null, // Set to null in the database
        updatedAt: new Date().toISOString()
      });
      console.log('Profile picture deleted:', existingFileId);
      setImagePreview(null); // Clear preview
      setProfilePictureFile(null); // Clear any selected file
      setExistingFileId(null); // Clear existing file ID state
    } catch (error) {
      console.error('Error deleting profile picture:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ p: 3, borderRadius: 2, position: 'relative' }} // Added relative positioning
    >
      {/* Delete Button - Top Right */}
      {existingFileId && !profilePictureFile && (
        <IconButton
          aria-label="delete profile picture"
          onClick={handleDelete}
          disabled={isDeleting || isUploading}
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        >
          {isDeleting ? <CircularProgress size={20} /> : <DeleteIcon fontSize="small" />}
        </IconButton>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar
          sx={{ width: 120, height: 120, mb: 2 }}
          src={imagePreview || undefined} // Use imagePreview state
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
          disabled={isUploading || isDeleting} // Disable while actions are in progress
        />
        <label htmlFor="profile-picture-upload">
          <Button
            variant="outlined"
            component="span"
            sx={{ mb: 2 }}
            disabled={isUploading || isDeleting}
          >
            Select Image
          </Button>
        </label>

        {/* Update Button - Appears only when a new file is selected */}
        {profilePictureFile && (
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={isUploading || isDeleting}
            sx={{ mb: 1 }}
          >
            {isUploading ? `Uploading: ${uploadProgress}%` : 'Update Picture'}
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
