"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function JobsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /projects
    router.replace('/projects');
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
        Redirecting to Projects...
      </Typography>
    </Box>
  );
}
