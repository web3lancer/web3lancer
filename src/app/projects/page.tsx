"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchProjects();

    // Handle initial tab based on URL hash
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        if (hash === '#post-a-job') {
          setActiveTab(1);
        } else if (hash === '#create-project') {
          setActiveTab(2);
        } else if (hash === '#my-listings') {
          setActiveTab(3);
        } else if (hash === '#browse') { 
          setActiveTab(0); 
        }
      }
    }
  }, []); // Removed router from dependencies

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASES.JOBS!,
        APPWRITE_CONFIG.COLLECTIONS.JOBS!
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
        APPWRITE_CONFIG.DATABASES.PROJECTS!,
        APPWRITE_CONFIG.COLLECTIONS.PROJECTS!
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
    let newHash = '';
    if (newValue === 1) {
      newHash = '#post-a-job';
    } else if (newValue === 2) {
      newHash = '#create-project';
    } else if (newValue === 3) {
      newHash = '#my-listings';
    } else if (newValue === 0) {
      newHash = '#browse'; 
    }
    router.replace(`/projects${newHash}`, { scroll: false }); 
  };

  if (loading && activeTab === 0 && (typeof window !== 'undefined' && !window.location.hash)) {
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
        <Tab label="Browse" id="projects-tab-0" aria-controls="projects-tabpanel-0"/>
        <Tab label="Post a Job" id="projects-tab-1" aria-controls="projects-tabpanel-1"/>
        <Tab label="Create Project" id="projects-tab-2" aria-controls="projects-tabpanel-2"/>
        <Tab label="My Listings" id="projects-tab-3" aria-controls="projects-tabpanel-3"/>
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
