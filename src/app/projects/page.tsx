"use client";
import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, Grid, Card, CardContent, CircularProgress } from "@mui/material";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments('67b88574002c6eb405a2', '67b885810006a89bc6a4');
      setProjects(response.documents as Project[]);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!name || !description) return;
    
    try {
      setLoading(true);
      await databases.createDocument('67b88574002c6eb405a2', '67b885810006a89bc6a4', ID.unique(), {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Projects
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          label="Project Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Project Description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
        />
        <Button 
          variant="contained" 
          onClick={handleCreateProject}
          disabled={loading || !name || !description}
        >
          {loading ? <CircularProgress size={24} /> : "Create Project"}
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : projects.length > 0 ? (
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
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No projects found. Create your first project!
        </Typography>
      )}
    </Box>
  );
}
