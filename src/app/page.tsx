"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AppBar, Toolbar, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import Link from 'next/link';
import { databases } from '../utils/api';

export default function HomePage() {
  const [jobs, setJobs] = useState([]);

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
  }, []);

  return (
    <>
      <AppBar position="static" style={{ backgroundColor: '#1E40AF', fontFamily: 'Roboto' }}>
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Web3Lancer
          </Typography>
          <Link href="/app" passHref>
            <Button color="inherit">Sign In</Button>
          </Link>
        </Toolbar>
      </AppBar>
      <main style={{ padding: '20px', fontFamily: 'Roboto' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Work Without Borders
                </Typography>
                <Typography variant="body1">
                  Connect, collaborate, and conquer from anywhere with digital working.
                </Typography>
                <Link href="/app" passHref>
                  <Button variant="contained" color="primary" style={{ marginTop: '10px' }}>
                    Sign Up
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={8}>
            <Card>
              <CardContent>
                <Image src="/logo/web3lancer.jpg" alt="Web3Lancer" width={500} height={300} style={{ objectFit: 'cover' }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
          See what you get if you trust us
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Payment Protection</Typography>
                <Typography variant="body2">Lower cost and reliable</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Large pool of Customers</Typography>
                <Typography variant="body2">Advanced Analytics</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Advanced Analytics</Typography>
                <Typography variant="body2">Manage your work, Grow your network, and Never miss an opportunity.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
          Latest Jobs
        </Typography>
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job.$ID}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{job.title}</Typography>
                  <Typography variant="body2">{job.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </main>
    </>
  );
}
