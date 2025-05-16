import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Notification } from '@/types/governance';
import NotificationService from '@/services/notificationService';
import { BellIcon } from '@heroicons/react/24/outline';

interface NotificationDropdownProps {
  notificationService: NotificationService;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notificationService }) => {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userNotifications = await notificationService.listNotifications([
          'Query.equal("recipientId", "' + user.id + '")',
          'Query.orderDesc("$createdAt")',
          'Query.limit(10)'
        ]);
        
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
    
    // Set up interval to check for new notifications
    const intervalId = setInterval(fetchNotifications, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [user, notificationService]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.$id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatNotificationTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <div className="bg-blue-100 p-2 rounded-full"><BellIcon className="h-4 w-4 text-blue-500" /></div>;
      case 'contract':
        return <div className="bg-green-100 p-2 rounded-full"><BellIcon className="h-4 w-4 text-green-500" /></div>;
      case 'payment':
        return <div className="bg-yellow-100 p-2 rounded-full"><BellIcon className="h-4 w-4 text-yellow-500" /></div>;
      case 'dispute':
        return <div className="bg-red-100 p-2 rounded-full"><BellIcon className="h-4 w-4 text-red-500" /></div>;
      default:
        return <div className="bg-gray-100 p-2 rounded-full"><BellIcon className="h-4 w-4 text-gray-500" /></div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Notifications</span>
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li 
                    key={notification.$id}
                    className={`p-3 hover:bg-gray-50 ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                  >
                    <a 
                      href={notification.actionUrl || '#'}
                      onClick={(e) => {
                        if (!notification.isRead) {
                          handleMarkAsRead(notification.$id);
                        }
                      }}
                      className="flex items-start gap-3"
                    >
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-800' : 'text-black'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatNotificationTime(notification.$createdAt)}
                        </p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-2 border-t border-gray-100 text-center">
            <a href="/notifications" className="text-xs text-blue-600 hover:text-blue-800">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;