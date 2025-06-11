import React from 'react';
import { Calendar, CheckCircle2, Clock, Wrench } from 'lucide-react';
import { Button } from '../ui/button';

interface MaintenanceScheduleProps {
  schedule: {
    vehicle_id: string;
    next_maintenance_date: string;
    maintenance_type: string;
    reason: string;
    priority: string;
    estimated_downtime_hours: number;
    recommended_actions: string[];
    predicted_days_to_replacement?: number;
  };
}

export const MaintenanceScheduleCard: React.FC<MaintenanceScheduleProps> = ({ schedule }) => {
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get priority styling
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };
  
  // Get maintenance type icon
  const getMaintenanceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'diagnostic': return <Wrench className="h-4 w-4" />;
      case 'preventive': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <span className="font-medium">Next Maintenance</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(schedule.priority)}`}>
          {schedule.priority.charAt(0).toUpperCase() + schedule.priority.slice(1)} Priority
        </span>
      </div>
      
      <div className="border-l-4 border-blue-500 pl-4">
        <p className="font-bold text-lg">{formatDate(schedule.next_maintenance_date)}</p>
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          <span>Est. {schedule.estimated_downtime_hours} hour{schedule.estimated_downtime_hours !== 1 ? 's' : ''}</span>
        </div>
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          {getMaintenanceIcon(schedule.maintenance_type)}
          <span className="font-medium">{schedule.maintenance_type.charAt(0).toUpperCase() + schedule.maintenance_type.slice(1)} Maintenance</span>
        </div>
        <p className="text-sm text-slate-600">{schedule.reason}</p>
      </div>
      
      {schedule.recommended_actions.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Recommended Actions:</p>
          <ul className="space-y-1">
            {schedule.recommended_actions.map((action, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {schedule.predicted_days_to_replacement !== undefined && (
        <div className="bg-slate-50 p-3 rounded-md mt-2">
          <p className="text-sm flex items-center gap-2">
            <Wrench className="h-4 w-4 text-slate-600" />
            <span>
              {schedule.predicted_days_to_replacement <= 0 
                ? <span className="font-medium text-red-600">Battery replacement recommended now</span>
                : <span>Predicted battery replacement in <span className="font-medium">{schedule.predicted_days_to_replacement} days</span></span>
              }
            </span>
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-center pt-2">
        <Button className="w-full">Schedule Maintenance</Button>
      </div>
    </div>
  );
}; 