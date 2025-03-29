"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Alert, CircularProgress, Tabs, Tab } from "@mui/material";
import { databases } from "@/utils/api";
import { useAuth } from '@/contexts/AuthContext';
import { APPWRITE_CONFIG } from "@/lib/env";
import BrowseProjectsTab from "@/components/projects/BrowseProjectsTab";
import PostJobTab from "@/components/projects/PostJobTab";
import CreateProjectTab from "@/components/projects/CreateProjectTab";
import MyListingsTab from "@/components/projects/MyListingsTab";

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
        <BrowseProjectsTab jobs={jobs} projects={projects} loading={loading} />
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <PostJobTab user={user} onJobPosted={fetchJobs} setActiveTab={setActiveTab} />
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        <CreateProjectTab user={user} onProjectCreated={fetchProjects} setActiveTab={setActiveTab} />
      </TabPanel>
      
      <TabPanel value={activeTab} index={3}>
        <MyListingsTab user={user} jobs={jobs} projects={projects} />
      </TabPanel>
    </Box>
  );
}
