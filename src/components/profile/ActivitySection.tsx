import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Chip, Button } from '@mui/material';
import { motion } from 'framer-motion';
import TimelineIcon from '@mui/icons-material/Timeline';

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  details: Record<string, any>;
}

interface ActivitySectionProps {
  activities: Activity[];
  filterCriteria: string;
}

const getActivityIcon = (type: string) => {
  // Return an appropriate icon based on the activity type
  return type.charAt(0).toUpperCase();
};

const getActivityTypeColor = (type: string) => {
  // Return a color based on the activity type
  switch (type) {
    case 'login':
      return 'primary';
    case 'update':
      return 'secondary';
    case 'payment':
      return 'success';
    case 'security':
      return 'error';
    default:
      return 'default';
  }
};

const formatTimestamp = (timestamp: string) => {
  // Format the timestamp
  return new Date(timestamp).toLocaleString();
};

const ActivitySection: React.FC<ActivitySectionProps> = ({ activities, filterCriteria }) => {
  const filteredActivities = activities.filter(activity =>
    activity.type.includes(filterCriteria) || activity.message.includes(filterCriteria)
  );

  // Sample activities for demonstration if none provided
  const sampleActivities = [
    {
      id: '1',
      type: 'login',
      message: 'Successful login from new device',
      timestamp: new Date().toISOString(),
      details: { device: 'MacBook Pro', browser: 'Chrome', location: 'New York, USA' }
    },
    {
      id: '2',
      type: 'update',
      message: 'Profile information updated',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      details: { fields: ['Bio', 'Skills'], user: 'You' }
    },
    {
      id: '3',
      type: 'payment',
      message: 'Payment received for project completion',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      details: { amount: '1,500 XLM', project: 'Web3 Integration', client: 'Blockchain Inc.' }
    }
  ];

  const displayActivities = filteredActivities.length > 0 ? filteredActivities : sampleActivities;

  return (
    <Box 
      sx={{ mt: 2 }}
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(135deg, rgba(32,151,255,0.02) 0%, rgba(120,87,255,0.02) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Activity Log
          </Typography>
        </Box>
        
        <List sx={{ 
          maxHeight: '60vh', 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          }
        }}>
          {displayActivities.length > 0 ? (
            displayActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    borderRadius: 2,
                    mb: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(32,151,255,0.05)',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        background: `linear-gradient(135deg, ${activity.type === 'login' ? '#2097ff' : 
                          activity.type === 'update' ? '#7857ff' : 
                          activity.type === 'payment' ? '#2ed573' : '#ff6b6b'} 0%, rgba(255,255,255,0.2) 100%)`,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" component="span" fontWeight="medium">
                          {activity.message}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={activity.type} 
                          color={getActivityTypeColor(activity.type) as any}
                          sx={{ 
                            ml: 1, 
                            fontSize: '0.7rem',
                            borderRadius: '4px',
                            background: activity.type === 'login' ? 'linear-gradient(90deg, #2097ff 0%, #5187ff 100%)' :
                              activity.type === 'update' ? 'linear-gradient(90deg, #7857ff 0%, #9b57ff 100%)' :
                              activity.type === 'payment' ? 'linear-gradient(90deg, #2ed573 0%, #7bed9f 100%)' :
                              'linear-gradient(90deg, #ff6b6b 0%, #ff9f9f 100%)',
                            color: 'white'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {formatTimestamp(activity.timestamp)}
                        </Typography>
                        <Box 
                          sx={{ 
                            mt: 1, 
                            p: 1, 
                            borderRadius: 1, 
                            bgcolor: 'rgba(0,0,0,0.02)',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          {Object.entries(activity.details).map(([key, value]) => (
                            <Box key={key} sx={{ display: 'flex', fontSize: '0.875rem', mb: 0.5 }}>
                              <Typography component="span" sx={{ fontWeight: 500, mr: 1, color: 'text.secondary', width: '80px' }}>
                                {key}:
                              </Typography>
                              <Typography component="span" sx={{ color: 'text.primary' }}>
                                {Array.isArray(value) ? value.join(', ') : String(value)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                {index < displayActivities.length - 1 && (
                  <Divider variant="inset" component="li" sx={{ ml: 0 }} />
                )}
              </motion.div>
            ))
          ) : (
            <Box 
              sx={{ 
                py: 4, 
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderRadius: 2
              }}
            >
              <Typography color="text.secondary">No activity found matching your criteria</Typography>
            </Box>
          )}
        </List>
        
        {displayActivities.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              sx={{ 
                borderRadius: 2,
                borderColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(32,151,255,0.05)',
                  borderColor: 'primary.dark',
                }
              }}
            >
              Load More
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ActivitySection;