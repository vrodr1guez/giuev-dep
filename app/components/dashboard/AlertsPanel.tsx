import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface Alert {
  id: string;
  type: 'vehicle' | 'charging' | 'battery' | 'driver' | 'system';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  link?: {
    text: string;
    href: string;
  };
}

interface AlertsPanelProps {
  alerts: Alert[];
}

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50"
            >
              <div
                className={`px-2 py-1 text-xs font-medium rounded ${
                  severityColors[alert.severity]
                }`}
              >
                {alert.severity.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
              {alert.link && (
                <Link
                  href={alert.link.href}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {alert.link.text}
                </Link>
              )}
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent alerts
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel; 