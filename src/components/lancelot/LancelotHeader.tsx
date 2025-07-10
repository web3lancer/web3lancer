import { Typography, Box, useTheme } from "@mui/material";

export default function LancelotHeader() {
  const theme = useTheme();
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        variant="h3"
        fontWeight={900}
        sx={{
          mb: 1,
          letterSpacing: "-1.5px",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          color: "primary.main",
        }}
      >
        <span role="img" aria-label="robot">
          🤖
        </span>
        Lancelot
      </Typography>
      <Typography
        variant="h6"
        sx={{
          opacity: 0.95,
          fontWeight: 600,
          mb: 0.5,
          color: theme.palette.mode === "dark" ? theme.palette.grey[200] : theme.palette.grey[700],
        }}
      >
        Your AI Job Assistant
      </Typography>
      <Typography
        variant="body1"
        sx={{
          opacity: 0.85,
          fontWeight: 400,
          color: theme.palette.text.secondary,
          maxWidth: 410,
          mx: "auto",
        }}
      >
        Get personalized help finding jobs, writing proposals, and navigating Web3Lancer. Ask anything or use a quick prompt!
      </Typography>
    </Box>
  );
}
