'use client';

import React from 'react';
import {
  CheckCircle2,
  Wrench,
  X,
  BatteryCharging,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'default' | 'sm' | 'lg';
}

interface StatusDetails {
  label: string;
  color: string;
  icon: React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'default' }) => {
  const getStatusDetails = (status: string): StatusDetails => {
    switch (status.toLowerCase()) {
      case 'active':
        return { 
          label: 'Active', 
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle2 className="w-3 h-3 mr-1" />
        };
      case 'maintenance':
        return { 
          label: 'Maintenance', 
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <Wrench className="w-3 h-3 mr-1" />
        };
      case 'inactive':
        return { 
          label: 'Inactive', 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <X className="w-3 h-3 mr-1" />
        };
      case 'charging':
        return { 
          label: 'Charging', 
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <BatteryCharging className="w-3 h-3 mr-1" />
        };
      case 'warning':
        return { 
          label: 'Warning', 
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: <AlertTriangle className="w-3 h-3 mr-1" />
        };
      default:
        return { 
          label: status, 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <Clock className="w-3 h-3 mr-1" />
        };
    }
  };

  const { label, color, icon } = getStatusDetails(status);
  
  const sizeClass = size === 'sm' ? 'text-xs py-0 px-1.5' : 
                   size === 'lg' ? 'text-sm py-1 px-3' : 
                   'text-xs py-0.5 px-2';

  return (
    <div className={`inline-flex items-center rounded-full border ${color} ${sizeClass}`}>
      {icon}
      {label}
    </div>
  );
};

export default StatusBadge; 