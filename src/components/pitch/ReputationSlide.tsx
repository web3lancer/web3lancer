import { Box, Typography, Grid, Paper } from "@mui/material";

const features = [
  { icon: "💯", title: "Transparent Ratings", desc: "On-chain reputation scores" },
  { icon: "👥", title: "Verified Reviews", desc: "Only from real collaborations" },
  { icon: "⚖️", title: "Dispute Resolution", desc: "Fair, transparent arbitration" },
  { icon: "🧮", title: "Decentralized Scoring", desc: "Smart contract automation" },
  { icon: "🛡️", title: "Modular Identity", desc: "Privacy-preserving verification" },
  { icon: "🔗", title: "Permissioned Access", desc: "Trust-based feature access" }
];

export default function ReputationSlide() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={4} px={4} sx={{ color: "common.white" }}>
      <Typography
        variant="h3"
        fontWeight={700}
        sx={{
          background: "linear-gradient(90deg, #fb923c, #ef4444)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 4,
        }}
      >
        Reputation & Trust
      </Typography>
      <Grid container spacing={3} maxWidth="lg">
        {features.map((feature, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Paper
              elevation={6}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.08)",
                color: "common.white",
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)", bgcolor: "rgba(255,255,255,0.15)" },
              }}
            >
              <Typography variant="h2" mb={1}>{feature.icon}</Typography>
              <Typography variant="h6" fontWeight={600}>{feature.title}</Typography>
              <Typography variant="body2" color="grey.300">{feature.desc}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
