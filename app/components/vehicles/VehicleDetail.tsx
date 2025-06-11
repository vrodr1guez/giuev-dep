import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Car, 
  Gauge, 
  Battery, 
  Clock, 
  MapPin, 
  History, 
  Calendar, 
  Settings,
  Zap
} from 'lucide-react';

interface VehicleDetailProps {
  vehicleId: number;
}

const VehicleDetail: React.FC<VehicleDetailProps> = ({ vehicleId }) => {
  // In a real app, this data would be fetched from an API based on the vehicleId
  const vehicle = {
    id: vehicleId,
    vin: "1HGCM82633A123456",
    license_plate: "ABC123",
    make: "Tesla",
    model: "Model Y",
    year: 2023,
    battery_capacity_kwh: 75.0,
    nominal_range_km: 450.0,
    status: "active",
    current_soc: 68,
    soh: 96,
    odometer_km: 15250,
    driver: "John Smith",
    location: {
      lat: 45.4215,
      lng: -75.6972,
      address: "123 Main St, Ottawa, ON"
    },
    last_update: "2024-05-15T14:32:00Z"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="text-gray-500">
            {vehicle.license_plate} • VIN: {vehicle.vin}
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors">
            Edit
          </button>
          <button className="bg-gray-50 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">
            Assign Driver
          </button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-4">
          <TabsTrigger value="overview" className="flex gap-2 items-center">
            <Car className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="telematics" className="flex gap-2 items-center">
            <Gauge className="h-4 w-4" />
            <span>Telematics</span>
          </TabsTrigger>
          <TabsTrigger value="battery" className="flex gap-2 items-center">
            <Battery className="h-4 w-4" />
            <span>Battery</span>
          </TabsTrigger>
          <TabsTrigger value="charging" className="flex gap-2 items-center">
            <Zap className="h-4 w-4" />
            <span>Charging</span>
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex gap-2 items-center">
            <MapPin className="h-4 w-4" />
            <span>Routes</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex gap-2 items-center">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex gap-2 items-center">
            <Calendar className="h-4 w-4" />
            <span>Maintenance</span>
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
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Make & Model</p>
                    <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-medium">{vehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">VIN</p>
                    <p className="font-medium">{vehicle.vin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">License Plate</p>
                    <p className="font-medium">{vehicle.license_plate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Battery Capacity</p>
                    <p className="font-medium">{vehicle.battery_capacity_kwh} kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nominal Range</p>
                    <p className="font-medium">{vehicle.nominal_range_km} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Driver</p>
                    <p className="font-medium">{vehicle.driver || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium capitalize">{vehicle.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Battery Level</span>
                    <span className="text-sm font-medium">{vehicle.current_soc}%</span>
                  </div>
                  <div className="h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        vehicle.current_soc > 60 ? 'bg-green-500' :
                        vehicle.current_soc > 20 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${vehicle.current_soc}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Battery Health</span>
                    <span className="text-sm font-medium">{vehicle.soh}%</span>
                  </div>
                  <div className="h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${vehicle.soh}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center pt-2">
                  <Gauge className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Odometer: {vehicle.odometer_km.toLocaleString()} km</span>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{vehicle.location.address}</span>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Last update: {new Date(vehicle.last_update).toLocaleString()}
                  </span>
                </div>

                <div className="pt-2">
                  <button className="w-full bg-blue-100 text-blue-600 py-2 rounded-md hover:bg-blue-200 transition-colors">
                    View on Map
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts for this Vehicle */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  No recent alerts for this vehicle
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tabs would be implemented here */}
        <TabsContent value="telematics">
          <Card>
            <CardHeader>
              <CardTitle>Live Telematics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Live telematics data would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="battery">
          <Card>
            <CardHeader>
              <CardTitle>Battery Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Battery health metrics would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charging">
          <Card>
            <CardHeader>
              <CardTitle>Charging History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Charging history would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Route assignments would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Telematics History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Historical telematics data would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Maintenance logs would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                Vehicle settings would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleDetail; 