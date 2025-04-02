"use client";
import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Container, 
  CircularProgress, 
  IconButton, 
  Chip, 
  Divider,
  Alert,
  Paper
} from "@mui/material";
import { motion } from "framer-motion";
import { databases } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from "next/navigation";
import { Query } from 'appwrite';

const MotionCard = motion(Card);
const MotionContainer = motion(Container);

interface Bookmark {
  $id: string;
  jobId: string;
  createdAt: string;
  bookmarkId: string;
}

interface Job {
  $id: string;
  title: string;
  description: string;
  tags?: string[];
  budget?: string;
  category?: string;
  deadline?: string;
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchBookmarks() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Use Query approach instead of string interpolation to prevent issues
        const response = await databases.listDocuments(
          '67b885ed000038dd7ab9', 
          '67b8860100311b7d7939', 
          [Query.equal('userId', user.$id)]
        );
        
        setBookmarks(response.documents as unknown as Bookmark[]);
        
        // Fetch jobs for these bookmarks
        await fetchJobs();
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        setError('Failed to load your bookmarks. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchJobs() {
      try {
        const response = await databases.listDocuments('67af3ffe0011106c4575', '67b8f57b0018fe4fcde7');
        setJobs(response.documents as unknown as Job[]);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load job details. Please try again later.');
      }
    }

    if (user) {
      fetchBookmarks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getJobDetails = (jobId: string) => {
    return jobs.find(job => job.$id === jobId);
  };

  const removeBookmark = async (bookmarkId: string) => {
    try {
      await databases.deleteDocument('67b885ed000038dd7ab9', '67b8860100311b7d7939', bookmarkId);
      setBookmarks(prev => prev.filter(b => b.$id !== bookmarkId));
    } catch (error) {
      console.error("Error removing bookmark:", error);
      setError("Failed to remove bookmark. Please try again.");
    }
  };
  
  const navigateToJob = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ 
          py: 8, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh' 
        }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              borderRadius: 2, 
              maxWidth: 500,
              mx: 'auto',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Sign in to view bookmarks
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You need to sign in to access your saved jobs and bookmarks.
            </Typography>
            <Button 
              variant="contained" 
              component={Link} 
              href="/signin?redirect=/bookmarks"
              sx={{ mt: 2 }}
            >
              Sign In
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 4, pb: 6 }}>
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Your Bookmarked Jobs
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage the jobs you've saved for later
            </Typography>
          </Box>
          <Button 
            variant="outlined"
            component={Link}
            href="/jobs"
            endIcon={<ArrowForwardIcon />}
          >
            Explore Jobs
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : bookmarks.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px dashed rgba(0,0,0,0.12)'
            }}
          >
            <BookmarkIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No bookmarks yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You haven't bookmarked any jobs yet. Browse jobs and bookmark the ones that interest you.
            </Typography>
            <Button 
              variant="contained" 
              component={Link}
              href="/jobs"
              startIcon={<ArrowForwardIcon />}
            >
              Browse Jobs
            </Button>
          </Paper>
        ) : (
          <MotionContainer
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            component="div"
            disableGutters
          >
            <Grid container spacing={3}>
              {bookmarks.map((bookmark) => {
                const job = getJobDetails(bookmark.jobId);
                return job ? (
                  <Grid item xs={12} sm={6} md={4} key={bookmark.$id}>
                    <MotionCard
                      component={motion.div}
                      variants={itemVariants}
                      whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid rgba(0,0,0,0.05)',
                      }}
                    >
                      <Box 
                        sx={{ 
                          p: 1, 
                          bgcolor: 'primary.main',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Chip 
                          label={job.category || "Job"} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'white',
                            color: 'primary.main',
                            fontWeight: 'bold',
                          }} 
                        />
                        <IconButton 
                          size="small"
                          onClick={() => removeBookmark(bookmark.$id)}
                          sx={{ color: 'white' }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ 
                            fontWeight: 600,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.3,
                          }}
                        >
                          {job.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 2
                          }}
                        >
                          {job.description}
                        </Typography>
                        
                        <Box sx={{ mt: 'auto' }}>
                          {job.budget && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">Budget:</Typography>
                              <Typography variant="body2" sx={{ ml: 1 }}>{job.budget}</Typography>
                            </Box>
                          )}
                          
                          {job.deadline && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">Deadline:</Typography>
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {new Date(job.deadline).toLocaleDateString()}
                              </Typography>
                            </Box>
                          )}
                          
                          {job.tags && job.tags.length > 0 && (
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {job.tags.slice(0, 3).map((tag, index) => (
                                <Chip 
                                  key={index}
                                  label={tag}
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                                    fontSize: '0.7rem'
                                  }}
                                />
                              ))}
                              {job.tags.length > 3 && (
                                <Chip 
                                  label={`+${job.tags.length - 3}`}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(59, 130, 246, 0.05)' }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                      
                      <Divider />
                      
                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => navigateToJob(job.$id)}
                          startIcon={<VisibilityIcon />}
                          fullWidth
                        >
                          View Details
                        </Button>
                      </Box>
                    </MotionCard>
                  </Grid>
                ) : null;
              })}
            </Grid>
          </MotionContainer>
        )}
      </Box>
    </Container>
  );
}
