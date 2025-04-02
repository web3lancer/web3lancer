/**
 * Format date to a readable string
 * @param {Date|string} date - The date to format
 * @param {string} format - The format to use
 * @returns {string} - Formatted date string
 */
export function formatDate(date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Handle invalid date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  try {
    const options: Intl.DateTimeFormatOptions = getFormatOptions(format);
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    // Fallback simple formatter
    return dateObj.toLocaleDateString();
  }
}

function getFormatOptions(format: 'short' | 'medium' | 'long'): Intl.DateTimeFormatOptions {
  switch (format) {
    case 'short':
      return {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit'
      };
    case 'long':
      return {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
    case 'medium':
    default:
      return {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      };
  }
}

/**
 * Format time to a readable string
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted time string
 */
export function formatTime(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Handle invalid date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid time';
  }
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting time:', error);
    // Fallback simple formatter
    return dateObj.toLocaleTimeString();
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Handle invalid date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffInMilliseconds = now.getTime() - dateObj.getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(dateObj);
  }
}

/**
 * Parse a date string to a Date object
 * @param {string} dateString - The date string to parse
 * @returns {Date} - Parsed Date object
 */
export function parseDate(dateString: string): Date {
  try {
    return new Date(dateString);
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date(); // Return current date as fallback
  }
}
