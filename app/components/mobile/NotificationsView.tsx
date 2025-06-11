/// <reference path="../../types/react.d.ts" />
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, BatteryCharging, Battery, Zap, Clock, Calendar, ChevronRight, X, Settings } from 'lucide-react';
import { useNotifications } from '../../hooks/useWebSocket';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  created_at: string;
  data?: any;
}

interface NotificationsViewProps {
  initialNotifications?: Notification[];
  onClose?: () => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ 
  initialNotifications = [], 
  onClose 
}) => {
  const [notifications, setNotifications] = useState(initialNotifications as Notification[]);
  const [activeTab, setActiveTab] = useState('all' as string);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false as boolean);
  
  // Connect to real-time notifications
  const { status, lastNotification } = useNotifications({
    token: 'demo-token', // In production, get from auth context
    onNotification: (data) => {
      // Add new notification to the list
      setNotifications(prev => [data, ...prev]);
    }
  });
  
  // Add new notification when received through websocket
  useEffect(() => {
    if (lastNotification) {
      setNotifications(prev => [lastNotification, ...prev.filter(n => n.id !== lastNotification.id)]);
    }
  }, [lastNotification]);
  
  // Function to mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/mobile/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true } 
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/v1/mobile/notifications/read-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Function to delete a notification
  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/mobile/notifications/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'charging') return notification.type.includes('charging');
    if (activeTab === 'battery') return notification.type.includes('battery');
    if (activeTab === 'alerts') return notification.priority === 'high' || notification.priority === 'critical';
    return true;
  });
  
  // Function to get icon for notification type
  const getNotificationIcon = (type: string, priority: string) => {
    if (type.includes('charging')) return <BatteryCharging size={20} className="text-purple-500" />;
    if (type.includes('battery')) return <Battery size={20} className="text-green-500" />;
    if (type.includes('optimization')) return <Zap size={20} className="text-amber-500" />;
    if (type.includes('schedule')) return <Calendar size={20} className="text-blue-500" />;
    if (priority === 'critical') return <AlertCircle size={20} className="text-red-500" />;
    if (priority === 'high') return <AlertCircle size={20} className="text-orange-500" />;
    return <Bell size={20} className="text-gray-500" />;
  };
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Bell size={20} className="text-blue-500" />
          <h2 className="text-lg font-semibold dark:text-white">Notifications</h2>
          {!status && (
            <span className="text-xs bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full">
              Offline
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Settings size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-1 p-2 bg-gray-50 dark:bg-gray-800">
        {['all', 'unread', 'charging', 'battery', 'alerts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium ${
              activeTab === tab 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between items-center px-4 py-2 border-b dark:border-gray-700">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={markAllAsRead}
          className="text-sm text-blue-600 dark:text-blue-400"
        >
          Mark all as read
        </button>
      </div>
      
      {/* Notification list */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          <ul className="divide-y dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <li
                key={notification.id}
                className={`relative ${notification.read ? 'bg-white dark:bg-gray-900' : 'bg-blue-50 dark:bg-gray-800'}`}
              >
                <div className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex-shrink-0 pt-0.5">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {notification.message}
                    </p>
                    
                    {/* Actions */}
                    <div className="mt-2 flex justify-between">
                      <div className="flex space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs text-gray-700 dark:text-gray-300"
                          >
                            Mark read
                          </button>
                        )}
                        {notification.data?.actionUrl && (
                          <a
                            href={notification.data.actionUrl}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-md text-xs text-blue-700 dark:text-blue-300"
                          >
                            {notification.data.actionText || 'View'}
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Bell size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You don't have any {activeTab !== 'all' ? activeTab : ''} notifications at the moment.
            </p>
          </div>
        )}
      </div>
      
      {/* Settings modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">Notification Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Notification Channels</h4>
                <div className="space-y-2">
                  {['Push Notifications', 'Email Notifications', 'SMS Notifications'].map((channel) => (
                    <div key={channel} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{channel}</span>
                      <label className="relative inline-block w-12 h-6">
                        <input type="checkbox" defaultChecked={channel === 'Push Notifications'} className="opacity-0 w-0 h-0" />
                        <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 transition-all duration-300 rounded-full before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:transition-all before:duration-300 before:rounded-full checked:bg-blue-600 checked:before:translate-x-6"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Notification Types</h4>
                <div className="space-y-2">
                  {[
                    'Charging Complete', 
                    'Charging Started', 
                    'Battery Status', 
                    'Charging Recommendations',
                    'Price Alerts',
                    'System Notifications'
                  ].map((type) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{type}</span>
                      <label className="relative inline-block w-12 h-6">
                        <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0" />
                        <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 transition-all duration-300 rounded-full before:absolute before:content-[''] before:h-5 before:w-5 before:left-0.5 before:bottom-0.5 before:bg-white before:transition-all before:duration-300 before:rounded-full checked:bg-blue-600 checked:before:translate-x-6"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t dark:border-gray-700">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsView; 