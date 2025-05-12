"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function PostRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /projects#post-a-job
    router.replace('/projects#post-a-job');
  }, [router]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '70vh',
        gap: 2
      }}
    >
      <CircularProgress />
      <Typography variant="body1">
        Redirecting to Post a Job...
      </Typography>
    </Box>
  );
}
