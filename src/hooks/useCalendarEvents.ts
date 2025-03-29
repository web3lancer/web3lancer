import { useState, useEffect } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'meeting' | 'deadline' | 'payment';
}

export function useCalendarEvents() {
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

  // You can add logic to fetch events from API if needed
  useEffect(() => {
    // Fetch events here if needed
  }, []);

  return { events, setEvents };
}
