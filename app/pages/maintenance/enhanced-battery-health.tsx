import React from 'react';
import EnhancedBatteryHealthDashboard from '../../components/maintenance/EnhancedBatteryHealthDashboard';

export default function EnhancedBatteryHealth() {
  // Using document title approach instead of Head component
  React.useEffect(() => {
    document.title = "Enhanced Battery Health Monitoring | EV Charging Infrastructure";
    return () => {
      document.title = "EV Charging Infrastructure"; // Reset on unmount
    };
  }, []);

  return <EnhancedBatteryHealthDashboard />;
} 