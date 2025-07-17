import { Box, Typography, Grid, Paper } from "@mui/material";

const features = [
  { icon: "🔍", title: "Smart Matching", desc: "AI-powered talent discovery, enhanced by on-chain reputation" },
  { icon: "🔐", title: "Secure Escrow", desc: "Protected payments with milestone-based releases" },
  { icon: "🌐", title: "Global Talent Pool", desc: "Verifiable identity and trust scores" },
  { icon: "🤝", title: "Collaborative Workspace", desc: "Seamless project management tools" },
  { icon: "💰", title: "Multi-currency Support", desc: "Work and earn in fiat or crypto" },
  { icon: "⚡", title: "Cross-Chain Interoperability", desc: "Seamless blockchain transactions" }
];

export default function FeaturesSlide() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={4} px={4} sx={{ color: "common.white" }}>
      <Typography
        variant="h3"
        fontWeight={700}
        sx={{
          background: "linear-gradient(90deg, #a78bfa, #f472b6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 4,
        }}
      >
        Core Features
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
