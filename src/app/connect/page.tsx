"use client";
import React, { useEffect, useState, useCallback } from "react";
import { 
  Typography, Grid, Card, CardContent, Avatar, Button, Alert, CircularProgress,
  TextField, IconButton, Tabs, Tab, Badge, List, ListItem, ListItemAvatar, ListItemText, Divider,
  Box, Container, Paper, Chip
} from "@mui/material";
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CallIcon from '@mui/icons-material/Call';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
// Import Appwrite services if not already available via context
import { databases, ID, Query, Realtime } from '@/utils/api'; 

// Animation variants
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

interface User {
  $id: string;
  name: string;
  email: string;
  status: string;
  avatarUrl?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  senderName: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  senderName: string;
}

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

  // Initialize mock data safely using useCallback to prevent serialization issues
  // TODO: Remove initializeMockData and fetch real data from Appwrite in useEffect
  const initializeMockData = useCallback(() => {
    const mockUsers: User[] = [
      { $id: '1', name: 'Alice Johnson', email: 'alice@example.com', status: 'online', avatarUrl: 'https://mui.com/static/images/avatar/1.jpg' },
      { $id: '2', name: 'Bob Smith', email: 'bob@example.com', status: 'offline', avatarUrl: 'https://mui.com/static/images/avatar/2.jpg' },
      { $id: '3', name: 'Charlie Brown', email: 'charlie@example.com', status: 'away', avatarUrl: 'https://mui.com/static/images/avatar/3.jpg' },
      { $id: '4', name: 'Diana Prince', email: 'diana@example.com', status: 'online', avatarUrl: 'https://mui.com/static/images/avatar/4.jpg' },
      { $id: '5', name: 'Ethan Hunt', email: 'ethan@example.com', status: 'online', avatarUrl: 'https://mui.com/static/images/avatar/5.jpg' },
    ];

    const initialActivities: Activity[] = [
      { type: 'started a voice call', user: 'Alice', time: '2 minutes ago' },
      { type: 'joined a space', user: 'Bob', time: '5 minutes ago' },
      { type: 'sent a friend request', user: 'Charlie', time: '10 minutes ago' },
    ];

    const initialFriendRequests: FriendRequest[] = user ? [
      { id: 'fr1', senderId: '3', receiverId: user.$id || '', status: 'pending', senderName: 'Charlie Brown' },
      { id: 'fr2', senderId: '5', receiverId: user.$id || '', status: 'pending', senderName: 'Ethan Hunt' },
    ] : [];

    const initialSpaces: Space[] = [
      { id: 'space1', name: 'Web3 Developers', type: 'voice', participants: 7, hostId: '2' },
      { id: 'space2', name: 'Blockchain Discussion', type: 'video', participants: 4, hostId: '4' },
      { id: 'space3', name: 'Freelancer Tips', type: 'voice', participants: 12, hostId: '1' },
    ];

    const initialMessages: Message[] = user ? [
      { id: 'm1', senderId: '1', receiverId: user.$id || '', content: 'Hey, how are you?', timestamp: '2023-08-10T10:30:00Z', senderName: 'Alice Johnson' },
      { id: 'm2', senderId: user.$id || '', receiverId: '1', content: 'I\'m good, thanks! Working on a new project.', timestamp: '2023-08-10T10:32:00Z', senderName: user.name || '' },
      { id: 'm3', senderId: '1', receiverId: user.$id || '', content: 'That sounds exciting! Tell me more about it.', timestamp: '2023-08-10T10:35:00Z', senderName: 'Alice Johnson' },
    ] : [];

    return {
      mockUsers,
      initialActivities,
      initialFriendRequests,
      initialSpaces,
      initialMessages
    };
  }, [user]);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace mock data initialization with Appwrite fetches
        // Fetch users, friend requests, spaces, messages
        // Example: Fetch users (consider privacy/search strategy)
        // const usersResponse = await databases.listDocuments('DB_ID', 'USERS_COLLECTION_ID', [Query.limit(25)]); 
        // setUsers(usersResponse.documents as unknown as User[]);

        // Example: Fetch friend requests for the current user
        // const requestsResponse = await databases.listDocuments('DB_ID', 'FRIEND_REQUESTS_COLLECTION_ID', [Query.equal('receiverId', user.$id)]);
        // setFriendRequests(requestsResponse.documents as unknown as FriendRequest[]);
        
        // Example: Fetch active spaces
        // const spacesResponse = await databases.listDocuments('DB_ID', 'SPACES_COLLECTION_ID', [Query.limit(10)]);
        // setActiveSpaces(spacesResponse.documents as unknown as Space[]);

        // Example: Fetch initial messages for a default/last chat (if applicable)
        // if (selectedChat) {
        //   const messagesResponse = await databases.listDocuments('DB_ID', 'MESSAGES_COLLECTION_ID', [
        //     Query.equal('chatId', generateChatId(user.$id, selectedChat)), // Assuming a combined chat ID
        //     Query.orderDesc('$createdAt'),
        //     Query.limit(50)
        //   ]);
        //   setMessages(messagesResponse.documents.reverse() as unknown as Message[]);
        // }

        // Using mock data for now:
        const { mockUsers, initialActivities, initialFriendRequests, initialSpaces, initialMessages } = initializeMockData();
        setUsers(mockUsers);
        setLiveActivities(initialActivities); // TODO: Replace with Realtime subscription or fetch
        setFriendRequests(initialFriendRequests);
        setActiveSpaces(initialSpaces);
        setMessages(initialMessages); // Load messages based on selectedChat

      } catch (error) {
        console.error('Error loading connect page data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();

    // TODO: Implement Realtime subscriptions for messages, activities, user status, etc.
    // Example:
    // const unsubscribeMessages = client.subscribe(`databases.DB_ID.collections.MESSAGES_COLLECTION_ID.documents`, response => {
    //   if (response.events.includes('databases.*.collections.*.documents.*.create')) {
    //      const newMessage = response.payload as Message;
    //      // Check if message belongs to the current chat and update state
    //      if ((newMessage.senderId === user?.$id && newMessage.receiverId === selectedChat) || (newMessage.senderId === selectedChat && newMessage.receiverId === user?.$id)) {
    //        setMessages(prev => [...prev, newMessage]);
    //      }
    //   }
    // });
    // return () => { unsubscribeMessages(); };

    // Mock activity interval (replace with Realtime)
    const interval = setInterval(() => {
      const { initialActivities } = initializeMockData();
      const newActivity = initialActivities[Math.floor(Math.random() * initialActivities.length)];
      setLiveActivities((prev) => [newActivity, ...prev].slice(0, 10));
    }, 5000);

    return () => clearInterval(interval);
  }, [user, initializeMockData, selectedChat]); // Added selectedChat dependency

  const handleSendMessage = async () => { // Made async
    if (!message.trim() || !selectedChat || !user) return;
    
    const newMessageData = {
      // chatId: generateChatId(user.$id, selectedChat), // Consider a combined ID for querying
      senderId: user.$id,
      receiverId: selectedChat,
      content: message,
      senderName: user.name || 'User' // Get sender name from user context
      // timestamp is handled by Appwrite ($createdAt)
    };
    
    setMessage(''); // Clear input immediately for better UX

    try {
      // TODO: Implement Appwrite database call
      // const createdMessage = await databases.createDocument(
      //   'DB_ID', 
      //   'MESSAGES_COLLECTION_ID', 
      //   ID.unique(), 
      //   newMessageData
      // );
      // If not using realtime, manually add to state:
      // setMessages([...messages, createdMessage as unknown as Message]);
      console.log("Sending message via Appwrite:", newMessageData);
      // Using mock update for now:
      const mockNewMessage: Message = {
        id: `m${Date.now()}`,
        ...newMessageData,
        timestamp: new Date().toISOString(), // Mock timestamp
      };
      setMessages([...messages, mockNewMessage]);

    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message.");
      setMessage(newMessageData.content); // Restore message input on error
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    if(!user) return;
    
    const requestData = {
      senderId: user.$id,
      receiverId: userId,
      status: 'pending',
      senderName: user.name || 'User' 
    };

    try {
      // TODO: Implement Appwrite database call
      // Check if a request already exists first
      // const existing = await databases.listDocuments('DB_ID', 'FRIEND_REQUESTS_COLLECTION_ID', [
      //   Query.equal('senderId', user.$id),
      //   Query.equal('receiverId', userId)
      // ]);
      // if (existing.total === 0) {
      //   const newRequest = await databases.createDocument(
      //     'DB_ID', 
      //     'FRIEND_REQUESTS_COLLECTION_ID', 
      //     ID.unique(), 
      //     requestData
      //   );
      //   // If not using realtime, manually add to state:
      //   // setFriendRequests([...friendRequests, newRequest as unknown as FriendRequest]);
      // } else {
      //   console.log("Friend request already sent or exists.");
      // }
      console.log("Sending friend request via Appwrite:", requestData);
      // Using mock update for now:
      const mockNewRequest: FriendRequest = {
        id: `fr${Date.now()}`,
        ...requestData,
      };
      setFriendRequests([...friendRequests, mockNewRequest]);
      
    } catch (error) {
      console.error("Error sending friend request:", error);
      setError("Failed to send friend request.");
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => { // Made async
    const request = friendRequests.find(req => req.id === requestId);
    if (!request) return;

    try {
      // TODO: Implement Appwrite database call to update status
      // await databases.updateDocument(
      //   'DB_ID', 
      //   'FRIEND_REQUESTS_COLLECTION_ID', 
      //   requestId, 
      //   { status: 'accepted' }
      // );
      // If not using realtime, manually update state:
      // setFriendRequests(
      //   friendRequests.map(req => 
      //     req.id === requestId ? {...req, status: 'accepted'} : req
      //   )
      // );
      console.log("Accepting friend request via Appwrite:", requestId);
      // Using mock update for now:
      setFriendRequests(
        friendRequests.map(req => 
          req.id === requestId ? {...req, status: 'accepted'} : req
        )
      );
      // TODO: Optionally create a 'friendship' document or update user profiles
    } catch (error) {
      console.error("Error accepting friend request:", error);
      setError("Failed to accept friend request.");
    }
  };

  // TODO: Implement handleDeclineFriendRequest similarly using updateDocument or deleteDocument

  const handleJoinSpace = (spaceId: string) => {
    // TODO: Implement logic to join a space (potentially using Appwrite Functions or Realtime)
    console.log(`Joining space ${spaceId}`);
  };

  const handleCreateSpace = async () => { // Made async
    if (!user) return;
    
    const newSpaceData = {
      name: `${user.name || 'User'}'s Space`,
      type: 'voice', // Default or allow selection
      participants: 1, // Initial participant count
      hostId: user.$id,
      // participantIds: [user.$id] // Store participant IDs
    };

    try {
      // TODO: Implement Appwrite database call
      // const createdSpace = await databases.createDocument(
      //   'DB_ID', 
      //   'SPACES_COLLECTION_ID', 
      //   ID.unique(), 
      //   newSpaceData
      // );
      // If not using realtime, manually add to state:
      // setActiveSpaces([...activeSpaces, createdSpace as unknown as Space]);
      console.log("Creating space via Appwrite:", newSpaceData);
      // Using mock update for now:
      const mockNewSpace: Space = {
        id: `space${Date.now()}`,
        ...newSpaceData,
      };
      setActiveSpaces([...activeSpaces, mockNewSpace]);
    } catch (error) {
      console.error("Error creating space:", error);
      setError("Failed to create space.");
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filterUsers = (users: User[]) => {
    if (!searchQuery) return users;
    return users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Loading your connections...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, background: 'linear-gradient(90deg, #3a86ff 0%, #4361ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Connect with Web3Lancers
          </Typography>
        </motion.div>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3, 
            mb: 3, 
            bgcolor: 'background.paper', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab 
              icon={<ChatIcon />} 
              label="Chat" 
              sx={{ py: 2 }} 
            />
            <Tab 
              icon={
                <Badge badgeContent={friendRequests.filter(r => r.status === 'pending' && r.receiverId === user?.$id).length} color="error">
                  <PeopleIcon />
                </Badge>
              } 
              label="Connections" 
              sx={{ py: 2 }} 
            />
            <Tab 
              icon={<GroupsIcon />} 
              label="Spaces" 
              sx={{ py: 2 }} 
            />
          </Tabs>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              {tabValue === 0 && (
                <Box>
                  <Paper 
                    elevation={0} 
                    sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>Messages</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Connect and chat with other professionals in the Web3 space
                    </Typography>
                  </Paper>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper elevation={0} sx={{ height: '70vh', overflow: 'hidden', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                          <TextField
                            fullWidth
                            placeholder="Search contacts..."
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                              sx: { borderRadius: 2 }
                            }}
                          />
                        </Box>
                        <List sx={{ height: 'calc(70vh - 70px)', overflow: 'auto' }}>
                          {filterUsers(users).map((contact) => (
                            <ListItem 
                              button 
                              key={contact.$id}
                              onClick={() => setSelectedChat(contact.$id)}
                              selected={selectedChat === contact.$id}
                              sx={{ 
                                px: 2,
                                py: 1.5, 
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5,
                                bgcolor: selectedChat === contact.$id ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                                '&:hover': {
                                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                                }
                              }}
                            >
                              <ListItemAvatar>
                                <Badge
                                  overlap="circular"
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  variant="dot"
                                  color={contact.status === 'online' ? 'success' : (contact.status === 'away' ? 'warning' : 'error')}
                                >
                                  <Avatar 
                                    src={contact.avatarUrl}
                                    sx={{ 
                                      width: 48, 
                                      height: 48,
                                      border: '2px solid',
                                      borderColor: contact.status === 'online' ? 'success.main' : (contact.status === 'away' ? 'warning.main' : 'text.disabled')
                                    }}
                                  >
                                    {contact.name[0]}
                                  </Avatar>
                                </Badge>
                              </ListItemAvatar>
                              <ListItemText 
                                primary={
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {contact.name}
                                  </Typography>
                                }
                                secondary={
                                  <Box component="span" sx={{ 
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    color: contact.status === 'online' ? 'success.main' : (contact.status === 'away' ? 'warning.main' : 'text.disabled'),
                                  }}>
                                    <Typography variant="caption">
                                      {contact.status}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          height: '70vh', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          borderRadius: 3,
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }}
                      >
                        {selectedChat ? (
                          <>
                            <Box sx={{ 
                              p: 2, 
                              borderBottom: '1px solid rgba(0, 0, 0, 0.08)', 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              bgcolor: 'background.paper'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Badge
                                  overlap="circular"
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  variant="dot"
                                  color={users.find(u => u.$id === selectedChat)?.status === 'online' ? 'success' : 
                                    (users.find(u => u.$id === selectedChat)?.status === 'away' ? 'warning' : 'error')}
                                >
                                  <Avatar 
                                    src={users.find(u => u.$id === selectedChat)?.avatarUrl}
                                    sx={{ width: 40, height: 40 }}
                                  >
                                    {users.find(u => u.$id === selectedChat)?.name[0]}
                                  </Avatar>
                                </Badge>
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {users.find(u => u.$id === selectedChat)?.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {users.find(u => u.$id === selectedChat)?.status}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box>
                                <IconButton color="primary" sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)', mr: 1 }}>
                                  <CallIcon />
                                </IconButton>
                                <IconButton color="primary" sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                                  <VideoCallIcon />
                                </IconButton>
                              </Box>
                            </Box>
                            <Box sx={{ 
                              flexGrow: 1, 
                              overflow: 'auto', 
                              p: 2, 
                              display: 'flex', 
                              flexDirection: 'column-reverse',
                              bgcolor: '#f8f9fa'
                            }}>
                              <Box>
                                {messages
                                  .filter(m => 
                                    (m.senderId === selectedChat && m.receiverId === user?.$id) || 
                                    (m.senderId === user?.$id && m.receiverId === selectedChat)
                                  )
                                  .map((msg) => (
                                    <motion.div
                                      key={msg.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <Box 
                                        sx={{ 
                                          display: 'flex', 
                                          justifyContent: msg.senderId === user?.$id ? 'flex-end' : 'flex-start',
                                          mb: 2
                                        }}
                                      >
                                        {msg.senderId !== user?.$id && (
                                          <Avatar 
                                            src={users.find(u => u.$id === msg.senderId)?.avatarUrl} 
                                            sx={{ mr: 1, width: 32, height: 32 }}
                                          >
                                            {msg.senderName[0]}
                                          </Avatar>
                                        )}
                                        <Box 
                                          sx={{ 
                                            p: 2, 
                                            bgcolor: msg.senderId === user?.$id ? 'primary.main' : 'white',
                                            color: msg.senderId === user?.$id ? 'white' : 'text.primary',
                                            borderRadius: msg.senderId === user?.$id 
                                              ? '20px 20px 0 20px' 
                                              : '0 20px 20px 20px',
                                            maxWidth: '70%',
                                            boxShadow: msg.senderId === user?.$id 
                                              ? 'none' 
                                              : '0 1px 3px rgba(0,0,0,0.1)'
                                          }}
                                        >
                                          <Typography variant="body1">{msg.content}</Typography>
                                          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', textAlign: 'right', mt: 0.5 }}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </motion.div>
                                  ))}
                              </Box>
                            </Box>
                            <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', bgcolor: 'background.paper' }}>
                              <TextField
                                fullWidth
                                placeholder="Type a message..."
                                variant="outlined"
                                size="medium"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                InputProps={{ 
                                  sx: { borderRadius: 3 }
                                }}
                              />
                              <IconButton 
                                color="primary" 
                                onClick={handleSendMessage} 
                                sx={{ 
                                  ml: 1, 
                                  bgcolor: 'primary.main', 
                                  color: 'white',
                                  '&:hover': { 
                                    bgcolor: 'primary.dark' 
                                  },
                                  width: 48,
                                  height: 48
                                }}
                              >
                                <SendIcon />
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
                            textAlign: 'center'
                          }}>
                            <ChatIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.primary">
                              Select a contact to start chatting
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Connect with professionals and discuss potential collaborations
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
                  <Paper 
                    elevation={0} 
                    sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>Find Connections</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Discover professionals and build your network
                    </Typography>
                  </Paper>
                  
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Friend Requests</Typography>
                      <Chip 
                        label={`${friendRequests.filter(r => r.status === 'pending' && r.receiverId === user?.$id).length} Pending`}
                        color="primary" 
                        size="small" 
                      />
                    </Box>
                    
                    {friendRequests.filter(r => r.status === 'pending' && r.receiverId === user?.$id).length > 0 ? (
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Grid container spacing={2}>
                          {friendRequests
                            .filter(r => r.status === 'pending' && r.receiverId === user?.$id)
                            .map((request) => (
                              <Grid item xs={12} sm={6} md={4} key={request.id}>
                                <motion.div variants={itemVariants}>
                                  <Paper 
                                    elevation={0} 
                                    sx={{ 
                                      p: 3, 
                                      borderRadius: 3, 
                                      border: '1px solid rgba(0,0,0,0.08)',
                                      transition: 'transform 0.3s, box-shadow 0.3s',
                                      '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                      }
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                      <Avatar 
                                        sx={{ 
                                          width: 56, 
                                          height: 56, 
                                          mr: 2,
                                          bgcolor: 'primary.light'
                                        }}
                                      >
                                        {request.senderName[0]}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{request.senderName}</Typography>
                                        <Typography variant="caption" color="text.secondary">Wants to connect</Typography>
                                      </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Button 
                                        variant="contained" 
                                        size="medium" 
                                        onClick={() => handleAcceptFriendRequest(request.id)}
                                        sx={{ 
                                          flexGrow: 1, 
                                          borderRadius: 2,
                                          py: 1
                                        }}
                                      >
                                        Accept
                                      </Button>
                                      <Button 
                                        variant="outlined" 
                                        size="medium"
                                        sx={{ 
                                          flexGrow: 1, 
                                          borderRadius: 2,
                                          py: 1
                                        }}
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
                          p: 3, 
                          bgcolor: 'background.paper', 
                          borderRadius: 2,
                          border: '1px solid rgba(0,0,0,0.08)'
                        }}
                      >
                        <Alert severity="info" sx={{ bgcolor: 'transparent' }}>No pending friend requests</Alert>
                      </Paper>
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Discover Web3Lancers</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        placeholder="Search users..."
                        variant="outlined"
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                          sx: { borderRadius: 2 }
                        }}
                      />
                      <IconButton sx={{ bgcolor: 'background.paper', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <FilterListIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Grid container spacing={2}>
                      {filterUsers(users).map((user) => (
                        <Grid item xs={12} sm={6} md={4} key={user.$id}>
                          <motion.div variants={itemVariants}>
                            <Paper 
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 3,
                                border: '1px solid rgba(0,0,0,0.08)',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Badge
                                  overlap="circular"
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  variant="dot"
                                  color={user.status === 'online' ? 'success' : (user.status === 'away' ? 'warning' : 'error')}
                                >
                                  <Avatar 
                                    src={user.avatarUrl} 
                                    sx={{ 
                                      width: 70, 
                                      height: 70, 
                                      mr: 2,
                                      border: '2px solid',
                                      borderColor: user.status === 'online' ? 'success.main' : (user.status === 'away' ? 'warning.main' : 'text.disabled')
                                    }}
                                  >
                                    {user.name[0]}
                                  </Avatar>
                                </Badge>
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                                  <Chip 
                                    label={user.status} 
                                    size="small" 
                                    color={user.status === 'online' ? 'success' : (user.status === 'away' ? 'warning' : 'default')}
                                    sx={{ 
                                      height: 24,
                                      fontSize: '0.75rem',
                                      mt: 0.5
                                    }} 
                                  />
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button 
                                  variant="outlined" 
                                  color="primary"
                                  size="medium"
                                  startIcon={<PersonAddIcon />}
                                  onClick={() => handleSendFriendRequest(user.$id)}
                                  sx={{ 
                                    flexGrow: 1, 
                                    borderRadius: 2,
                                    py: 1
                                  }}
                                >
                                  Connect
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  color="primary"
                                  size="medium"
                                  startIcon={<ChatIcon />}
                                  onClick={() => {
                                    setSelectedChat(user.$id);
                                    setTabValue(0);
                                  }}
                                  sx={{ 
                                    flexGrow: 1, 
                                    borderRadius: 2,
                                    py: 1
                                  }}
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
                      p: 3, 
                      mb: 3, 
                      borderRadius: 2, 
                      bgcolor: 'background.paper',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>Active Spaces</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Join voice and video discussions with other Web3Lancers
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      startIcon={<GroupsIcon />}
                      onClick={handleCreateSpace}
                      sx={{
                        py: 1.5,
                        px: 3,
                        borderRadius: 2
                      }}
                    >
                      Create Space
                    </Button>
                  </Paper>
                  
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Grid container spacing={2}>
                      {activeSpaces.map((space) => (
                        <Grid item xs={12} sm={6} md={4} key={space.id}>
                          <motion.div variants={itemVariants}>
                            <Paper 
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 3,
                                border: '1px solid rgba(0,0,0,0.08)',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{space.name}</Typography>
                                  <Chip 
                                    icon={space.type === 'voice' ? <CallIcon fontSize="small" /> : <VideoCallIcon fontSize="small" />} 
                                    label={space.type === 'voice' ? 'Voice Room' : 'Video Room'} 
                                    size="small"
                                    color={space.type === 'voice' ? 'primary' : 'secondary'}
                                    sx={{ height: 28 }}
                                  />
                                </Box>
                                <Chip 
                                  label={`${space.participants} joined`} 
                                  size="small" 
                                  color="default"
                                  sx={{ height: 24, fontSize: '0.75rem' }}
                                />
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                  {[...Array(Math.min(space.participants, 3))].map((_, i) => (
                                    <Avatar 
                                      key={i} 
                                      sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        ml: i > 0 ? -1 : 0,
                                        border: '2px solid white'
                                      }}
                                    />
                                  ))}
                                  {space.participants > 3 && (
                                    <Avatar 
                                      sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        ml: -1,
                                        bgcolor: 'primary.main',
                                        border: '2px solid white',
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      +{space.participants - 3}
                                    </Avatar>
                                  )}
                                </Box>
                              </Box>
                              
                              <Button 
                                variant="contained"
                                color={space.type === 'voice' ? 'primary' : 'secondary'}
                                size="medium"
                                fullWidth
                                startIcon={space.type === 'voice' ? <CallIcon /> : <VideoCallIcon />}
                                onClick={() => handleJoinSpace(space.id)}
                                sx={{
                                  borderRadius: 2,
                                  py: 1.5
                                }}
                              >
                                Join Now
                              </Button>
                            </Paper>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </motion.div>
                </Box>
              )}
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  bgcolor: 'background.paper', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  mb: 3
                }}
              >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Live Activities</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {liveActivities.map((activity, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.08)',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateX(5px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>{activity.user[0]}</Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{activity.user}</Typography>
                          <Typography variant="body2" color="text.secondary">{activity.type}</Typography>
                          <Typography variant="caption" color="text.disabled">{activity.time}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Paper>
              
              {/* Added section for Network Stats */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  bgcolor: 'background.paper', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Your Network</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.08)'
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {users.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Connections</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.08)'
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                        {activeSpaces.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Active Spaces</Typography>
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
