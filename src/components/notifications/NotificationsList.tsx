import React, { useState, useEffect } from 'react';
import { UserNotification } from '@/types/activity';
import NotificationService from '@/services/notificationService';
import { AppwriteService } from '@/services/appwriteService';
import { formatDistanceToNow } from 'date-fns';
import { envConfig } from '@/config/environment';

interface NotificationItemProps {
  notification: UserNotification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.$id);
    }
    
    // Navigate to the link if provided
    if (notification.link) {
      window.location.href = notification.link;
    }
  };
  
  return (
    <div 
      className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
        notification.isRead ? 'opacity-75' : 'font-medium'
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-semibold">{notification.title}</h3>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(notification.$createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
      {!notification.isRead && (
        <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-4 right-4"></div>
      )}
    </div>
  );
};

interface NotificationsListProps {
  profileId: string;
  limit?: number;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ profileId, limit = 10 }) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const appwriteService = new AppwriteService(envConfig);
  const notificationService = new NotificationService(appwriteService);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const fetchedNotifications = await notificationService.getUserNotifications(profileId, limit);
        setNotifications(fetchedNotifications);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchNotifications();
    }
  }, [profileId, limit]);
  
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.$id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead(profileId);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date().toISOString()
        }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading notifications...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }
  
  if (notifications.length === 0) {
    return <div className="p-4 text-center text-gray-500">No notifications</div>;
  }
  
  return (
    <div className="notifications-list">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button 
          onClick={handleMarkAllAsRead}
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          Mark all as read
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.map(notification => (
          <NotificationItem 
            key={notification.$id} 
            notification={notification} 
            onMarkAsRead={handleMarkAsRead} 
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationsList;