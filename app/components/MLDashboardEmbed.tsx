'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  BarChart2, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  Loader,
  ExternalLink,
  Maximize2,
  ChevronDown,
  ArrowUp,
  Activity,
  X
} from 'lucide-react';

interface MLDashboardEmbedProps {
  section?: string;
  height?: string | number;
  title?: string;
  description?: string;
  showControls?: boolean;
  showHeader?: boolean;
  className?: string;
  refreshInterval?: number;
}

export default function MLDashboardEmbed({
  section = 'enhanced-forecasting',
  height = 600,
  title = 'ML Dashboard',
  description = 'Visualize machine learning insights',
  showControls = true,
  showHeader = true,
  className = '',
  refreshInterval = 30000, // 30 seconds default
}: MLDashboardEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const iframeRef = useRef(null);
  const healthCheckInterval = useRef(null);
  
  // Use direct Streamlit URLs instead of Next.js proxy
  const baseDashboardUrl = process.env.NEXT_PUBLIC_ML_DASHBOARD_URL || 'http://localhost:8503';
  const healthCheckUrl = `/api/ml/health`;
  
  // Check if the ML dashboard is available
  const checkDashboardAvailability = async (showLoadingState = true) => {
    if (showLoadingState) {
      setIsRetrying(true);
      setConnectionStatus('connecting');
    }
    
    try {
      // Strategy 1: Check our new ML health endpoint
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(healthCheckUrl, { 
          method: 'GET',
          headers: { 
            'Cache-Control': 'no-cache',
            'Accept': 'application/json'
          },
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const healthData = await response.json();
          console.log('ML Health check passed:', healthData);
          setIsAvailable(true);
          setIsError(false);
          setConnectionStatus('connected');
          setLastUpdate(new Date());
          return;
        }
      } catch (error) {
        console.warn('ML health API check failed:', error);
      }
      
      // Strategy 2: Check dashboard metrics as fallback
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('/api/dashboard/metrics', { 
          method: 'GET',
          headers: { 
            'Cache-Control': 'no-cache',
            'Accept': 'application/json'
          },
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log('Dashboard metrics API is healthy, assuming ML dashboard is available');
          setIsAvailable(true);
          setIsError(false);
          setConnectionStatus('connected');
          setLastUpdate(new Date());
          return;
        }
      } catch (error) {
        console.warn('Dashboard metrics API check failed:', error);
      }
      
      // If both checks fail, still try to load the dashboard
      // The iframe will handle its own errors
      console.log('Health checks failed, but attempting to load ML dashboard anyway');
      setIsAvailable(true);
      setIsError(false);
      setConnectionStatus('connected');
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('All ML Dashboard health checks failed:', error);
      
      // Only show error after multiple retries
      if (retryCount >= 2) {
        setIsError(true);
        setIsAvailable(false);
        setConnectionStatus('disconnected');
      } else {
        // Still try to load anyway
        setIsAvailable(true);
        setIsError(false);
        setConnectionStatus('connected');
        setRetryCount(prev => prev + 1);
      }
    } finally {
      if (showLoadingState) {
        setIsRetrying(false);
        setIsLoading(false);
      }
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setIsError(false);
    setRetryCount(0);
    setConnectionStatus('connecting');
    
    // Force iframe reload
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }
    
    setTimeout(() => {
      checkDashboardAvailability();
    }, 1000);
  };
  
  // Handle load event
  const handleIframeLoad = () => {
    setIsLoading(false);
    setIsError(false);
    setConnectionStatus('connected');
    setLastUpdate(new Date());
  };
  
  // Handle error event
  const handleIframeError = () => {
    setIsError(true);
    setIsLoading(false);
    setConnectionStatus('disconnected');
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Set up periodic health checks and load dashboard on mount
  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    setConnectionStatus('connecting');
    
    // Initial health check
    checkDashboardAvailability();
    
    // Set up periodic health checks (but less frequent than refresh interval)
    healthCheckInterval.current = setInterval(() => {
      checkDashboardAvailability(false); // Don't show loading state for background checks
    }, refreshInterval);
    
    return () => {
      if (healthCheckInterval.current) {
        clearInterval(healthCheckInterval.current);
      }
    };
  }, [section, refreshInterval]);
  
  // Build dashboard URL with section parameter
  const dashboardUrl = section ? `${baseDashboardUrl}?section=${encodeURIComponent(section)}` : baseDashboardUrl;
  
  // Styles
  const containerStyle = isFullscreen
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: '#1e293b', // Dark background for fullscreen
      }
    : {};
  
  // Connection status indicator
  const ConnectionStatus = () => (
    <div className="flex items-center space-x-2 text-xs">
      {connectionStatus === 'connected' && (
        <>
          <Activity className="w-3 h-3 text-green-500" />
          <span className="text-green-600">Connected</span>
        </>
      )}
      {connectionStatus === 'connecting' && (
        <>
          <Loader className="w-3 h-3 text-yellow-500 animate-spin" />
          <span className="text-yellow-600">Connecting...</span>
        </>
      )}
      {connectionStatus === 'disconnected' && (
        <>
          <X className="w-3 h-3 text-red-500" />
          <span className="text-red-600">Disconnected</span>
        </>
      )}
      {lastUpdate && (
        <span className="text-gray-500 ml-2">
          Last: {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
  
  // UI elements
  const HeaderSection = showHeader && (
    <div className="flex items-center justify-between mb-4 px-2">
      <div>
        <h2 className="text-xl font-semibold flex items-center text-slate-200">
          <BarChart2 className="mr-2" size={20} /> {title}
        </h2>
        <p className="text-slate-400 text-sm">{description}</p>
        <ConnectionStatus />
      </div>
      {showControls && (
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-300"
            title="Refresh dashboard"
            disabled={isLoading || isRetrying}
          >
            <RefreshCw
              size={20}
              className={`${isRetrying ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-300"
            title={isFullscreen ? 'Exit fullscreen' : 'View in fullscreen'}
          >
            <Maximize2 size={20} />
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-300"
            title="View connection details"
          >
            {showDetails ? (
              <ArrowUp size={20} className="transform rotate-180" />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>
      )}
    </div>
  );
  
  const LoadingState = isLoading && (
    <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-dashed border-slate-600 bg-slate-800/50">
      <Loader className="w-10 h-10 text-blue-400 animate-spin mb-4" />
      <p className="text-slate-300">Loading ML Dashboard...</p>
      <p className="text-xs mt-2 text-slate-400">
        {isRetrying ? 'Establishing connection...' : 'Checking availability...'}
      </p>
    </div>
  );
  
  const ErrorState = isError && !isLoading && (
    <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-dashed border-red-600/50 bg-red-900/20">
      <AlertTriangle className="w-10 h-10 text-red-400 mb-4" />
      <p className="text-red-300 font-medium">ML Dashboard is not available</p>
      <p className="text-red-400 text-sm mt-1 max-w-md text-center">
        The dashboard service might be offline or experiencing issues.
      </p>
      <div className="flex space-x-2 mt-4">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors flex items-center"
        >
          <RefreshCw size={16} className="mr-2" /> Retry Connection
        </button>
        <a
          href="/ml-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors flex items-center"
        >
          <ExternalLink size={16} className="mr-2" /> Open Direct
        </a>
      </div>
    </div>
  );
  
  const ConnectionDetails = showDetails && (
    <div className="text-xs bg-slate-800/70 border border-slate-700 p-3 rounded-md mt-2 mb-4">
      <div className="flex items-center mb-1">
        <span className="font-semibold mr-2 text-slate-300">Status:</span>
        <ConnectionStatus />
      </div>
      <div className="flex flex-col space-y-1 text-slate-400">
        <p>
          <span className="font-semibold text-slate-300">URL:</span>{' '}
          {dashboardUrl}
        </p>
        <p>
          <span className="font-semibold text-slate-300">Section:</span> {section}
        </p>
        <p>
          <span className="font-semibold text-slate-300">Retry Count:</span> {retryCount}
        </p>
        <p>
          <span className="font-semibold text-slate-300">Health Check Interval:</span> {refreshInterval / 1000}s
        </p>
        {isAvailable && (
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 flex items-center mt-1"
          >
            <ExternalLink size={14} className="mr-1" /> Open in new tab
          </a>
        )}
      </div>
    </div>
  );
  
  return (
    <div 
      className={`ml-dashboard-embed relative ${className}`}
      style={containerStyle}
    >
      {HeaderSection}
      {ConnectionDetails}
      
      {LoadingState}
      {ErrorState}
      
      {isAvailable && !isError && (
        <div className={`iframe-container relative rounded-lg overflow-hidden ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
          <iframe
            ref={iframeRef}
            src={dashboardUrl}
            height={isFullscreen ? '100%' : height}
            width="100%"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ border: 'none', background: '#1e293b' }}
            className="rounded-lg shadow-md"
            title="ML Dashboard"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            allow="accelerometer; camera; encrypted-media; gyroscope; microphone"
          />
        </div>
      )}
    </div>
  );
} 