"use client";

import { Badge } from "@/components/ui/badge";
import AssistantChat from "@/components/lancelot/AssistantChat";
import { Box, Paper, useTheme, Divider, Typography, Container } from "@mui/material";
import { useRef } from "react";

export default function LancelotPageClient() {
  const theme = useTheme();
  const headerHeight = 0; // No longer needed for sticky header

  const scrollableRef = useRef<HTMLDivElement>(null);

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header Section (no Paper, just spacing) */}
      <Container maxWidth="sm" sx={{ pt: { xs: 4, sm: 6 }, pb: 2 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              mb: 1,
              letterSpacing: "-0.5px",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <span role="img" aria-label="robot">
              🤖
            </span>
            Lancelot
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.92, fontWeight: 500, mb: 0.5 }}
          >
            Your AI Job Assistant
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 400 }}>
            Find jobs, write proposals, and navigate Web3Lancer with ease.
          </Typography>
        </Box>
      </Container>

      {/* Scrollable Content */}
      <Container
        maxWidth="sm"
        sx={{
          pb: 6,
          px: { xs: 0.5, sm: 2 },
        }}
      >
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            boxShadow: theme.shadows[4],
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
            mt: 0,
          }}
        >
          {/* Quick Prompts */}
          <Box
            sx={{
              px: { xs: 2, sm: 4 },
              pt: 3,
              pb: 1.5,
              bgcolor: theme.palette.mode === "dark"
                ? theme.palette.background.default
                : "#f7f8fa",
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: theme.palette.text.secondary, mb: 2, letterSpacing: 1, fontWeight: 600 }}
            >
              Quick Prompts
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              <Badge variant="info" sx={{ px: 2, py: 0.5, fontSize: 14 }}>
                Find me remote Solidity jobs
              </Badge>
              <Badge variant="info" sx={{ px: 2, py: 0.5, fontSize: 14 }}>
                Write a proposal for this job
              </Badge>
              <Badge variant="info" sx={{ px: 2, py: 0.5, fontSize: 14 }}>
                How do I improve my profile?
              </Badge>
              <Badge variant="info" sx={{ px: 2, py: 0.5, fontSize: 14 }}>
                Show me trending jobs
              </Badge>
            </Box>
          </Box>

          {/* Chat Section */}
          <Box
            ref={scrollableRef}
            tabIndex={-1}
            sx={{
              px: { xs: 2, sm: 4 },
              py: { xs: 2.5, sm: 4 },
              bgcolor: theme.palette.mode === "dark"
                ? theme.palette.grey[900]
                : "white",
              maxHeight: { xs: "calc(100vh - 220px)", sm: "calc(100vh - 220px)" },
              overflowY: "auto",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                mb: 1.5,
                color: theme.palette.text.primary,
                fontWeight: 600,
                letterSpacing: 0.1,
              }}
            >
              Chat with Lancelot
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box
              sx={{
                bgcolor:
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[900]
                    : theme.palette.grey[50],
                borderRadius: 4,
                p: { xs: 1, sm: 2 },
                minHeight: 340,
                boxShadow: theme.shadows[1],
                mb: 2,
              }}
            >
              <AssistantChat />
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}