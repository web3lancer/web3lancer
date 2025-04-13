"use client";
import React, { useEffect, useState } from "react";
import { 
  Typography, Grid, Card, CardContent, Avatar, Button, Alert, CircularProgress,
  TextField, IconButton, Tabs, Tab, Badge, List, ListItem, ListItemAvatar, ListItemText, Divider,
  Box
} from "@mui/material";
import { databases, ID, Query } from "@/utils/api";
import { useAuth } from '@/contexts/AuthContext';
import SendIcon from '@mui/icons-material/Send';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CallIcon from '@mui/icons-material/Call';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';

const DB_SOCIAL_ID = 'YOUR_SOCIAL_DATABASE_ID';
const COLL_USERS_PROFILES_ID = 'YOUR_USER_PROFILES_COLLECTION_ID';
const COLL_MESSAGES_ID = 'YOUR_MESSAGES_COLLECTION_ID';
const COLL_FRIEND_REQUESTS_ID = 'YOUR_FRIEND_REQUESTS_COLLECTION_ID';
const COLL_SPACES_ID = 'YOUR_SPACES_COLLECTION_ID';

interface UserProfile {
  $id: string;
  name: string;
  email?: string;
  status?: string;
  avatarUrl?: string;
}

interface Message {
  $id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  senderName?: string;
}

interface FriendRequest {
  $id?: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  senderName?: string;
}

