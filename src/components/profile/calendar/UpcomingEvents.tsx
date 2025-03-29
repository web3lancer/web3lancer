import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { CalendarEvent } from '@/hooks/useCalendarEvents';

interface UpcomingEventsProps {
  events: CalendarEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const today = new Date();
  const upcomingEvents = events
    .filter(event => event.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);
  
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Upcoming Events</Typography>
      {upcomingEvents.length > 0 ? (
        <Grid container spacing={2}>
          {upcomingEvents.map(event => (
            <Grid item xs={12} key={event.id}>
              <Card sx={{ bgcolor: 'background.paper' }}>
                <CardContent>
                  <Typography variant="subtitle1">{event.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">No upcoming events</Typography>
      )}
    </Box>
  );
}
