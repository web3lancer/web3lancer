import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Chip } from '@mui/material';
import { createProject } from "@/lib/appwrite";

interface CreateProjectTabProps {
  user: any;
  onProjectCreated: () => void;
  setActiveTab: (tab: number) => void;
}

export default function CreateProjectTab({ user, onProjectCreated, setActiveTab }: CreateProjectTabProps) {
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTags, setProjectTags] = useState<string[]>([]);
  const [projectTagInput, setProjectTagInput] = useState("");

  const handleAddProjectTag = () => {
    if (projectTagInput.trim() !== "") {
      setProjectTags([...projectTags, projectTagInput.trim()]);
      setProjectTagInput("");
    }
  };

  const handleDeleteProjectTag = (tagToDelete: string) => {
    setProjectTags(projectTags.filter(tag => tag !== tagToDelete));
  };

  const handleCreateProject = async () => {
    try {
      await createProject({
        userId: user?.$id,
        name: projectTitle,
        bio: projectDescription,
        tags: projectTags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        isVerified: false,
      });
      console.log('Project created successfully');
      
      // Reset form and refresh projects
      setProjectTitle("");
      setProjectDescription("");
      setProjectTags([]);
      onProjectCreated();
      
      // Switch to browse tab after creating
      setActiveTab(0);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <Box component="form" sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Create a Project</Typography>
      <TextField
        label="Project Title"
        fullWidth
        sx={{ mb: 2 }}
        value={projectTitle}
        onChange={(e) => setProjectTitle(e.target.value)}
      />
      <TextField
        label="Project Description"
        fullWidth
        multiline
        rows={4}
        sx={{ mb: 2 }}
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          label="Add Tag"
          value={projectTagInput}
          onChange={(e) => setProjectTagInput(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={handleAddProjectTag}>
          Add
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {projectTags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            onDelete={() => handleDeleteProjectTag(tag)}
            sx={{ background: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF' }}
          />
        ))}
      </Box>
      <Button variant="contained" onClick={handleCreateProject}>
        Create Project
      </Button>
    </Box>
  );
}
    