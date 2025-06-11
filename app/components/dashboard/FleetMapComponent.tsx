/// <reference path="../../types/react.d.ts" />
"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Battery, Zap, MapPin, Info, AlertCircle, Car } from 'lucide-react';

// This is a placeholder component
// In a real implementation, this would use a mapping library like Leaflet or Google Maps
interface Vehicle {
  id: string;
  lat: number;
  lng: number;
  status: string;
  soc: number;
  driver: string;
  model: string;
  range: number;
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

interface FleetMapComponentProps {
  vehicles: any[];
  stations: any[];
  viewMode?: 'all' | 'vehicles' | 'stations';
}

const FleetMapComponent: React.FC<FleetMapComponentProps> = ({
  vehicles,
  stations,
  viewMode = 'all'
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null as string | null);
  const [selectedStation, setSelectedStation] = useState(null as string | null);
  
  const handleVehicleClick = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    setSelectedStation(null);
  };
  
  const handleStationClick = (stationId: string) => {
    setSelectedStation(stationId);
    setSelectedVehicle(null);
  };
  
  // Get details of selected vehicle or station
  const selectedVehicleDetails = selectedVehicle 
    ? vehicles.find(v => v.id === selectedVehicle) 
    : null;
    
  const selectedStationDetails = selectedStation 
    ? stations.find(s => s.id === selectedStation) 
    : null;

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-md overflow-hidden">
      {/* Map Placeholder - In a real implementation, this would be a proper map */}
      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Interactive Fleet Map</h3>
          <p className="text-sm text-muted-foreground mb-4">
            In a real implementation, this would be an interactive map showing vehicles and charging stations.
            The current view mode is: <span className="font-medium">{viewMode}</span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-left">
            {/* Vehicle List */}
            {(viewMode === 'all' || viewMode === 'vehicles') && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Vehicles ({vehicles.length})</h4>
                <div className="space-y-1">
                  {vehicles.map(vehicle => (
                    <div 
                      key={vehicle.id}
                      className={`p-2 text-xs rounded cursor-pointer flex items-center ${
                        selectedVehicle === vehicle.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleVehicleClick(vehicle.id)}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        vehicle.status === 'alert' ? 'bg-red-500' :
                        vehicle.status === 'charging' ? 'bg-green-500' :
                        vehicle.status === 'driving' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`} />
                      <div>{vehicle.id}: {vehicle.model}</div>
                      <div className="ml-auto flex items-center gap-1">
                        <Battery className="h-3 w-3" />
                        <span>{vehicle.soc}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Charging Stations List */}
            {(viewMode === 'all' || viewMode === 'stations') && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Charging Stations ({stations.length})</h4>
                <div className="space-y-1">
                  {stations.map(station => (
                    <div 
                      key={station.id}
                      className={`p-2 text-xs rounded cursor-pointer flex items-center ${
                        selectedStation === station.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleStationClick(station.id)}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        station.available === 0 ? 'bg-red-500' :
                        station.available < station.total / 2 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <div>{station.id}</div>
                      <div className="ml-auto flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span>{station.power} kW</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Selected Item Details */}
      {(selectedVehicleDetails || selectedStationDetails) && (
        <div className="absolute bottom-4 right-4 w-80 bg-white rounded-md shadow-lg">
          {selectedVehicleDetails && (
            <Card>
              <CardContent className="p-4">
                <div className="font-medium flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  {selectedVehicleDetails.id}: {selectedVehicleDetails.model}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                  <div className="flex items-center">
                    <Battery className="h-3 w-3 mr-1" />
                    <span>SoC: {selectedVehicleDetails.soc}%</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>Range: {selectedVehicleDetails.range} km</span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Driver: {selectedVehicleDetails.driver}</span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Status: {selectedVehicleDetails.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {selectedStationDetails && (
            <Card>
              <CardContent className="p-4">
                <div className="font-medium flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  {selectedStationDetails.id} ({selectedStationDetails.type.toUpperCase()})
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                  <div className="flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Power: {selectedStationDetails.power} kW</span>
                  </div>
                  <div className="flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Type: {selectedStationDetails.type}</span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span>
                      Available: {selectedStationDetails.available}/{selectedStationDetails.total} connectors
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FleetMapComponent; 