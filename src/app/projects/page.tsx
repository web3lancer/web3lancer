"use client";

import React, { useState, useEffect } from "react";
import { Box, Alert, CircularProgress, Tabs, Tab } from "@mui/material";
import { useAuth } from '@/contexts/AuthContext';
import BrowseProjectsTab from "@/components/projects/BrowseProjectsTab";
import PostJobTab from "@/components/projects/PostJobTab";
import CreateProjectTab from "@/components/projects/CreateProjectTab";
import MyListingsTab from "@/components/projects/MyListingsTab";
import { listJobs, listProfiles } from "@/lib/appwrite";
import type { Jobs, Profiles } from "@/types/appwrite.d";

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
        <Box sx={{
          pt: 1,
          animation: 'fadeIn 0.4s ease-in-out',
          '@keyframes fadeIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(10px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState<Jobs[]>([]);
  const [projects, setProjects] = useState<Profiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listJobs();
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
      const response = await listProfiles();
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
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          {error}
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          mb: 3,
          borderRadius: '16px 16px 0 0',
          background: theme => `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          '& .MuiTab-root': {
            color: 'white',
            opacity: 0.7,
            fontWeight: 500,
            py: 2,
            transition: 'all 0.3s ease',
            '&.Mui-selected': {
              opacity: 1,
              fontWeight: 700,
            },
          },
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: '4px 4px 0 0',
            backgroundColor: 'white',
          }
        }}
      >
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
