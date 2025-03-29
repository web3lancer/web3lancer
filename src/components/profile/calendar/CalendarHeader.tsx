import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface CalendarHeaderProps {
  currentMonth: Date;
  prevMonth: () => void;
  nextMonth: () => void;
}

export function CalendarHeader({ currentMonth, prevMonth, nextMonth }: CalendarHeaderProps) {
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
}
