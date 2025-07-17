import { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Divider,
  IconButton,
  Avatar,
  Chip,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupIcon from "@mui/icons-material/Group";
import GroupPosts from "@/components/groups/GroupPosts";
import GroupMessages from "@/components/groups/GroupMessages";

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  joined: boolean;
}

export default function GroupPanel({
  group,
  onBack,
  onJoinToggle,
}: {
  group: Group;
  onBack: () => void;
  onJoinToggle: (id: string) => void;
}) {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: "primary.main", width: 44, height: 44, mr: 1 }}>
          <GroupIcon />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {group.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {group.description}
          </Typography>
        </Box>
        <Chip
          label={`${group.members} members`}
          size="small"
          color="primary"
          sx={{ fontWeight: 500, mr: 1 }}
        />
        <Button
          variant={group.joined ? "outlined" : "contained"}
          color={group.joined ? "secondary" : "primary"}
          onClick={() => onJoinToggle(group.id)}
          sx={{ borderRadius: 2, fontWeight: 600, minWidth: 90 }}
        >
          {group.joined ? "Exit" : "Join"}
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2 }}
        variant="fullWidth"
      >
        <Tab label="Posts" />
        <Tab label="Messages" />
      </Tabs>
      {tab === 0 ? (
        <GroupPosts groupId={group.id} joined={group.joined} />
      ) : (
        <GroupMessages groupId={group.id} joined={group.joined} />
      )}
    </Box>
  );
}
