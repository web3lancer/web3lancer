'use client';

import React, { useState, useEffect } from 'react';
// import { useAuth } from '@/components/auth/AuthContext';
import NotificationService from '@/services/notificationService';
import { AppwriteService } from '@/services/appwriteService';
import { UserNotification } from '@/types/activity';
import { formatDistanceToNow } from 'date-fns';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  
  const appwriteService = new AppwriteService();
  const notificationService = new NotificationService(appwriteService);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !user.profileId) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedNotifications = await notificationService.getUserNotifications(
          user.profileId,
          50 // Fetch more for this page
        );
        setNotifications(fetchedNotifications);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user]);
  
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
    if (!user || !user.profileId) return;
    
    try {
      await notificationService.markAllNotificationsAsRead(user.profileId);
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
  
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.$id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };
  
  const filteredNotifications = tab === 'unread'
    ? notifications.filter(notification => !notification.isRead)
    : notifications;
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8">
          Please log in to view your notifications.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 ${tab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                onClick={() => setTab('all')}
              >
                All
              </button>
              <button
                className={`px-4 py-2 ${tab === 'unread' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                onClick={() => setTab('unread')}
              >
                Unread
              </button>
            </div>
            
            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={handleMarkAllAsRead}
              disabled={!notifications.some(n => !n.isRead)}
            >
              Mark all as read
            </button>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FiBell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>
                {tab === 'all' 
                  ? "You don't have any notifications yet."
                  : "You don't have any unread notifications."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.$id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <p className="mt-1 text-gray-600">{notification.message}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.$createdAt), { addSuffix: true })}
                        {notification.isRead && notification.readAt && (
                          <span className="ml-2">
                            · Read {formatDistanceToNow(new Date(notification.readAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.$id)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Mark as read"
                        >
                          <FiCheck className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.$id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete notification"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {notification.link && (
                    <div className="mt-2">
                      <a 
                        href={notification.link}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;