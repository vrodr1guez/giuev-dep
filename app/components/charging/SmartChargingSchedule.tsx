/// <reference path="../../types/react.d.ts" />
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar, Clock, Battery, Zap, Car, ChevronDown, Filter, Check, X, Edit, Plus } from 'lucide-react';

interface ChargingSchedule {
  id: number;
  vehicleId: number;
  vehicleName: string;
  licensePlate: string;
  chargingStationId: number;
  chargingStationName: string;
  connectorId: number;
  connectorType: string;
  startTime: string;
  endTime: string;
  targetSoCPercent: number;
  initialSoCPercent: number;
  currentSoCPercent?: number;
  maxChargingPowerKw: number;
  priority: 1 | 2 | 3; // 1 = high, 2 = medium, 3 = low
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  isOptimized: boolean;
  energySavedKwh?: number;
  costSaved?: number;
}

const SmartChargingSchedule: React.FC = () => {
  const [activeDay, setActiveDay] = useState('today' as string);
  const [vehicleFilter, setVehicleFilter] = useState('all' as string);
  const [statusFilter, setStatusFilter] = useState('all' as string);
  
  // Mock data - in a real app, this would come from an API
  const schedules: ChargingSchedule[] = [
    {
      id: 1,
      vehicleId: 1,
      vehicleName: 'Tesla Model Y',
      licensePlate: 'ABC123',
      chargingStationId: 1,
      chargingStationName: 'Main Depot Fast Charging Hub',
      connectorId: 1,
      connectorType: 'CCS2',
      startTime: '2024-05-15T18:00:00Z',
      endTime: '2024-05-15T22:00:00Z',
      targetSoCPercent: 90,
      initialSoCPercent: 35,
      currentSoCPercent: 35,
      maxChargingPowerKw: 50,
      priority: 2,
      status: 'scheduled',
      isOptimized: true,
      energySavedKwh: 4.5,
      costSaved: 1.35,
    },
    {
      id: 2,
      vehicleId: 2,
      vehicleName: 'Tesla Model 3',
      licensePlate: 'XYZ789',
      chargingStationId: 1,
      chargingStationName: 'Main Depot Fast Charging Hub',
      connectorId: 2,
      connectorType: 'CCS2',
      startTime: '2024-05-15T14:30:00Z',
      endTime: '2024-05-15T17:30:00Z',
      targetSoCPercent: 80,
      initialSoCPercent: 22,
      currentSoCPercent: 42,
      maxChargingPowerKw: 50,
      priority: 1,
      status: 'in_progress',
      isOptimized: true,
      energySavedKwh: 3.2,
      costSaved: 0.96,
    },
    {
      id: 3,
      vehicleId: 3,
      vehicleName: 'Ford F-150 Lightning',
      licensePlate: 'DEF456',
      chargingStationId: 1,
      chargingStationName: 'Main Depot Fast Charging Hub',
      connectorId: 3,
      connectorType: 'CHAdeMO',
      startTime: '2024-05-15T08:00:00Z',
      endTime: '2024-05-15T10:00:00Z',
      targetSoCPercent: 85,
      initialSoCPercent: 15,
      currentSoCPercent: 85,
      maxChargingPowerKw: 75,
      priority: 1,
      status: 'completed',
      isOptimized: false,
      energySavedKwh: 0,
      costSaved: 0,
    },
    {
      id: 4,
      vehicleId: 4,
      vehicleName: 'Chevrolet Bolt',
      licensePlate: 'GHI789',
      chargingStationId: 5,
      chargingStationName: 'South Mall Charging',
      connectorId: 1,
      connectorType: 'Type2',
      startTime: '2024-05-16T09:00:00Z',
      endTime: '2024-05-16T12:00:00Z',
      targetSoCPercent: 90,
      initialSoCPercent: 30,
      currentSoCPercent: 30,
      maxChargingPowerKw: 22,
      priority: 3,
      status: 'scheduled',
      isOptimized: true,
      energySavedKwh: 2.8,
      costSaved: 0.84,
    },
    {
      id: 5,
      vehicleId: 5,
      vehicleName: 'Rivian R1T',
      licensePlate: 'JKL012',
      chargingStationId: 2,
      chargingStationName: 'Downtown Public Station',
      connectorId: 1,
      connectorType: 'CCS2',
      startTime: '2024-05-15T12:30:00Z',
      endTime: '2024-05-15T13:45:00Z',
      targetSoCPercent: 70,
      initialSoCPercent: 10,
      currentSoCPercent: 70,
      maxChargingPowerKw: 150,
      priority: 2,
      status: 'completed',
      isOptimized: true,
      energySavedKwh: 5.2,
      costSaved: 1.56,
    },
  ];

  // Helper to check if a schedule is for today
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Helper to check if a schedule is for tomorrow
  const isTomorrow = (dateString: string) => {
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() &&
           date.getMonth() === tomorrow.getMonth() &&
           date.getFullYear() === tomorrow.getFullYear();
  };

  // Filter schedules based on active filters
  const filteredSchedules = schedules.filter(schedule => {
    // Day filter
    const matchesDay = 
      (activeDay === 'today' && isToday(schedule.startTime)) ||
      (activeDay === 'tomorrow' && isTomorrow(schedule.startTime)) ||
      activeDay === 'all';
    
    // Vehicle filter
    const matchesVehicle = vehicleFilter === 'all' || 
      schedule.vehicleId.toString() === vehicleFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      schedule.status === statusFilter;
    
    return matchesDay && matchesVehicle && matchesStatus;
  });

  // Get unique vehicles for the filter
  const vehicles = Array.from(
    new Set(schedules.map(schedule => ({
      id: schedule.vehicleId,
      name: `${schedule.vehicleName} (${schedule.licensePlate})`
    })))
  );

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Smart Charging Schedule</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add Charging Schedule</span>
        </button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Charging Schedule</CardTitle>
            
            <div className="flex flex-wrap gap-2">
              {/* Day filter */}
              <div className="flex border rounded-md overflow-hidden">
                <button 
                  className={`px-3 py-1 text-sm ${activeDay === 'today' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setActiveDay('today')}
                >
                  Today
                </button>
                <button 
                  className={`px-3 py-1 text-sm ${activeDay === 'tomorrow' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setActiveDay('tomorrow')}
                >
                  Tomorrow
                </button>
                <button 
                  className={`px-3 py-1 text-sm ${activeDay === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setActiveDay('all')}
                >
                  All
                </button>
              </div>

              {/* Vehicle filter */}
              <div className="flex items-center">
                <div className="relative">
                  <div className="flex items-center gap-2 border rounded-md px-3 py-1 cursor-pointer">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Vehicle</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                  <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={vehicleFilter}
                    onChange={(e) => setVehicleFilter(e.target.value)}
                  >
                    <option value="all">All Vehicles</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status filter */}
              <div className="flex items-center">
                <div className="relative">
                  <div className="flex items-center gap-2 border rounded-md px-3 py-1 cursor-pointer">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Status</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </div>
                  <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No charging schedules match your criteria
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchedules.map(schedule => (
                <Card key={schedule.id} className="overflow-hidden">
                  <div className={`h-1 ${schedule.isOptimized ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{schedule.vehicleName}</h3>
                          <span className="text-xs text-gray-500">{schedule.licensePlate}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(schedule.status)}`}>
                            {schedule.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityBadge(schedule.priority)}`}>
                            {schedule.priority === 1 ? 'High' : schedule.priority === 2 ? 'Medium' : 'Low'} Priority
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div className="text-sm">
                              <div>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(schedule.startTime).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-gray-400" />
                            <div className="text-sm">
                              <div>{schedule.maxChargingPowerKw} kW</div>
                              <div className="text-xs text-gray-500">Max Power</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Battery className="h-4 w-4 text-gray-400" />
                            <div className="text-sm">
                              <div>
                                {schedule.currentSoCPercent !== undefined 
                                  ? `${schedule.currentSoCPercent}% → ${schedule.targetSoCPercent}%` 
                                  : `${schedule.initialSoCPercent}% → ${schedule.targetSoCPercent}%`}
                              </div>
                              <div className="text-xs text-gray-500">Charge Level</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div className="text-sm">
                              <div>{schedule.chargingStationName}</div>
                              <div className="text-xs text-gray-500">
                                Connector #{schedule.connectorId} ({schedule.connectorType})
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {schedule.isOptimized && (
                          <div className="mt-3 flex items-center text-xs text-green-600">
                            <Check className="h-3 w-3 mr-1" />
                            <span>
                              Smart charging optimized (Saved: {schedule.energySavedKwh} kWh / ${schedule.costSaved?.toFixed(2)})
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {schedule.status === 'scheduled' && (
                          <>
                            <button className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Charging Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Scheduled</p>
                <p className="text-2xl font-bold">
                  {schedules.filter(s => s.status === 'scheduled').length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Energy Saved</p>
                <p className="text-2xl font-bold">
                  {schedules.reduce((sum, s) => sum + (s.energySavedKwh || 0), 0).toFixed(1)} kWh
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Cost Saved</p>
                <p className="text-2xl font-bold">
                  ${schedules.reduce((sum, s) => sum + (s.costSaved || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <div className="h-6 w-6 text-green-500 flex items-center justify-center font-bold">$</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartChargingSchedule; 