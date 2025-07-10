import { Box, Typography, IconButton, Tooltip, useTheme } from "@mui/material";
import { Badge } from "@/components/ui/badge";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function LancelotPrompts() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 4 },
        pt: 3,
        pb: 2,
        bgcolor: theme.palette.mode === "dark"
          ? theme.palette.background.default
          : "#f5f7fa",
        borderRadius: 3,
        mb: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            color: theme.palette.text.secondary,
            mb: 1.2,
            letterSpacing: 1,
            fontWeight: 700,
            textTransform: "uppercase",
            fontSize: 13,
          }}
        >
          Quick Prompts
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Badge variant="info" sx={{ px: 2, py: 0.5, fontSize: 14, borderRadius: 2 }}>
            Find me remote Solidity jobs
          </Badge>
          <Badge variant="info" sx={{ px: 2, py: 0.5, fontSize: 14, borderRadius: 2 }}>
            Write a proposal for this job
          </Badge>
          <Badge variant="info" sx={{ px: 2, py: 0.5, fontSize: 14, borderRadius: 2 }}>
            How do I improve my profile?
          </Badge>
          <Badge variant="info" sx={{ px: 2, py: 0.5, fontSize: 14, borderRadius: 2 }}>
            Show me trending jobs
          </Badge>
        </Box>
      </Box>
      <Tooltip title="Use a prompt to quickly get started">
        <IconButton aria-label="info" size="small" sx={{ color: "primary.main", ml: 1 }}>
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
