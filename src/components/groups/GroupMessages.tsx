import { Box, Typography, Paper, TextField, Button, Stack } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import * as social from "@/lib/appwrites/social";
import { useAuth } from "@/contexts/AuthContext";
import ProfileService from "@/services/profileService";
import { AppwriteService } from "@/services/appwriteService";
import { envConfig } from "@/config/environment";

const appwriteService = new AppwriteService(envConfig);
const profileService = new ProfileService(appwriteService, envConfig);
import { client } from "@/lib/appwrites/client";
import { Query } from "appwrite";
import type { Models } from "appwrite";

type GroupMessage = Models.Document & {
  senderId: string;
  content: string;
  createdAt: string;
};

type Profile = Models.Document & {
  displayName: string;
};

export default function GroupMessages({ groupId, joined }: { groupId: string; joined: boolean }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, Profile>>({});
  const { user } = useAuth();

  const fetchMessages = useCallback(async () => {
    if (!groupId) return;
    try {
      const response = await social.listGroupMessages([
        Query.equal("groupId", groupId),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ]);
      const messages = response.documents as unknown as GroupMessage[];
      setMessages(messages);

      const senderIds = [...new Set(messages.map((m) => m.senderId))];
      if (senderIds.length > 0) {
        const profilesData = await profileService.listProfiles([
          Query.equal("userId", senderIds),
        ]);
        const profilesMap = profilesData.reduce((acc, p) => {
          acc[p.$id] = p;
          return acc;
        }, {} as Record<string, Profile>);
        setProfilesMap(profilesMap);
      }
    } catch (error) {
      console.error("Error fetching group messages:", error);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMessages();

    const unsubscribe = client.subscribe(
      `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_SOCIAL_ID}.collections.${process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUP_MESSAGES_ID}.documents`,
      (response) => {
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          const newMessage = response.payload as unknown as GroupMessage;
          if (newMessage.groupId === groupId) {
            setMessages((prevMessages) => [newMessage, ...prevMessages]);
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [fetchMessages, groupId]);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;
    try {
      await social.createGroupMessage({
        groupId,
        senderId: user.$id,
        content: input,
        contentType: "text",
      });
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Box>
      {!joined && (
        <Paper sx={{ p: 3, mb: 2, textAlign: "center", bgcolor: "background.default" }}>
          <Typography variant="body1" color="text.secondary">
            Join this group to participate in the chat.
          </Typography>
        </Paper>
      )}
      {joined && (
        <Box>
          <Stack spacing={1} sx={{ maxHeight: 260, overflowY: "auto", mb: 2 }}>
            {messages.map((msg) => (
              <Paper key={msg.$id} sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.default" }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {profilesMap[msg.senderId]?.displayName || "Unknown User"}
                </Typography>
                <Typography variant="body2">{msg.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(msg.$createdAt).toLocaleTimeString()}
                </Typography>
              </Paper>
            ))}
          </Stack>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              sx={{ borderRadius: 2 }}
            />
            <Button
              variant="contained"
              disabled={!input.trim()}
              sx={{ borderRadius: 2, px: 3 }}
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
