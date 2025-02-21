"use client";
import React, { useState } from "react";
import { Box, Typography, Button, TextField, Chip } from "@mui/material";
import { databases } from "@/utils/api";
import { ID } from 'appwrite';
import { useAuth } from '@/contexts/AuthContext';

export default function JobsPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() !== "") {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handlePostJob = async () => {
    try {
      const response = await databases.createDocument('67af3ffe0011106c4575', 'jobs', ID.unique(), {
        userId: user?.$id,
        title,
        description,
        tags,
        createdAt: new Date().toISOString(),
      });
      console.log('Job posted successfully:', response);
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Post a Job
      </Typography>
      <TextField
        label="Title"
        fullWidth
        sx={{ mb: 2 }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        label="Description"
        fullWidth
        multiline
        rows={4}
        sx={{ mb: 2 }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Add Tag"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={handleAddTag}>
          Add
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            onDelete={() => handleDeleteTag(tag)}
            sx={{ background: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF' }}
          />
        ))}
      </Box>
      <Button variant="contained" onClick={handlePostJob}>
        Post Job
      </Button>
    </Box>
  );
}
