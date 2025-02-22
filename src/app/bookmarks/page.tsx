"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import { motion } from "framer-motion";
import { databases } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";

const MotionCard = motion(Card);

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
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const response = await databases.listDocuments('67b885ed000038dd7ab9', '67b8860100311b7d7939', [
          { key: 'userId', value: user?.$id }
        ]);
        setBookmarks(response.documents as Bookmark[]);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      }
    }

    async function fetchJobs() {
      try {
        const response = await databases.listDocuments('67af3ffe0011106c4575', '67b8f57b0018fe4fcde7');
        setJobs(response.documents as Job[]);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    }

    if (user) {
      fetchBookmarks();
      fetchJobs();
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
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Bookmarks
      </Typography>
      <Grid container spacing={3}>
        {bookmarks.map((bookmark) => {
          const job = getJobDetails(bookmark.jobId);
          return job ? (
            <Grid item xs={12} sm={6} md={4} key={bookmark.$id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <MotionCard
                  whileHover={{ y: -5 }}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">{job.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{job.description}</Typography>
                    <Button variant="outlined" sx={{ mt: 2 }}>
                      View Job
                    </Button>
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={() => removeBookmark(bookmark.$id)}>
                      Remove
                    </Button>
                  </CardContent>
                </MotionCard>
              </motion.div>
            </Grid>
          ) : null;
        })}
      </Grid>
    </Box>
  );
}
