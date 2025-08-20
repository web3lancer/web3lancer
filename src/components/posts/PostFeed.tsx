import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button, Alert, Paper } from '@mui/material';
import PostCard from '@/components/posts/PostCard';
import PostForm from '@/components/posts/PostForm';
import { Post, Profile } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  createPost,
  listPosts,
  updatePost,
  deletePost,
} from '@/lib/appwrites/posts';
import ProfileService from "@/services/profileService";
import { AppwriteService } from "@/services/appwriteService";
import { envConfig } from "@/config/environment";
import { BUCKET_ID } from '@/lib/appwrites/constants';

const appwriteService = new AppwriteService(envConfig);
const profileService = new ProfileService(appwriteService, envConfig);

interface PostFeedProps {
  profileId?: string; // If provided, shows only posts from this profile
  showPostForm?: boolean;
}

const PostFeed: React.FC<PostFeedProps> = ({ profileId, showPostForm = true }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [authorProfiles, setAuthorProfiles] = useState<Record<string, Profile>>({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (user) {
          const userProfile = await profileService.getProfileByUserId(user.$id);
          setCurrentUserProfile(userProfile);
        }

        const response = await listPosts(profileId ? [Query.equal('authorId', profileId)] : []);
        setPosts(response.documents);

        const authorIds = [...new Set(response.documents.map(post => post.authorId))];
        const profiles = await profileService.listProfiles([Query.equal('$id', authorIds)]);

        const profilesMap: Record<string, Profile> = {};
        profiles.forEach(profile => {
          if (profile) {
            profilesMap[profile.$id] = profile;
          }
        });
        setAuthorProfiles(profilesMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, profileId]);

  const handleCreatePost = async (postData: Partial<Post>, files?: File[]) => {
    if (!user || !currentUserProfile) {
      setError('You must be logged in to create a post');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let mediaFileIds: string[] = [];
      if (files && files.length > 0) {
        const uploadPromises = files.map(file => profileService.uploadPostMedia(file));
        const uploadedFiles = await Promise.all(uploadPromises);
        mediaFileIds = uploadedFiles.map(file => file.$id);
      }

      const newPostData = {
        ...postData,
        authorId: currentUserProfile.$id,
        media: mediaFileIds,
      };

      const newPost = await createPost(newPostData);
      setPosts(prevPosts => [newPost, ...prevPosts]);

      if (!authorProfiles[currentUserProfile.$id]) {
        setAuthorProfiles(prev => ({ ...prev, [currentUserProfile.$id]: currentUserProfile }));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLikePost = async (postId: string) => {
    // This functionality is not implemented in the new appwrite functions.
    // I will leave this as a TODO.
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(p => p.$id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    }
  };

  const handleEditPost = async (updatedPost: Post, files?: File[]) => {
    try {
      setIsSubmitting(true);
      
      let mediaFileIds: string[] = updatedPost.media || [];
      if (files && files.length > 0) {
        const uploadPromises = files.map(file => profileService.uploadPostMedia(file));
        const uploadedFiles = await Promise.all(uploadPromises);
        mediaFileIds = [...mediaFileIds, ...uploadedFiles.map(file => file.$id)];
      }

      const result = await updatePost(
        updatedPost.$id,
        {
          content: updatedPost.content,
          tags: updatedPost.tags,
          media: mediaFileIds,
        }
      );
      
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.$id === updatedPost.$id ? { ...p, ...result } : p
        )
      );
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {showPostForm && user && currentUserProfile && (
        <PostForm 
          onSubmit={handleCreatePost} 
          isSubmitting={isSubmitting}
          currentUserProfile={currentUserProfile}
        />
      )}
      
      {posts.length > 0 ? (
        posts.map(post => (
          <PostCard
            key={post.$id}
            post={post}
            authorProfile={authorProfiles[post.authorId]}
            onLike={handleLikePost}
            onDelete={handleDeletePost}
            onEdit={(post) => handleEditPost(post)}
          />
        ))
      ) : (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Typography variant="h6" color="text.secondary">
            {profileId 
              ? 'No posts found for this profile.' 
              : 'Your feed is empty. Follow other users to see their posts here.'}
          </Typography>
          {!profileId && (
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => window.location.href = '/explore'}
            >
              Explore Users
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default PostFeed;