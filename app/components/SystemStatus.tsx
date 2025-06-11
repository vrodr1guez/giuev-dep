'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X, Clock, RefreshCw } from 'lucide-react';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'checking' | 'online' | 'offline';
  responseTime?: number;
  lastChecked?: Date;
}

export default function SystemStatus() {
  const [services, setServices] = useState([
    { name: 'Frontend (Next.js)', url: 'http://localhost:3000', status: 'checking' },
    { name: 'Backend API', url: 'http://localhost:8000/health', status: 'checking' },
    { name: 'ML Dashboard (Streamlit)', url: 'http://localhost:8503', status: 'checking' },
    { name: 'Database', url: 'http://localhost:8000/health', status: 'checking' },
  ] as ServiceStatus[]);

  const [lastUpdate, setLastUpdate] = useState(null as Date | null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkService = async (service: ServiceStatus): Promise<ServiceStatus> => {
    const startTime = performance.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(service.url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      clearTimeout(timeoutId);
      const responseTime = Math.round(performance.now() - startTime);
      
      return {
        ...service,
        status: response.ok ? 'online' : 'offline',
        responseTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        ...service,
        status: 'offline',
        responseTime: undefined,
        lastChecked: new Date()
      };
    }
  };

  const checkAllServices = async () => {
    setIsRefreshing(true);
    
    const updatedServices = await Promise.all(
      services.map(service => checkService(service))
    );
    
    setServices(updatedServices);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkAllServices();
    
    // Check every 30 seconds
    const interval = setInterval(checkAllServices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <X className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return 'text-green-400 bg-green-900/20 border-green-700/50';
      case 'offline':
        return 'text-red-400 bg-red-900/20 border-red-700/50';
      case 'checking':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/50';
    }
  };

  const onlineCount = services.filter(s => s.status === 'online').length;
  const totalCount = services.length;

  return (
    <div className="bg-slate-800/70 rounded-xl border border-slate-700/50 p-6 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">System Status</h3>
          <p className="text-sm text-slate-400">
            {onlineCount}/{totalCount} services online
            {lastUpdate && (
              <span className="ml-2">
                • Last checked: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={checkAllServices}
          disabled={isRefreshing}
          className="flex items-center px-3 py-1 text-sm bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {services.map((service, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-md border ${getStatusColor(service.status)}`}
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(service.status)}
              <div>
                <div className="font-medium text-sm text-slate-200">{service.name}</div>
                <div className="text-xs text-slate-400">{service.url}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium capitalize text-slate-200">{service.status}</div>
              {service.responseTime && (
                <div className="text-xs text-slate-400">{service.responseTime}ms</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="text-xs text-slate-400">
          <strong className="text-slate-300">Recent Updates:</strong>
          <ul className="mt-1 space-y-1 text-slate-500">
            <li>✅ Dashboard metrics API fixed and working</li>
            <li>✅ Real-time data updates functioning</li>
            <li>✅ ML Dashboard embed improved</li>
            <li>✅ System monitoring active</li>
            <li>✅ Error handling enhanced</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 