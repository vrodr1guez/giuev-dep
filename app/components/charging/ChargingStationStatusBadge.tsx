'use client';

import React from 'react';
import { Badge } from "../ui/badge";
import {
  CheckCircle2,
  Wrench,
  X,
  BatteryCharging
} from 'lucide-react';

interface ChargingStationStatusBadgeProps {
  status: string;
  size?: 'default' | 'sm' | 'lg';
}

const ChargingStationStatusBadge: React.FC<ChargingStationStatusBadgeProps> = ({ status, size = 'default' }) => {
  const getStatusDetails = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return { 
          label: 'Available', 
          color: 'bg-green-500/10 text-green-500 border-green-500/20',
          icon: <CheckCircle2 className="w-3 h-3 mr-1" />
        };
      case 'in-use':
        return { 
          label: 'In-Use', 
          color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          icon: <BatteryCharging className="w-3 h-3 mr-1" />
        };
      case 'maintenance':
        return { 
          label: 'Maintenance', 
          color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          icon: <Wrench className="w-3 h-3 mr-1" />
        };
      case 'offline':
        return { 
          label: 'Offline', 
          color: 'bg-red-500/10 text-red-500 border-red-500/20',
          icon: <X className="w-3 h-3 mr-1" />
        };
      default:
        return { 
          label: status, 
          color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
          icon: <X className="w-3 h-3 mr-1" />
        };
    }
  };

  const { label, color, icon } = getStatusDetails(status);
  
  const sizeClass = size === 'sm' ? 'text-xs py-0 px-1.5' : 
                   size === 'lg' ? 'text-sm py-1 px-3' : 
                   'text-xs py-0.5 px-2';

  return (
    <Badge variant="outline" className={`flex items-center ${color} ${sizeClass}`}>
      {icon}
      {label}
    </Badge>
  );
};

export default ChargingStationStatusBadge; 