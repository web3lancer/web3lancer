import { Box, Typography, Grid, Paper } from "@mui/material";

const features = [
  { icon: "🎯", title: "Trust Score Analytics", desc: "KYC integration & behavioral scoring" },
  { icon: "🛡️", title: "Sybil Resistance", desc: "One user, one account policy" },
  { icon: "🔐", title: "Compliance Filtering", desc: "Smart access control" },
  { icon: "⚡", title: "Reputation-Based Access", desc: "Dynamic feature permissions" },
  { icon: "🕵️", title: "Zero-Knowledge Privacy", desc: "Private verification methods" }
];

export default function TrustNetworkSlide() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={4} px={4} sx={{ color: "common.white" }}>
      <Typography
        variant="h3"
        fontWeight={700}
        sx={{
          background: "linear-gradient(90deg, #14b8a6, #22d3ee)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 4,
        }}
      >
        Advanced Trust Network
      </Typography>
      <Grid container spacing={3} maxWidth="md">
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
