"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  IconButton, 
  Avatar, 
  Badge, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Paper,
  useTheme,
  Tooltip,
  Collapse,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  ExpandLess,
  ExpandMore,
  Close as CloseIcon,
  DragHandle as DragHandleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Define secondary sidebar width
const secondarySidebarWidth = 320;
const minSidebarWidth = 280;
const maxSidebarWidth = 500;
const minNotificationsHeight = 200;
const minMessagesHeight = 200;

interface SecondarySidebarProps {
  drawerWidth?: number;
  width?: number;
  onWidthChange?: (width: number) => void;
}

export default function SecondarySidebar({ 
  drawerWidth = 240, 
  width = secondarySidebarWidth,
  onWidthChange 
}: SecondarySidebarProps) {
  const theme = useTheme();
  const [expandedNotifications, setExpandedNotifications] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState(true);
  const [notificationsHeight, setNotificationsHeight] = useState(window.innerHeight * 0.5);
  const [messagesHeight, setMessagesHeight] = useState(window.innerHeight * 0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [startDragY, setStartDragY] = useState(0);
  const [startHeights, setStartHeights] = useState({ notifications: 0, messages: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(width);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  
  // Update internal state when prop changes
  useEffect(() => {
    setSidebarWidth(width);
  }, [width]);
  
  // Listen for window resize to adjust sidebar positioning if needed
  useEffect(() => {
    const handleResize = () => {
      // Reset vertical panel sizes on window resize
      const totalHeight = window.innerHeight - 64; // Subtract header height
      setNotificationsHeight(totalHeight * 0.5);
      setMessagesHeight(totalHeight * 0.5);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Mock notification data
  const notificationItems = [
    { id: 1, type: 'payment', user: 'Alex Chen', action: 'received payment for', target: 'Smart Contract Development', time: '2 min ago', avatar: '/avatars/user1.jpg' },
    { id: 2, type: 'application', user: 'Maria Lopez', action: 'applied to your job', target: 'Frontend Developer', time: '10 min ago', avatar: '/avatars/user2.jpg' },
    { id: 3, type: 'space', user: 'Web3 Community', action: 'started a new space', target: 'DeFi Innovations', time: '15 min ago', avatar: '/avatars/community1.jpg' },
    { id: 4, type: 'job', user: 'John Smith', action: 'posted a new job', target: 'Blockchain Engineer', time: '30 min ago', avatar: '/avatars/user3.jpg' },
    { id: 5, type: 'community', user: 'Eth Developers', action: 'created a new community', target: 'Ethereum Layer 2', time: '1 hour ago', avatar: '/avatars/community2.jpg' },
  ];
  
  // Mock message data
  const messageItems = [
    { id: 1, user: 'Alex Chen', message: "Hi, I'd like to discuss the project details.", time: '2 min ago', avatar: '/avatars/user1.jpg', unread: true },
    { id: 2, user: 'Maria Lopez', message: 'When can we schedule a call?', time: '10 min ago', avatar: '/avatars/user2.jpg', unread: true },
    { id: 3, user: 'John Smith', message: "I have sent the contract details.", time: '1 hour ago', avatar: '/avatars/user3.jpg', unread: false },
    { id: 4, user: 'Sarah Williams', message: 'Looking forward to working with you!', time: '2 hours ago', avatar: '/avatars/user4.jpg', unread: false },
    { id: 5, user: 'David Kim', message: 'Thanks for your help yesterday.', time: '1 day ago', avatar: '/avatars/user5.jpg', unread: false },
  ];

  // Horizontal resize handlers
  const handleHorizontalResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(sidebarWidth);
    
    document.addEventListener('mousemove', handleHorizontalResizeMove);
    document.addEventListener('mouseup', handleHorizontalResizeEnd);
    
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  const handleHorizontalResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startX;
    // Since we're on the right side, we need to reverse the direction
    const newWidth = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, startWidth - deltaX));
    setSidebarWidth(newWidth);
    
    // Create custom event to notify the rest of the application about the resize
    const resizeEvent = new CustomEvent('secondarySidebarResize', { 
      detail: { width: newWidth } 
    });
    window.dispatchEvent(resizeEvent);
    
    // Notify parent component of width change
    if (onWidthChange) {
      onWidthChange(newWidth);
    }
    
    // Update document styles to indicate resizing
    document.body.style.cursor = 'ew-resize';
  };

  const handleHorizontalResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleHorizontalResizeMove);
    document.removeEventListener('mouseup', handleHorizontalResizeEnd);
    
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Vertical resize handlers
  const handleDragStart = (e: React.MouseEvent, section: 'divider') => {
    setIsDragging(true);
    setStartDragY(e.clientY);
    setStartHeights({
      notifications: notificationsHeight,
      messages: messagesHeight
    });
    
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    // Prevent default behavior
    e.preventDefault();
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = e.clientY - startDragY;
    
    // Calculate new heights ensuring minimums are respected
    const newNotificationsHeight = Math.max(minNotificationsHeight, startHeights.notifications + deltaY);
    const newMessagesHeight = Math.max(minMessagesHeight, startHeights.messages - deltaY);
    
    // Update heights if they're both above minimums
    if (newNotificationsHeight >= minNotificationsHeight && newMessagesHeight >= minMessagesHeight) {
      setNotificationsHeight(newNotificationsHeight);
      setMessagesHeight(newMessagesHeight);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  const toggleNotifications = () => {
    setExpandedNotifications(!expandedNotifications);
    if (expandedNotifications) {
      // If collapsing, store current height and expand messages
      setMessagesHeight(messagesHeight + notificationsHeight);
    } else {
      // If expanding, restore from collapsed state
      setNotificationsHeight(window.innerHeight * 0.5);
      setMessagesHeight(window.innerHeight * 0.5);
    }
  };

  const toggleMessages = () => {
    setExpandedMessages(!expandedMessages);
    if (expandedMessages) {
      // If collapsing, store current height and expand notifications
      setNotificationsHeight(notificationsHeight + messagesHeight);
    } else {
      // If expanding, restore from collapsed state
      setNotificationsHeight(window.innerHeight * 0.5);
      setMessagesHeight(window.innerHeight * 0.5);
    }
  };

  const getNotificationContent = (item: typeof notificationItems[0]) => {
    let color;
    switch (item.type) {
      case 'payment':
        color = theme.palette.success.main;
        break;
      case 'application':
        color = theme.palette.info.main;
        break;
      case 'space':
        color = theme.palette.warning.main;
        break;
      case 'job':
        color = theme.palette.primary.main;
        break;
      case 'community':
        color = theme.palette.secondary.main;
        break;
      default:
        color = theme.palette.text.primary;
    }

    return (
      <>
        <Typography component="span" sx={{ fontWeight: 600 }}>{item.user}</Typography>
        <Typography component="span"> {item.action} </Typography>
        <Typography component="span" sx={{ color, fontWeight: 500 }}>{item.target}</Typography>
      </>
    );
  };

  const NotificationsPanel = (
    <Box sx={{ 
      height: expandedNotifications ? notificationsHeight : 48, 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'height 0.3s ease'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        height: 48,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge badgeContent={notificationItems.length} color="error" sx={{ mr: 1 }}>
            <NotificationsIcon color="action" />
          </Badge>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        <IconButton onClick={toggleNotifications} size="small">
          {expandedNotifications ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      
      <Collapse in={expandedNotifications} sx={{ 
        overflow: 'auto', 
        height: 'calc(100% - 48px)',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '4px',
        },
      }}>
        <List sx={{ py: 0 }}>
          {notificationItems.map((item) => (
            <ListItem 
              key={item.id} 
              divider 
              sx={{ 
                py: 1.5,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}
            >
              <ListItemAvatar>
                <Avatar src={item.avatar} />
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Box sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {getNotificationContent(item)}
                  </Box>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {item.time}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );

  const MessagesPanel = (
    <Box sx={{ 
      height: expandedMessages ? messagesHeight : 48, 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'height 0.3s ease'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        height: 48,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge 
            badgeContent={messageItems.filter(m => m.unread).length} 
            color="error" 
            sx={{ mr: 1 }}
          >
            <ChatIcon color="action" />
          </Badge>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Messages
          </Typography>
        </Box>
        <IconButton onClick={toggleMessages} size="small">
          {expandedMessages ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      
      <Collapse in={expandedMessages} sx={{ 
        overflow: 'auto', 
        height: 'calc(100% - 48px)',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '4px',
        },
      }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Recent" />
          <Tab label="Unread" />
        </Tabs>
        
        <List sx={{ py: 0 }}>
          {messageItems
            .filter(msg => activeTab === 0 || (activeTab === 1 && msg.unread))
            .map((item) => (
              <ListItem 
                key={item.id} 
                divider 
                sx={{ 
                  py: 1.5,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  backgroundColor: item.unread ? alpha(theme.palette.primary.light, 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: item.unread 
                      ? alpha(theme.palette.primary.light, 0.15) 
                      : theme.palette.action.hover,
                  }
                }}
              >
                <ListItemAvatar>
                  <Badge 
                    variant="dot" 
                    color="success" 
                    overlap="circular" 
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    sx={{ 
                      '& .MuiBadge-badge': {
                        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
                      }
                    }}
                  >
                    <Avatar src={item.avatar} />
                  </Badge>
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: item.unread ? 700 : 400 }}>
                        {item.user}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {item.time}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: item.unread ? theme.palette.text.primary : theme.palette.text.secondary,
                        fontWeight: item.unread ? 500 : 400,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.message}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
        </List>
      </Collapse>
    </Box>
  );

  const DividerHandle = (
    <Box 
      sx={{ 
        height: '10px', 
        cursor: 'ns-resize',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        }
      }}
      onMouseDown={(e) => handleDragStart(e, 'divider')}
    >
      <DragHandleIcon sx={{ fontSize: 18, color: theme.palette.action.active }} />
    </Box>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Horizontal resize handle */}
      <Box
        ref={resizeHandleRef}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '8px',
          cursor: 'ew-resize',
          zIndex: theme.zIndex.appBar - 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)',
          },
          '&:active': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.2)' 
              : 'rgba(0, 0, 0, 0.2)',
          },
          transition: 'background-color 0.2s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            height: '30px',
            width: '3px',
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.3)' 
              : 'rgba(0, 0, 0, 0.2)',
            borderRadius: '3px',
          }
        }}
        onMouseDown={handleHorizontalResizeStart}
      />
      
      <Box
        component={Paper}
        elevation={2}
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          position: 'fixed',
          top: 64, // Header height
          right: 0,
          bottom: 0,
          width: sidebarWidth,
          background: theme.palette.background.paper,
          borderLeft: `1px solid ${theme.palette.divider}`,
          zIndex: theme.zIndex.appBar - 1,
          overflow: 'hidden',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.05)', // Add left-side shadow
          transition: theme.transitions.create(['width', 'background-color'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {NotificationsPanel}
        
        {expandedNotifications && expandedMessages && DividerHandle}
        
        {MessagesPanel}
      </Box>
    </Box>
  );
}

function alpha(color: string, opacity: number): string {
  // Simple alpha function for demo purposes
  return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
}