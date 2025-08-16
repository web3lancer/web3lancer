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

import type { GroupChats } from "@/types/appwrite.d";

export default function GroupPanel({
  group,
  onBack,
  onJoinToggle,
  userId,
}: {
  group: GroupChats;
  onBack: () => void;
  onJoinToggle: (g: GroupChats) => void;
  userId?: string;
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
          label={`${group.memberCount} members`}
          size="small"
          color="primary"
          sx={{ fontWeight: 500, mr: 1 }}
        />
        <Button
          variant={userId && group.memberIds?.includes(userId) ? "outlined" : "contained"}
          color={userId && group.memberIds?.includes(userId) ? "secondary" : "primary"}
          onClick={() => onJoinToggle(group)}
          sx={{ borderRadius: 2, fontWeight: 600, minWidth: 90 }}
        >
          {userId && group.memberIds?.includes(userId) ? "Exit" : "Join"}
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
        <GroupPosts groupId={group.$id} joined={userId ? group.memberIds?.includes(userId) : false} />
      ) : (
        <GroupMessages groupId={group.$id} joined={userId ? group.memberIds?.includes(userId) : false} />
      )}
    </Box>
  );
}
