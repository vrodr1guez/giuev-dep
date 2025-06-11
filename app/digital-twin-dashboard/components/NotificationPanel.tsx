"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  timestamp: string;
}

interface NotificationPanelProps {
  show: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ show, onClose, notifications }) => {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute top-20 right-6 w-96 bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-2xl border border-blue-500/30 z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-blue-300 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700 transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              No new notifications.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
              {notifications.map(notif => (
                <div key={notif.id} className="p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-200">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-slate-800 border-t border-slate-700 text-center">
            <button className="text-sm text-blue-400 hover:underline">
              View All Notifications
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default NotificationPanel; 