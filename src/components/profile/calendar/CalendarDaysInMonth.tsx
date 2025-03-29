import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { CalendarEvent } from '@/hooks/useCalendarEvents';

interface CalendarDaysInMonthProps {
  currentMonth: Date;
  events: CalendarEvent[];
}

export function CalendarDaysInMonth({ currentMonth, events }: CalendarDaysInMonthProps) {
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
}