interface Space {
  $id?: string;
  name: string;
  type: 'voice' | 'video';
  participantsCount?: number;
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
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [liveActivities, setLiveActivities] = useState<Activity[]>(activities);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [activeSpaces, setActiveSpaces] = useState<Space[]>([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setLoading(false);
    }

    const interval = setInterval(() => {
      const newActivity = activities[Math.floor(Math.random() * activities.length)];
      setLiveActivities((prev) => [newActivity, ...prev].slice(0, 10));
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (selectedChatUserId && user) {
      fetchMessages(selectedChatUserId);
    } else {
      setMessages([]);
    }
  }, [selectedChatUserId, user]);

  const fetchAllData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchUserProfiles(),
        fetchFriendRequests(),
        fetchActiveSpaces(),
      ]);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load connection data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfiles = async () => {
    try {
      const response = await databases.listDocuments(DB_SOCIAL_ID, COLL_USERS_PROFILES_ID, []);
      setUserProfiles(response.documents as UserProfile[]);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
    }
  };

  const fetchFriendRequests = async () => {
    if (!user) return;
    try {
      const response = await databases.listDocuments(DB_SOCIAL_ID, COLL_FRIEND_REQUESTS_ID, [
        Query.equal('receiverId', user.$id),
        Query.equal('status', 'pending'),
        Query.orderDesc('$createdAt')
      ]);
      setFriendRequests(response.documents as FriendRequest[]);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchActiveSpaces = async () => {
    try {
      const response = await databases.listDocuments(DB_SOCIAL_ID, COLL_SPACES_ID, [
        Query.orderDesc('$createdAt')
      ]);
      setActiveSpaces(response.documents as Space[]);
    } catch (error) {
      console.error('Error fetching active spaces:', error);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await databases.listDocuments(DB_SOCIAL_ID, COLL_MESSAGES_ID, [
        Query.or([
          Query.and([Query.equal('senderId', user.$id), Query.equal('receiverId', otherUserId)]),
          Query.and([Query.equal('senderId', otherUserId), Query.equal('receiverId', user.$id)])
        ]),
        Query.orderAsc('$createdAt')
      ]);
      setMessages(response.documents as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages for this chat.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChatUserId || !user) return;

    const newMessageData: Omit<Message, '$id' | 'senderName'> = {
      senderId: user.$id,
      receiverId: selectedChatUserId,
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const createdDoc = await databases.createDocument(
        DB_SOCIAL_ID, 
        COLL_MESSAGES_ID, 
        ID.unique(), 
        newMessageData
      );

      setMessages([...messages, { ...createdDoc, senderName: user.name } as Message]);
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message.");
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user) return;

    const newRequestData = {
      senderId: user.$id,
      receiverId: targetUserId,
      status: 'pending',
      senderName: user.name || 'Unknown User'
    };

    try {
      await databases.createDocument(
        DB_SOCIAL_ID, 
        COLL_FRIEND_REQUESTS_ID, 
        ID.unique(), 
        newRequestData
      );

      alert('Friend request sent!');
    } catch (error) {
      console.error("Error sending friend request:", error);
      setError("Failed to send friend request.");
    }
  };

  const handleAcceptFriendRequest = async (request: FriendRequest) => {
    if (!request.$id) return;
    try {
      await databases.updateDocument(
        DB_SOCIAL_ID, 
        COLL_FRIEND_REQUESTS_ID, 
        request.$id, 
        { status: 'accepted' }
      );

      setFriendRequests(prev => prev.filter(req => req.$id !== request.$id));
      alert('Friend request accepted!');
    } catch (error) {
      console.error("Error accepting friend request:", error);
      setError("Failed to accept friend request.");
    }
  };

  const handleDeclineFriendRequest = async (request: FriendRequest) => {
    if (!request.$id) return;
    try {
      await databases.deleteDocument(DB_SOCIAL_ID, COLL_FRIEND_REQUESTS_ID, request.$id);

      setFriendRequests(prev => prev.filter(req => req.$id !== request.$id));
      alert('Friend request declined.');
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
      hostId: user.$id,
      participantsCount: 1,
    };

    try {
      const createdDoc = await databases.createDocument(
        DB_SOCIAL_ID, 
        COLL_SPACES_ID, 
        ID.unique(), 
        newSpaceData
      );

      setActiveSpaces(prev => [createdDoc as Space, ...prev]);
      alert('Space created!');
    } catch (error) {
      console.error("Error creating space:", error);
      setError("Failed to create space.");
    }
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
            <Badge badgeContent={friendRequests.length} color="error">
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
                      {userProfiles.map((profile) => (
                        <React.Fragment key={profile.$id}>
                          <ListItem 
                            button 
                            onClick={() => setSelectedChatUserId(profile.$id)}
                            selected={selectedChatUserId === profile.$id}
                            sx={{ backgroundColor: selectedChatUserId === profile.$id ? 'rgba(0, 0, 0, 0.04)' : 'transparent' }}
                          >
                            <ListItemAvatar>
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                variant="dot"
                                color={profile.status === 'online' ? 'success' : (profile.status === 'away' ? 'warning' : 'default')}
                              >
                                <Avatar src={profile.avatarUrl}>{profile.name ? profile.name[0] : '?'}</Avatar>
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={profile.name} 
                              secondary={profile.status || 'offline'}
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
                    {selectedChatUserId ? (
                      <>
                        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={userProfiles.find(p => p.$id === selectedChatUserId)?.avatarUrl}>
                              {userProfiles.find(p => p.$id === selectedChatUserId)?.name?.[0] || '?'}
                            </Avatar>
                            <Typography variant="h6">{userProfiles.find(p => p.$id === selectedChatUserId)?.name}</Typography>
                          </Box>
                          <Box>
                            <IconButton color="primary"><CallIcon /></IconButton>
                            <IconButton color="primary"><VideoCallIcon /></IconButton>
                          </Box>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                          {messages.map((msg) => (
                              <Box 
                                key={msg.$id}
                                sx={{ 
                                  display: 'flex', 
                                  justifyContent: msg.senderId === user?.$id ? 'flex-end' : 'flex-start',
                                  mb: 2
                                }}
                              >
                                {msg.senderId !== user?.$id && (
                                  <Avatar 
                                    src={userProfiles.find(p => p.$id === msg.senderId)?.avatarUrl} 
                                    sx={{ mr: 1, width: 32, height: 32 }}
                                  >
                                    {msg.senderName?.[0] || userProfiles.find(p => p.$id === msg.senderId)?.name?.[0] || '?'}
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
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                {friendRequests.length > 0 ? (
                  <Grid container spacing={2}>
                    {friendRequests.map((request) => (
                        <Grid item xs={12} sm={6} md={4} key={request.$id}>
                          <Card sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ mr: 2 }} src={userProfiles.find(p => p.$id === request.senderId)?.avatarUrl}>
                                {request.senderName?.[0] || '?'}
                              </Avatar>
                              <Typography variant="body1">{request.senderName || 'Unknown User'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button 
                                variant="contained" 
                                size="small" 
                                onClick={() => handleAcceptFriendRequest(request)}
                              >
                                Accept
                              </Button>
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => handleDeclineFriendRequest(request)}
                              >
                                Decline
                              </Button>
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
                {userProfiles.map((profile) => (
                  profile.$id !== user?.$id && (
                    <Grid item xs={12} sm={6} md={4} key={profile.$id}>
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
                              color={profile.status === 'online' ? 'success' : (profile.status === 'away' ? 'warning' : 'default')}
                            >
                              <Avatar src={profile.avatarUrl} sx={{ width: 56, height: 56, mr: 2 }}>{profile.name ? profile.name[0] : '?'}</Avatar>
                            </Badge>
                            <Box>
                              <Typography variant="h6">{profile.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{profile.status || 'offline'}</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              variant="outlined" 
                              size="small"
                              startIcon={<PersonAddIcon />}
                              onClick={() => handleSendFriendRequest(profile.$id)}
                            >
                              Connect
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              startIcon={<ChatIcon />}
                              onClick={() => {
                                setSelectedChatUserId(profile.$id);
                                setTabValue(0);
                              }}
                            >
                              Message
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
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
                  <Grid item xs={12} sm={6} md={4} key={space.$id}>
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
                          {space.participantsCount && space.participantsCount > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {[...Array(Math.min(space.participantsCount, 3))].map((_, i) => (
                                <Avatar 
                                  key={i} 
                                  sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    ml: i > 0 ? -1 : 0,
                                    bgcolor: 'grey.300'
                                  }}
                                />
                              ))}
                              {space.participantsCount > 3 && (
                                <Avatar sx={{ width: 32, height: 32, ml: -1, bgcolor: 'grey.300' }}>
                                  +{space.participantsCount - 3}
                                </Avatar>
                              )}
                            </Box>
                          )}
                        </Box>
                        <Button 
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={space.type === 'voice' ? <CallIcon /> : <VideoCallIcon />}
                          onClick={() => space.$id && handleJoinSpace(space.$id)}
                          disabled={!space.$id}
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
