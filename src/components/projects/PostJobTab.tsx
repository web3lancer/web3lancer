import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Chip } from '@mui/material';
import { databases, ID } from "@/utils/api";
import { APPWRITE_CONFIG } from "@/lib/env";

interface PostJobTabProps {
  user: any;
  onJobPosted: () => void;
  setActiveTab: (tab: number) => void;
}

export default function PostJobTab({ user, onJobPosted, setActiveTab }: PostJobTabProps) {
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
      const response = await databases.createDocument(
        APPWRITE_CONFIG.DATABASES.JOBS,
        APPWRITE_CONFIG.COLLECTIONS.JOBS,
        ID.unique(),
        {
          title,
          description,
          tags,
          createdAt: new Date().toISOString(),
          jobId: ID.unique(),
          employerId: user?.$id,
          status: 'open',
          updatedAt: new Date().toISOString(),
        }
      );
      console.log('Job posted successfully:', response);
      
      // Reset form and refresh jobs
      setTitle("");
      setDescription("");
      setTags([]);
      onJobPosted();
      
      // Switch to browse tab after posting
      setActiveTab(0);
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  return (
    <Box component="form" sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Post a Job</Typography>
      <TextField
        label="Job Title"
        fullWidth
        sx={{ mb: 2 }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        label="Job Description"
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
