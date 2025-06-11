"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, AlertTriangle, Info, Bell, ChevronRight } from 'lucide-react';

interface AlertItem {
  id: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  linkHref: string;
  linkText: string;
}

interface RecentAlertsProps {
  alerts: AlertItem[];
  maxItems?: number;
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({
  alerts, 
  maxItems = 4
}) => {
  const displayAlerts = alerts.slice(0, maxItems);
  
  const getSeverityIcon = (severity: string): React.ReactNode => {
    switch(severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch(severity) {
      case 'critical':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Recent Alerts
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/alerts">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayAlerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-4">
              <div className="mt-0.5">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{alert.message}</p>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={alert.linkHref}>{alert.linkText}</Link>
                  </Button>
                </div>
                <p className={`text-sm font-medium ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Priority
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAlerts; 