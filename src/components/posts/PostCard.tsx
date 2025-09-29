import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Post, Profile } from '@/types';
import { Card, CardHeader, CardContent, CardActions, Avatar, Typography, IconButton, Box, Chip, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, Comment as CommentIcon, Share as ShareIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { getFilePreviewUrl } from '@/lib/appwrites/storage';
import { BUCKET as BUCKET_ID } from '@/lib/appwrites/constants';

interface PostCardProps {
  post: Post;
  authorProfile?: Profile;
  onLike?: (postId: string) => Promise<void>;
  onDelete?: (postId: string) => Promise<void>;
  onEdit?: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  authorProfile, 
  onLike, 
  onDelete, 
  onEdit 
}) => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  
  const isCurrentUserAuthor = user && authorProfile && user.userId === authorProfile.userId;
  
  const authorAvatarUrl = authorProfile?.avatarFileId
    ? getFilePreviewUrl(BUCKET_ID.PROFILE_AVATARS, authorProfile.avatarFileId)
    : '/images/default-avatar.png';
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLikeClick = async () => {
    if (onLike) {
      try {
        await onLike(post.$id);
        setIsLiked(!isLiked);
        setLikesCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
      } catch (error) {
        console.error('Error liking post:', error);
      }
    }
  };
  
  const handleEditClick = () => {
    if (onEdit) {
      onEdit(post);
    }
    handleMenuClose();
  };
  
  const handleDeleteClick = async () => {
    if (onDelete) {
      if (window.confirm('Are you sure you want to delete this post?')) {
        try {
          await onDelete(post.$id);
        } catch (error) {
          console.error('Error deleting post:', error);
        }
      }
    }
    handleMenuClose();
  };
  
  // Format date
  const formattedDate = post.createdAt 
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : '';
  
  return (
    <Card sx={{ 
      mb: 2, 
      borderRadius: 2,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
      }
    }}>
      <CardHeader
        avatar={
          <Link href={`/profile/${authorProfile?.username || authorProfile?.$id || 'unknown'}`}>
            <Avatar src={authorAvatarUrl} alt={authorProfile?.displayName || 'Unknown User'} />
          </Link>
        }
        action={
          isCurrentUserAuthor && (
            <>
              <IconButton onClick={handleMenuOpen} aria-label="settings">
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleEditClick}>Edit</MenuItem>
                <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
              </Menu>
            </>
          )
        }
        title={
          <Link href={`/profile/${authorProfile?.username || authorProfile?.$id || 'unknown'}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="subtitle1" component="span" fontWeight="bold">
              {authorProfile?.displayName || 'Unknown User'}
            </Typography>
          </Link>
        }
        subheader={formattedDate}
      />
      
      <CardContent>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {post.content}
        </Typography>
        
        {/* Display post media if available */}
        {post.media && post.media.length > 0 && (
          <Box sx={{ mt: 2, borderRadius: 1, overflow: 'hidden' }}>
            {post.media.map((mediaId, index) => (
              <Box 
                key={index} 
                sx={{ 
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%', // 16:9 aspect ratio
                  mb: index < post.media.length - 1 ? 1 : 0
                }}
              >
                <Image
                  src={getFilePreviewUrl(BUCKET_ID.MESSAGE_ATTACHMENTS, mediaId)}
                  alt={`Post media ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                />
              </Box>
            ))}
          </Box>
        )}
        
        {/* Display tags if available */}
        {post.tags && post.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {post.tags.map((tag, index) => (
              <Chip
                key={index}
                label={`#${tag}`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
        )}
      </CardContent>
      
      <CardActions disableSpacing sx={{ px: 2, pb: 2 }}>
        <IconButton 
          aria-label="like" 
          onClick={handleLikeClick}
          color={isLiked ? 'primary' : 'default'}
        >
          {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {likesCount > 0 ? likesCount : ''}
        </Typography>
        
        <Link href={`/posts/${post.$id}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
          <IconButton aria-label="comments">
            <CommentIcon />
          </IconButton>
        </Link>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {post.commentsCount || ''}
        </Typography>
        
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default PostCard;