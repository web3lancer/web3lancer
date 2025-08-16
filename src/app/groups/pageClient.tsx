"use client";

import { useState, useEffect } from "react";
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

import { useAuth } from "@/contexts/AuthContext";
import { listGroupChats, createGroupChat, updateGroupChat } from "@/lib/appwrite";
import type { GroupChats } from "@/types/appwrite.d";

export default function GroupsPageClient() {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<GroupChats[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupChats | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listGroupChats();
      setGroups(response.documents);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Failed to fetch groups. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter groups by search
  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description?.toLowerCase().includes(search.toLowerCase())
  );

  const { user } = useAuth();

  const handleJoinToggle = async (group: GroupChats) => {
    if (!user) {
      setError("You must be logged in to join or leave a group.");
      return;
    }

    setLoading(true);
    try {
      const isMember = group.memberIds?.includes(user.$id);
      const newMemberIds = isMember
        ? group.memberIds?.filter((id) => id !== user.$id)
        : [...(group.memberIds || []), user.$id];

      const newMemberCount = newMemberIds?.length || 0;

      await updateGroupChat(group.$id, {
        memberIds: newMemberIds,
        memberCount: newMemberCount,
      });

      fetchGroups(); // Re-fetch groups to update the UI
    } catch (error) {
      console.error("Error toggling group membership:", error);
      setError("Failed to update group membership. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (group: { name: string; description: string }) => {
    if (!user) {
      setError("You must be logged in to create a group.");
      return;
    }

    setLoading(true);
    try {
      await createGroupChat({
        name: group.name,
        description: group.description,
        creatorId: user.$id,
        memberIds: [user.$id],
        memberCount: 1,
      });
      fetchGroups(); // Re-fetch groups after creating a new one
    } catch (error) {
      console.error("Error creating group:", error);
      setError("Failed to create group. Please try again later.");
    } finally {
      setLoading(false);
      setCreateOpen(false);
    }
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
                userId={user?.$id}
              />
            ) : (
              <GroupPanel
                group={selectedGroup}
                onBack={() => setSelectedGroup(null)}
                onJoinToggle={handleJoinToggle}
                userId={user?.$id}
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
