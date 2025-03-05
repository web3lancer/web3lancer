"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, Button, Input, Chip, TextField, CircularProgress, Paper, Grid } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile, getFilePreview } from "@/utils/storage";
import { databases } from "@/utils/api";
import { motion } from "framer-motion";

const MotionPaper = motion(Paper);

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user?.$id) return;
    
    try {
      const response = await databases.getDocument('67b885280000d2cb5411', '67b8853c003c55c82ff6', user.$id);
      setSkills(response.skills || []);
      setBio(response.bio || "");
      
      if (response.profilePicture) {
        try {
          const imageUrl = await getFilePreview('67b889200019e3d3519d', response.profilePicture, 200, 200);
          setImagePreview(imageUrl.toString());
        } catch (error) {
          console.error('Error fetching profile image:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfilePicture(file);
      
      // Create a preview
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
        const filePath = `users/${user.$id}/profile-pictures/${profilePicture.name}`;
        const response = await uploadFile(
          '67b889200019e3d3519d', 
          profilePicture, 
          filePath,
          (progress) => {
            setUploadProgress(progress);
          }
        );
        
        await databases.updateDocument('67b885280000d2cb5411', '67b8853c003c55c82ff6', user.$id, {
          profilePicture: response.$id,
        });
        
        console.log('Profile picture uploaded:', response);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() !== "" && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setSkills(skills.filter(skill => skill !== skillToDelete));
  };

  const handleSaveProfile = async () => {
    if (user) {
      setLoading(true);
      try {
        await databases.updateDocument('67b885280000d2cb5411', '67b8853c003c55c82ff6', user.$id, {
          skills,
          bio,
        });
        console.log('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        My Profile
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
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
        </Grid>
        
        <Grid item xs={12} md={8}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            sx={{ p: 3, borderRadius: 2 }}
          >
            <Typography variant="h6" sx={{ mb: 3 }}>
              Profile Information
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Bio
              </Typography>
              <TextField
                label="Tell us about yourself"
                fullWidth
                multiline
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Skills
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  label="Add Skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSkill();
                      e.preventDefault();
                    }
                  }}
                  sx={{ mr: 2, flexGrow: 1 }}
                />
                <Button variant="contained" onClick={handleAddSkill}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleDeleteSkill(skill)}
                    sx={{ background: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF' }}
                  />
                ))}
              </Box>
            </Box>
            
            <Button 
              variant="contained" 
              onClick={handleSaveProfile}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Profile'}
            </Button>
          </MotionPaper>
        </Grid>
      </Grid>
    </Box>
  );
}
