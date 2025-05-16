"use client";

import { 
  Box, 
  Typography, 
  useTheme, 
  Paper, 
  Avatar, 
  CircularProgress, 
  Divider, 
  Card, 
  CardContent,
  Button,
  Chip,
  IconButton,
  TextField,
  Menu,
  MenuItem,
  CardMedia,
  CardActions,
  Container,
  useMediaQuery,
  Tooltip,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
  InputAdornment
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getUserProfile, getProfilePictureUrl } from '@/utils/api'; 
import { APPWRITE_CONFIG } from '@/lib/env';
import { CONTENT_DATABASE_ID, USER_POSTS_COLLECTION_ID, POST_ATTACHMENTS_BUCKET_ID } from '@/lib/env';
import { Client, Databases, Storage, ID, Query } from 'appwrite';

// Icons
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
import ShareIcon from '@mui/icons-material/Share';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import PeopleIcon from '@mui/icons-material/People';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GridViewIcon from '@mui/icons-material/GridView';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ReportIcon from '@mui/icons-material/Report';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

const AnimatedCard = motion(Card);

// Types for lances (posts)
interface Media {
  type: 'image' | 'video' | 'code';
  fileId: string;
  thumbnailFileId?: string;
}

interface Lance {
  $id: string;
  userId: string;
  content: string;
  media?: Media[];
  likes: number;
  comments: number;
  reposts: number;
  bookmarks: number;
  views: number;
  createdAt: string;
  updatedAt?: string;
  visibility: 'public' | 'private' | 'followers' | 'following' | 'specific';
  tags?: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface VisibilityOption {
  value: Lance['visibility'];
  label: string;
  icon: React.ElementType;
}

export default function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [lances, setLances] = useState<Lance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [selectedVisibility, setSelectedVisibility] = useState<Lance['visibility']>('public');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const client = useRef<Client | null>(null);
  const databases = useRef<Databases | null>(null);
  const storage = useRef<Storage | null>(null);
  
  // Mock trending topics
  const trendingTopics = [
    { tag: '#Web3', count: '5.2K' },
    { tag: '#Blockchain', count: '3.8K' },
    { tag: '#SmartContracts', count: '2.9K' },
    { tag: '#NFTs', count: '2.1K' },
    { tag: '#DeFi', count: '1.7K' }
  ];

  const visibilityOptions: VisibilityOption[] = [
    { value: 'public', label: 'Everyone', icon: PublicIcon },
    { value: 'private', label: 'Only me', icon: LockIcon },
    { value: 'followers', label: 'People who follow me', icon: PeopleIcon },
    { value: 'following', label: 'People I follow', icon: PeopleIcon },
  ];

