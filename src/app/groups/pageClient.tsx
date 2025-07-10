"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import GroupsList from "@/components/groups/GroupsList";
import GroupPanel from "@/components/groups/GroupPanel";
import CreateGroupDialog from "@/components/groups/CreateGroupDialog";

const mockGroups = [
  {
    id: "g1",
    name: "Web3 Developers",
    description: "A group for all things Web3 development.",
    members: 124,
    joined: true,
  },
  {
    id: "g2",
    name: "Solidity Wizards",
    description: "Discuss smart contracts and Solidity tips.",
    members: 87,
    joined: false,
  },
  {
    id: "g3",
    name: "NFT Creators",
    description: "Share and discover NFT projects.",
    members: 56,
    joined: true,
  },
];

export default function GroupsPageClient() {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState(mockGroups);
  const [selectedGroup, setSelectedGroup] = useState<typeof mockGroups[0] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Filter groups by search
  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase())
  );

  // Handle join/exit group
  const handleJoinToggle = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, joined: !g.joined } : g
      )
    );
    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup((g) => g && { ...g, joined: !g.joined });
    }
  };

  // Handle create group
  const handleCreateGroup = (group: { name: string; description: string }) => {
    setGroups((prev) => [
      ...prev,
      {
        id: `g${Date.now()}`,
        name: group.name,
        description: group.description,
        members: 1,
        joined: true,
      },
    ]);
    setCreateOpen(false);
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <Container maxWidth="sm" sx={{ pt: { xs: 4, sm: 7 }, pb: 2 }}>
        <Box sx={{ textAlign: "center", position: "relative" }}>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              mb: 1,
              letterSpacing: "-1.5px",
              fontFamily: "inherit",
              color: "primary.main",
            }}
          >
            Groups
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.95,
              fontWeight: 600,
              mb: 0.5,
              color: "text.secondary",
            }}
          >
            Join, create, and collaborate in exclusive communities.
          </Typography>
        </Box>
      </Container>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ pb: 8 }}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            boxShadow: 4,
            bgcolor: "background.paper",
            border: `1.5px solid`,
            borderColor: "divider",
            overflow: "hidden",
            mt: 0,
            p: { xs: 2, sm: 4 },
          }}
        >
          {/* Search and Create */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search groups"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: 180 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: "background.default" },
              }}
            />
            <Button
              variant="contained"
              startIcon={<GroupAddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
            >
              Create Group
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Main area: group list or group panel */}
          <Box>
            {!selectedGroup ? (
              <GroupsList
                groups={filteredGroups}
                onSelect={setSelectedGroup}
                onJoinToggle={handleJoinToggle}
              />
            ) : (
              <GroupPanel
                group={selectedGroup}
                onBack={() => setSelectedGroup(null)}
                onJoinToggle={handleJoinToggle}
              />
            )}
          </Box>
        </Paper>
      </Container>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateGroup}
      />
    </Box>
  );
}
