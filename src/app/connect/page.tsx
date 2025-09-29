"use client";
import React, { useEffect, useState, useCallback } from "react";
import { 
  Typography, Grid, Avatar, Button, Alert, CircularProgress,
  TextField, IconButton, Tabs, Tab, Badge, List, ListItem, ListItemAvatar, ListItemText, 
  Box, Container, Paper, Chip, InputAdornment, useTheme, ListItemButton
} from "@mui/material";
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CallIcon from '@mui/icons-material/Call';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import * as social from '@/lib/appwrites/social';
import { Query } from 'appwrite';
import type { Models } from 'appwrite';
import { client } from '@/lib/appwrites/client';
import ProfileService from "@/services/profileService";
import { AppwriteService } from "@/services/appwriteService";
import { envConfig } from "@/config/environment";

const appwriteService = new AppwriteService(envConfig);
const profileService = new ProfileService(appwriteService, envConfig);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

type User = Models.Document & {
  name: string;
  email: string;
  status: string;
  avatarUrl?: string;
};

type Message = Models.Document & {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  senderName: string;
};

type FriendRequest = Models.Document & {
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  senderName: string;
};

interface Space {
  id: string;
  name: string;
  type: 'voice' | 'video';
  participants: number;
  hostId: string;
}

interface Activity {
  type: string;
  user: string;
  time: string;
}

