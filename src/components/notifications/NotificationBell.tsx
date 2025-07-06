import React, { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import NotificationsList from './NotificationsList';
import { NotificationService } from '@/services/notificationService';
import { AppwriteService } from '@/services/appwriteService';
import { defaultEnvConfig } from '@/config/environment';

interface NotificationBellProps {
  profileId: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ profileId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const appwriteService = new AppwriteService(defaultEnvConfig);
  const notificationService = new NotificationService(appwriteService, defaultEnvConfig);
  
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadNotificationCount(profileId);
        setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching unread notifications count:', err);
      }
    };
    
    if (profileId) {
      fetchUnreadCount();
      
      // Poll for new notifications every minute
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [profileId]);
  
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
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 text-gray-600 hover:text-blue-500 focus:outline-none"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <FiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10">
          <NotificationsList profileId={profileId} limit={5} />
          
          <div className="p-2 text-center border-t">
            <a 
              href="/notifications"
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;