"use client";
import React, { useEffect, useState } from "react";
import { 
  Typography, Grid, Card, CardContent, Avatar, Button, Alert, CircularProgress,
  TextField, IconButton, Tabs, Tab, Badge, List, ListItem, ListItemAvatar, ListItemText, Divider,
  Box
} from "@mui/material";
import { databases, ID } from "@/utils/api";
import { APPWRITE_CONFIG } from "@/lib/env";
import { useAuth } from '@/contexts/AuthContext';
import SendIcon from '@mui/icons-material/Send';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CallIcon from '@mui/icons-material/Call';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';

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

const activities: Activity[] = [
  { type: 'started a voice call', user: 'Alice', time: '2 minutes ago' },
  { type: 'joined a space', user: 'Bob', time: '5 minutes ago' },
  { type: 'sent a friend request', user: 'Charlie', time: '10 minutes ago' },
];

export default function ConnectPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [liveActivities, setLiveActivities] = useState<Activity[]>(activities);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [activeSpaces, setActiveSpaces] = useState<Space[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setError(null);
      try {
        const mockUsers: User[] = [
          { $id: '1', name: 'Alice Johnson', email: 'alice@example.com', status: 'online', avatarUrl: 'https://mui.com/static/images/avatar/1.jpg' },
          { $id: '2', name: 'Bob Smith', email: 'bob@example.com', status: 'offline', avatarUrl: 'https://mui.com/static/images/avatar/2.jpg' },
          { $id: '3', name: 'Charlie Brown', email: 'charlie@example.com', status: 'away', avatarUrl: 'https://mui.com/static/images/avatar/3.jpg' },
          { $id: '4', name: 'Diana Prince', email: 'diana@example.com', status: 'online', avatarUrl: 'https://mui.com/static/images/avatar/4.jpg' },
          { $id: '5', name: 'Ethan Hunt', email: 'ethan@example.com', status: 'online', avatarUrl: 'https://mui.com/static/images/avatar/5.jpg' },
        ];
        setUsers(mockUsers);

        setFriendRequests([
          { id: 'fr1', senderId: '3', receiverId: user?.$id || '', status: 'pending', senderName: 'Charlie Brown' },
          { id: 'fr2', senderId: '5', receiverId: user?.$id || '', status: 'pending', senderName: 'Ethan Hunt' },
        ]);

        setActiveSpaces([
          { id: 'space1', name: 'Web3 Developers', type: 'voice', participants: 7, hostId: '2' },
          { id: 'space2', name: 'Blockchain Discussion', type: 'video', participants: 4, hostId: '4' },
          { id: 'space3', name: 'Freelancer Tips', type: 'voice', participants: 12, hostId: '1' },
        ]);

        setMessages([
          { id: 'm1', senderId: '1', receiverId: user?.$id || '', content: 'Hey, how are you?', timestamp: '2023-08-10T10:30:00Z', senderName: 'Alice Johnson' },
          { id: 'm2', senderId: user?.$id || '', receiverId: '1', content: 'I\'m good, thanks! Working on a new project.', timestamp: '2023-08-10T10:32:00Z', senderName: user?.name || '' },
          { id: 'm3', senderId: '1', receiverId: user?.$id || '', content: 'That sounds exciting! Tell me more about it.', timestamp: '2023-08-10T10:35:00Z', senderName: 'Alice Johnson' },
        ]);

      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    loadUsers();

    const interval = setInterval(() => {
      const newActivity = activities[Math.floor(Math.random() * activities.length)];
      setLiveActivities((prev) => [newActivity, ...prev].slice(0, 10));
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;
    
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: user?.$id || '',
      receiverId: selectedChat,
      content: message,
      timestamp: new Date().toISOString(),
      senderName: user?.name || ''
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleSendFriendRequest = async (userId: string) => {
    if(!user) return;
    try {
      const newRequest: FriendRequest = {
        id: `fr${Date.now()}`,
        senderId: user.$id,
        receiverId: userId,
        status: 'pending',
        senderName: user.name || ''
      };
      
      setFriendRequests([...friendRequests, newRequest]);
      
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleAcceptFriendRequest = (requestId: string) => {
    setFriendRequests(
      friendRequests.map(req => 
        req.id === requestId ? {...req, status: 'accepted'} : req
      )
    );
  };

  const handleJoinSpace = (spaceId: string) => {
    console.log(`Joining space ${spaceId}`);
  };

  const handleCreateSpace = () => {
    const newSpace: Space = {
      id: `space${Date.now()}`,
      name: `${user?.name}'s Space`,
      type: 'voice',
      participants: 1,
      hostId: user?.$id || ''
    };
    
    setActiveSpaces([...activeSpaces, newSpace]);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Connect
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab icon={<ChatIcon />} label="Chat" />
        <Tab 
          icon={
            <Badge badgeContent={friendRequests.filter(r => r.status === 'pending').length} color="error">
              <PeopleIcon />
            </Badge>
          } 
          label="Connections" 
        />
        <Tab icon={<GroupsIcon />} label="Spaces" />
      </Tabs>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 2 }}>Messages</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '70vh', overflow: 'auto' }}>
                    <List>
                      {users.map((contact) => (
                        <React.Fragment key={contact.$id}>
                          <ListItem 
                            button 
                            onClick={() => setSelectedChat(contact.$id)}
                            selected={selectedChat === contact.$id}
                            sx={{ backgroundColor: selectedChat === contact.$id ? 'rgba(0, 0, 0, 0.04)' : 'transparent' }}
                          >
                            <ListItemAvatar>
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                variant="dot"
                                color={contact.status === 'online' ? 'success' : (contact.status === 'away' ? 'warning' : 'error')}
                              >
                                <Avatar src={contact.avatarUrl}>{contact.name[0]}</Avatar>
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={contact.name} 
                              secondary={contact.status}
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
                    {selectedChat ? (
                      <>
                        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={users.find(u => u.$id === selectedChat)?.avatarUrl}>
                              {users.find(u => u.$id === selectedChat)?.name[0]}
                            </Avatar>
                            <Typography variant="h6">{users.find(u => u.$id === selectedChat)?.name}</Typography>
                          </Box>
                          <Box>
                            <IconButton color="primary"><CallIcon /></IconButton>
                            <IconButton color="primary"><VideoCallIcon /></IconButton>
                          </Box>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                          {messages
                            .filter(m => 
                              (m.senderId === selectedChat && m.receiverId === user?.$id) || 
                              (m.senderId === user?.$id && m.receiverId === selectedChat)
                            )
                            .map((msg) => (
                              <Box 
                                key={msg.id} 
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
                                    p: 1.5, 
                                    bgcolor: msg.senderId === user?.$id ? 'primary.main' : 'grey.100',
                                    color: msg.senderId === user?.$id ? 'white' : 'text.primary',
                                    borderRadius: 2,
                                    maxWidth: '70%'
                                  }}
                                >
                                  <Typography variant="body1">{msg.content}</Typography>
                                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                        </Box>
                        <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)', display: 'flex' }}>
                          <TextField
                            fullWidth
                            placeholder="Type a message..."
                            variant="outlined"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <IconButton color="primary" onClick={handleSendMessage}>
                            <SendIcon />
                          </IconButton>
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body1" color="text.secondary">
                          Select a contact to start chatting
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 2 }}>Find Connections</Typography>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Friend Requests</Typography>
                {friendRequests.filter(r => r.status === 'pending' && r.receiverId === user?.$id).length > 0 ? (
                  <Grid container spacing={2}>
                    {friendRequests
                      .filter(r => r.status === 'pending' && r.receiverId === user?.$id)
                      .map((request) => (
                        <Grid item xs={12} sm={6} md={4} key={request.id}>
                          <Card sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ mr: 2 }}>{request.senderName[0]}</Avatar>
                              <Typography variant="body1">{request.senderName}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button 
                                variant="contained" 
                                size="small" 
                                onClick={() => handleAcceptFriendRequest(request.id)}
                              >
                                Accept
                              </Button>
                              <Button variant="outlined" size="small">Decline</Button>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                ) : (
                  <Alert severity="info">No pending friend requests</Alert>
                )}
              </Box>
              
              <Typography variant="h6" sx={{ mb: 2 }}>Discover Web3Lancers</Typography>
              <Grid container spacing={2}>
                {users.map((user) => (
                  <Grid item xs={12} sm={6} md={4} key={user.$id}>
                    <Card 
                      sx={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            variant="dot"
                            color={user.status === 'online' ? 'success' : (user.status === 'away' ? 'warning' : 'error')}
                          >
                            <Avatar src={user.avatarUrl} sx={{ width: 56, height: 56, mr: 2 }}>{user.name[0]}</Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="h6">{user.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{user.status}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<PersonAddIcon />}
                            onClick={() => handleSendFriendRequest(user.$id)}
                          >
                            Connect
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<ChatIcon />}
                            onClick={() => {
                              setSelectedChat(user.$id);
                              setTabValue(0);
                            }}
                          >
                            Message
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Active Spaces</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<GroupsIcon />}
                  onClick={handleCreateSpace}
                >
                  Create Space
                </Button>
              </Box>
              <Grid container spacing={2}>
                {activeSpaces.map((space) => (
                  <Grid item xs={12} sm={6} md={4} key={space.id}>
                    <Card 
                      sx={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box>
                            <Typography variant="h6">{space.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {space.type === 'voice' ? 'Voice Call' : 'Video Call'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {[...Array(Math.min(space.participants, 3))].map((_, i) => (
                              <Avatar 
                                key={i} 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  ml: i > 0 ? -1 : 0 
                                }}
                              />
                            ))}
                            {space.participants > 3 && (
                              <Avatar sx={{ width: 32, height: 32, ml: -1 }}>
                                +{space.participants - 3}
                              </Avatar>
                            )}
                          </Box>
                        </Box>
                        <Button 
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={space.type === 'voice' ? <CallIcon /> : <VideoCallIcon />}
                          onClick={() => handleJoinSpace(space.id)}
                        >
                          Join
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h5" sx={{ mb: 2 }}>Live Activities</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {liveActivities.map((activity, index) => (
              <Card
                key={index}
                sx={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  mb: 2
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar>{activity.user[0]}</Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{activity.user}</Typography>
                    <Typography variant="body2" color="text.secondary">{activity.type}</Typography>
                    <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
