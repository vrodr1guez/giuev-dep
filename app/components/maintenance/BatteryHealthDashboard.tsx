/// <reference path="../../types/react.d.ts" />
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { 
  Battery, 
  AlertTriangle, 
  Calendar, 
  Zap, 
  BarChart, 
  ThermometerSun, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Wrench
} from 'lucide-react';
import { BatteryHealthChart } from '../visualization/BatteryHealthChart';
import { MaintenanceScheduleCard } from './MaintenanceScheduleCard';

interface BatteryHealthData {
  vehicle_id: string;
  state_of_health: number;
  estimated_capacity: number;
  nominal_capacity: number;
  cycle_count: number;
  predicted_degradation_rate: number;
  estimated_replacement_date?: string;
  anomalies: Array<{
    type: string;
    severity: string;
    date: string;
    description: string;
    recommended_action: string;
  }>;
  confidence: number;
}

interface MaintenanceSchedule {
  vehicle_id: string;
  next_maintenance_date: string;
  maintenance_type: string;
  reason: string;
  priority: string;
  estimated_downtime_hours: number;
  recommended_actions: string[];
  predicted_days_to_replacement?: number;
}

const BatteryHealthDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVehicle, setSelectedVehicle] = useState(null as string | null);
  const [batteryHealth, setBatteryHealth] = useState(null as BatteryHealthData | null);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState(null as MaintenanceSchedule | null);
  const [fleetHealth, setFleetHealth] = useState(null as any);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock vehicle data - would come from API in real application
  const vehicles = [
    { id: 'v1', name: 'Tesla Model Y (ABC123)' },
    { id: 'v2', name: 'Ford F-150 Lightning (XYZ789)' },
    { id: 'v3', name: 'Chevy Bolt (DEF456)' },
    { id: 'v4', name: 'Rivian R1T (GHI789)' },
    { id: 'v5', name: 'Hyundai Ioniq 5 (JKL012)' },
  ];
  
  // Fetch battery health data for a selected vehicle
  useEffect(() => {
    if (!selectedVehicle) return;
    
    const fetchBatteryHealthData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/battery-health/vehicle/${selectedVehicle}`);
        if (!response.ok) throw new Error('Failed to fetch battery health data');
        const data = await response.json();
        setBatteryHealth(data);
        
        // Also fetch maintenance schedule
        const maintenanceResponse = await fetch(`/api/v1/battery-health/maintenance/${selectedVehicle}`);
        if (maintenanceResponse.ok) {
          const maintenanceData = await maintenanceResponse.json();
          setMaintenanceSchedule(maintenanceData);
        }
      } catch (error) {
        console.error('Error fetching battery health data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBatteryHealthData();
  }, [selectedVehicle]);
  
  // Fetch fleet health report
  useEffect(() => {
    const fetchFleetHealthData = async () => {
      setIsLoading(true);
      try {
        // All vehicle IDs joined by commas
        const vehicleIds = vehicles.map(v => v.id).join(',');
        const response = await fetch(`/api/v1/battery-health/fleet-report?vehicles=${vehicleIds}`);
        if (!response.ok) throw new Error('Failed to fetch fleet health data');
        const data = await response.json();
        setFleetHealth(data);
      } catch (error) {
        console.error('Error fetching fleet health data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (activeTab === 'fleet-overview') {
      fetchFleetHealthData();
    }
  }, [activeTab]);
  
  // Helper function to format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Helper to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };
  
  // Helper to get health status color
  const getHealthStatusColor = (health: number) => {
    if (health > 90) return 'text-green-500';
    if (health > 80) return 'text-blue-500';
    if (health > 70) return 'text-orange-500';
    return 'text-red-500';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Battery Health Monitoring</h1>
          <p className="text-muted-foreground">
            Track battery performance, detect anomalies, and predict maintenance needs
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
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
          
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vehicle Overview</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="fleet-overview">Fleet Overview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          {!selectedVehicle ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
              <Battery className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium">Select a Vehicle</h3>
              <p className="text-sm text-slate-500 mt-2 mb-4">Choose a vehicle to view its battery health data</p>
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
          ) : isLoading ? (
            <div className="flex items-center justify-center p-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : batteryHealth ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">State of Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className={`font-bold text-2xl ${getHealthStatusColor(batteryHealth.state_of_health)}`}>
                        {batteryHealth.state_of_health}%
                      </div>
                      <Battery className={`h-8 w-8 ${getHealthStatusColor(batteryHealth.state_of_health)}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {batteryHealth.state_of_health > 90 ? 'Excellent' : 
                       batteryHealth.state_of_health > 80 ? 'Good' : 
                       batteryHealth.state_of_health > 70 ? 'Fair' : 'Poor'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Battery Capacity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-2xl">
                        {batteryHealth.estimated_capacity} kWh
                      </div>
                      <Zap className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {batteryHealth.nominal_capacity} kWh nominal capacity
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Charge Cycles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-2xl">
                        {batteryHealth.cycle_count}
                      </div>
                      <BarChart className="h-8 w-8 text-purple-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {batteryHealth.predicted_degradation_rate.toFixed(2)}% degradation per month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Replacement Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-2xl">
                        {formatDate(batteryHealth.estimated_replacement_date)}
                      </div>
                      <Calendar className="h-8 w-8 text-orange-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Prediction confidence: {(batteryHealth.confidence * 100).toFixed(0)}%
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Battery Health Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <BatteryHealthChart vehicleId={selectedVehicle} />
                  </CardContent>
                </Card>
                
                {maintenanceSchedule && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Maintenance Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MaintenanceScheduleCard schedule={maintenanceSchedule} />
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {batteryHealth.anomalies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detected Anomalies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {batteryHealth.anomalies.map((anomaly, index) => (
                        <Alert key={index} variant={anomaly.severity === 'high' ? 'destructive' : 'default'}>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle className={getSeverityColor(anomaly.severity)}>
                            {anomaly.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </AlertTitle>
                          <AlertDescription>
                            <p>{anomaly.description}</p>
                            <p className="font-medium mt-1">Recommended action: {anomaly.recommended_action}</p>
                            <p className="text-xs mt-1">Detected: {formatDate(anomaly.date)}</p>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-12">
              <p>Failed to load battery health data</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="anomalies" className="space-y-4 pt-4">
          {selectedVehicle && batteryHealth ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  {batteryHealth.anomalies.length > 0 ? (
                    <div className="space-y-4">
                      {batteryHealth.anomalies.map((anomaly, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 p-2 rounded-full ${anomaly.severity === 'high' ? 'bg-red-100' : anomaly.severity === 'medium' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                              <AlertTriangle className={`h-5 w-5 ${getSeverityColor(anomaly.severity)}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-medium ${getSeverityColor(anomaly.severity)}`}>
                                {anomaly.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                <span className="text-xs ml-2 text-slate-500">
                                  {formatDate(anomaly.date)}
                                </span>
                              </h3>
                              <p className="text-sm mt-1">{anomaly.description}</p>
                              <div className="mt-3 bg-slate-50 p-3 rounded border">
                                <p className="text-sm font-medium flex items-center gap-2">
                                  <Wrench className="h-4 w-4" />
                                  Recommended Action
                                </p>
                                <p className="text-sm mt-1">{anomaly.recommended_action}</p>
                              </div>
                              <div className="mt-3 flex justify-end">
                                <Button variant="outline" size="sm">Schedule Service</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No Anomalies Detected</h3>
                      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                        No battery anomalies have been detected for this vehicle. The system continuously monitors battery performance for any issues.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Battery Telemetry</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <p className="text-slate-500">Battery telemetry visualization would go here</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
              <AlertTriangle className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium">Select a Vehicle</h3>
              <p className="text-sm text-slate-500 mt-2 mb-4">Choose a vehicle to view anomaly detection data</p>
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
        </TabsContent>
        
        <TabsContent value="fleet-overview" className="space-y-4 pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : fleetHealth ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Fleet Average SoH</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className={`font-bold text-2xl ${getHealthStatusColor(fleetHealth.fleet_avg_soh)}`}>
                        {fleetHealth.fleet_avg_soh}%
                      </div>
                      <Battery className={`h-8 w-8 ${getHealthStatusColor(fleetHealth.fleet_avg_soh)}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {fleetHealth.vehicles_analyzed} vehicles analyzed
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-2xl">
                        {fleetHealth.critical_issues_count}
                      </div>
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {fleetHealth.anomalies_detected} total anomalies detected
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Maintenance Required</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-2xl">
                        {fleetHealth.maintenance_required_count}
                      </div>
                      <Wrench className="h-8 w-8 text-orange-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {fleetHealth.vehicles_by_priority.high.length} high priority
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Replacement Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-2xl">
                        ${fleetHealth.total_predicted_replacement_cost.toLocaleString()}
                      </div>
                      <Calendar className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Predicted battery replacement costs
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Fleet Health Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="w-full max-w-xl">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium">Excellent</span>
                        <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-green-500 absolute top-0 left-0"
                            style={{ width: `${(fleetHealth.health_distribution.excellent / fleetHealth.vehicles_analyzed) * 100}%` }}
                          ></div>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {fleetHealth.health_distribution.excellent} vehicles
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium">Good</span>
                        <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-blue-500 absolute top-0 left-0"
                            style={{ width: `${(fleetHealth.health_distribution.good / fleetHealth.vehicles_analyzed) * 100}%` }}
                          ></div>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {fleetHealth.health_distribution.good} vehicles
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium">Fair</span>
                        <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-yellow-500 absolute top-0 left-0"
                            style={{ width: `${(fleetHealth.health_distribution.fair / fleetHealth.vehicles_analyzed) * 100}%` }}
                          ></div>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {fleetHealth.health_distribution.fair} vehicles
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="w-24 text-sm font-medium">Poor</span>
                        <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-red-500 absolute top-0 left-0"
                            style={{ width: `${(fleetHealth.health_distribution.poor / fleetHealth.vehicles_analyzed) * 100}%` }}
                          ></div>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {fleetHealth.health_distribution.poor} vehicles
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>High Priority Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  {fleetHealth.vehicles_by_priority.high.length > 0 ? (
                    <div className="space-y-3">
                      {fleetHealth.vehicles_by_priority.high.map((vehicleId: string) => {
                        const vehicle = vehicles.find(v => v.id === vehicleId);
                        return (
                          <Button 
                            key={vehicleId} 
                            variant="outline" 
                            className="w-full justify-start text-left h-auto py-3 px-4"
                            onClick={() => {
                              setSelectedVehicle(vehicleId);
                              setActiveTab('overview');
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                              <div>
                                <p className="font-medium">{vehicle?.name || vehicleId}</p>
                                <p className="text-xs text-muted-foreground mt-1">High priority maintenance required</p>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No high priority maintenance needed</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center p-12">
              <p>Failed to load fleet health data</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BatteryHealthDashboard; 