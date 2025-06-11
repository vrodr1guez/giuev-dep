'use client';

import { useState, useEffect } from 'react';

// Simple placeholder for VehicleTelemetryDashboard
const VehicleTelemetryDashboard = ({ vehicleId, token, initialData }: any) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center mb-4">
      <div className="h-6 w-6 bg-blue-600 rounded mr-2"></div>
      <h2 className="text-2xl font-bold">Vehicle Telemetry Dashboard</h2>
    </div>
    <p className="text-gray-600 mb-4">
      Real-time telemetry data for Vehicle {vehicleId}
    </p>
    <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
      <p className="text-gray-500">Real-time telemetry dashboard would appear here</p>
    </div>
  </div>
);

export default function RealtimeDashboardDemo() {
  const [token, setToken] = useState('demo-token-123');
  const [vehicleId, setVehicleId] = useState('1');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState('');
  
  const startSimulation = async () => {
    try {
      setSimulationStatus('Starting simulation...');
      
      // In a real app, this would call the API to start the simulation
      // For demo purposes, we're not making the actual API call
      
      // Simulate success after a short delay
      setTimeout(() => {
        setIsSimulating(true);
        setSimulationStatus('Simulation running');
      }, 1000);
      
    } catch (error) {
      console.error('Error starting simulation:', error);
      setSimulationStatus('Error starting simulation');
    }
  };
  
  const stopSimulation = () => {
    setIsSimulating(false);
    setSimulationStatus('Simulation stopped');
  };
  
  // Mock initial data
  const initialData = {
    vehicle_id: vehicleId,
    state_of_charge_percent: 78.5,
    state_of_health_percent: 97.2,
    estimated_range_km: 312.4,
    latitude: 40.7128,
    longitude: -74.0060,
    speed_kmh: 0,
    is_charging: true,
    charging_power_kw: 11.2,
    odometer_km: 15478.2,
    battery_temperature_c: 24.5,
    outside_temperature_c: 21.2,
    energy_consumption_kwh_per_100km: 16.7,
    regenerated_energy_kwh: 2.3,
    power_output_kw: 0,
    timestamp: new Date().toISOString()
  };
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Real-Time EV Fleet Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Live demonstration of real-time vehicle telemetry data visualization
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-2">Simulation Control</h3>
            <p className="text-gray-600 mt-2">
              {isSimulating 
                ? "Simulation is running. WebSocket connection active." 
                : "Start the simulation to see real-time data updates."}
            </p>
            <div className="mt-4">
              {!isSimulating ? (
                <button 
                  onClick={startSimulation} 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Start Simulation
                </button>
              ) : (
                <button 
                  onClick={stopSimulation} 
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Stop Simulation
                </button>
              )}
            </div>
            {simulationStatus && (
              <p className="mt-2 text-sm text-gray-600">{simulationStatus}</p>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-2">Connection Details</h3>
            <div className="mt-2 space-y-2">
              <div>
                <p className="text-sm font-medium">Vehicle ID:</p>
                <p className="text-gray-600">{vehicleId}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Auth Token:</p>
                <p className="font-mono text-xs truncate text-gray-600">{token}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-2">About This Demo</h3>
            <p className="mt-2 text-gray-600">
              This demonstration shows how the dashboard processes and visualizes real-time telemetry 
              data from electric vehicles using WebSocket connections. Data is simulated on the server 
              and streamed to the client.
            </p>
          </div>
        </div>
      </div>
      
      {/* Only show the dashboard when simulation is running */}
      {isSimulating && (
        <VehicleTelemetryDashboard
          vehicleId={vehicleId}
          token={token}
          initialData={initialData}
        />
      )}
    </div>
  );
} 