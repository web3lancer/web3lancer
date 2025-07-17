import { Box, Typography, Grid, Paper } from "@mui/material";

const capabilities = [
  {
    icon: "💸",
    title: "Instant Cross-Border Payments",
    desc: "Eliminate traditional banking delays",
  },
  {
    icon: "🔄",
    title: "Currency Conversion",
    desc: "Seamless exchanges between currencies",
  },
  {
    icon: "📊",
    title: "Financial Inclusion",
    desc: "Banking services for the unbanked",
  },
  {
    icon: "🛡️",
    title: "Transaction Security",
    desc: "Immutable payment records",
  },
  {
    icon: "⚡",
    title: "Low-Cost Microtransactions",
    desc: "Granular payment models",
  },
];

export default function OnChainSlide() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      gap={4}
      px={4}
      sx={{ color: "common.white" }}
    >
      <Typography
        variant="h3"
        fontWeight={700}
        sx={{
          background: "linear-gradient(90deg, #4ade80, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 4,
        }}
      >
        On-Chain Capabilities
      </Typography>
      <Grid container spacing={3} maxWidth="md">
        {capabilities.map((cap, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Paper
              elevation={6}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.08)",
                color: "common.white",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  bgcolor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              <Typography
                variant="h2"
                mb={1}
                sx={{ animation: "pulse 2s infinite" }}
              >
                {cap.icon}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {cap.title}
              </Typography>
              <Typography variant="body2" color="grey.300">
                {cap.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h6" maxWidth={500} color="grey.200" mt={4}>
        Powered by fast, low-cost, and secure blockchain transactions.
      </Typography>
    </Box>
  );
}
