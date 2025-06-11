'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  MapPin, 
  PlugZap, 
  Settings, 
  BarChart, 
  Zap,
  Info
} from 'lucide-react';

interface ChargingStationDetailProps {
  stationId: number;
}

type ConnectorStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'out_of_service' | 'faulted' | 'offline';

interface Connector {
  id: number;
  connectorNumber: number;
  connectorType: string;
  maxPowerKw: number;
  status: ConnectorStatus;
  pricePerKwh: number | null;
  lastStatusUpdate: string;
  currentSessionId: number | null;
}

const ChargingStationDetail = ({ stationId }: ChargingStationDetailProps) => {
  // In a real app, this data would be fetched from an API based on the stationId
  const station = {
    id: stationId,
    name: "Main Depot Fast Charging Hub",
    location: {
      description: "Company HQ - North Parking",
      latitude: 45.4215,
      longitude: -75.6972,
      address: "123 Corporate Drive",
      city: "Ottawa",
      state: "ON",
      postalCode: "K1P 1J1",
      country: "Canada"
    },
    provider: "ChargePoint",
    isPublic: false,
    operatingHours: "24/7",
    status: "active",
    powerCapacityKw: 150,
    currentLoadKw: 65.5,
    availability: {
      totalConnectors: 6,
      availableConnectors: 3,
      inUseConnectors: 2,
      faultedConnectors: 1
    },
    commissioning_date: "2023-05-10",
    contactPhone: "+1 (555) 123-4567"
  };

  // Mock connectors for this station
  const connectors: Connector[] = [
    {
      id: 101,
      connectorNumber: 1,
      connectorType: "CCS2",
      maxPowerKw: 150,
      status: "available",
      pricePerKwh: 0.25,
      lastStatusUpdate: "2024-05-15T15:30:00Z",
      currentSessionId: null
    },
    {
      id: 102,
      connectorNumber: 2,
      connectorType: "CCS2",
      maxPowerKw: 150,
      status: "occupied",
      pricePerKwh: 0.25,
      lastStatusUpdate: "2024-05-15T14:15:00Z",
      currentSessionId: 5001
    },
    {
      id: 103,
      connectorNumber: 3,
      connectorType: "CHAdeMO",
      maxPowerKw: 100,
      status: "available",
      pricePerKwh: 0.25,
      lastStatusUpdate: "2024-05-15T15:30:00Z",
      currentSessionId: null
    },
    {
      id: 104,
      connectorNumber: 4,
      connectorType: "Type2",
      maxPowerKw: 22,
      status: "available",
      pricePerKwh: 0.20,
      lastStatusUpdate: "2024-05-15T15:30:00Z",
      currentSessionId: null
    },
    {
      id: 105,
      connectorNumber: 5,
      connectorType: "Type2",
      maxPowerKw: 22,
      status: "occupied",
      pricePerKwh: 0.20,
      lastStatusUpdate: "2024-05-15T13:45:00Z",
      currentSessionId: 5002
    },
    {
      id: 106,
      connectorNumber: 6,
      connectorType: "Type2",
      maxPowerKw: 22,
      status: "faulted",
      pricePerKwh: 0.20,
      lastStatusUpdate: "2024-05-15T10:20:00Z",
      currentSessionId: null
    }
  ];

  // Get status color classes
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      case 'planned': return 'bg-blue-500';
      case 'faulted': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get connector status color classes
  const getConnectorStatusColorClass = (status: ConnectorStatus) => {
    switch (status) {
      case 'available': return 'text-green-500';
      case 'occupied': return 'text-blue-500';
      case 'reserved': return 'text-purple-500';
      case 'maintenance': 
      case 'out_of_service': return 'text-yellow-500';
      case 'faulted': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{station.name}</h1>
            <span className={`inline-block w-3 h-3 rounded-full ${getStatusColorClass(station.status)}`}></span>
          </div>
          <p className="text-gray-500">
            {station.location.address}, {station.location.city}
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors">
            Edit
          </button>
          <button className="bg-gray-50 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">
            View on Map
          </button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-5 mb-4">
          <TabsTrigger value="overview" className="flex gap-2 items-center">
            <Info className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="connectors" className="flex gap-2 items-center">
            <PlugZap className="h-4 w-4" />
            <span>Connectors</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex gap-2 items-center">
            <Clock className="h-4 w-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex gap-2 items-center">
            <BarChart className="h-4 w-4" />
            <span>Metrics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex gap-2 items-center">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Station Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Provider</p>
                    <p className="font-medium">{station.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Accessibility</p>
                    <p className="font-medium">{station.isPublic ? 'Public' : 'Private'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Operating Hours</p>
                    <p className="font-medium">{station.operatingHours}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{station.contactPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Power Capacity</p>
                    <p className="font-medium">{station.powerCapacityKw} kW</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Commissioning Date</p>
                    <p className="font-medium">{new Date(station.commissioning_date).toLocaleDateString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {station.location.address}, {station.location.city}, {station.location.state} {station.location.postalCode}, {station.location.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Load:</span>
                  <span className="text-sm font-medium">{station.currentLoadKw} kW / {station.powerCapacityKw} kW</span>
                </div>
                <div className="h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${(station.currentLoadKw / station.powerCapacityKw) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-green-50 p-3 rounded-md text-center">
                    <div className="text-xl font-bold text-green-600">{station.availability.availableConnectors}</div>
                    <div className="text-xs text-green-700">Available</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-md text-center">
                    <div className="text-xl font-bold text-blue-600">{station.availability.inUseConnectors}</div>
                    <div className="text-xs text-blue-700">In Use</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-md text-center">
                    <div className="text-xl font-bold text-red-600">{station.availability.faultedConnectors}</div>
                    <div className="text-xs text-red-700">Faulted</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <div className="text-xl font-bold text-gray-600">{station.availability.totalConnectors}</div>
                    <div className="text-xs text-gray-700">Total</div>
                  </div>
                </div>

                <div className="flex items-center pt-2">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Last updated: {new Date().toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {station.location.latitude.toFixed(6)}, {station.location.longitude.toFixed(6)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Connectors Tab */}
        <TabsContent value="connectors">
          <Card>
            <CardHeader>
              <CardTitle>Charging Connectors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="p-3 font-medium">ID</th>
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium">Max Power</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Price</th>
                      <th className="p-3 font-medium">Last Update</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {connectors.map(connector => (
                      <tr key={connector.id} className="hover:bg-gray-50">
                        <td className="p-3">{connector.connectorNumber}</td>
                        <td className="p-3">{connector.connectorType}</td>
                        <td className="p-3">{connector.maxPowerKw} kW</td>
                        <td className="p-3">
                          <span className={`capitalize font-medium ${getConnectorStatusColorClass(connector.status)}`}>
                            {connector.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3">
                          {connector.pricePerKwh ? `$${connector.pricePerKwh}/kWh` : 'N/A'}
                        </td>
                        <td className="p-3">
                          {new Date(connector.lastStatusUpdate).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              {connector.status === 'faulted' ? 'Reset' : 'Details'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Charging Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Recent charging sessions would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Energy Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Energy usage charts and metrics would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Station Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Station configuration settings would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChargingStationDetail; 