import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button, Alert, Paper } from '@mui/material';
import PostCard from './PostCard';
import PostForm from './PostForm';
import { Post, Profile } from '@/types';
import postService from '@/services/postService';
// import profileService from '@/services/profileService';
import { useAuth } from '@/contexts/AuthContext';


import ProfileService from "@/services/profileService";
import { AppwriteService } from "@/services/appwriteService";
import { envConfig } from "@/config/environment";


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
  
  // Fetch user profile and posts on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch current user's profile if logged in
        if (user && user.userId) {
          const userProfile = await profileService.getProfileByUserId(user.$id);
          setCurrentUserProfile(userProfile);
        }
        
        // Fetch posts (either user's posts or feed)
        let fetchedPosts: Post[];
        if (profileId) {
          fetchedPosts = await postService.getUserPosts(profileId);
        } else {
          fetchedPosts = await postService.getFeed();
        }
        
        setPosts(fetchedPosts);
        
        // Fetch author profiles for each post
        const authorIds = [...new Set(fetchedPosts.map(post => post.authorId))];
        const profilePromises = authorIds.map(id => profileService.getProfile(id));
        const profiles = await Promise.all(profilePromises);
        
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
      
      const newPost = await postService.createPost(
        currentUserProfile.$id,
        postData.content || '',
        postData.tags || [],
        files
      );
      
      // Add to posts list
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      // Ensure we have the author profile
      if (!authorProfiles[currentUserProfile.$id]) {
        setAuthorProfiles(prev => ({
          ...prev,
          [currentUserProfile.$id]: currentUserProfile
        }));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLikePost = async (postId: string) => {
    if (!user) {
      setError('You must be logged in to like posts');
      return;
    }
    
    try {
      const post = posts.find(p => p.$id === postId);
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      if (post.isLikedByCurrentUser) {
        await postService.unlikePost(postId);
      } else {
        await postService.likePost(postId);
      }
      
      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.$id === postId 
            ? { 
                ...p, 
                isLikedByCurrentUser: !p.isLikedByCurrentUser,
                likesCount: p.isLikedByCurrentUser 
                  ? Math.max((p.likesCount || 0) - 1, 0) 
                  : (p.likesCount || 0) + 1
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      setError('Failed to update like status. Please try again.');
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    try {
      await postService.deletePost(postId);
      
      // Remove from posts list
      setPosts(prevPosts => prevPosts.filter(p => p.$id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
    }
  };
  
  const handleEditPost = async (updatedPost: Post, files?: File[]) => {
    try {
      setIsSubmitting(true);
      
      const result = await postService.updatePost(
        updatedPost.$id,
        {
          content: updatedPost.content,
          tags: updatedPost.tags
        },
        files
      );
      
      // Update in posts list
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