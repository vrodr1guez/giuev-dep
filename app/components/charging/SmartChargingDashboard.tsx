/// <reference path="../../types/react.d.ts" />
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, BarChart, Battery, Zap, Clock, DollarSign, Sun, RefreshCw, Settings, ChevronDown } from 'lucide-react';
import SmartChargingSchedule from './SmartChargingSchedule';
import { EnergyPriceForecastChart } from '../visualization/EnergyPriceForecastChart';
import { ChargingProfileChart } from '../visualization/ChargingProfileChart';
import { FleetChargingOptimization } from './FleetChargingOptimization';

interface EnergyPrice {
  timestamp: string;
  price: number;
  renewable: number;
  demand: number;
  isOptimal: boolean;
}

interface ChargingSchedule {
  vehicleId: string;
  batteryCapacity: number;
  initialSoC: number;
  targetSoC: number;
  startTime: string;
  endTime: string;
  totalChargingTime: number;
  totalEnergyCost: number;
  totalEnergyAdded: number;
  costSavingsPercent: number;
  averageRenewablePercent: number;
  schedule: ChargingSchedulePoint[];
}

interface ChargingSchedulePoint {
  timestamp: string;
  chargingPower: number;
  expectedSoC: number;
  price: number;
  renewable: number;
  isCritical: boolean;
}

const SmartChargingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [location, setLocation] = useState('main-depot');
  const [timeframe, setTimeframe] = useState('24h');
  const [energyPrices, setEnergyPrices] = useState([] as EnergyPrice[]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null as string | null);
  const [optimizedSchedule, setOptimizedSchedule] = useState(null as ChargingSchedule | null);
  
  // Fetch energy price data
  useEffect(() => {
    const fetchEnergyPrices = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/energy-prices?location=${location}&timeframe=${timeframe}`);
        const data = await response.json();
        setEnergyPrices(data);
      } catch (error) {
        console.error('Error fetching energy prices:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnergyPrices();
  }, [location, timeframe]);
  
  // Fetch optimized charging schedule when a vehicle is selected
  useEffect(() => {
    if (!selectedVehicle) return;
    
    const fetchOptimizedSchedule = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/charging-optimization?vehicleId=${selectedVehicle}`);
        const data = await response.json();
        setOptimizedSchedule(data);
      } catch (error) {
        console.error('Error fetching optimized schedule:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOptimizedSchedule();
  }, [selectedVehicle]);
  
  // Mock vehicle data
  const vehicles = [
    { id: 'v1', name: 'Tesla Model Y (ABC123)' },
    { id: 'v2', name: 'Ford F-150 Lightning (XYZ789)' },
    { id: 'v3', name: 'Chevy Bolt (DEF456)' },
    { id: 'v4', name: 'Rivian R1T (GHI789)' },
  ];
  
  // Mock locations
  const locations = [
    { id: 'main-depot', name: 'Main Depot' },
    { id: 'north-hub', name: 'North Hub Charging' },
    { id: 'downtown', name: 'Downtown Charging Station' },
    { id: 'airport', name: 'Airport Fleet Hub' },
  ];
  
  // Mock timeframes
  const timeframes = [
    { id: '24h', name: 'Next 24 Hours' },
    { id: '48h', name: 'Next 48 Hours' },
    { id: '7d', name: 'Next 7 Days' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Smart Charging Dashboard</h1>
          <p className="text-muted-foreground">
            Optimize your fleet charging schedules based on energy prices, vehicle needs, and grid demand
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((tf) => (
                <SelectItem key={tf.id} value={tf.id}>{tf.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="energy-prices">Energy Prices</TabsTrigger>
          <TabsTrigger value="vehicle-optimization">Vehicle Optimization</TabsTrigger>
          <TabsTrigger value="fleet-optimization">Fleet Optimization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Energy Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-2xl">
                    $0.14/kWh
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  10% lower than yesterday
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Renewable Energy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-2xl">
                    42%
                  </div>
                  <Sun className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Peak: 68% at 14:00
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Vehicles Charging</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-2xl">
                    8
                  </div>
                  <Battery className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  3 optimized, 5 standard
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Estimated Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-2xl">
                    $34.56
                  </div>
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Today's optimized charging
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Energy Price Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <EnergyPriceForecastChart data={energyPrices} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Optimal Charging Windows</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-blue-50 p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">2:00 AM - 5:00 AM</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">$0.08/kWh</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">45% renewable energy</p>
                </div>
                
                <div className="rounded-md bg-blue-50 p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">11:00 AM - 2:00 PM</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">$0.10/kWh</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">65% renewable energy</p>
                </div>
                
                <div className="rounded-md bg-blue-50 p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">9:00 PM - 11:00 PM</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">$0.09/kWh</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">38% renewable energy</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Smart Charging Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <SmartChargingSchedule />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="energy-prices" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Energy Price Forecast</CardTitle>
            </CardHeader>
            <CardContent className="h-[500px]">
              <EnergyPriceForecastChart data={energyPrices} showRenewable={true} showDemand={true} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vehicle-optimization" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Vehicle Charging Optimization</CardTitle>
                <Select value={selectedVehicle || ''} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select a Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedVehicle && optimizedSchedule ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-slate-500">Initial SoC</p>
                      <p className="text-2xl font-bold">{optimizedSchedule.initialSoC}%</p>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-slate-500">Target SoC</p>
                      <p className="text-2xl font-bold">{optimizedSchedule.targetSoC}%</p>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-slate-500">Charging Time</p>
                      <p className="text-2xl font-bold">{Math.round(optimizedSchedule.totalChargingTime / 60)} hrs</p>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-lg">
                      <p className="text-sm font-medium text-slate-500">Cost Savings</p>
                      <p className="text-2xl font-bold">{optimizedSchedule.costSavingsPercent}%</p>
                    </div>
                  </div>
                  
                  <ChargingProfileChart schedule={optimizedSchedule.schedule} />
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Optimization Summary</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <span>Total Energy Cost: ${optimizedSchedule.totalEnergyCost.toFixed(2)}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-500" />
                        <span>Total Energy Added: {optimizedSchedule.totalEnergyAdded.toFixed(1)} kWh</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Sun className="h-5 w-5 text-yellow-500" />
                        <span>Average Renewable %: {optimizedSchedule.averageRenewablePercent.toFixed(1)}%</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <span>Optimal Plug-in: {new Date(optimizedSchedule.startTime).toLocaleString()}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Battery className="h-16 w-16 text-slate-300 mb-4" />
                  <p className="text-slate-500 mb-4">Select a vehicle to view its optimized charging profile</p>
                  <Select value={selectedVehicle || ''} onValueChange={setSelectedVehicle}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select a Vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fleet-optimization" className="space-y-4 pt-4">
          <FleetChargingOptimization location={location} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartChargingDashboard; 