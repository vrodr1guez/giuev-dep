'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Settings, RefreshCw, Download, BarChart, MessageSquare, BrainCircuit, LineChart, AlertTriangle, Battery, ChevronRight, Cpu, Zap, Plus, Minus, ExternalLink, Activity, Shield } from 'lucide-react';

// Enhanced tabs with more metadata and categorization
const TABS = [
  { 
    id: 'enhanced-forecasting', 
    label: 'Enhanced Forecasting', 
    icon: LineChart, 
    description: 'Advanced time series prediction with confidence intervals',
    category: 'forecasting',
    responseTime: '50ms'
  },
  { 
    id: 'multi-task-learning', 
    label: 'Multi-Task Learning', 
    icon: BrainCircuit, 
    description: 'Models that predict multiple related outputs simultaneously',
    category: 'advanced',
    responseTime: '120ms'
  },
  { 
    id: 'model-ensembles', 
    label: 'Model Ensembles', 
    icon: BarChart, 
    description: 'Combining multiple models for improved performance',
    category: 'advanced',
    responseTime: '85ms'
  },
  { 
    id: 'online-learning', 
    label: 'Online Learning', 
    icon: MessageSquare, 
    description: 'Models that continuously learn from new data',
    category: 'advanced',
    responseTime: '60ms'
  },
  { 
    id: 'battery-health', 
    label: 'Battery Health', 
    icon: Battery, 
    description: 'Predict battery degradation and maintenance needs',
    category: 'forecasting',
    responseTime: '45ms'
  },
  { 
    id: 'energy-optimization', 
    label: 'Energy Optimization', 
    icon: Zap, 
    description: 'Smart charging strategies based on price & demand',
    category: 'forecasting',
    responseTime: '55ms'
  },
];

// Dashboard server URL with extensive fallbacks
const DASHBOARD_URLS = [
  process.env.NEXT_PUBLIC_ML_DASHBOARD_URL || 'http://localhost:8503',
  process.env.NEXT_PUBLIC_ML_DASHBOARD_FALLBACK_URL || 'http://localhost:8502',
  process.env.NEXT_PUBLIC_ML_DASHBOARD_FALLBACK2_URL || 'http://localhost:8501',
  'http://localhost:8503',
  'http://localhost:8502',
  'http://localhost:8501',
];

/**
 * ML Dashboard Integrated Page
 * This page embeds the Streamlit ML Dashboard within the main website's styling
 * for a seamless user experience
 */
