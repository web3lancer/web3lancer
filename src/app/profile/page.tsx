"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, Button, Input, Chip, TextField, CircularProgress } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/utils/storage";
import { databases } from "@/utils/api";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await databases.getDocument('67b885280000d2cb5411', '67b8853c003c55c82ff6', user.$id);
      setSkills(response.skills || []);
      setBio(response.bio || "");
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfilePicture(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (profilePicture && user) {
      try {
        const response = await uploadFile('67b889200019e3d3519d', profilePicture, `users/${user.$id}/profile-pictures/${profilePicture.name}`);
        console.log('Profile picture uploaded:', response);
        await databases.updateDocument('67b885280000d2cb5411', '67b8853c003c55c82ff6', user.$id, {
          profilePicture: response.$id,
        });
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() !== "") {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setSkills(skills.filter(skill => skill !== skillToDelete));
  };

  const handleSaveProfile = async () => {
    if (user) {
      try {
        await databases.updateDocument('67b885280000d2cb5411', '67b8853c003c55c82ff6', user.$id, {
          skills,
          bio,
        });
        console.log('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        User Profile
      </Typography>
      <Avatar sx={{ width: 96, height: 96, mb: 2 }} src={user?.profilePicture ? `/storage/${user.profilePicture}` : undefined} />
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
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Skills
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            label="Add Skill"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            sx={{ mr: 2 }}
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
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Bio
        </Typography>
        <TextField
          label="Bio"
          fullWidth
          multiline
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          sx={{ mb: 2 }}
        />
      </Box>
      <Button variant="contained" onClick={handleSaveProfile}>
        Save Profile
      </Button>
    </Box>
  );
}
