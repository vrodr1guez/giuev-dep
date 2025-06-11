/// <reference path="../../types/react.d.ts" />
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BatteryCharging, MapPin, Plus, Edit, Trash, Info, ChevronRight, ChevronDown, Zap } from 'lucide-react';

interface ChargingSchedule {
  id: number;
  name: string | null;
  description: string | null;
  start_time: string;
  end_time: string;
  target_soc: number;
  charging_preference: string;
  is_active: boolean;
  is_complete: boolean;
  is_recurring: boolean;
  recurrence_pattern: any;
  created_at: string;
  vehicle_id: number;
  vehicle_name?: string;
  location_name?: string;
}

interface ChargingScheduleViewProps {
  initialSchedules?: ChargingSchedule[];
  vehicles?: any[];
  onCreateSchedule?: () => void;
}

const ChargingScheduleView: React.FC<ChargingScheduleViewProps> = ({
  initialSchedules = [],
  vehicles = [],
  onCreateSchedule
}) => {
  const [schedules, setSchedules] = useState(initialSchedules as ChargingSchedule[]);
  const [loading, setLoading] = useState(false as boolean);
  const [expandedId, setExpandedId] = useState(null as number | null);
  const [activeTab, setActiveTab] = useState('upcoming' as string);
  
  useEffect(() => {
    fetchSchedules();
  }, [activeTab]);
  
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/mobile/charging-schedules?active_only=${activeTab === 'upcoming'}`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching charging schedules:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteSchedule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this charging schedule?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/v1/mobile/charging-schedules/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      }
    } catch (error) {
      console.error('Error deleting charging schedule:', error);
    }
  };
  
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };
  
  const formatTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };
  
  const getPreferenceColor = (preference: string) => {
    switch (preference) {
      case 'eco':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30';
      case 'cost':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30';
      case 'speed':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30';
      case 'balanced':
        return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';
    }
  };
  
  const getPreferenceIcon = (preference: string) => {
    switch (preference) {
      case 'eco':
        return <Zap size={14} className="mr-1" />;
      case 'cost':
        return <span className="mr-1">$</span>;
      case 'speed':
        return <Clock size={14} className="mr-1" />;
      case 'balanced':
        return <span className="mr-1">⚖️</span>;
      default:
        return null;
    }
  };
  
  const getRecurrenceText = (pattern: any) => {
    if (!pattern) return 'One-time';
    
    const { type, days } = pattern;
    
    if (type === 'daily') return 'Daily';
    
    if (type === 'weekly' && days) {
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      if (days.length === 7) return 'Every day';
      if (days.length === 5 && !days.includes(5) && !days.includes(6)) return 'Weekdays';
      if (days.length === 2 && days.includes(5) && days.includes(6)) return 'Weekends';
      return days.map(d => dayNames[d]).join(', ');
    }
    
    return 'Custom';
  };
  
  const groupSchedulesByDate = () => {
    const grouped: { [key: string]: ChargingSchedule[] } = {};
    
    schedules.forEach(schedule => {
      const date = new Date(schedule.start_time);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      
      grouped[dateStr].push(schedule);
    });
    
    return grouped;
  };
  
  const groupedSchedules = groupSchedulesByDate();
  const dateKeys = Object.keys(groupedSchedules).sort();
  
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }).format(date);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Calendar size={20} className="text-blue-500" />
          <h2 className="text-lg font-semibold dark:text-white">Charging Schedule</h2>
        </div>
        <button 
          onClick={onCreateSchedule}
          className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          <Plus size={18} />
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex space-x-1 p-2 bg-gray-50 dark:bg-gray-800">
        {['upcoming', 'all', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium ${
              activeTab === tab 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Schedule list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : schedules.length > 0 ? (
          <div className="divide-y dark:divide-gray-700">
            {dateKeys.map(dateKey => (
              <div key={dateKey} className="mb-2">
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">
                  {formatDateHeader(dateKey)}
                </div>
                {groupedSchedules[dateKey].map((schedule) => (
                  <div key={schedule.id} className="border-b dark:border-gray-700 last:border-b-0">
                    <div 
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === schedule.id ? null : schedule.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <BatteryCharging size={16} className="text-blue-500 mr-1" />
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {schedule.name || `Charge to ${schedule.target_soc}%`}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-xs px-2 py-0.5 rounded-full flex items-center ${getPreferenceColor(schedule.charging_preference)}`}>
                            {getPreferenceIcon(schedule.charging_preference)}
                            {schedule.charging_preference.charAt(0).toUpperCase() + schedule.charging_preference.slice(1)}
                          </span>
                          {schedule.is_recurring && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {getRecurrenceText(schedule.recurrence_pattern)}
                            </span>
                          )}
                        </div>
                        {expandedId === schedule.id ? (
                          <ChevronDown size={16} className="ml-2 text-gray-400" />
                        ) : (
                          <ChevronRight size={16} className="ml-2 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded details */}
                    {expandedId === schedule.id && (
                      <div className="p-4 pt-0 pb-3 bg-gray-50 dark:bg-gray-800 text-sm">
                        {schedule.description && (
                          <p className="text-gray-600 dark:text-gray-300 mt-2 mb-3">
                            {schedule.description}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <div className="flex items-center">
                            <Clock size={14} className="text-gray-500 mr-1.5" />
                            <span className="text-gray-600 dark:text-gray-300">
                              {formatDateTime(schedule.start_time)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <BatteryCharging size={14} className="text-gray-500 mr-1.5" />
                            <span className="text-gray-600 dark:text-gray-300">
                              Target: {schedule.target_soc}%
                            </span>
                          </div>
                          {schedule.vehicle_name && (
                            <div className="flex items-center col-span-2">
                              <span className="text-gray-600 dark:text-gray-300">
                                Vehicle: {schedule.vehicle_name}
                              </span>
                            </div>
                          )}
                          {schedule.location_name && (
                            <div className="flex items-center col-span-2">
                              <MapPin size={14} className="text-gray-500 mr-1.5" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {schedule.location_name}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex mt-4 space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit
                            }}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center"
                          >
                            <Edit size={14} className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSchedule(schedule.id);
                            }}
                            className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-md text-xs font-medium text-red-700 dark:text-red-300 flex items-center"
                          >
                            <Trash size={14} className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No charging schedules</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You don't have any {activeTab} charging schedules.
            </p>
            <button
              onClick={onCreateSchedule}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
            >
              <Plus size={16} className="mr-1.5" />
              Create Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChargingScheduleView; 