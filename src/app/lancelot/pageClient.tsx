"use client";

import { Box, Container, useTheme } from "@mui/material";
import LancelotHeader from "@/components/lancelot/LancelotHeader";
import LancelotPrompts from "@/components/lancelot/LancelotPrompts";
import LancelotChatCard from "@/components/lancelot/LancelotChatCard";

export default function LancelotPageClient() {
  const theme = useTheme();
  const headerHeight = 104; // px, adjust to match your header height
  const appBarHeight = 56; // px, adjust if your appbar is taller (e.g. 64 for desktop)

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        minHeight: "100vh",
        bgcolor: "background.default",
        overflow: "hidden", // Prevent page scroll
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Fixed Header */}
      <Box
        sx={{
          position: "sticky",
          top: { xs: appBarHeight, sm: appBarHeight },
          zIndex: 1201,
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="sm" sx={{ px: { xs: 1, sm: 2 }, py: 2 }}>
          <LancelotHeader />
        </Container>
      </Box>

      {/* Scrollable Content with fade-out mask at the top */}
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          minHeight: 0,
          pt: 2,
          pb: 8,
          px: { xs: 0.5, sm: 2 },
          overflowY: "auto",
          // Fade out top of content as it scrolls under the header
          maskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 32px, black 100%)",
        }}
      >
        <LancelotPrompts />
        <LancelotChatCard />
      </Container>
    </Box>
  );
}