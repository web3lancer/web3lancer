"use client";
import React from "react";
import { AppBar, Toolbar, Typography, Button, Grid, Card, CardContent } from "@mui/material";

export default function HomePage() {
  return (
    <>
      <AppBar position="static" style={{ backgroundColor: '#1E40AF', fontFamily: 'Roboto' }}>
        <Toolbar>
          <Typography variant="h6">Web3Lancer</Typography>
          <Button color="inherit">Sign In</Button>
        </Toolbar>
      </AppBar>
      <main style={{ padding: '20px', fontFamily: 'Roboto' }}>
        <Typography variant="h5" gutterBottom>Welcome to Web3Lancer!</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Continue courses</Typography>
                {/* Add course cards here */}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Notifications</Typography>
                {/* Add notification cards here */}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Calendar</Typography>
                {/* Add calendar component here */}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Today tasks</Typography>
                {/* Add task cards here */}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Team chat</Typography>
                {/* Add chat component here */}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Hours spent</Typography>
                {/* Add hours spent component here */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </main>
    </>
  );
}
