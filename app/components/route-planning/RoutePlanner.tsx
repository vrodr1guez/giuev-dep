import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MapPin, Navigation, Zap, Car, Clock, Calendar, Plus, Battery } from 'lucide-react';

const RoutePlanner: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Route Planning</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Plan New Route</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Planning Map */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Route Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-100 rounded-lg border border-gray-200 h-[600px] w-full flex items-center justify-center">
                {/* This is a placeholder for the actual map. In a real app, you would use a library like Google Maps, Leaflet, or Mapbox */}
                <div className="text-gray-500 text-center absolute inset-0 flex items-center justify-center">
                  <div>
                    <MapPin className="h-12 w-12 mx-auto text-gray-400" />
                    <p>Interactive Map Would Display Here</p>
                    <p className="text-sm mt-2">With Route Planning Interface</p>
                  </div>
                </div>

                {/* Route Planning Interface (this would typically be implemented with a maps API) */}
                <div className="absolute top-4 left-4 right-4 bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-medium mb-4">Plan Your Route</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-full">
                        <MapPin className="h-4 w-4 text-green-500" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Start location" 
                        className="flex-1 p-2 border rounded-md" 
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-100 rounded-full">
                        <MapPin className="h-4 w-4 text-red-500" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Destination" 
                        className="flex-1 p-2 border rounded-md" 
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Car className="h-4 w-4 text-blue-500" />
                      </div>
                      <select className="flex-1 p-2 border rounded-md">
                        <option value="">Select Vehicle</option>
                        <option value="1">Tesla Model Y (ABC123)</option>
                        <option value="2">Tesla Model 3 (XYZ789)</option>
                        <option value="3">Ford F-150 Lightning (DEF456)</option>
                        <option value="4">Chevrolet Bolt (GHI789)</option>
                        <option value="5">Rivian R1T (JKL012)</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Calendar className="h-4 w-4 text-purple-500" />
                        </div>
                        <input 
                          type="date" 
                          className="flex-1 p-2 border rounded-md" 
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Clock className="h-4 w-4 text-purple-500" />
                        </div>
                        <input 
                          type="time" 
                          className="flex-1 p-2 border rounded-md" 
                        />
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                      Calculate Optimal Route
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Route Details */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Route Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-20">
                <Navigation className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p>Select a start and destination</p>
                <p className="text-sm mt-2">Route details will appear here</p>
              </div>

              {/* This would be populated when a route is calculated */}
              <div className="hidden space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Route Summary</h3>
                    <button className="text-sm text-blue-600">Save Route</button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Total Distance</div>
                      <div className="font-bold">320 km</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Est. Travel Time</div>
                      <div className="font-bold">3h 45m</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Energy Consumption</div>
                      <div className="font-bold">65 kWh</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Charging Stops</div>
                      <div className="font-bold">1</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Route Waypoints</h3>
                  
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="p-2 bg-green-100 rounded-full">
                          <MapPin className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="absolute top-[calc(100%+4px)] bottom-0 left-1/2 w-0.5 h-12 bg-gray-300"></div>
                      </div>
                      <div>
                        <div className="font-medium">Start: Ottawa Downtown</div>
                        <div className="text-sm text-gray-500">Departure: 9:00 AM</div>
                        <div className="flex items-center text-xs mt-1">
                          <Battery className="h-3 w-3 mr-1 text-green-500" />
                          <span>Starting Battery: 85%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Zap className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="absolute top-[calc(100%+4px)] bottom-0 left-1/2 w-0.5 h-12 bg-gray-300"></div>
                      </div>
                      <div>
                        <div className="font-medium">Charging Stop: Kingston Supercharger</div>
                        <div className="text-sm text-gray-500">Arrival: 10:45 AM</div>
                        <div className="flex items-center text-xs mt-1">
                          <Battery className="h-3 w-3 mr-1 text-yellow-500" />
                          <span>Charge from 25% to 80% (30 min)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div>
                        <div className="p-2 bg-red-100 rounded-full">
                          <MapPin className="h-4 w-4 text-red-500" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Destination: Toronto Downtown</div>
                        <div className="text-sm text-gray-500">Arrival: 12:45 PM</div>
                        <div className="flex items-center text-xs mt-1">
                          <Battery className="h-3 w-3 mr-1 text-yellow-500" />
                          <span>Remaining Battery: 35%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Saved Routes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Saved Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 font-medium">Route Name</th>
                  <th className="p-3 font-medium">Vehicle</th>
                  <th className="p-3 font-medium">Distance</th>
                  <th className="p-3 font-medium">Departure</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50">
                  <td className="p-3">Ottawa to Toronto</td>
                  <td className="p-3">Tesla Model Y (ABC123)</td>
                  <td className="p-3">320 km</td>
                  <td className="p-3">Tomorrow, 9:00 AM</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Scheduled
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                      <button className="text-gray-600 hover:text-gray-800">Edit</button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3">Daily Commute</td>
                  <td className="p-3">Tesla Model 3 (XYZ789)</td>
                  <td className="p-3">25 km</td>
                  <td className="p-3">Today, 5:30 PM</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Active
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                      <button className="text-gray-600 hover:text-gray-800">Edit</button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3">Weekend Trip</td>
                  <td className="p-3">Rivian R1T (JKL012)</td>
                  <td className="p-3">450 km</td>
                  <td className="p-3">Sat, 8:00 AM</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      Planning
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                      <button className="text-gray-600 hover:text-gray-800">Edit</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoutePlanner; 