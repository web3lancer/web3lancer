"use client";
import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Grid, Card, CardContent } from "@mui/material";
import { databases, ID } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  $id: string;
  name: string;
  description: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const response = await databases.listDocuments('67af3ffe0011106c4575', '67b8f57b005d474dcf22');
      setProjects(response.documents as Project[]);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleCreateProject = async () => {
    try {
      await databases.createDocument('67af3ffe0011106c4575', '67b8f57b005d474dcf22', ID.unique(), {
        name,
        description,
        ownerId: user.$id,
        createdAt: new Date().toISOString(),
      });
      setName("");
      setDescription("");
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Projects
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Project Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Project Description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button variant="contained" onClick={handleCreateProject}>
          Create Project
        </Button>
      </Box>
      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.$id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{project.name}</Typography>
                <Typography variant="body2">{project.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
