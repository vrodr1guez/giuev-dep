/// <reference path="../../types/react.d.ts" />
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Battery, Zap, DollarSign, ArrowRight, BarChart, Settings, RefreshCw } from 'lucide-react';

interface FleetOptimizationProps {
  location: string;
}

interface FleetVehicle {
  id: string;
  name: string;
  licensePlate: string;
  batteryCapacity: number;
  currentSoC: number;
  targetSoC: number;
  pluginTime: string;
  departureTime: string;
  chargingPriority: 'high' | 'medium' | 'low';
  optimalChargingWindow?: {
    start: string;
    end: string;
    cost: number;
    savings: number;
  };
}

interface GridDemandPoint {
  timestamp: string;
  demand: number;
  renewable: number;
  price: number;
}

export const FleetChargingOptimization: React.FC<FleetOptimizationProps> = ({ location }) => {
  const [fleetVehicles, setFleetVehicles] = useState([] as FleetVehicle[]);
  const [gridDemand, setGridDemand] = useState([] as GridDemandPoint[]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [totalSavings, setTotalSavings] = useState(0);
  
  // Mock data for demonstration
  useEffect(() => {
    // In a real app, fetch this data from the API
    const mockVehicles: FleetVehicle[] = [
      {
        id: 'v1',
        name: 'Tesla Model Y',
        licensePlate: 'ABC123',
        batteryCapacity: 75,
        currentSoC: 35,
        targetSoC: 90,
        pluginTime: new Date().toISOString(),
        departureTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        chargingPriority: 'medium',
      },
      {
        id: 'v2',
        name: 'Ford F-150 Lightning',
        licensePlate: 'XYZ789',
        batteryCapacity: 131,
        currentSoC: 22,
        targetSoC: 80,
        pluginTime: new Date().toISOString(),
        departureTime: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
        chargingPriority: 'high',
      },
      {
        id: 'v3',
        name: 'Chevy Bolt',
        licensePlate: 'DEF456',
        batteryCapacity: 65,
        currentSoC: 45,
        targetSoC: 85,
        pluginTime: new Date().toISOString(),
        departureTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        chargingPriority: 'low',
      },
      {
        id: 'v4',
        name: 'Rivian R1T',
        licensePlate: 'GHI789',
        batteryCapacity: 135,
        currentSoC: 15,
        targetSoC: 75,
        pluginTime: new Date().toISOString(),
        departureTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        chargingPriority: 'high',
      },
      {
        id: 'v5',
        name: 'Hyundai Ioniq 5',
        licensePlate: 'JKL012',
        batteryCapacity: 77,
        currentSoC: 30,
        targetSoC: 90,
        pluginTime: new Date().toISOString(),
        departureTime: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
        chargingPriority: 'medium',
      },
    ];
    
    setFleetVehicles(mockVehicles);
    
    // Generate mock grid demand data
    const mockGridDemand: GridDemandPoint[] = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000).toISOString();
      const hour = (now.getHours() + i) % 24;
      
      // Simulate daily demand pattern
      let demand = 30;
      if (hour >= 6 && hour <= 9) demand = 70 + Math.random() * 20; // Morning peak
      else if (hour >= 17 && hour <= 21) demand = 80 + Math.random() * 20; // Evening peak
      else if (hour >= 10 && hour <= 16) demand = 50 + Math.random() * 20; // Midday
      else demand = 30 + Math.random() * 20; // Night
      
      // Simulate renewable availability
      let renewable = 20;
      if (hour >= 9 && hour <= 16) renewable = 40 + Math.random() * 30; // Solar peak during day
      else renewable = 20 + Math.random() * 15; // Base renewable
      
      // Simulate price based on demand and renewable
      const price = 0.10 + (demand / 100) * 0.15 - (renewable / 100) * 0.04 + (Math.random() * 0.02 - 0.01);
      
      mockGridDemand.push({
        timestamp,
        demand,
        renewable,
        price,
      });
    }
    
    setGridDemand(mockGridDemand);
  }, [location]);
  
  // Function to optimize fleet charging
  const optimizeFleetCharging = () => {
    setIsOptimizing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Simulate optimized charging windows based on grid demand and vehicle needs
      const optimizedVehicles = fleetVehicles.map(vehicle => {
        // Find low demand periods for this vehicle
        const departureTime = new Date(vehicle.departureTime);
        const pluginTime = new Date(vehicle.pluginTime);
        const availableHours = Math.floor((departureTime.getTime() - pluginTime.getTime()) / (60 * 60 * 1000));
        
        // Calculate how many hours of charging needed
        const energyNeeded = (vehicle.targetSoC - vehicle.currentSoC) / 100 * vehicle.batteryCapacity;
        const chargingRate = vehicle.batteryCapacity > 100 ? 50 : 30; // kW
        const hoursNeeded = Math.ceil(energyNeeded / chargingRate);
        
        // Find lowest price periods
        const eligibleDemandPoints = gridDemand.filter(point => {
          const pointTime = new Date(point.timestamp);
          return pointTime >= pluginTime && pointTime <= departureTime;
        });
        
        // Sort by price
        eligibleDemandPoints.sort((a, b) => a.price - b.price);
        
        // Take the best hours based on price
        const bestPeriods = eligibleDemandPoints.slice(0, hoursNeeded);
        
        if (bestPeriods.length === 0) return vehicle;
        
        // Calculate average price for best periods
        const avgPrice = bestPeriods.reduce((sum, point) => sum + point.price, 0) / bestPeriods.length;
        
        // Calculate average price for immediate charging (worst case)
        const immediateChargingPeriods = eligibleDemandPoints.slice(0, hoursNeeded);
        const avgImmediatePrice = immediateChargingPeriods.reduce((sum, point) => sum + point.price, 0) / 
                                 (immediateChargingPeriods.length || 1);
        
        // Calculate savings
        const costBest = avgPrice * energyNeeded;
        const costImmediate = avgImmediatePrice * energyNeeded;
        const savings = Math.max(0, costImmediate - costBest);
        
        return {
          ...vehicle,
          optimalChargingWindow: {
            start: bestPeriods[0]?.timestamp || pluginTime.toISOString(),
            end: bestPeriods[bestPeriods.length - 1]?.timestamp || pluginTime.toISOString(),
            cost: parseFloat(costBest.toFixed(2)),
            savings: parseFloat(savings.toFixed(2))
          }
        };
      });
      
      setFleetVehicles(optimizedVehicles);
      
      // Calculate total savings
      const totalSavings = optimizedVehicles.reduce((sum, vehicle) => 
        sum + (vehicle.optimalChargingWindow?.savings || 0), 0);
      setTotalSavings(parseFloat(totalSavings.toFixed(2)));
      
      setIsOptimizing(false);
      setIsOptimized(true);
    }, 1500);
  };
  
  // Format time for display
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Determine status badge styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Fleet Charging Optimization</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                onClick={optimizeFleetCharging} 
                disabled={isOptimizing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    {isOptimized ? 'Re-Optimize Fleet' : 'Optimize Fleet Charging'}
                  </>
                )}
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isOptimized && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Fleet Optimization Complete</h3>
                  <p className="text-sm text-blue-700">
                    Optimized charging schedules for {fleetVehicles.length} vehicles based on energy prices and grid demand
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-blue-700">Total Savings</p>
                    <p className="text-2xl font-bold text-green-600">${totalSavings}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-blue-700">Grid Impact</p>
                    <p className="text-2xl font-bold text-blue-600">Reduced</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Vehicle</th>
                  <th className="text-center py-3 px-4">Battery</th>
                  <th className="text-center py-3 px-4">Departure</th>
                  <th className="text-center py-3 px-4">Priority</th>
                  <th className="text-center py-3 px-4">Optimal Window</th>
                  <th className="text-center py-3 px-4">Savings</th>
                </tr>
              </thead>
              <tbody>
                {fleetVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Battery className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{vehicle.name}</p>
                          <p className="text-xs text-gray-500">{vehicle.licensePlate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <p className="font-medium">{vehicle.currentSoC}% → {vehicle.targetSoC}%</p>
                      <p className="text-xs text-gray-500">{vehicle.batteryCapacity} kWh</p>
                    </td>
                    <td className="text-center py-3 px-4">
                      <p className="font-medium">{formatTime(vehicle.departureTime)}</p>
                      <p className="text-xs text-gray-500">
                        {Math.floor((new Date(vehicle.departureTime).getTime() - Date.now()) / (60 * 60 * 1000))} hrs remaining
                      </p>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadge(vehicle.chargingPriority)}`}>
                        {vehicle.chargingPriority}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      {vehicle.optimalChargingWindow ? (
                        <div>
                          <p className="font-medium flex items-center justify-center gap-2">
                            <span>{formatTime(vehicle.optimalChargingWindow.start)}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{formatTime(vehicle.optimalChargingWindow.end)}</span>
                          </p>
                          <p className="text-xs text-gray-500">${vehicle.optimalChargingWindow.cost.toFixed(2)} estimated cost</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not optimized</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {vehicle.optimalChargingWindow ? (
                        <p className="font-medium text-green-600">${vehicle.optimalChargingWindow.savings.toFixed(2)}</p>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grid Demand Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border rounded-md">
              <p className="text-slate-500">Grid demand visualization would go here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Charging Station Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border rounded-md">
              <p className="text-slate-500">Charging station capacity visualization would go here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 