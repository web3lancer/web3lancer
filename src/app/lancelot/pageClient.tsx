"use client";

import { Badge } from "@/components/ui/badge";
import AssistantChat from "@/components/lancelot/AssistantChat";
import { Box, Paper, useTheme, Divider, Typography, Container } from "@mui/material";

export default function LancelotPageClient() {
  const theme = useTheme();

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 6 }, px: { xs: 0.5, sm: 2 } }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 4,
          boxShadow: theme.shadows[4],
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: theme.palette.mode === "dark"
              ? theme.palette.primary.dark
              : theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            py: 3,
            px: { xs: 2, sm: 4 },
            borderBottom: `1px solid ${theme.palette.divider}`,
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
              <span role="img" aria-label="robot">🤖</span> Lancelot
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ opacity: 0.92, fontWeight: 500, mt: 0.5 }}>
            Your AI Job Assistant
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 400, mt: 0.5 }}>
            Find jobs, write proposals, and navigate Web3Lancer with ease.
          </Typography>
        </Box>

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
          sx={{
            px: { xs: 2, sm: 4 },
            py: { xs: 2.5, sm: 4 },
            bgcolor: theme.palette.mode === "dark"
              ? theme.palette.grey[900]
              : "white",
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
  );
}