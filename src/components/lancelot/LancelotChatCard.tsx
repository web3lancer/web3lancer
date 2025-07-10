import { Box, Paper, Divider, Typography, useTheme } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AssistantChat from "@/components/lancelot/AssistantChat";

export default function LancelotChatCard() {
  const theme = useTheme();
  return (
    <Paper
      elevation={4}
      sx={{
        borderRadius: 5,
        boxShadow: theme.shadows[10],
        bgcolor: theme.palette.background.paper,
        border: `1.5px solid ${theme.palette.divider}`,
        overflow: "hidden",
        mt: 0,
        transition: "box-shadow 0.2s",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 4 },
          py: { xs: 2.5, sm: 4 },
          bgcolor: theme.palette.mode === "dark"
            ? theme.palette.grey[900]
            : "white",
          maxHeight: { xs: "calc(100vh - 260px)", sm: "calc(100vh - 260px)" },
          overflowY: "auto",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
          <ChatBubbleOutlineIcon color="primary" fontSize="small" />
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 700,
              letterSpacing: 0.15,
              fontSize: 18,
            }}
          >
            Chat with Lancelot
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box
          sx={{
            bgcolor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[900]
                : theme.palette.grey[50],
            borderRadius: 4,
            p: { xs: 1.5, sm: 2.5 },
            minHeight: 340,
            boxShadow: theme.shadows[2],
            mb: 1,
            border: `1px solid ${theme.palette.divider}`,
            transition: "box-shadow 0.15s, border 0.15s",
            "&:focus-within": {
              boxShadow: theme.shadows[6],
              borderColor: theme.palette.primary.light,
            },
          }}
        >
          <AssistantChat />
        </Box>
      </Box>
    </Paper>
  );
}
