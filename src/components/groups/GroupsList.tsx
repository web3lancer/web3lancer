import { Paper, Box, Typography, Button, Avatar, Chip, Stack } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  joined: boolean;
}

export default function GroupsList({
  groups,
  onSelect,
  onJoinToggle,
}: {
  groups: Group[];
  onSelect: (g: Group) => void;
  onJoinToggle: (id: string) => void;
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
      {groups.map((g) => (
        <Paper
          key={g.id}
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
              label={`${g.members} members`}
              size="small"
              color="primary"
              sx={{ fontWeight: 500 }}
            />
          </Box>
          <Button
            variant={g.joined ? "outlined" : "contained"}
            color={g.joined ? "secondary" : "primary"}
            onClick={(e) => {
              e.stopPropagation();
              onJoinToggle(g.id);
            }}
            sx={{ borderRadius: 2, fontWeight: 600, minWidth: 90 }}
          >
            {g.joined ? "Exit" : "Join"}
          </Button>
        </Paper>
      ))}
    </Stack>
  );
}
