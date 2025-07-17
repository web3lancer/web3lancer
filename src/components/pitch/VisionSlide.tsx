import { Box, Typography, Avatar, Stack } from "@mui/material";

export default function VisionSlide() {
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
      <Avatar
        src="/logo/web3lancer.jpg"
        alt="Web3Lancer Logo"
        sx={{
          width: 160,
          height: 160,
          boxShadow: 6,
          border: "4px solid rgba(255,255,255,0.3)",
          mb: 2,
        }}
      />
      <Typography
        variant="h2"
        fontWeight={700}
        sx={{
          background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Web3Lancer
      </Typography>
      <Typography variant="h5" maxWidth={600} color="grey.200">
        Bridging traditional freelancing with blockchain innovation. A borderless platform where freelancers and businesses connect, collaborate, and transact with unprecedented transparency in a community reputation-based system.
      </Typography>
      <Stack direction="row" spacing={2} mt={2}>
        <Box sx={{ width: 12, height: 12, bgcolor: "#60a5fa", borderRadius: "50%", animation: "bounce 1s infinite" }} />
        <Box sx={{ width: 12, height: 12, bgcolor: "#a78bfa", borderRadius: "50%", animation: "bounce 1s infinite 0.1s" }} />
        <Box sx={{ width: 12, height: 12, bgcolor: "#f472b6", borderRadius: "50%", animation: "bounce 1s infinite 0.2s" }} />
      </Stack>
    </Box>
  );
}
