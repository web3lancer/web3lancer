"use client";

import {
  Box,
  Typography,
  useTheme,
  Paper,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  TextField,
  Menu,
  MenuItem,
  Container,
  useMediaQuery,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  Snackbar,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  listPosts,
  createPost,
  updatePost,
  getPostInteraction,
  createPostInteraction,
  deletePostInteraction,
  getBookmark,
  createBookmark,
  deleteBookmark,
  getProfile,
  getFileViewUrl,
} from '@/lib/appwrite';
import type { Posts, Profiles } from '@/types/appwrite.d';
import { useInView } from 'react-intersection-observer';

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
import GridViewIcon from '@mui/icons-material/GridView';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CommentSection from '@/components/posts/CommentSection';

// Import Query from Appwrite SDK
import { Query } from "appwrite";

// You may need to define APP_URL if you use it in linkifyMentions
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

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

// Helper for profile pic (fix: this is not defined in your code)
function getProfilePictureUrl(pic: string) {
  // Update this function to match your backend implementation
  if (!pic) return "";
  // Example: if you store only fileId, and need to use getFileViewUrl
  return getFileViewUrl("", pic);
}

export default function HomeClient() {
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
  const [userProfiles, setUserProfiles] = useState<Record<string, Profiles | null>>({});
  const feedContainerRef = useRef<HTMLDivElement>(null); // Add ref for feed container
  const { ref: sentinelRef, inView } = useInView({ threshold: 0, rootMargin: '200px' }); // Add intersection observer
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [openCommentSection, setOpenCommentSection] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobBudget, setJobBudget] = useState('');

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
    if (user) {
      fetchUserProfile();
    }
    fetchLances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserProfile = async () => {
    if (user && user.$id) {
      try {
        const profile = await getProfile(user.$id);
        if (profile && profile.profilePicture) {
          setUserProfilePic(profile.profilePicture);
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
      let nextPage = refresh ? 1 : page;
      if (refresh) {
        setPage(1);
        setHasMore(true);
      }
      // Use listPosts from appwrite.ts
      const response = await listPosts([
        Query.orderDesc('$createdAt'),
        Query.limit(50),
        Query.offset((refresh ? 0 : (nextPage - 1) * 50))
      ]);
      const fetchedLances = response.documents.map((doc: Posts) => ({
        $id: doc.$id,
        userId: doc.authorId,
        content: doc.content,
        media: doc.media ? JSON.parse(doc.media as any) : [],
        likes: doc.likesCount || 0,
        comments: doc.commentsCount || 0,
        reposts: doc.repostsCount || 0,
        bookmarks: doc.bookmarksCount || 0,
        views: doc.viewsCount || 0,
        createdAt: doc.$createdAt!,
        updatedAt: doc.$updatedAt,
        visibility: doc.visibility || 'public',
        tags: doc.tags,
        isLiked: doc.isLiked,
        isBookmarked: doc.isBookmarked
      }));
      if (refresh) {
        setLances(fetchedLances);
      } else {
        setLances(prev => {
          const allLances = [...prev, ...fetchedLances];
          // Deduplicate by $id
          const uniqueLancesMap = new Map();
          allLances.forEach(lance => {
            uniqueLancesMap.set(lance.$id, lance);
          });
          return Array.from(uniqueLancesMap.values());
        });
      }
      setIsLoading(false);
      setHasMore(fetchedLances.length === 50);
      if (!refresh) setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching lances:', error);
      setIsLoading(false);
      showSnackbar('Failed to load posts', 'error');
    }
  };

  const fetchUserProfiles = useCallback(async (lancesList: Lance[]) => {
    const uniqueUserIds = Array.from(new Set(lancesList.map(l => l.userId)));
    const missingUserIds = uniqueUserIds.filter(id => !(id in userProfiles));
    if (missingUserIds.length === 0) return;
    const profiles: Record<string, Profiles | null> = { ...userProfiles };
    await Promise.all(missingUserIds.map(async (id) => {
      try {
        const profile = await getProfile(id);
        profiles[id] = profile;
      } catch (e) {
        profiles[id] = null;
      }
    }));
    setUserProfiles(profiles);
  }, [userProfiles]);

  useEffect(() => {
    if (lances.length > 0) {
      fetchUserProfiles(lances);
    }
  }, [lances, fetchUserProfiles]);

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

  // unused, but referenced in MenuItem onClick
  // const handleVisibilityChange = (event: React.MouseEvent<HTMLElement>, newVisibility: Lance['visibility']) => {
  //   if (newVisibility !== null) setSelectedVisibility(newVisibility);
  // };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchorEl(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchorEl(null);
  };

  const handleLikeToggle = async (id: string) => {
    if (!user) return;
    try {
      const lance = lances.find(l => l.$id === id);
      if (!lance) return;

      const interaction = await getPostInteraction(id, user.$id);
      if (interaction) {
        await deletePostInteraction(interaction.$id);
        await updatePost(id, { likesCount: lance.likes - 1 });
      } else {
        await createPostInteraction({ postId: id, userId: user.$id, interactions: 'like' });
        await updatePost(id, { likesCount: lance.likes + 1 });
      }
      fetchLances(true);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmarkToggle = async (id: string) => {
    if (!user) return;
    try {
      const lance = lances.find(l => l.$id === id);
      if (!lance) return;

      const bookmark = await getBookmark(id, user.$id);
      if (bookmark) {
        await deleteBookmark(bookmark.$id);
        await updatePost(id, { bookmarksCount: lance.bookmarks - 1 });
      } else {
        await createBookmark({ itemId: id, profileId: user.$id, itemType: 'post' });
        await updatePost(id, { bookmarksCount: lance.bookmarks + 1 });
      }
      fetchLances(true);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
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
    if (activeTab === 3) {
      if (!jobTitle.trim() || !jobDescription.trim()) {
        showSnackbar('Please fill out all job fields', 'warning');
        return;
      }
    } else {
      if (!newPostContent.trim() && selectedMedia.length === 0) {
        showSnackbar('Please enter some content or add media', 'warning');
        return;
      }
    }

    setIsLoading(true);
    try {
      let postData: Partial<Posts> & { postType?: string } = {
        authorId: user?.$id,
        likesCount: 0,
        commentsCount: 0,
        bookmarksCount: 0,
        viewsCount: 0,
        repostsCount: 0,
        visibility: selectedVisibility,
      };

      if (activeTab === 3) {
        postData = {
          ...postData,
          postType: 'job',
          content: `${jobTitle}\n\n${jobDescription}\n\nBudget: ${jobBudget}`,
          tags: ['job', ...jobTitle.split(' '), ...jobDescription.split(' ')],
        };
      } else {
        postData = {
          ...postData,
          content: newPostContent,
          tags: (newPostContent.match(/#(\w+)/g) || []) as string[],
        };
      }

      const doc = await createPost(postData);
      setLances(prev => [{
        $id: doc.$id,
        userId: doc.authorId,
        content: doc.content,
        media: doc.media ? JSON.parse(doc.media as any) : [],
        likes: doc.likesCount || 0,
        comments: doc.commentsCount || 0,
        reposts: doc.repostsCount || 0,
        bookmarks: doc.bookmarksCount || 0,
        views: doc.viewsCount || 0,
        createdAt: doc.$createdAt!,
        updatedAt: doc.$updatedAt,
        visibility: doc.visibility,
        tags: doc.tags,
        isLiked: false,
        isBookmarked: false
      }, ...prev]);
      setNewPostContent('');
      setJobTitle('');
      setJobDescription('');
      setJobBudget('');
      setSelectedMedia([]);
      setMediaPreview([]);
      setSelectedVisibility('public');
      showSnackbar('Post created successfully!', 'success');
    } catch (error) {
      console.error('Error creating post:', error);
      showSnackbar('Failed to create post', 'error');
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

  // Helper to linkify @mentions in post content
  const linkifyMentions = (text: string) => {
    const baseUrl = APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    return text.split(/(\s+)/).map((part, i) => {
      if (/^@([a-zA-Z0-9_\-.]{1,64})$/.test(part)) {
        const username = part.slice(1);
        return (
          <Link key={i} href={`${baseUrl}/u/${username}`} style={{ color: theme.palette.primary.main, textDecoration: 'underline' }}>
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const VisibilityIcon = visibilityOptions.find(option => option.value === selectedVisibility)?.icon || PublicIcon;

  // Infinite scroll effect using intersection observer
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      fetchLances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, hasMore, isLoading]); // Remove fetchLances from deps to avoid unwanted triggers

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
          <Box sx={{ width: '100%' }}>
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
                <Tab
                  icon={<TrendingUpIcon fontSize="small" />}
                  iconPosition="start"
                  label="Jobs"
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
                    <Avatar src={userProfilePic ? getProfilePictureUrl(userProfilePic) : undefined} />
                    <Box sx={{ flexGrow: 1 }}>
                      {activeTab === 3 ? (
                        <Box>
                          <TextField fullWidth placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} sx={{ mb: 1 }} />
                          <TextField fullWidth multiline rows={3} placeholder="Job Description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} sx={{ mb: 1 }} />
                          <TextField fullWidth placeholder="Budget" value={jobBudget} onChange={(e) => setJobBudget(e.target.value)} sx={{ mb: 1 }} />
                        </Box>
                      ) : (
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
                      )}

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

                      {/* Make action row sticky on mobile */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          position: { xs: 'sticky', sm: 'static' } as any,
                          bottom: { xs: 0, sm: 'auto' },
                          left: 0,
                          bgcolor: { xs: 'background.paper', sm: 'inherit' },
                          py: { xs: 1, sm: 0 },
                          zIndex: 2,
                          borderTop: { xs: `1px solid ${theme.palette.divider}`, sm: 'none' },
                          mt: { xs: 2, sm: 0 },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            overflowX: { xs: 'auto', sm: 'visible' },
                            maxWidth: { xs: '70vw', sm: 'none' },
                          }}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleMediaUpload}
                          />
                          {/* MOBILE: Combine first four icons into a dropdown, keep visibility separate */}
                          {isMobile ? (
                            <>
                              <Tooltip title="Add">
                                <IconButton
                                  color="primary"
                                  onClick={handleAddMenuOpen}
                                >
                                  <AddCircleOutlineIcon />
                                </IconButton>
                              </Tooltip>
                              <Menu
                                anchorEl={addMenuAnchorEl}
                                open={Boolean(addMenuAnchorEl)}
                                onClose={handleAddMenuClose}
                                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                              >
                                <MenuItem
                                  onClick={() => {
                                    fileInputRef.current?.click();
                                    handleAddMenuClose();
                                  }}
                                >
                                  <ImageIcon fontSize="small" sx={{ mr: 1 }} />
                                  Add Image
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    fileInputRef.current?.click();
                                    handleAddMenuClose();
                                  }}
                                >
                                  <VideocamIcon fontSize="small" sx={{ mr: 1 }} />
                                  Add Video
                                </MenuItem>
                                <MenuItem
                                  onClick={handleAddMenuClose}
                                >
                                  <EmojiEmotionsIcon fontSize="small" sx={{ mr: 1 }} />
                                  Add Emoji
                                </MenuItem>
                                <MenuItem
                                  onClick={handleAddMenuClose}
                                >
                                  <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                                  Add Location
                                </MenuItem>
                              </Menu>
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
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
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
                          sx={{
                            borderRadius: 6,
                            px: 3,
                            minWidth: 100,
                            ml: 2,
                            flexShrink: 0,
                            position: { xs: 'sticky', sm: 'static' } as any,
                            right: { xs: 0, sm: 'auto' },
                          }}
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
              <Box
                sx={{ pb: 4, width: '100%' }}
                ref={feedContainerRef}
              >
                {lances.map((lance) => {
                  const profile = userProfiles[lance.userId];
                  const userProfilePic = profile && profile.profilePicture ? getProfilePictureUrl(profile.profilePicture) : undefined;
                  const userName = profile && profile.username ? profile.username : lance.userId;
                  const userHandle = profile && profile.username ? profile.username : lance.userId;
                  return (
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
                        width: '100%'
                      }}
                    >
                      <CardContent sx={{ pb: 1, width: '100%' }}>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Avatar
                            src={userProfilePic}
                            component={Link}
                            href={`/u/${lance.userId}`}
                            sx={{
                              width: 48,
                              height: 48,
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.8 }
                            }}
                          />
                          <Box sx={{ flexGrow: 1, width: '100%' }}>
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
                                    {userName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    @{userHandle}
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
                              {linkifyMentions(lance.content)}
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
                                        src={getFileViewUrl('', media.fileId)}
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
                                        src={getFileViewUrl('', media.fileId)}
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
                              <IconButton size="small" onClick={() => setOpenCommentSection(openCommentSection === lance.$id ? null : lance.$id)}>
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
                        {openCommentSection === lance.$id && <CommentSection postId={lance.$id} />}
                      </CardContent>
                    </AnimatedCard>
                  );
                })}

                {/* Load more indicator */}
                {isLoading && lances.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}

                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} />

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
          </Box>
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