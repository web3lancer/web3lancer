import { Paper, Box, Typography, Button, Avatar, Chip, Stack } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";

import type { GroupChats } from "@/types/appwrite.d";

export default function GroupsList({
  groups,
  onSelect,
  onJoinToggle,
  userId,
}: {
  groups: GroupChats[];
  onSelect: (g: GroupChats) => void;
  onJoinToggle: (g: GroupChats) => void;
  userId?: string;
}) {
  if (!groups.length) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="body1" color="text.secondary">
          No groups found.
        </Typography>
      </Box>
    );
  }
  return (
    <Stack spacing={2}>
      {groups.map((g) => {
        const isJoined = userId ? g.memberIds?.includes(userId) : false;
        return (
          <Paper
            key={g.$id}
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: "background.default",
              cursor: "pointer",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": { boxShadow: 3, borderColor: "primary.light" },
              transition: "box-shadow 0.2s, border-color 0.2s",
            }}
            onClick={() => onSelect(g)}
          >
            <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
              <GroupIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                {g.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {g.description}
              </Typography>
              <Chip
                label={`${g.memberCount} members`}
                size="small"
                color="primary"
                sx={{ fontWeight: 500 }}
              />
            </Box>
            <Button
              variant={isJoined ? "outlined" : "contained"}
              color={isJoined ? "secondary" : "primary"}
              onClick={(e) => {
                e.stopPropagation();
                onJoinToggle(g);
              }}
              sx={{ borderRadius: 2, fontWeight: 600, minWidth: 90 }}
            >
              {isJoined ? "Exit" : "Join"}
            </Button>
          </Paper>
        );
      })}
    </Stack>
  );
}
