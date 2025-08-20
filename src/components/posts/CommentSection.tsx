import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, Button, Avatar, Paper, Stack } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import * as posts from '@/lib/appwrites/posts';
import * as profiles from '@/lib/appwrites/profiles';
import { Query } from 'appwrite';
import type { Models } from 'appwrite';

type Comment = Models.Document & {
    userId: string;
    content: string;
    createdAt: string;
};

type Profile = Models.Document & {
    name: string;
    profilePicture?: string;
};

export default function CommentSection({ postId }: { postId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [profilesMap, setProfilesMap] = useState<Record<string, Profile>>({});
    const [newComment, setNewComment] = useState('');
    const { user } = useAuth();

    const fetchComments = useCallback(async () => {
        try {
            const response = await posts.listComments(postId);
            const comments = response.documents as unknown as Comment[];
            setComments(comments);

            const userIds = [...new Set(comments.map(c => c.userId))];
            if (userIds.length > 0) {
                const profilesResponse = await profiles.listProfiles([
                    Query.equal('userId', userIds),
                ]);
                const profilesData = profilesResponse.documents as unknown as Profile[];
                const profilesMap = profilesData.reduce((acc, p) => {
                    acc[p.userId] = p;
                    return acc;
                }, {} as Record<string, Profile>);
                setProfilesMap(profilesMap);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !user) return;
        try {
            await posts.createComment({
                postId,
                userId: user.$id,
                content: newComment,
            });
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Comments</Typography>
            <Stack spacing={2}>
                {comments.map(comment => (
                    <Paper key={comment.$id} sx={{ p: 2, display: 'flex', gap: 2 }}>
                        <Avatar src={profilesMap[comment.userId]?.profilePicture} />
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {profilesMap[comment.userId]?.name || 'Unknown User'}
                            </Typography>
                            <Typography variant="body2">{comment.content}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(comment.$createdAt).toLocaleString()}
                            </Typography>
                        </Box>
                    </Paper>
                ))}
            </Stack>
            {user && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleAddComment}>
                        Comment
                    </Button>
                </Box>
            )}
        </Box>
    );
}
