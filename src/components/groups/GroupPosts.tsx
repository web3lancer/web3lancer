import { Box, Typography, Paper, Button, Stack } from "@mui/material";

const mockPosts = [
  {
    id: "p1",
    author: "Alice",
    content: "Welcome to the group! Let's share our latest Web3 projects.",
    createdAt: "2024-06-01",
  },
  {
    id: "p2",
    author: "Bob",
    content: "Anyone working on Solidity contracts? Need some advice.",
    createdAt: "2024-06-02",
  },
];

export default function GroupPosts({ groupId, joined }: { groupId: string; joined: boolean }) {
  return (
    <Box>
      {!joined && (
        <Paper sx={{ p: 3, mb: 2, textAlign: "center", bgcolor: "background.default" }}>
          <Typography variant="body1" color="text.secondary">
            Join this group to view and create posts.
          </Typography>
        </Paper>
      )}
      {joined && (
        <Stack spacing={2}>
          {mockPosts.map((post) => (
            <Paper key={post.id} sx={{ p: 2, borderRadius: 3, bgcolor: "background.default" }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {post.author}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {post.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {post.createdAt}
              </Typography>
            </Paper>
          ))}
          <Button variant="contained" sx={{ mt: 2, borderRadius: 2 }}>
            Create Post
          </Button>
        </Stack>
      )}
    </Box>
  );
}
