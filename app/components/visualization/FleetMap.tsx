/// <reference path="../../types/react.d.ts" />
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Button } from "../ui/button";
import { 
  Layers, 
  Filter, 
  Maximize2, 
  Car, 
  BatteryCharging, 
  AlertTriangle, 
  Clock
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix the default icon issue in react-leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
// });

// Create custom icons for different vehicle statuses
const createVehicleIcon = (status: string) => {
  let color;
  switch(status) {
    case 'driving': color = '#22c55e'; break; // green
    case 'charging': color = '#8b5cf6'; break; // purple
    case 'idle': color = '#f59e0b'; break; // amber
    case 'maintenance': color = '#64748b'; break; // slate
    case 'alert': color = '#ef4444'; break; // red
    default: color = '#3b82f6'; // blue
  }

  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

interface VehicleLocation {
  id: string;
  lat: number;
  lng: number;
  status: string;
  soc: number;
  driver: string;
  model: string;
  range: number;
  speed: number;
}

interface ChargingStation {
  id: string;
  lat: number;
  lng: number;
  type: string;
  available: number;
  total: number;
  power: number;
}

interface FleetMapProps {
  vehicles: VehicleLocation[];
  stations: ChargingStation[];
  loading?: boolean;
  onVehicleClick?: (vehicle: VehicleLocation) => void;
  onStationClick?: (station: ChargingStation) => void;
  className?: string;
}

const FleetMap: React.FC<FleetMapProps> = ({
  vehicles,
  stations,
  loading = false,
  onVehicleClick,
  onStationClick,
  className = ''
}) => {
  const [mapCenter] = useState([40.7128, -74.0060] as [number, number]);
  const [zoom] = useState(13);
  
  if (loading) {
    return (
      <div className={`relative h-[400px] bg-gray-900 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-3"></div>
          <p>Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fleet-map-widget ${className}`}>
      <div className="widget-header flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="font-semibold">Fleet Map</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="bg-gray-700 p-1.5 rounded-md">
            <Layers size={16} />
          </Button>
          <Button variant="outline" size="icon" className="bg-gray-700 p-1.5 rounded-md">
            <Filter size={16} />
          </Button>
          <Button variant="outline" size="icon" className="bg-gray-700 p-1.5 rounded-md">
            <Maximize2 size={16} />
          </Button>
        </div>
      </div>

      <div className="relative h-[400px]">
        <MapContainer 
          center={mapCenter} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Dark">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Light">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Render Vehicles */}
          {vehicles.map(vehicle => (
            <Marker 
              key={vehicle.id} 
              position={[vehicle.lat, vehicle.lng]} 
              icon={createVehicleIcon(vehicle.status)}
              eventHandlers={{
                click: () => onVehicleClick && onVehicleClick(vehicle),
              }}
            >
              <Popup className="vehicle-popup">
                <div className="vehicle-info">
                  <h3 className="font-semibold text-sm">{vehicle.id} - {vehicle.model}</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                    <div className="flex items-center">
                      <Car size={12} className="mr-1" />
                      <span>Status: <span className="capitalize">{vehicle.status}</span></span>
                    </div>
                    <div className="flex items-center">
                      <BatteryCharging size={12} className="mr-1" />
                      <span>SoC: {vehicle.soc}%</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      <span>Range: {vehicle.range} mi</span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      <span>Speed: {vehicle.speed} mph</span>
                    </div>
                  </div>
                  <p className="text-xs mt-2">Driver: {vehicle.driver}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render Charging Stations */}
          {stations.map(station => (
            <Marker 
              key={station.id} 
              position={[station.lat, station.lng]}
              eventHandlers={{
                click: () => onStationClick && onStationClick(station),
              }}
            >
              <Popup className="station-popup">
                <div className="station-info">
                  <h3 className="font-semibold text-sm">{station.id}</h3>
                  <div className="grid grid-cols-1 gap-y-1 mt-2 text-xs">
                    <div className="flex items-center">
                      <BatteryCharging size={12} className="mr-1" />
                      <span>Type: {station.type === 'fast' ? 'Fast Charging' : 'Standard'}</span>
                    </div>
                    <div className="flex items-center">
                      <span>Available: {station.available}/{station.total}</span>
                    </div>
                    <div className="flex items-center">
                      <span>Power: {station.power} kW</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-800/80 p-2 rounded-md text-xs z-[1000]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Driving</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            <span>Charging</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>Alert</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetMap; 