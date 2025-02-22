"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, Avatar } from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";
import { databases } from "../../utils/api";
import { scrollAnimation, staggeredContainer, cardAnimation } from "@/utils/animations";

const MotionCard = motion(Card);

interface Job {
  $id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  jobId: string;
  employerId: string;
  status: string;
  updatedAt: string;
}

interface Activity {
  type: string;
  user: string;
  time: string;
}

const activities: Activity[] = [
  { type: 'joined', user: 'Alice', time: '2 minutes ago' },
  { type: 'paid', user: 'Bob', time: '5 minutes ago' },
  { type: 'joined team', user: 'Charlie', time: '10 minutes ago' },
];

export default function MarketplacePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [liveActivities, setLiveActivities] = useState<Activity[]>(activities);
  const { scrollYProgress } = useScroll();
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await databases.listDocuments('67af3ffe0011106c4575', '67b8f57b0018fe4fcde7');
        setJobs(response.documents as Job[]);
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
    <motion.div
      style={{ scale: scaleProgress }}
      variants={staggeredContainer}
      initial="hidden"
      animate="visible"
    >
      {/* <Header /> */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          Marketplace
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <motion.div variants={scrollAnimation}>
              <Typography variant="h5" sx={{ mb: 2 }}>Latest Jobs</Typography>
              <Grid container spacing={3}>
                {jobs.map((job, index) => (
                  <Grid item xs={12} sm={6} key={job.$id || index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <MotionCard
                        whileHover={cardAnimation.hover}
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
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={scrollAnimation}>
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
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
}
