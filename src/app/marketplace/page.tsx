"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import { databases } from "../../utils/api";

const MotionCard = motion(Card);

const activities = [
  { type: 'joined', user: 'Alice', time: '2 minutes ago' },
  { type: 'paid', user: 'Bob', time: '5 minutes ago' },
  { type: 'joined team', user: 'Charlie', time: '10 minutes ago' },
];

export default function MarketplacePage() {
  const [jobs, setJobs] = useState([]);
  const [liveActivities, setLiveActivities] = useState(activities);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await databases.listDocuments('67aed8360001b6dd8cb3', 'jobs');
        setJobs(response.documents);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    }
    fetchJobs();

    const interval = setInterval(() => {
      const newActivity = activities[Math.floor(Math.random() * activities.length)];
      setLiveActivities((prev) => [newActivity, ...prev].slice(0, 10));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Marketplace
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" sx={{ mb: 2 }}>Latest Jobs</Typography>
          <Grid container spacing={3}>
            {jobs.map((job, index) => (
              <Grid item xs={12} sm={6} key={job.$ID || index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                    </CardContent>
                  </MotionCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h5" sx={{ mb: 2 }}>Live Activities</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {liveActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MotionCard
                  whileHover={{ y: -5 }}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{activity.user[0]}</Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{activity.user}</Typography>
                      <Typography variant="body2" color="text.secondary">{activity.type}</Typography>
                      <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                    </Box>
                  </CardContent>
                </MotionCard>
              </motion.div>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