  useEffect(() => {
    client.current = new Client();
    client.current.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!).setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
    databases.current = new Databases(client.current);
    storage.current = new Storage(client.current);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
    fetchLances();
  }, [user]);

  const fetchUserProfile = async () => {
    if (user && user.$id) {
      try {
        const profile = await getUserProfile(user.$id);
        if (profile && profile.profilePicture) {
          setUserProfilePic(getProfilePictureUrl(profile.profilePicture));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  };

  // Function to fetch lances (posts)
  const fetchLances = async (refresh = false) => {
    try {
      setIsLoading(true);
      if (refresh) {
        setPage(1);
        setHasMore(true);
      }
      if (!databases.current) return;
      const response = await databases.current.listDocuments(
        CONTENT_DATABASE_ID,
        USER_POSTS_COLLECTION_ID,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(10),
          Query.offset((refresh ? 0 : (page - 1) * 10))
        ]
      );
      const fetchedLances = response.documents.map((doc: any) => ({
        $id: doc.$id,
        userId: doc.authorId,
        content: doc.content,
        media: doc.media ? JSON.parse(doc.media) : [],
        likes: doc.likesCount || 0,
        comments: doc.commentsCount || 0,
        reposts: doc.repostsCount || 0,
        bookmarks: doc.bookmarksCount || 0,
        views: doc.viewsCount || 0,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
        visibility: doc.visibility || 'public',
        tags: doc.tags,
        isLiked: doc.isLiked,
        isBookmarked: doc.isBookmarked
      }));
      if (refresh) {
        setLances(fetchedLances);
      } else {
        setLances(prev => [...prev, ...fetchedLances]);
      }
      setIsLoading(false);
      setHasMore(fetchedLances.length === 10);
      if (!refresh) setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching lances:', error);
      setIsLoading(false);
      showSnackbar('Failed to load posts', 'error');
    }
  };

  const handleRefresh = () => {
    fetchLances(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // In a real app, you would fetch different content based on the active tab
    handleRefresh();
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedMedia(prev => [...prev, ...newFiles]);

    // Generate previews for the new files
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setMediaPreview(prev => [...prev, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => {
      // Revoke the URL to avoid memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleVisibilityChange = (event: React.MouseEvent<HTMLElement>, newVisibility: Lance['visibility']) => {
    if (newVisibility !== null) {
      setSelectedVisibility(newVisibility);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLikeToggle = (id: string) => {
    setLances(prev => 
      prev.map(lance => 
        lance.$id === id 
          ? { 
              ...lance, 
              isLiked: !lance.isLiked,
              likes: lance.isLiked ? lance.likes - 1 : lance.likes + 1 
            } 
          : lance
      )
    );
    // In a real app, you would also update this on the server
  };

  const handleBookmarkToggle = (id: string) => {
    setLances(prev => 
      prev.map(lance => 
        lance.$id === id 
          ? { ...lance, isBookmarked: !lance.isBookmarked } 
          : lance
      )
    );
    // In a real app, you would also update this on the server
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() && selectedMedia.length === 0) {
      showSnackbar('Please enter some content or add media', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      let media: Media[] = [];
      if (selectedMedia.length > 0 && storage.current) {
        const uploadPromises = selectedMedia.map(file =>
          storage.current!.createFile(POST_ATTACHMENTS_BUCKET_ID, ID.unique(), file)
        );
        const uploadResults = await Promise.all(uploadPromises);
        media = uploadResults.map(result => ({
          type: result.mimeType && result.mimeType.startsWith('video') ? 'video' : 'image',
          fileId: result.$id
        }));
      }
      if (!databases.current) throw new Error('Database not initialized');
      const doc = await databases.current.createDocument(
        CONTENT_DATABASE_ID,
        USER_POSTS_COLLECTION_ID,
        ID.unique(),
        {
          authorId: user?.$id,
          content: newPostContent,
          media,
          likesCount: 0,
          commentsCount: 0,
          bookmarksCount: 0,
          viewsCount: 0,
          repostsCount: 0,
          visibility: selectedVisibility,
          tags: (newPostContent.match(/#(\w+)/g) || []) as string[],
        }
      );
      setLances(prev => [{
        $id: doc.$id,
        userId: doc.authorId,
        content: doc.content,
        media: doc.media,
        likes: doc.likesCount || 0,
        comments: doc.commentsCount || 0,
        reposts: doc.repostsCount || 0,
        bookmarks: doc.bookmarksCount || 0,
        views: doc.viewsCount || 0,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
        visibility: doc.visibility,
        tags: doc.tags,
        isLiked: false,
        isBookmarked: false
      }, ...prev]);
      setNewPostContent('');
      setSelectedMedia([]);
      setMediaPreview([]);
      setSelectedVisibility('public');
      showSnackbar('Lance posted successfully!', 'success');
    } catch (error) {
      console.error('Error posting lance:', error);
      showSnackbar('Failed to post lance', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPostDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return date.toLocaleDateString();
  };

  const VisibilityIcon = visibilityOptions.find(option => option.value === selectedVisibility)?.icon || PublicIcon;

  return (
    <Container maxWidth="lg" sx={{ pt: 0, mb: 8 }}>
      <Grid container spacing={3} sx={{ mt: -1.5 }}>
        {/* Left sidebar - only on desktop */}
        {!isMobile && (
          <Grid item xs={12} md={3} lg={2.5} sx={{ display: { xs: 'none', md: 'block' } }}>
            {/* Left sidebar content */}
          </Grid>
        )}

        {/* Main content */}
        <Grid item xs={12} md={6} lg={6}>
          {/* Fixed tabs section at the top */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px 16px 0 0',
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: theme.palette.background.paper,
              mb: 2,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="feed tabs"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Tab
                icon={<GridViewIcon fontSize="small" />}
                iconPosition="start"
                label="For You"
              />
              <Tab
                icon={<TrendingUpIcon fontSize="small" />}
                iconPosition="start"
                label="Trending"
              />
              <Tab
                icon={<PeopleIcon fontSize="small" />}
                iconPosition="start"
                label="Following"
              />
            </Tabs>
          </Paper>

          {/* Post creation box - only for signed in users */}
          {user && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                mb: 3,
              }}
            >
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Avatar src={userProfilePic || undefined} />
                  <Box sx={{ flexGrow: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="What's happening in the web3 world?"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      variant="outlined"
                      sx={{
                        mb: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                      InputProps={{
                        sx: { p: 1.5 }
                      }}
                    />

                    {/* Media preview */}
                    {mediaPreview.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {mediaPreview.map((preview, index) => (
                          <Box key={index} sx={{ position: 'relative', width: 100, height: 100 }}>
                            <img
                              src={preview}
                              alt={`Preview ${index}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 8,
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => removeMedia(index)}
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                p: 0.5,
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          style={{ display: 'none' }}
                          ref={fileInputRef}
                          onChange={handleMediaUpload}
                        />
                        <Tooltip title="Add Image">
                          <IconButton
                            color="primary"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <ImageIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add Video">
                          <IconButton
                            color="primary"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <VideocamIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add Emoji">
                          <IconButton color="primary">
                            <EmojiEmotionsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add Location">
                          <IconButton color="primary">
                            <LocationOnIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Visibility">
                          <IconButton
                            color="primary"
                            onClick={handleMenuOpen}
                            aria-controls="visibility-menu"
                            aria-haspopup="true"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Menu
                          id="visibility-menu"
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                        >
                          {visibilityOptions.map((option) => (
                            <MenuItem
                              key={option.value}
                              onClick={() => {
                                setSelectedVisibility(option.value);
                                handleMenuClose();
                              }}
                              selected={selectedVisibility === option.value}
                            >
                              <option.icon fontSize="small" sx={{ mr: 1 }} />
                              {option.label}
                            </MenuItem>
                          ))}
                        </Menu>
                      </Box>
                      <Button
                        variant="contained"
                        disableElevation
                        endIcon={<SendIcon />}
                        onClick={handlePostSubmit}
                        disabled={isLoading || (!newPostContent.trim() && selectedMedia.length === 0)}
                        sx={{ borderRadius: 6, px: 3 }}
                      >
                        Lance it
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Scrollable feed content - individual lance cards */}
          {isLoading && lances.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pb: 4 }}>
              {lances.map((lance) => (
                <AnimatedCard
                  key={lance.$id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  sx={{
                    mb: 2.5,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { bgcolor: 'action.hover' },
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Avatar 
                        src={lance.userProfilePic} 
                        component={Link}
                        href={`/u/${lance.userId}`}
                        sx={{ 
                          width: 48, 
                          height: 48,
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 } 
                        }} 
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography 
                                variant="subtitle1" 
                                component={Link}
                                href={`/u/${lance.userId}`}
                                sx={{ 
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  color: 'text.primary',
                                  '&:hover': { textDecoration: 'underline' } 
                                }}
                              >
                                {lance.userName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                @{lance.userHandle}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                · {formatPostDate(lance.createdAt)}
                              </Typography>
                            </Box>
                            {lance.visibility !== 'public' && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                {lance.visibility === 'private' && <LockIcon sx={{ fontSize: 14, mr: 0.5 }} />}
                                {lance.visibility === 'followers' && <PeopleIcon sx={{ fontSize: 14, mr: 0.5 }} />}
                                {lance.visibility === 'following' && <PeopleIcon sx={{ fontSize: 14, mr: 0.5 }} />}
                                <Typography variant="caption" color="text.secondary">
                                  {visibilityOptions.find(opt => opt.value === lance.visibility)?.label}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <IconButton size="small">
                            <MoreHorizIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Typography variant="body1" sx={{ my: 1, whiteSpace: 'pre-wrap' }}>
                          {lance.content}
                        </Typography>

                        {/* Tags */}
                        {lance.tags && lance.tags.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                            {lance.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                component={Link}
                                href={`/search?q=${encodeURIComponent(tag)}`}
                                clickable
                                sx={{ 
                                  borderRadius: 1,
                                  height: 24,
                                  bgcolor: `${theme.palette.primary.main}15`,
                                  color: theme.palette.primary.main,
                                  '&:hover': { bgcolor: `${theme.palette.primary.main}25` },
                                  textDecoration: 'none'
                                }}
                              />
                            ))}
                          </Box>
                        )}

                        {/* Media */}
                        {lance.media && lance.media.length > 0 && (
                          <Box sx={{ mt: 1, mb: 2 }}>
                            {lance.media.map((media, index) => (
                              <Box 
                                key={index} 
                                sx={{ 
                                  borderRadius: 2, 
                                  overflow: 'hidden',
                                  ...(lance.media && lance.media.length > 1 ? {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: 1
                                  } : {})
                                }}
                              >
                                {media.type === 'image' ? (
                                  <img
                                    src={storage.current?.getFileView(POST_ATTACHMENTS_BUCKET_ID, media.fileId).toString()}
                                    alt="Post media"
                                    style={{
                                      width: '100%',
                                      borderRadius: 8,
                                      objectFit: 'cover',
                                      aspectRatio: '16/9',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => setDialogOpen(true)}
                                  />
                                ) : media.type === 'video' ? (
                                  <Box
                                    component="video"
                                    src={storage.current?.getFileView(POST_ATTACHMENTS_BUCKET_ID, media.fileId).toString()}
                                    controls
                                    sx={{ width: '100%', borderRadius: 2 }}
                                  />
                                ) : null}
                              </Box>
                            ))}
                          </Box>
                        )}

                        {/* Action buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleLikeToggle(lance.$id)}
                            color={lance.isLiked ? 'primary' : 'default'}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {lance.isLiked ? (
                                <FavoriteIcon fontSize="small" />
                              ) : (
                                <FavoriteBorderIcon fontSize="small" />
                              )}
                              <Typography variant="caption" sx={{ ml: 0.5 }}>
                                {lance.likes}
                              </Typography>
                            </Box>
                          </IconButton>
                          <IconButton size="small">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <ChatBubbleOutlineIcon fontSize="small" />
                              <Typography variant="caption" sx={{ ml: 0.5 }}>
                                {lance.comments}
                              </Typography>
                            </Box>
                          </IconButton>
                          <IconButton size="small">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <RepeatIcon fontSize="small" />
                              <Typography variant="caption" sx={{ ml: 0.5 }}>
                                {lance.reposts}
                              </Typography>
                            </Box>
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleBookmarkToggle(lance.$id)}
                            color={lance.isBookmarked ? 'primary' : 'default'}
                          >
                            {lance.isBookmarked ? (
                              <BookmarkIcon fontSize="small" />
                            ) : (
                              <BookmarkBorderIcon fontSize="small" />
                            )}
                          </IconButton>
                          <IconButton size="small">
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </AnimatedCard>
              ))}

              {/* Load more indicator */}
              {isLoading && lances.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {/* End of feed message */}
              {!isLoading && !hasMore && (
                <Box sx={{ py: 3, textAlign: 'center', mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    You've reached the end of your feed
                  </Typography>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    sx={{ mt: 1 }}
                  >
                    Refresh Feed
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Grid>

        {/* Right sidebar - only on desktop/tablet */}
        <Grid item xs={12} md={3} lg={3.5} sx={{ display: { xs: 'none', md: 'block' } }}>
          {/* Right sidebar content */}
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Media preview dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.4)', color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src="https://picsum.photos/1000/600"
            alt="Full size media"
            style={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}