export default function ConnectPage() {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [liveActivities, setLiveActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [activeSpaces, setActiveSpaces] = useState<Space[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [profilesResponse, connectionsResponse] = await Promise.all([
        profileService.listProfiles(),
        social.listConnections([
          Query.or([
            Query.equal('followerId', user.$id),
            Query.equal('followingId', user.$id)
          ])
        ])
      ]);

      const profilesData = profilesResponse as unknown as User[];
      const connectionsData = connectionsResponse.documents as unknown as FriendRequest[];

      const friendRequestsData = connectionsData.filter(c => c.status === 'pending' && c.receiverId === user.$id);

      const usersWithStatus = profilesData.map(p => {
        const connection = connectionsData.find(c => c.followerId === user.$id && c.followingId === p.$id);
        return {
          ...p,
          status: connection ? connection.status : 'not-connected'
        };
      });

      setUsers(usersWithStatus);
      setFriendRequests(friendRequestsData);

      if (selectedChat) {
        const messagesResponse = await social.listMessages([
          Query.or([
            Query.and([Query.equal('senderId', user.$id), Query.equal('receiverId', selectedChat)]),
            Query.and([Query.equal('senderId', selectedChat), Query.equal('receiverId', user.$id)])
          ]),
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]);
        setMessages(messagesResponse.documents as unknown as Message[]);
      }

    } catch (error) {
      console.error('Error loading connect page data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user, selectedChat]);

  useEffect(() => {
    loadData();

    const unsubscribe = client.subscribe(`databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_SOCIAL_ID}.collections.${process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DIRECT_MESSAGES_ID}.documents`, response => {
      if (response.events.includes("databases.*.collections.*.documents.*.create")) {
        setMessages(prevMessages => [response.payload as unknown as Message, ...prevMessages]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !user) return;

    const newMessageData = {
      senderId: user.$id,
      receiverId: selectedChat,
      content: message,
      senderName: user.name || 'User',
      chatId: [user.$id, selectedChat].sort().join('_'),
      contentType: 'text' as const,
    };

    setMessage('');

    try {
      const newMessage = await social.createMessage(newMessageData);
      setMessages(prevMessages => [newMessage as unknown as Message, ...prevMessages]);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message.");
      setMessage(newMessageData.content);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    if (!user) return;

    try {
      await social.createConnection({
        followerId: user.$id,
        followingId: userId,
        connectionType: 'friend_request' as const,
        status: 'pending' as const,
      });
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error sending friend request:", error);
      setError("Failed to send friend request.");
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      await social.updateConnection(requestId, { status: 'accepted' as const });
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error accepting friend request:", error);
      setError("Failed to accept friend request.");
    }
  };

  const handleDeclineFriendRequest = async (requestId: string) => {
    try {
      await social.deleteConnection(requestId);
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error declining friend request:", error);
      setError("Failed to decline friend request.");
    }
  };

  const handleJoinSpace = (spaceId: string) => {
    console.log(`Joining space ${spaceId}`);
  };

  const handleCreateSpace = async () => {
    if (!user) return;
    
    const newSpaceData = {
      name: `${user.name || 'User'}'s Space`,
      type: 'voice',
      participants: 1,
      hostId: user.$id,
    };

    try {
      console.log("Creating space via Appwrite:", newSpaceData);
      const mockNewSpace: Space = {
        id: `space${Date.now()}`,
        ...newSpaceData,
        type: newSpaceData.type as 'voice' | 'video',
      };
      setActiveSpaces([...activeSpaces, mockNewSpace]);
    } catch (error) {
      console.error("Error creating space:", error);
      setError("Failed to create space.");
    }
  };

  const handleStartVoiceCall = () => {
    const callId = uuidv4();
    router.push(`/connect/spaces/voice/${callId}`);
  };

  const handleStartVideoCall = () => {
    const callId = uuidv4();
    router.push(`/connect/spaces/video/${callId}`);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filterUsers = (users: User[]) => {
    if (!searchQuery) return users;
    return users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 64px)',
        flexDirection: 'column',
        gap: 2,
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={50} thickness={3} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading connections...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <motion.div>
        <motion.div variants={itemVariants}>
          <Typography variant="h4" sx={{ mb: { xs: 2, md: 3 }, fontWeight: 600, color: 'text.primary', fontSize: { xs: 24, md: 32 } }}>
            Connect
          </Typography>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              mb: 3, 
              bgcolor: 'background.paper', 
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              width: '100%',
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              indicatorColor="primary"
              textColor="primary"
              sx={{ 
                '& .MuiTabs-indicator': { height: 3 },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  py: 1.5,
                  minHeight: 'auto',
                  '&.Mui-selected': { fontWeight: 600 },
                  '& .MuiBadge-badge': { top: 8, right: -4 }
                }
              }}
            >
              <Tab icon={<ChatOutlinedIcon sx={{ mb: 0.5 }} />} iconPosition="start" label="Chat" />
              <Tab icon={<Badge badgeContent={friendRequests.filter(r => r.status === 'pending' && r.receiverId === user?.$id).length} color="error"><PeopleAltOutlinedIcon sx={{ mb: 0.5 }} /></Badge>} iconPosition="start" label="Connections" />
              <Tab icon={<GroupsOutlinedIcon sx={{ mb: 0.5 }} />} iconPosition="start" label="Spaces" />
            </Tabs>
          </Paper>
        </motion.div>

        <Grid container spacing={{ xs: 1, md: 3 }}>
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              {tabValue === 0 && (
                <Box>
                  <Grid container spacing={2}>
                    {/* On mobile, show contacts as a Drawer */}
                    <Grid item xs={12} sm={5} md={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          height: { xs: 'auto', sm: 'calc(100vh - 200px)' },
                          minHeight: 300,
                          overflow: 'hidden', 
                          borderRadius: 3, 
                          border: `1px solid ${theme.palette.divider}`,
                          flexDirection: 'column',
                          position: { xs: 'fixed', sm: 'static' },
                          zIndex: { xs: 1200, sm: 'auto' },
                          width: { xs: selectedChat ? 0 : '100vw', sm: 'auto' },
                          left: 0,
                          top: 64,
                          bgcolor: 'background.paper',
                          transition: 'width 0.3s',
                          boxShadow: { xs: 3, sm: 0 },
                          display: { xs: selectedChat ? 'none' : 'flex', sm: 'flex' },
                        }}
                      >
                        <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <TextField
                            fullWidth
                            placeholder="Search contacts"
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                              ),
                              sx: { borderRadius: 2, bgcolor: theme.palette.background.default }
                            }}
                          />
                        </Box>
                        <List sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
                          {filterUsers(users).map((contact) => (
                            <ListItem key={contact.$id} disableGutters sx={{ px: 0 }}>
                              <ListItemButton
                                onClick={() => setSelectedChat(contact.$id)}
                                selected={selectedChat === contact.$id}
                                sx={{
                                  px: 1.5,
                                  py: 1,
                                  borderRadius: 2,
                                  mx: 1,
                                  my: 0.5,
                                  cursor: 'pointer',
                                  transition: 'background 0.2s',
                                  '&.Mui-selected': {
                                    bgcolor: theme.palette.action.selected,
                                    '&:hover': { bgcolor: theme.palette.action.selected }
                                  },
                                  '&:hover': { bgcolor: theme.palette.action.hover }
                                }}
                              >
                                <ListItemAvatar sx={{ minWidth: 'auto', mr: 1.5 }}>
                                  <Badge
                                    sx={{
                                      '& .MuiBadge-dot': {
                                        border: `2px solid ${theme.palette.background.paper}`,
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%'
                                      }
                                    }}
                                  >
                                    <Avatar 
                                      src={contact.avatarUrl}
                                      sx={{ width: 40, height: 40 }}
                                    >
                                      {contact.name[0]}
                                    </Avatar>
                                  </Badge>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={
                                    <Typography variant="body1" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {contact.name}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="caption" sx={{ 
                                      color: contact.status === 'online' ? 'success.main' : (contact.status === 'away' ? 'warning.main' : 'text.disabled'),
                                      fontWeight: 500
                                    }}>
                                      {contact.status}
                                    </Typography>
                                  }
                                />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={7} md={8}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          height: { xs: 'auto', sm: 'calc(100vh - 200px)' },
                          minHeight: 400,
                          display: 'flex', 
                          flexDirection: 'column', 
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: `1px solid ${theme.palette.divider}`,
                          width: '100%',
                          position: 'relative',
                        }}
                      >
                        {/* Add a back button for mobile to return to contacts */}
                        {selectedChat && (
                          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', p: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                            <IconButton onClick={() => setSelectedChat(null)} size="small">
                              <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, ml: 1, color: 'text.primary' }}>
                              Contacts
                            </Typography>
                          </Box>
                        )}
                        {selectedChat ? (
                          <>
                            <Box sx={{ 
                              p: 1.5,
                              borderBottom: `1px solid ${theme.palette.divider}`, 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              bgcolor: 'background.paper'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Badge
                                  sx={{
                                    '& .MuiBadge-dot': {
                                      border: `2px solid ${theme.palette.background.paper}`,
                                      width: 10,
                                      height: 10,
                                      borderRadius: '50%'
                                    }
                                  }}
                                >
                                  <Avatar 
                                    src={users.find(u => u.$id === selectedChat)?.avatarUrl}
                                    sx={{ width: 36, height: 36 }}
                                  >
                                    {users.find(u => u.$id === selectedChat)?.name[0]}
                                  </Avatar>
                                </Badge>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {users.find(u => u.$id === selectedChat)?.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    color: users.find(u => u.$id === selectedChat)?.status === 'online' ? 'success.main' : (users.find(u => u.$id === selectedChat)?.status === 'away' ? 'warning.main' : 'text.disabled'),
                                    fontWeight: 500
                                  }}>
                                    {users.find(u => u.$id === selectedChat)?.status}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box>
                                <IconButton size="small" color="primary" sx={{ mr: 0.5 }}>
                                  <CallIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="primary">
                                  <VideoCallIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            <Box sx={{ 
                              flexGrow: 1, 
                              overflow: 'auto', 
                              p: 2, 
                              display: 'flex', 
                              flexDirection: 'column-reverse',
                              bgcolor: theme.palette.background.default
                            }}>
                              <Box sx={{ mb: 1 }}> 
                                {messages
                                  .filter(m => 
                                    (m.senderId === selectedChat && m.receiverId === user?.$id) || 
                                    (m.senderId === user?.$id && m.receiverId === selectedChat)
                                  )
                                  .map((msg) => (
                                    <motion.div key={msg.id}>
                                      <Box 
                                        sx={{ 
                                          display: 'flex', 
                                          justifyContent: msg.senderId === user?.$id ? 'flex-end' : 'flex-start',
                                          mb: 1.5
                                        }}
                                      >
                                        {msg.senderId !== user?.$id && (
                                          <Avatar 
                                            src={users.find(u => u.$id === msg.senderId)?.avatarUrl} 
                                            sx={{ mr: 1, width: 28, height: 28, alignSelf: 'flex-end' }}
                                          >
                                            {msg.senderName[0]}
                                          </Avatar>
                                        )}
                                        <Box 
                                          sx={{ 
                                            p: '8px 14px',
                                            bgcolor: msg.senderId === user?.$id ? 'primary.main' : 'background.paper',
                                            color: msg.senderId === user?.$id ? 'primary.contrastText' : 'text.primary',
                                            borderRadius: msg.senderId === user?.$id 
                                              ? '16px 16px 4px 16px'
                                              : '4px 16px 16px 16px',
                                            maxWidth: '75%',
                                            boxShadow: theme.shadows[1],
                                            wordBreak: 'break-word'
                                          }}
                                        >
                                          <Typography variant="body2">{msg.content}</Typography>
                                          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', textAlign: 'right', mt: 0.5, fontSize: '0.65rem' }}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </motion.div>
                                  ))}
                              </Box>
                            </Box>
                            <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', bgcolor: 'background.paper' }}>
                              <TextField
                                fullWidth
                                placeholder="Type a message..."
                                variant="outlined"
                                size="small"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                InputProps={{ 
                                  sx: { borderRadius: 5, bgcolor: theme.palette.background.default }
                                }}
                                sx={{ mr: 1 }}
                              />
                              <IconButton 
                                color="primary" 
                                onClick={handleSendMessage} 
                                disabled={!message.trim()}
                                sx={{ 
                                  bgcolor: 'primary.main', 
                                  color: theme.palette.primary.contrastText, // Changed from 'white'
                                  '&:hover': { 
                                    bgcolor: 'primary.dark' 
                                  },
                                  '&.Mui-disabled': {
                                    bgcolor: 'action.disabledBackground',
                                    color: theme.palette.action.disabled, // Added for disabled icon color
                                  },
                                  width: 40,
                                  height: 40
                                }}
                              >
                                <SendIcon fontSize="small"/>
                              </IconButton>
                            </Box>
                          </>
                        ) : (
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: '100%',
                            p: 3,
                            textAlign: 'center',
                            bgcolor: theme.palette.background.default
                          }}>
                            <ChatOutlinedIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 500 }}>
                              Select a conversation
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              Start connecting with others.
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Friend Requests</Typography>
                      <Chip 
                        label={`${friendRequests.filter(r => r.status === 'pending' && r.receiverId === user?.$id).length} Pending`}
                        color="primary" 
                        size="small" 
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    
                    {friendRequests.filter(r => r.status === 'pending' && r.receiverId === user?.$id).length > 0 ? (
                      <motion.div>
                        <Grid container spacing={2}>
                          {friendRequests
                            .filter(r => r.status === 'pending' && r.receiverId === user?.$id)
                            .map((request) => (
                              <Grid item xs={12} sm={6} key={request.id}>
                                <motion.div variants={itemVariants}>
                                  <Paper 
                                    elevation={0} 
                                    sx={{ 
                                      p: 2,
                                      borderRadius: 3, 
                                      border: `1px solid ${theme.palette.divider}`,
                                      bgcolor: 'background.paper',
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                      <Avatar
                                        sx={{
                                          width: 48,
                                          height: 48,
                                          mr: 1.5,
                                          bgcolor: theme.palette.primary.main,
                                          color: theme.palette.primary.contrastText
                                        }}
                                      >
                                        {users.find(u => u.$id === request.senderId)?.name[0]}
                                      </Avatar>
                                      <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                          {users.find(u => u.$id === request.senderId)?.name || 'Unknown User'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">Wants to connect</Typography>
                                      </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleAcceptFriendRequest(request.$id)}
                                        sx={{ flexGrow: 1, borderRadius: 2, textTransform: 'none' }}
                                      >
                                        Accept
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeclineFriendRequest(request.$id)}
                                        sx={{ flexGrow: 1, borderRadius: 2, textTransform: 'none' }}
                                      >
                                        Decline
                                      </Button>
                                    </Box>
                                  </Paper>
                                </motion.div>
                              </Grid>
                            ))}
                        </Grid>
                      </motion.div>
                    ) : (
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'background.paper', 
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                          No pending friend requests.
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Discover Web3Lancers</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        placeholder="Search users"
                        variant="outlined"
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2, bgcolor: 'background.paper' }
                        }}
                      />
                    </Box>
                  </Box>
                  
                  <motion.div>
                    <Grid container spacing={2}>
                      {filterUsers(users).map((user) => (
                        <Grid item xs={12} sm={6} md={4} key={user.$id}>
                          <motion.div variants={itemVariants}>
                            <Paper 
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                border: `1px solid ${theme.palette.divider}`,
                                bgcolor: 'background.paper',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Badge
                                  sx={{
                                    '& .MuiBadge-dot': {
                                      border: `2px solid ${theme.palette.background.paper}`,
                                      width: 10,
                                      height: 10,
                                      borderRadius: '50%'
                                    }
                                  }}
                                >
                                  <Avatar 
                                    src={user.avatarUrl} 
                                    sx={{ 
                                      width: 48,
                                      height: 48, 
                                      mr: 1.5,
                                    }}
                                  >
                                    {user.name[0]}
                                  </Avatar>
                                </Badge>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                                  <Chip 
                                    label={user.status} 
                                    size="small" 
                                    color={user.status === 'online' ? 'success' : (user.status === 'away' ? 'warning' : 'default')}
                                    variant="outlined"
                                    sx={{ 
                                      height: 22,
                                      fontSize: '0.7rem',
                                      mt: 0.5,
                                      fontWeight: 500
                                    }} 
                                  />
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button 
                                  variant="outlined" 
                                  size="small"
                                  startIcon={<PersonAddOutlinedIcon />}
                                  onClick={() => handleSendFriendRequest(user.$id)}
                                  sx={{ flexGrow: 1, borderRadius: 2, textTransform: 'none' }}
                                >
                                  Connect
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  size="small"
                                  startIcon={<ChatOutlinedIcon />}
                                  onClick={() => {
                                    setSelectedChat(user.$id);
                                    setTabValue(0);
                                  }}
                                  sx={{ flexGrow: 1, borderRadius: 2, textTransform: 'none' }}
                                >
                                  Message
                                </Button>
                              </Box>
                            </Paper>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </motion.div>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: { xs: 1.5, md: 2 },
                      mb: 3, 
                      borderRadius: 2, 
                      bgcolor: 'background.paper',
                      border: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Active Spaces</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Join or create voice/video discussions.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="contained" 
                        size="medium"
                        startIcon={<CallIcon />}
                        onClick={handleStartVoiceCall}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Start Voice Call
                      </Button>
                      <Button 
                        variant="contained" 
                        size="medium"
                        startIcon={<VideoCallIcon />}
                        onClick={handleStartVideoCall}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Start Video Call
                      </Button>
                    </Box>
                  </Paper>
                  
                  <motion.div>
                    <Grid container spacing={2}>
                      {activeSpaces.map((space) => (
                        <Grid item xs={12} sm={6} key={space.id}>
                          <motion.div variants={itemVariants}>
                            <Paper 
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                border: `1px solid ${theme.palette.divider}`,
                                bgcolor: 'background.paper',
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{space.name}</Typography>
                                  <Chip 
                                    icon={space.type === 'voice' ? <CallIcon sx={{ fontSize: 16, ml: 0.5 }} /> : <VideoCallIcon sx={{ fontSize: 16, ml: 0.5 }} />} 
                                    label={space.type === 'voice' ? 'Voice' : 'Video'} 
                                    size="small"
                                    color={space.type === 'voice' ? 'primary' : 'secondary'}
                                    variant="outlined"
                                    sx={{ height: 24, fontSize: '0.75rem', fontWeight: 500 }}
                                  />
                                </Box>
                                <Chip 
                                  label={`${space.participants} joined`} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ height: 24, fontSize: '0.75rem', fontWeight: 500 }}
                                />
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                  {[...Array(Math.min(space.participants, 4))].map((_, i) => (
                                    <Avatar 
                                      key={i} 
                                      sx={{ 
                                        width: 28,
                                        height: 28, 
                                        ml: i > 0 ? -1.2 : 0,
                                        border: `2px solid ${theme.palette.background.paper}`
                                      }}
                                    />
                                  ))}
                                  {space.participants > 4 && (
                                    <Avatar 
                                      sx={{ 
                                        width: 28, 
                                        height: 28, 
                                        ml: -1.2,
                                        bgcolor: theme.palette.action.hover, // Changed from 'grey.300'
                                        color: 'text.secondary',
                                        border: `2px solid ${theme.palette.background.paper}`,
                                        fontSize: '0.7rem',
                                        fontWeight: 600
                                      }}
                                    >
                                      +{space.participants - 4}
                                    </Avatar>
                                  )}
                                </Box>
                              </Box>
                              
                              <Button 
                                variant="contained"
                                color={space.type === 'voice' ? 'primary' : 'secondary'}
                                size="small"
                                fullWidth
                                startIcon={space.type === 'voice' ? <CallIcon /> : <VideoCallIcon />}
                                onClick={() => handleJoinSpace(space.id)}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  py: 1
                                }}
                              >
                                Join Now
                              </Button>
                            </Paper>
                          </motion.div>
                        </Grid>
                      ))}
                      {activeSpaces.length === 0 && (
                        <Grid item xs={12}>
                           <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 3, 
                              bgcolor: 'background.paper', 
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.divider}`,
                              textAlign: 'center'
                            }}
                          >
                            <GroupsOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body1" color="text.secondary">
                              No active spaces right now.
                            </Typography>
                            <Button 
                              variant="text" 
                              size="small" 
                              onClick={handleCreateSpace} 
                              sx={{ mt: 1, textTransform: 'none' }}
                            >
                              Create one?
                            </Button>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </motion.div>
                </Box>
              )}
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
            <motion.div variants={itemVariants}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 1.5, md: 2 },
                  borderRadius: 3, 
                  bgcolor: 'background.paper', 
                  border: `1px solid ${theme.palette.divider}`,
                  mb: 3
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Live Activities</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 300, overflow: 'auto' }}>
                  {liveActivities.map((activity, index) => (
                      <Box key={index} sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.background.default }}>
                        {/* Guard against missing activity or user */}
                        {activity?.user ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, width: 32, height: 32 }}>{String(activity.user)[0]}</Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                <Box component="span" sx={{ fontWeight: 600 }}>{activity.user}</Box> {activity.type}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: theme.palette.action.disabledBackground, color: theme.palette.text.disabled, width: 32, height: 32 }}>?</Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                <Box component="span" sx={{ fontWeight: 600 }}>Unknown</Box>
                              </Typography>
                              <Typography variant="caption" color="text.secondary">{activity?.time ?? ''}</Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ))}

                   {liveActivities.length === 0 && (
                     <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                       No recent activity.
                     </Typography>
                   )}
                </Box>
              </Paper>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 1.5, md: 2 },
                  borderRadius: 3, 
                  bgcolor: 'background.paper', 
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Your Network</Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 1.5,
                        textAlign: 'center',
                        borderRadius: 2,
                        bgcolor: theme.palette.background.default
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {users.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Connections</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 1.5,
                        textAlign: 'center',
                        borderRadius: 2,
                        bgcolor: theme.palette.background.default
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                        {activeSpaces.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Active Spaces</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}
