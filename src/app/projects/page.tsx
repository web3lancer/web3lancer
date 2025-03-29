"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, Chip, Tabs, Tab, Grid, Card, CardContent, CardActions, Alert, CircularProgress } from "@mui/material";
import { databases } from "@/utils/api";
import { ID } from 'appwrite';
import { useAuth } from '@/contexts/AuthContext';
import { Work, WorkOutline } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { APPWRITE_CONFIG } from "@/lib/env";

const MotionCard = motion(Card);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`projects-tabpanel-${index}`}
      aria-labelledby={`projects-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states for job posting
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Form states for project creation
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTags, setProjectTags] = useState<string[]>([]);
  const [projectTagInput, setProjectTagInput] = useState("");

  useEffect(() => {
    fetchJobs();
    fetchProjects();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASES.JOBS,
        APPWRITE_CONFIG.COLLECTIONS.JOBS
      );
      setJobs(response.documents);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASES.PROJECTS,
        APPWRITE_CONFIG.COLLECTIONS.PROJECTS
      );
      setProjects(response.documents);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Job posting handlers
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
      fetchJobs();
      
      // Switch to browse tab after posting
      setActiveTab(0);
    } catch (error) {
      console.error('Error posting job:', error);
      setError('Failed to post job. Please try again later.');
    }
  };

  // Project creation handlers
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
      const response = await databases.createDocument(
        APPWRITE_CONFIG.DATABASES.PROJECTS,
        APPWRITE_CONFIG.COLLECTIONS.PROJECTS,
        ID.unique(),
        {
          title: projectTitle,
          description: projectDescription,
          tags: projectTags,
          createdAt: new Date().toISOString(),
          projectId: ID.unique(),
          ownerId: user?.$id,
          status: 'active',
          updatedAt: new Date().toISOString(),
          participants: [user?.$id],
        }
      );
      console.log('Project created successfully:', response);
      
      // Reset form and refresh projects
      setProjectTitle("");
      setProjectDescription("");
      setProjectTags([]);
      fetchProjects();
      
      // Switch to browse tab after creating
      setActiveTab(0);
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project. Please try again later.');
    }
  };

  if (loading && activeTab === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Projects & Jobs
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Browse" />
        <Tab label="Post a Job" />
        <Tab label="Create Project" />
        <Tab label="My Listings" />
      </Tabs>
      
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <WorkOutline sx={{ mr: 1 }} /> Available Jobs
            </Typography>
            {jobs.length === 0 && !loading ? (
              <Alert severity="info">No jobs available at the moment.</Alert>
            ) : (
              <Grid container spacing={2}>
                {jobs.map((job) => (
                  <Grid item xs={12} key={job.$id}>
                    <MotionCard 
                      whileHover={{ y: -5 }}
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6">{job.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{job.description}</Typography>
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {job.tags?.map((tag: string, index: number) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{ background: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF' }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="primary">Apply</Button>
                        <Button size="small" color="primary">Details</Button>
                      </CardActions>
                    </MotionCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Work sx={{ mr: 1 }} /> Active Projects
            </Typography>
            {projects.length === 0 && !loading ? (
              <Alert severity="info">No active projects at the moment.</Alert>
            ) : (
              <Grid container spacing={2}>
                {projects.map((project) => (
                  <Grid item xs={12} key={project.$id}>
                    <MotionCard 
                      whileHover={{ y: -5 }}
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6">{project.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{project.description}</Typography>
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {project.tags?.map((tag: string, index: number) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{ background: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF' }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="primary">Join</Button>
                        <Button size="small" color="primary">Details</Button>
                      </CardActions>
                    </MotionCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
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
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
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
      </TabPanel>
      
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ mb: 2 }}>My Jobs</Typography>
            <Grid container spacing={2}>
              {jobs
                .filter(job => job.employerId === user?.$id)
                .map((job) => (
                  <Grid item xs={12} key={job.$id}>
                    <MotionCard 
                      whileHover={{ y: -5 }}
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6">{job.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{job.description}</Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="primary">Edit</Button>
                        <Button size="small" color="error">Delete</Button>
                      </CardActions>
                    </MotionCard>
                  </Grid>
                ))}
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ mb: 2 }}>My Projects</Typography>
            <Grid container spacing={2}>
              {projects
                .filter(project => project.ownerId === user?.$id)
                .map((project) => (
                  <Grid item xs={12} key={project.$id}>
                    <MotionCard 
                      whileHover={{ y: -5 }}
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6">{project.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{project.description}</Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="primary">Edit</Button>
                        <Button size="small" color="error">Delete</Button>
                      </CardActions>
                    </MotionCard>
                  </Grid>
                ))}
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
}
