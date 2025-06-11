import React from 'react';
import Link from 'next/link';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  Zap, 
  CheckCircle, 
  X,
  BellRing,
  MoreHorizontal
} from 'lucide-react';
import { Button } from "../../ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "../../ui/card";

export interface AlertAction {
  label: string;
  link: string;
  variant: 'primary' | 'secondary' | 'destructive' | 'warning';
  onClick?: () => void;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'v2g' | 'success';
  title: string;
  description: string;
  time: string;
  vehicle?: string;
  station?: string;
  driver?: string;
  icon?: React.ReactNode;
  actions?: AlertAction[];
}

interface AlertItemProps {
  alert: Alert;
  onDismiss?: (id: string) => void;
}

export const AlertItem: React.FC<AlertItemProps> = ({ 
  alert,
  onDismiss 
}) => {
  const getIcon = () => {
    if (alert.icon) return alert.icon;
    
    switch (alert.type) {
      case 'critical': return <AlertOctagon className="text-red-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'info': return <Info className="text-blue-500" size={20} />;
      case 'v2g': return <Zap className="text-purple-500" size={20} />;
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBgColor = () => {
    switch (alert.type) {
      case 'critical': return 'bg-red-500/10 border-red-500';
      case 'warning': return 'bg-amber-500/10 border-amber-500';
      case 'info': return 'bg-blue-500/10 border-blue-500';
      case 'v2g': return 'bg-purple-500/10 border-purple-500';
      case 'success': return 'bg-green-500/10 border-green-500';
      default: return 'bg-gray-500/10 border-gray-500';
    }
  };

  const getButtonVariant = (variant: string) => {
    switch (variant) {
      case 'destructive': return 'bg-red-500/20 text-red-400 hover:bg-red-500/30';
      case 'warning': return 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30';
      case 'primary': return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30';
      default: return 'bg-gray-700 hover:bg-gray-600';
    }
  };

  return (
    <div className={`alert-item flex p-3 border-l-4 rounded-md ${getBgColor()} mb-3 group hover:bg-opacity-25 transition-colors`}>
      <div className="mr-3 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="font-medium">{alert.title}</h4>
          <span className="text-xs text-gray-400">{alert.time}</span>
        </div>
        <p className="text-sm text-gray-400 mb-2">{alert.description}</p>
        
        {alert.actions && alert.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {alert.actions.map((action: AlertAction, index: number) => (
              <Button 
                key={index}
                variant="ghost" 
                size="sm" 
                className={`text-xs py-1 px-2 h-7 ${getButtonVariant(action.variant)}`}
                asChild
                onClick={action.onClick}
              >
                <Link href={action.link}>
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {onDismiss && (
        <button 
          className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDismiss(alert.id)}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

interface AlertPanelProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
  onDismissAll?: () => void;
  loading?: boolean;
  maxItems?: number;
  showViewAll?: boolean;
  className?: string;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ 
  alerts,
  onDismiss, 
  onDismissAll,
  loading = false,
  maxItems = 5,
  showViewAll = true,
  className = '' 
}) => {
  const visibleAlerts = maxItems ? alerts.slice(0, maxItems) : alerts;
  const hasMoreAlerts = alerts.length > visibleAlerts.length;
  
  return (
    <Card className={`alerts-panel overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-gray-700">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BellRing size={16} className="text-amber-500" />
          <span>Alerts</span>
          {alerts.length > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-gray-700 ml-2 px-2 py-0.5 text-xs text-white">
              {alerts.length}
            </span>
          )}
        </CardTitle>
        
        <div className="flex items-center gap-2">
          {alerts.length > 0 && onDismissAll && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7"
              onClick={onDismissAll}
            >
              Clear all
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto p-3">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex p-3 border-l-4 border-gray-700 rounded-md bg-gray-700">
                  <div className="mr-3">
                    <div className="h-5 w-5 rounded-full bg-gray-600 animate-pulse"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="h-4 w-32 bg-gray-600 animate-pulse rounded"></div>
                      <div className="h-3 w-16 bg-gray-600 animate-pulse rounded"></div>
                    </div>
                    <div className="h-3 w-full mt-1 bg-gray-600 animate-pulse rounded"></div>
                    <div className="mt-2 flex gap-2">
                      <div className="h-6 w-20 bg-gray-600 animate-pulse rounded-md"></div>
                      <div className="h-6 w-20 bg-gray-600 animate-pulse rounded-md"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {visibleAlerts.length > 0 ? (
                visibleAlerts.map((alert: Alert) => (
                  <AlertItem 
                    key={alert.id} 
                    alert={alert} 
                    onDismiss={onDismiss}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="text-green-500 mb-2" size={24} />
                  <p>No active alerts</p>
                </div>
              )}
            </>
          )}
        </div>
        
        {showViewAll && hasMoreAlerts && (
          <div className="p-3 border-t border-gray-700">
            <Button 
              variant="outline" 
              className="w-full text-sm"
              asChild
            >
              <Link href="/alerts">
                View all alerts ({alerts.length})
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertPanel; 