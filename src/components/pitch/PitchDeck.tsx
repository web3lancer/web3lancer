"use client";

import { Grid, Paper, Typography, Button, Box, Stack } from "@mui/material";

export default function PitchDeck() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      <div className="w-full max-w-4xl mx-auto px-4">
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={4} px={4} sx={{ color: "common.white" }}>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 4,
            }}
          >
            See It In Action
          </Typography>
          <Grid container spacing={4} maxWidth="md">
            <Grid item xs={12} md={6}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "common.white",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.05)", bgcolor: "rgba(255,255,255,0.15)" },
                  textAlign: "center",
                }}
              >
                <Typography variant="h2" mb={2}>📄</Typography>
                <Typography variant="h6" fontWeight={600} mb={2}>Interactive Pitch Deck</Typography>
                <Typography variant="body2" color="grey.300" mb={2}>
                  Experience our full presentation with animations and detailed insights.
                </Typography>
                <Button
                  variant="contained"
                  href="https://doc.storydoc.ai/tgKIKu"
                  target="_blank"
                  sx={{
                    background: "linear-gradient(90deg, #3b82f6, #a78bfa)",
                    color: "common.white",
                    fontWeight: 700,
                    px: 3,
                    py: 1.5,
                    borderRadius: 8,
                    textTransform: "none",
                    fontSize: "1rem",
                    "&:hover": {
                      background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                    },
                  }}
                >
                  View Pitch Deck
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "common.white",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.05)", bgcolor: "rgba(255,255,255,0.15)" },
                  textAlign: "center",
                }}
              >
                <Typography variant="h2" mb={2}>▶️</Typography>
                <Typography variant="h6" fontWeight={600} mb={2}>Demo Video</Typography>
                <Typography variant="body2" color="grey.300" mb={2}>
                  Watch our platform in action with live demonstrations and use cases.
                </Typography>
                <Button
                  variant="contained"
                  href="https://youtube.com/watch?v=VwpeeR8MMG8"
                  target="_blank"
                  sx={{
                    background: "linear-gradient(90deg, #ef4444, #f472b6)",
                    color: "common.white",
                    fontWeight: 700,
                    px: 3,
                    py: 1.5,
                    borderRadius: 8,
                    textTransform: "none",
                    fontSize: "1rem",
                    "&:hover": {
                      background: "linear-gradient(90deg, #b91c1c, #db2777)",
                    },
                  }}
                >
                  Watch Demo
                </Button>
              </Paper>
            </Grid>
          </Grid>
          <Box mt={6}>
            <Typography variant="body1" color="grey.300">
              Thank you for your attention!
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
              <Box sx={{ width: 16, height: 16, bgcolor: "#60a5fa", borderRadius: "50%", animation: "ping 1s infinite" }} />
              <Box sx={{ width: 16, height: 16, bgcolor: "#a78bfa", borderRadius: "50%", animation: "ping 1s infinite 0.1s" }} />
              <Box sx={{ width: 16, height: 16, bgcolor: "#f472b6", borderRadius: "50%", animation: "ping 1s infinite 0.2s" }} />
            </Stack>
          </Box>
        </Box>
      </div>
    </div>
  );
}
