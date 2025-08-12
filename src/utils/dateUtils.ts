
// src/utils/dateUtils.ts

/**
 * Formats a Date object into a string (e.g., "April 13, 2025").
 * Adjust the options for different formats.
 */
export const formatDate = (date: Date): string => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats a Date object into a time string (e.g., "10:30 AM").
 */
export const formatTime = (date: Date): string => {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats a Date object into a date and time string (e.g., "April 13, 2025, 10:30 AM").
 */
export const formatDateTime = (date: Date): string => {
  if (!date) return '';
  return `${formatDate(date)}, ${formatTime(date)}`;
};

// Add other useful date utility functions as needed
// For example:
// - isSameDay(date1, date2)
// - isToday(date)
// - getStartOfMonth(date)
// - getEndOfMonth(date)
// - addDays(date, days)
