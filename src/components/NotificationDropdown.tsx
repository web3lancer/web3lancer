import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, AlertCircle, MessageCircle, DollarSign } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import ServiceFactory from '@/services/serviceFactory';
import NotificationService from '@/services/notificationService';
import { Notification } from '@/types/activity';

interface NotificationDropdownProps {
  maxHeight?: number;
  maxNotifications?: number;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  maxHeight = 400,
  maxNotifications = 10
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuthContext();
  
  // Get services
  const serviceFactory = ServiceFactory.getInstance();
  const notificationService = new NotificationService(
    serviceFactory.getAppwriteService(),
    serviceFactory.getConfig()
  );

  // Load notifications
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setIsLoading(true);
      const userNotifications = await notificationService.getUserNotifications(
        user.$id, 
        maxNotifications
      );
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const count = await notificationService.getUnreadNotificationCount(user.$id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      
      // Update the notification in the local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.$id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date().toISOString() } 
            : notif
        )
      );
      
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      await notificationService.markAllNotificationsAsRead(user.$id);
      
      // Update all notifications in the local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_application':
      case 'proposal_accepted':
      case 'contract_signed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      
      case 'milestone_completed':
      case 'milestone_approved':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      
      case 'payment_released':
      case 'payment_received':
        return <DollarSign className="h-5 w-5 text-emerald-500" />;
      
      case 'new_message':
      case 'message_reply':
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      
      case 'dispute_created':
      case 'warning':
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // If opening the dropdown, refresh notifications
    if (newIsOpen) {
      fetchNotifications();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700"
          style={{ maxHeight: `${maxHeight}px` }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="text-sm text-blue-500 hover:text-blue-700"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          {/* Notification List */}
          <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight - 60}px` }}>
            {isLoading ? (
              <div className="flex justify-center items-center p-4">
                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications to display
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li 
                    key={notification.$id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex">
                      <div className="mr-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{notification.title}</p>
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.$createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex gap-2 mt-1">
                            {notification.actions.map((action, index) => (
                              <a
                                key={index}
                                href={action.url}
                                className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded"
                              >
                                {action.label}
                              </a>
                            ))}
                          </div>
                        )}
                        {!notification.isRead && (
                          <button
                            className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => markAsRead(notification.$id)}
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
            <a href="/notifications" className="text-sm text-blue-500 hover:text-blue-700">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;