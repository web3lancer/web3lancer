import React, { useState } from 'react';
import { Paper, Typography, Box, Grid } from '@mui/material';
import { Today } from '@mui/icons-material';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarDaysOfWeek } from './calendar/CalendarDaysOfWeek';
import { CalendarDaysInMonth } from './calendar/CalendarDaysInMonth';
import { UpcomingEvents } from './calendar/UpcomingEvents';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

export default function CalendarSection() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { events } = useCalendarEvents();

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Today sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5">Calendar</Typography>
      </Box>
      
      <CalendarHeader 
        currentMonth={currentMonth} 
        prevMonth={prevMonth} 
        nextMonth={nextMonth} 
      />
      <CalendarDaysOfWeek />
      <CalendarDaysInMonth 
        currentMonth={currentMonth} 
        events={events} 
      />
      <UpcomingEvents events={events} />
    </Paper>
  );
}
