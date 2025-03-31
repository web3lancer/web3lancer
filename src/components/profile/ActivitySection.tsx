import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Chip, Button } from '@mui/material';

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

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Activity Log
        </Typography>
        <List>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{getActivityIcon(activity.type)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" component="span">
                          {activity.message}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={activity.type} 
                          color={getActivityTypeColor(activity.type) as any}
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {formatTimestamp(activity.timestamp)}
                        </Typography>
                        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
                          {Object.entries(activity.details).map(([key, value]) => (
                            <Box key={key} sx={{ display: 'flex', fontSize: '0.875rem' }}>
                              <Typography component="span" sx={{ fontWeight: 500, mr: 1, color: 'text.secondary' }}>
                                {key}:
                              </Typography>
                              <Typography component="span" sx={{ color: 'text.primary' }}>
                                {Array.isArray(value) ? value.join(', ') : String(value)}
                              </Typography>
                            </Box>
                          ))}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < filteredActivities.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No activity found matching your criteria</Typography>
            </Box>
          )}
        </List>
        
        {filteredActivities.length > 0 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Button variant="outlined">Load More</Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ActivitySection;