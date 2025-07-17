import { Box, Typography, Paper, Button, Stack } from "@mui/material";

export default function GetStartedSlide() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={4} px={4} sx={{ color: "common.white" }}>
      <Typography
        variant="h3"
        fontWeight={700}
        sx={{
          background: "linear-gradient(90deg, #d1d5db, #fff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 4,
        }}
      >
        Getting Started
      </Typography>
      <Paper
        elevation={6}
        sx={{
          bgcolor: "rgba(0,0,0,0.4)",
          color: "green.400",
          borderRadius: 3,
          p: 4,
          maxWidth: 500,
          mx: "auto",
          fontFamily: "monospace",
        }}
      >
        <Typography component="pre" variant="body1" sx={{ textAlign: "left", color: "green.400" }}>
          {`git clone https://github.com/web3lancer/web3lancer.git
cd web3lancer
npm install
npm run dev`}
        </Typography>
      </Paper>
      <Stack direction="column" alignItems="center" gap={2}>
        <Typography variant="h5" fontWeight={600} color="common.white">
          Join us in building the future of work!
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            background: "linear-gradient(90deg, #3b82f6, #a78bfa)",
            color: "common.white",
            fontWeight: 700,
            px: 4,
            py: 2,
            borderRadius: 8,
            boxShadow: 4,
            textTransform: "none",
            fontSize: "1.1rem",
            "&:hover": {
              background: "linear-gradient(90deg, #2563eb, #7c3aed)",
            },
          }}
        >
          Start Contributing
        </Button>
      </Stack>
    </Box>
  );
}
