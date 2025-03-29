import React from 'react';
import { Grid, Typography } from '@mui/material';

export function CalendarDaysOfWeek() {
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
}