export default function MLDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(Date.now()); // Used to force iframe reload
  const [currentTab, setCurrentTab] = useState(TABS[0].id);
  const [dashboardError, setDashboardError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showIframeControls, setShowIframeControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dashboardStatus, setDashboardStatus] = useState({
    isHealthy: false,
    responseTime: null,
    lastChecked: null,
    activeUrl: DASHBOARD_URLS[0] // Default to the first URL
  });
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const iframeRef = useRef(null);
  const healthCheckIntervalRef = useRef(null);

  const checkDashboardAvailability = useCallback(async () => {
    for (const url of DASHBOARD_URLS) {
      const startTime = performance.now();
      try {
        const response = await fetch(`${url}/healthz`, { // Standard health check endpoint for Streamlit
          method: 'GET',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });

        if (response.ok) {
          const responseTime = Math.round(performance.now() - startTime);
          setDashboardStatus({
            isHealthy: true,
            responseTime,
            lastChecked: new Date().toISOString(),
            activeUrl: url
          });
          console.log(`Streamlit dashboard is healthy at ${url}`);
          setDashboardError(false);
          return url;
        }
      } catch (error) {
        console.warn(`Health check failed for ${url}:`, error);
      }
    }

    // If all health checks fail, use the first URL as a fallback
    console.error('All Streamlit dashboard health checks failed. Falling back to default URL.');
    setDashboardStatus({
      isHealthy: false, // Mark as not healthy but still attempt to load
      responseTime: null,
      lastChecked: new Date().toISOString(),
      activeUrl: DASHBOARD_URLS[0]
    });
    setDashboardError(true); // Set dashboard error to true if all checks fail
    return DASHBOARD_URLS[0]; // Return the first URL as a fallback
  }, []);

  const navigateToSection = useCallback((sectionId) => {
    const iframe = iframeRef.current;
    if (iframe && dashboardStatus.activeUrl) {
      // Ensure the sectionId is correctly appended as a query parameter
      const newSrc = new URL(dashboardStatus.activeUrl);
      newSrc.searchParams.set('section', sectionId);
      iframe.src = newSrc.toString();
      console.log(`Navigating iframe to: ${iframe.src}`);
    }
    setCurrentTab(sectionId);
    setLoading(true); // Show loader while iframe reloads page
  }, [dashboardStatus.activeUrl]);

  // Setup regular health checks
  useEffect(() => {
    let isMounted = true;
    const performCheck = async () => {
      const availableUrl = await checkDashboardAvailability();
      if (isMounted && availableUrl) {
        // If the activeUrl in state is different from the newly found availableUrl,
        // or if the dashboard was previously in error, refresh the iframe.
        if (dashboardStatus.activeUrl !== availableUrl || dashboardError) {
          setDashboardStatus(prev => ({ ...prev, activeUrl: availableUrl, isHealthy: true }));
          navigateToSection(currentTab); // Reload with the new URL and current section
        }
      }
    };

    performCheck(); // Initial check

    healthCheckIntervalRef.current = setInterval(performCheck, 30000);

    return () => {
      isMounted = false;
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [checkDashboardAvailability, navigateToSection, currentTab, dashboardStatus.activeUrl, dashboardError]);

  // Handle tab changes and initial loading
  useEffect(() => {
    // This effect ensures navigation when activeUrl is set or changes
    if (dashboardStatus.activeUrl) {
      navigateToSection(currentTab);
    }
  }, [currentTab, dashboardStatus.activeUrl, navigateToSection]);
  
  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    console.warn('Iframe failed to load, but continuing to try...');
    setLoading(false);
    // Don't immediately set error - the iframe might recover
    // Only set error after multiple consecutive failures would be handled elsewhere
  };

  const refreshDashboard = async () => {
    setIframeKey(Date.now()); // Change key to force reload
    setLoading(true);
    
    // Re-check availability
    const availableUrl = await checkDashboardAvailability();
    if (availableUrl) {
      const iframe = iframeRef.current;
      if (iframe) {
        // Ensure the current tab's section is loaded after refresh
        iframe.src = `${availableUrl}/?section=${currentTab}`;
      }
    }
  };

  // Toggle iframe control panel
  const toggleIframeControls = () => {
    setShowIframeControls(prev => !prev);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // Download dashboard data (placeholder function)
  const downloadDashboardData = () => {
    alert('This functionality would download the current dashboard data as CSV/JSON');
    // In a real implementation, we would send a message to the iframe or call a backend API
  };

  // Open dashboard in a new tab
  const openInNewTab = () => {
    const targetUrl = dashboardStatus.activeUrl || DASHBOARD_URLS[0];
    window.open(`${targetUrl}/?section=${currentTab}`, '_blank');
  };

  // Filter tabs by category
  const filteredTabs = categoryFilter === 'all' 
    ? TABS 
    : TABS.filter(tab => tab.category === categoryFilter);

  // Render error state if dashboard is not available
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="bg-red-900/20 p-6 rounded-xl border border-red-700 shadow-lg w-full max-w-md mb-8">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
        <h2 className="text-xl font-bold text-amber-500 mb-2">Dashboard Unavailable</h2>
        <p className="text-slate-300 mb-4">
          The ML Dashboard service is currently unavailable. This could be due to:
        </p>
        <ul className="text-slate-400 text-sm text-left list-disc pl-8 mb-4">
          <li>The dashboard service is not running</li>
          <li>Network connectivity issues</li>
          <li>Server configuration issues</li>
        </ul>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={refreshDashboard}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-md font-medium transition shadow-lg"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry Connection
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/overview'}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md font-medium transition shadow-lg"
          >
            Return to Main Dashboard
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <div key={tab.id} className="bg-slate-800/50 rounded-lg p-5 border border-slate-700 transition-all hover:border-emerald-900/50 hover:bg-slate-800/80">
              <div className="flex items-center mb-3">
                <Icon className="w-5 h-5 mr-2 text-emerald-500" />
                <h3 className="font-semibold text-emerald-400">{tab.label}</h3>
              </div>
              <p className="text-sm text-slate-400">
                {tab.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/90 text-gray-100 font-sans ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Header - hidden in fullscreen mode */}
      {!isFullscreen && (
        <header className="bg-slate-800/70 border-b border-slate-700/80 shadow-lg sticky top-0 z-50 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/overview" className="flex items-center text-slate-300 hover:text-cyan-400 transition-colors duration-300 group">
                <ChevronLeft className="w-5 h-5 mr-2 group-hover:text-cyan-500 transition-colors" />
                <span className="text-sm font-medium">Main Dashboard</span>
              </Link>
              <div className="h-6 border-l border-slate-600"></div>
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500">
                  ML Insights Hub
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Powered by Advanced Analytics & AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Dashboard health indicator */}
              <div className={`flex items-center px-3 py-1 rounded-full text-xs ${dashboardStatus.isHealthy 
                ? 'bg-emerald-900/30 text-emerald-400' 
                : 'bg-red-900/30 text-red-400'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${dashboardStatus.isHealthy 
                  ? 'bg-emerald-400 animate-pulse' 
                  : 'bg-red-400'}`}></span>
                {dashboardStatus.isHealthy 
                  ? `Healthy (${dashboardStatus.responseTime}ms)` 
                  : 'Offline'}
              </div>
            
              <button 
                onClick={refreshDashboard}
                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                title="Refresh Dashboard"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button 
                onClick={downloadDashboardData}
                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                title="Download Data"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button 
                onClick={openInNewTab}
                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                title="Open in New Tab"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
              
              <button
                onClick={toggleIframeControls} 
                className={`p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${showIframeControls ? 'bg-slate-700/50 text-cyan-400' : ''}`}
                title="Dashboard Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
      )}
      
      {/* Fullscreen toggle button when in fullscreen mode */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-50 p-2 bg-slate-800/80 text-slate-300 hover:text-white rounded-full shadow-lg backdrop-blur-sm"
          title="Exit Fullscreen"
        >
          <Minus className="w-5 h-5" />
        </button>
      )}
      
      {/* Control Panel (conditionally rendered) */}
      {showIframeControls && !isFullscreen && (
        <div className="bg-slate-800/80 border-b border-slate-700/50 p-3 backdrop-blur-lg">
          <div className="container mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 ${dashboardStatus.isHealthy ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2 ${dashboardStatus.isHealthy ? 'animate-pulse' : ''}`}></div>
                <span className="text-xs text-slate-300">{dashboardStatus.isHealthy ? 'Dashboard Active' : 'Dashboard Inactive'}</span>
              </div>
              <div className="h-4 border-l border-slate-600"></div>
              <div className="text-xs text-slate-400">
                <span className="font-medium text-sky-400">URL:</span> {dashboardStatus.activeUrl}
              </div>
              {dashboardStatus.responseTime && (
                <>
                  <div className="h-4 border-l border-slate-600"></div>
                  <div className="text-xs text-slate-400">
                    <span className="font-medium text-sky-400">Response:</span> {dashboardStatus.responseTime}ms
                  </div>
                </>
              )}
            </div>
            <div className="flex space-x-2">
              {/* Category filter */}
              <div className="flex items-center space-x-2 mr-2">
                <span className="text-xs text-slate-400">Filter:</span>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs bg-slate-700 text-slate-300 rounded border border-slate-600 px-2 py-1"
                >
                  <option value="all">All Models</option>
                  <option value="forecasting">Forecasting</option>
                  <option value="advanced">Advanced ML</option>
                </select>
              </div>
              
              <button 
                onClick={() => window.open(dashboardStatus.activeUrl, '_blank')}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 rounded flex items-center"
              >
                <span>Open in New Tab</span>
                <ChevronRight className="ml-1 w-3 h-3" />
              </button>
              <button 
                onClick={refreshDashboard}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 rounded flex items-center"
              >
                <RefreshCw className="mr-1 w-3 h-3" />
                <span>Reload</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content Area - adjusted for fullscreen */}
      <div className={`flex flex-grow container mx-auto ${isFullscreen ? 'p-0' : 'px-6 py-8'}`}>
        {/* Sidebar Navigation - hidden in fullscreen */}
        {!isFullscreen && (
          <aside className="w-64 pr-8 space-y-2 sticky top-24 self-start">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">ML Models</h2>
              <p className="text-xs text-slate-400 mb-4">Select a model type to explore its predictive capabilities and performance metrics.</p>
            </div>
            
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateToSection(tab.id)}
                  disabled={!dashboardStatus.activeUrl}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 group 
                              ${!dashboardStatus.activeUrl ? 'opacity-50 cursor-not-allowed bg-slate-800/30 text-slate-500' : 
                                currentTab === tab.id 
                                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg' 
                                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-cyan-300'}`}
                >
                  <Icon className={`w-5 h-5 mr-3 transition-colors duration-300 
                                   ${!dashboardStatus.activeUrl ? 'text-slate-600' :
                                     currentTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                  <div className="flex flex-col items-start">
                    <span>{tab.label}</span>
                    <div className="flex items-center text-xs opacity-70 mt-1">
                      <Activity className="w-3 h-3 mr-1" />
                      <span>{tab.responseTime}</span>
                    </div>
                  </div>
                </button>
              );
            })}
            
            {/* API Status Indicators */}
            <div className="mt-8 pt-4 border-t border-slate-700/50">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">System Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-xs text-slate-500 justify-between">
                  <div className="flex items-center">
                    <Shield className="w-3 h-3 mr-2" />
                    <span>ML API:</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-green-400">Online</span>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-slate-500 justify-between">
                  <div className="flex items-center">
                    <Cpu className="w-3 h-3 mr-2" />
                    <span>Model Status:</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-slate-500 justify-between">
                  <div className="flex items-center">
                    <RefreshCw className="w-3 h-3 mr-2" />
                    <span>Last Updated:</span>
                  </div>
                  <span className="text-sky-400">2 min ago</span>
                </div>
                
                <div className="mt-2">
                  <div className="flex items-center text-xs text-slate-500 justify-between mb-1">
                    <span>System Load</span>
                    <span>75%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Iframe Content - adjusted for fullscreen */}
        <main className={`flex-grow bg-slate-800/70 rounded-xl shadow-2xl overflow-hidden relative border border-slate-700/50 backdrop-blur-sm ${isFullscreen ? 'rounded-none border-0' : ''}`}>
          {!dashboardStatus.activeUrl ? (
            renderErrorState()
          ) : (
            <>
              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10 backdrop-blur-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-cyan-500 animate-spin mb-4"></div>
                    <div className="text-cyan-400 font-medium">Loading Dashboard...</div>
                    <div className="text-xs text-slate-400 mt-2">This may take a few moments</div>
                  </div>
                </div>
              )}
              
              <iframe
                ref={iframeRef}
                key={iframeKey}
                className={`w-full border-0 ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-9rem)]'}`}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                style={{ opacity: loading ? 0.3 : 1, transition: 'opacity 0.5s ease' }}
              />
            </>
          )}
        </main>
      </div>
      
      {/* Fullscreen mode styling */}
      <style>{`
        .fullscreen-mode {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          background: white;
          overflow: auto;
        }
      `}</style>
    </div>
  );
} 