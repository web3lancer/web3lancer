import { Box, Typography, Paper, TextField, Button, Stack } from "@mui/material";
import { useState } from "react";

const mockMessages = [
  { id: "m1", user: "Alice", content: "Hey everyone!", createdAt: "10:00" },
  { id: "m2", user: "Bob", content: "Hi Alice!", createdAt: "10:01" },
];

export default function GroupMessages({ groupId, joined }: { groupId: string; joined: boolean }) {
  const [input, setInput] = useState("");

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
            {mockMessages.map((msg) => (
              <Paper key={msg.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.default" }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {msg.user}
                </Typography>
                <Typography variant="body2">{msg.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {msg.createdAt}
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
              sx={{ borderRadius: 2 }}
            />
            <Button
              variant="contained"
              disabled={!input.trim()}
              sx={{ borderRadius: 2, px: 3 }}
              onClick={() => setInput("")}
            >
              Send
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
