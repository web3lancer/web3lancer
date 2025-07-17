import { Box, Typography, Paper, Stack } from "@mui/material";

export default function LegalSlide() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={4} px={4} sx={{ color: "common.white" }}>
      <Typography
        variant="h3"
        fontWeight={700}
        sx={{
          background: "linear-gradient(90deg, #6366f1, #a78bfa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 4,
        }}
      >
        Legal Transparency & Trust
      </Typography>
      <Paper
        elevation={6}
        sx={{
          maxWidth: 600,
          bgcolor: "rgba(255,255,255,0.08)",
          color: "common.white",
          borderRadius: 3,
          p: 4,
          mx: "auto",
        }}
      >
        <Typography variant="h2" mb={2}>⚖️</Typography>
        <Typography variant="h6" color="grey.200" mb={2}>
          Web3Lancer is open-source and decentralized, providing a foundation for legal data, compliance, and transparency tools. Our platform empowers justice innovation and transparent governance globally.
        </Typography>
        <Stack direction="row" spacing={6} justifyContent="center" mt={4}>
          <Box textAlign="center">
            <Typography variant="h4">🌍</Typography>
            <Typography variant="body2" color="grey.300">Global Reach</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h4">🔓</Typography>
            <Typography variant="body2" color="grey.300">Open Source</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h4">🏛️</Typography>
            <Typography variant="body2" color="grey.300">Governance</Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
