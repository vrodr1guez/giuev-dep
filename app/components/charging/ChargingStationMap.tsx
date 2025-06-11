'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from "../ui/button";
import Link from 'next/link';
import { Zap, MapPin } from 'lucide-react';

// Dynamically import react-leaflet components with no SSR
// This is necessary because leaflet requires window which isn't available during SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const ZoomControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
);

// We need to dynamically import leaflet for client-side only
const LeafletModule = dynamic(() => import('leaflet'), { ssr: false });

// Define station status type for type safety
type StationStatus = 'available' | 'in-use' | 'maintenance' | 'offline';

interface ChargingStation {
  id: string;
  name: string;
  status: StationStatus;
  connectors: number;
  power: number;
  location: string;
  coordinates: { lat: number; lng: number };
  address: string;
  lastUpdated: string;
  connectorDetails: Array<{
    id: string;
    type: string;
    power: number;
    status: string;
  }>;
}

interface ChargingStationMapProps {
  stations: ChargingStation[];
  loading?: boolean;
  center?: [number, number];
  zoom?: number;
}

const ChargingStationMap: React.FC<ChargingStationMapProps> = ({ 
  stations, 
  loading = false,
  center = [40.7128, -74.0060],
  zoom = 13
}) => {
  // Function to create custom marker icons - will be used client-side only
  const createCustomIcon = (status: StationStatus) => {
    if (typeof window === 'undefined') return null;
    
    // @ts-ignore - Leaflet types are tricky in Next.js
    let L: any;
    // Attempt to get L from the dynamically loaded module
    try {
      L = require('leaflet');
    } catch (e) {
      return null;
    }
    
    // Fix for Leaflet marker icons in React
    // @ts-ignore - Leaflet types compatibility fix
    if (L && L.Icon && L.Icon.Default && !L.Icon.Default.prototype._getIconUrl) {
      // @ts-ignore - Leaflet types compatibility fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    }
    
    let color: string;
    switch (status) {
      case 'available':
        color = '#22c55e'; // green
        break;
      case 'in-use':
        color = '#3b82f6'; // blue
        break;
      case 'maintenance':
        color = '#f59e0b'; // amber
        break;
      case 'offline':
        color = '#ef4444'; // red
        break;
      default:
        color = '#64748b'; // gray
    }
    
    // @ts-ignore - Leaflet DivIcon creation
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Don't render map on server
  if (typeof window === 'undefined') {
    return (
      <div className="h-[500px] bg-gray-900/10 flex items-center justify-center">
        <p>Map loading...</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-3"></div>
            <p>Loading map data...</p>
          </div>
        </div>
      ) : null}
      
      {/* Include the leaflet CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `@import 'leaflet/dist/leaflet.css';`
      }} />
      
      {/* @ts-ignore - Leaflet component typing issues */}
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        className="z-0"
      >
        {/* @ts-ignore - Leaflet component typing issues */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />
        {stations.map((station: ChargingStation) => (
          // @ts-ignore - Leaflet marker typing issues
          <Marker 
            key={station.id}
            position={[station.coordinates.lat, station.coordinates.lng]}
            icon={createCustomIcon(station.status as StationStatus)}
          >
            {/* @ts-ignore - Leaflet popup typing issues */}
            <Popup>
              <div className="text-gray-900 p-1">
                <h3 className="font-bold">{station.name}</h3>
                <p className="text-sm">Status: <span className={
                  station.status === 'available' ? 'text-green-600' :
                  station.status === 'in-use' ? 'text-blue-600' :
                  station.status === 'maintenance' ? 'text-amber-600' :
                  'text-red-600'
                }>{station.status}</span></p>
                <p className="text-sm">Connectors: {station.connectors}</p>
                <p className="text-sm">Power: {station.power} kW</p>
                <p className="text-sm">Location: {station.location}</p>
                <p className="text-sm">Address: {station.address}</p>
                <Button size="sm" className="mt-2 w-full">
                  <Link href={`/charging-stations/${station.id}`}>View Details</Link>
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
        {/* @ts-ignore - Leaflet control typing issues */}
        <ZoomControl position="topright" />
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-gray-800/80 p-2 rounded-md text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>In-Use</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>Maintenance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span>Offline</span>
        </div>
      </div>
    </div>
  );
};

export default ChargingStationMap; 