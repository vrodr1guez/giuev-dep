/// <reference path="../../types/react.d.ts" />
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { Vehicle } from '../../types/models';
import { ChargingStation } from '../../types/models';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { MapPin, Filter, Loader, AlertCircle, Car, Battery, AlertTriangle, Check, BarChart, PieChart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { PulsingEnergyIndicator, EnergyFlowAnimation } from '../../components/ui/energy-flow-animation';

// Ensure Leaflet markers work correctly in Next.js
if (typeof window !== 'undefined') {
  // Fix Leaflet's icon paths
  const LeafletIcon = L.Icon as any;
  delete LeafletIcon.Default.prototype._getIconUrl;
  LeafletIcon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
}

// Custom vehicle marker icons
const createVehicleIcon = (status) => {
  const colors = {
    'driving': '#22c55e', // green
    'charging': '#3b82f6', // blue
    'maintenance': '#f59e0b', // amber
    'offline': '#6b7280', // gray
    'available': '#8b5cf6', // purple
  };
  
  const color = colors[status] || '#6b7280';
  
  return L.divIcon({
    html: `
      <div class="vehicle-marker flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg relative overflow-visible">
        <div style="color: ${color}; z-index: 2; position: relative;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
            <circle cx="7" cy="17" r="2"></circle>
            <path d="M9 17h6"></path>
            <circle cx="17" cy="17" r="2"></circle>
          </svg>
        </div>
        ${status === 'charging' ? 
          `<div class="absolute inset-0 animate-pulse bg-blue-200 rounded-full opacity-30"></div>
           <div class="absolute -top-1 -right-1">
             <div class="pulse-dot"></div>
           </div>` 
          : 
          status === 'maintenance' ? 
          `<div class="absolute -top-1 -right-1">
             <div class="text-amber-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <path d="M10.3 21H8l-4-6 4-6h12l4 6-4 6h-2.3M12 3v6M4 15h2M18 15h2"></path>
               </svg>
             </div>
           </div>` 
          : ''}
      </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

// Custom charging station marker icons
const createStationIcon = (status, inUse) => {
  const colors = {
    'operational': '#22c55e', // green
    'partial_outage': '#f59e0b', // amber
    'full_outage': '#ef4444', // red
    'maintenance': '#6b7280', // gray
  };
  
  const color = colors[status] || '#6b7280';
  const glowEffect = inUse ? 
    `<div class="absolute inset-0 station-glow rounded-full" 
        style="box-shadow: 0 0 15px ${color}, 0 0 5px ${color}; z-index: -1;"></div>` : '';
  
  return L.divIcon({
    html: `
      <div class="station-marker flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg relative ${inUse ? 'charging-active' : ''}">
        ${glowEffect}
        <div style="color: ${color}; z-index: 2;" class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10V8a1 1 0 0 0-1-1h-1"></path>
            <path d="M14 7h-6.5a1 1 0 0 0-1 1v8.5"></path>
            <path d="M5 5v16"></path>
            <path d="M3 7h2"></path>
            <path d="M3 12h2"></path>
            <path d="M3 17h2"></path>
            <path d="m15 5-2 5h4l-2 5"></path>
          </svg>
        </div>
      </div>
    `,
    className: '',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });
};

interface MapMarker {
  id: string;
  position: [number, number];
  tooltip: string;
  color: string;
  type: 'vehicle' | 'charging-station';
  status: string;
  analytics?: {
    usagePercent?: number;
    energyDelivered?: number;
    peakHours?: string[];
    efficiency?: number;
  };
}

interface FleetMapProps {
  vehicles?: Vehicle[];
  chargingStations?: ChargingStation[];
  height?: string;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

interface VehicleLocation {
  latitude: number;
  longitude: number;
}

interface VehicleData {
  id: string;
  name: string;
  status: string;
  location?: VehicleLocation;
}

interface ChargingStationData {
  id: string;
  name: string;
  status: string;
  location?: VehicleLocation;
}

type FilterType = 'all' | 'driving' | 'charging' | 'idle' | 'low_battery' | 'alert';
type ViewMode = 'default' | 'heatmap' | 'analytics';

const FleetMap: React.FC<FleetMapProps> = ({ 
  vehicles = [], 
  chargingStations = [],
  height = '500px',
  loading = false,
  error = '',
  onRefresh = () => {},
}) => {
  const [selectedMarker, setSelectedMarker] = useState(null as MapMarker | null);
  const [activeFilter, setActiveFilter] = useState('all' as FilterType);
  const [filteredMarkers, setFilteredMarkers] = useState([] as MapMarker[]);
  const [viewMode, setViewMode] = useState('default' as ViewMode);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  
  // Create markers when vehicles or charging stations change
  useEffect(() => {
    if (loading) return;
    
    try {
      const vehicleMarkers: MapMarker[] = (vehicles as unknown as VehicleData[]).map(vehicle => {
        const position: [number, number] = [
          vehicle.location?.latitude || 51.505,
          vehicle.location?.longitude || -0.09
        ];
        
        const getStatusColor = (status: string): string => {
          const colors: Record<string, string> = {
            available: 'green',
            driving: 'blue',
            charging: 'purple',
            idle: 'gray',
            in_use: 'orange',
            maintenance: 'red',
            offline: 'gray',
            low_battery: 'yellow',
            alert: 'red'
          };
          return colors[status] || 'gray';
        };

        return {
          id: vehicle.id,
          position,
          tooltip: vehicle.name,
          color: getStatusColor(vehicle.status),
          type: 'vehicle',
          status: vehicle.status
        };
      });
      
      const stationMarkers: MapMarker[] = (chargingStations as unknown as ChargingStationData[]).map(station => {
        const position: [number, number] = [
          station.location?.latitude || 51.505,
          station.location?.longitude || -0.09
        ];
        
        return {
          id: station.id,
          position,
          tooltip: station.name,
          color: 'blue',
          type: 'charging-station',
          status: station.status
        };
      });
      
      setFilteredMarkers([...vehicleMarkers, ...stationMarkers]);
    } catch (err) {
      console.error("Error creating map markers:", err);
    }
  }, [vehicles, chargingStations, loading]);
  
  // Apply filters when markers or the active filter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredMarkers(filteredMarkers);
    } else {
      // We need a mapping between the filter name and possible status values
      // as the vehicle status and filter names might differ
      const statusMapping: Record<FilterType, string[]> = {
        all: [],
        driving: ['driving', 'in_use'],
        charging: ['charging'],
        idle: ['idle', 'available'],
        low_battery: ['low_battery'],
        alert: ['alert', 'maintenance']
      };
      
      const allowedStatuses = statusMapping[activeFilter as FilterType] || [];
      setFilteredMarkers(
        filteredMarkers.filter((marker: MapMarker) => 
          marker.type === 'charging-station' ? 
            activeFilter === 'charging' : 
            allowedStatuses.includes(marker.status)
        )
      );
    }
  }, [filteredMarkers, activeFilter]);
  
  // Handler for filter clicks
  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
  };
  
  // Analytics data for the dashboard
  const analyticsData = useMemo(() => {
    return {
      totalVehicles: vehicles.length,
      chargingVehicles: filteredMarkers.filter(m => m.type === 'vehicle' && m.status === 'charging').length,
      activeStations: filteredMarkers.filter(m => m.type === 'charging-station' && m.status === 'operational').length,
      totalStations: chargingStations.length,
      utilizationRate: chargingStations.length ? 
        Math.round((filteredMarkers.filter(m => m.type === 'charging-station' && m.status === 'in_use').length / chargingStations.length) * 100) : 0,
      averageChargingTime: '43 min',
      peakUsageTime: '18:00 - 20:00',
      totalEnergyDelivered: '1,248 kWh'
    };
  }, [vehicles, chargingStations, filteredMarkers]);
  
  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle>Fleet Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-red-500">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p className="text-center">{error}</p>
            <button 
              onClick={onRefresh}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle>Fleet Map</CardTitle>
        <div className="flex space-x-4 items-center">
          {/* View mode toggles */}
          <div className="flex space-x-2 items-center mr-2">
            <button
              onClick={() => setViewMode('default')}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md ${
                viewMode === 'default' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md ${
                viewMode === 'heatmap' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Heat Map</span>
            </button>
            <button
              onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md ${
                showAnalyticsPanel 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <BarChart className="w-3 h-3" />
              <span>Stats</span>
            </button>
          </div>
          
          {/* Existing filter controls */}
          <div className="flex space-x-2 items-center">
            <Filter className="w-4 h-4 mr-1" />
            <div className="flex space-x-1">
              {(['all', 'driving', 'charging', 'idle', 'low_battery', 'alert'] as FilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    activeFilter === filter 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  aria-pressed={activeFilter === filter}
                >
                  {filter === 'all' ? 'All' : filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center" style={{ height, width: '100%' }}>
            <Loader className="w-12 h-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">Loading map data...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row" style={{ height }}>
            <div className={`${showAnalyticsPanel ? 'w-full md:w-3/4' : 'w-full'} transition-all duration-300`}>
              <MapContainer
                center={[51.505, -0.09]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url={viewMode === 'default' ? 
                    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" : 
                    "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"}
                />
                
                <ZoomControl position="topright" />
                
                {filteredMarkers.map((marker: MapMarker) => (
                  <Marker
                    key={`${marker.type}-${marker.id}`}
                    position={marker.position}
                    icon={marker.type === 'vehicle' ? 
                      createVehicleIcon(marker.status) : 
                      createStationIcon(marker.status, marker.status === 'in_use')}
                    eventHandlers={{
                      click: () => setSelectedMarker(marker),
                    }}
                  >
                    <Popup>
                      <div>
                        <h4 className="font-medium">{marker.tooltip}</h4>
                        <p className="text-sm capitalize">Status: {marker.status}</p>
                        <p className="text-sm capitalize">Type: {marker.type.replace('-', ' ')}</p>
                        
                        {/* Analytics data in popup */}
                        {marker.type === 'charging-station' && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs font-medium text-blue-600">Analytics Insights:</p>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                              <p className="text-xs">Usage: 78%</p>
                              <p className="text-xs">Energy: 124 kWh</p>
                              <p className="text-xs">Peak: 18:00-20:00</p>
                              <p className="text-xs">Efficiency: 92%</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
                
                {/* Add heatmap visualization component when in heatmap mode */}
                {viewMode === 'heatmap' && (
                  <div className="leaflet-pane leaflet-overlay-pane">
                    <div style={{ position: 'absolute', inset: 0, zIndex: 400, pointerEvents: 'none' }}>
                      <EnergyFlowAnimation
                        direction="radial"
                        color="#8b5cf6"
                        particleCount={50}
                        intensity="medium"
                      />
                    </div>
                  </div>
                )}
              </MapContainer>
            </div>
            
            {/* Analytics Side Panel */}
            {showAnalyticsPanel && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full md:w-1/4 bg-white dark:bg-gray-800 p-4 overflow-auto border-l border-gray-200 dark:border-gray-700"
                style={{ height: '100%' }}
              >
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-purple-500" />
                  Fleet Analytics
                </h3>
                
                <div className="space-y-4">
                  {/* Key stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Total Vehicles</p>
                      <p className="text-lg font-bold">{analyticsData.totalVehicles}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Charging</p>
                      <p className="text-lg font-bold">{analyticsData.chargingVehicles}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Active Stations</p>
                      <p className="text-lg font-bold">{analyticsData.activeStations}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Utilization</p>
                      <p className="text-lg font-bold">{analyticsData.utilizationRate}%</p>
                    </div>
                  </div>
                  
                  {/* Energy delivered */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium">Energy Delivered</p>
                      <p className="text-xs text-gray-500">Today</p>
                    </div>
                    <p className="text-xl font-bold">{analyticsData.totalEnergyDelivered}</p>
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative w-3/4">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Usage times */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">Peak Usage Time</p>
                    <p className="text-lg font-bold">{analyticsData.peakUsageTime}</p>
                    <p className="text-xs text-gray-500 mt-1">Average charging session: {analyticsData.averageChargingTime}</p>
                  </div>
                  
                  {/* Filter metrics */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2">Current Filter Metrics</p>
                    <div className="flex items-center justify-between text-xs">
                      <span>Showing:</span>
                      <span className="font-medium">{filteredMarkers.length} items</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span>Filter:</span>
                      <span className="font-medium capitalize">{activeFilter}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
        <div className="mt-4 text-sm text-gray-500">
          <p>Showing {filteredMarkers.length} {activeFilter !== 'all' ? activeFilter : ''} items on the map</p>
          {filteredMarkers.length === 0 && !loading && (
            <p className="mt-2 text-amber-500">No items match the current filter. Try changing the filter.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Zoom Control Component (to place in top right)
function ZoomControl({ position }) {
  const map = useMap();
  
  return (
    <div className={`leaflet-control-zoom leaflet-bar leaflet-control absolute ${
      position === 'topright' ? 'top-2 right-2' : 'top-2 left-2'
    }`}>
      <button
        className="bg-white px-2 py-1 rounded-t border border-gray-300 hover:bg-gray-100 shadow-sm"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        className="bg-white px-2 py-1 rounded-b border border-gray-300 hover:bg-gray-100 shadow-sm border-t-0"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
      >
        -
      </button>
    </div>
  );
}

export default FleetMap; 