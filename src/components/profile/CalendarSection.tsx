import React, { useState } from 'react';
import { Paper, Typography, Box, Grid, Card, CardContent, IconButton } from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today
} from '@mui/icons-material';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'meeting' | 'deadline' | 'payment';
}

export default function CalendarSection() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Project Meeting',
      date: new Date(2023, new Date().getMonth(), 15),
      type: 'meeting'
    },
    {
      id: '2',
      title: 'Project Deadline',
      date: new Date(2023, new Date().getMonth(), 25),
      type: 'deadline'
    },
    {
      id: '3',
      title: 'Payment Due',
      date: new Date(2023, new Date().getMonth(), 30),
      type: 'payment'
    }
  ]);

  const renderCalendarHeader = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={prevMonth}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Typography>
        <IconButton onClick={nextMonth}>
          <ChevronRight />
        </IconButton>
      </Box>
    );
  };

  const renderDaysOfWeek = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <Grid container sx={{ mb: 1 }}>
        {daysOfWeek.map(day => (
          <Grid item xs={12/7} key={day}>
            <Typography variant="body2" align="center" fontWeight="bold">
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Get the day of the week of the first day (0-6, where 0 is Sunday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    // Get the last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<Grid item xs={12/7} key={`empty-${i}`} />);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= lastDayOfMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = events.filter(event => 
        event.date.getDate() === day && 
        event.date.getMonth() === month && 
        event.date.getFullYear() === year
      );
      
      days.push(
        <Grid item xs={12/7} key={day}>
          <Box 
            sx={{ 
              position: 'relative',
              height: 40,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: dayEvents.length > 0 ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              border: dayEvents.length > 0 ? '1px solid rgba(59, 130, 246, 0.3)' : 'none',
              '&:hover': {
                bgcolor: 'rgba(59, 130, 246, 0.05)'
              }
            }}
          >
            <Typography variant="body2">
              {day}
            </Typography>
            {dayEvents.length > 0 && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  bottom: 2,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#3B82F6'
                }}
              />
            )}
          </Box>
        </Grid>
      );
    }
    
    return (
      <Grid container spacing={1}>
        {days}
      </Grid>
    );
  };

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const renderUpcomingEvents = () => {
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
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Today sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5">Calendar</Typography>
      </Box>
      
      {renderCalendarHeader()}
      {renderDaysOfWeek()}
      {renderDaysInMonth()}
      {renderUpcomingEvents()}
    </Paper>
  );
}
