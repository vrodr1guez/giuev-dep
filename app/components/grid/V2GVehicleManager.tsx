/// <reference path="../../types/react.d.ts" />
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  BatteryCharging, 
  Zap, 
  Car,
  Power,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  battery_type: string;
  battery_chemistry: string;
  nominal_battery_capacity: number;
  v2g_capable: boolean;
  v2g_enabled: boolean;
  min_soc_limit: number;
}

interface V2GPotential {
  vehicle_id: string;
  timestamp: string;
  v2g_potential: {
    available_energy_kwh: number;
    available_percentage: number;
    earnings_potential: number;
    carbon_offset_kg: number;
  };
  grid_contribution: {
    grid_stress_level: string;
    priority_score: number;
    recommended_action: string;
  };
  battery_impact: {
    chemistry: string;
    health_impact_level: string;
    estimated_health_impact_pct: number;
  };
  price_data: {
    current_price_kwh: number;
    compensation_rate_kwh: number;
  };
}

interface V2GTransaction {
  transaction_id: string;
  vehicle_id: string;
  timestamp_start: string;
  timestamp_end?: string;
  energy_kwh?: number;
  compensation_amount?: number;
  carbon_offset_kg?: number;
  battery_soc_start?: number;
  battery_soc_end?: number;
  status: string;
  message?: string;
}

const V2GVehicleManager: React.FC = () => {
  const [vehicles, setVehicles] = useState([] as Vehicle[]);
  const [v2gPotentials, setV2gPotentials] = useState({} as {[key: string]: V2GPotential});
  const [activeTransactions, setActiveTransactions] = useState([] as V2GTransaction[]);
  const [loading, setLoading] = useState(true as boolean);
  const [error, setError] = useState(null as string | null);
  
  // For demo purposes
  const demoVehicles: Vehicle[] = [
    {
      id: 'v1',
      name: 'Tesla Model Y',
      battery_type: 'Lithium-ion',
      battery_chemistry: 'NMC',
      nominal_battery_capacity: 75.0,
      v2g_capable: true,
      v2g_enabled: true,
      min_soc_limit: 30,
    },
    {
      id: 'v2',
      name: 'Ford F-150 Lightning',
      battery_type: 'Lithium-ion',
      battery_chemistry: 'LFP',
      nominal_battery_capacity: 131.0,
      v2g_capable: true,
      v2g_enabled: false,
      min_soc_limit: 40,
    },
    {
      id: 'v3',
      name: 'Hyundai IONIQ 5',
      battery_type: 'Lithium-ion',
      battery_chemistry: 'NMC',
      nominal_battery_capacity: 65.0,
      v2g_capable: true,
      v2g_enabled: true,
      min_soc_limit: 35,
    },
    {
      id: 'v4',
      name: 'Rivian R1T',
      battery_type: 'Lithium-ion',
      battery_chemistry: 'NCA',
      nominal_battery_capacity: 135.0,
      v2g_capable: true,
      v2g_enabled: true,
      min_soc_limit: 30,
    },
    {
      id: 'v5',
      name: 'Nissan Leaf',
      battery_type: 'Lithium-ion',
      battery_chemistry: 'NMC',
      nominal_battery_capacity: 62.0,
      v2g_capable: false,
      v2g_enabled: false,
      min_soc_limit: 30,
    },
  ];

  const fetchVehicles = async () => {
    try {
      // For demo, use sample data
      setVehicles(demoVehicles);
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles. Please try again later.');
    }
  };

  const fetchV2GPotentials = async () => {
    try {
      const potentials: {[key: string]: V2GPotential} = {};
      
      // Mock V2G potential data
      for (const vehicle of vehicles) {
        if (vehicle.v2g_capable) {
          potentials[vehicle.id] = {
            vehicle_id: vehicle.id,
            timestamp: new Date().toISOString(),
            v2g_potential: {
              available_energy_kwh: Math.random() * 30 + 10,
              available_percentage: Math.random() * 40 + 30,
              earnings_potential: Math.random() * 15 + 5,
              carbon_offset_kg: Math.random() * 8 + 2
            },
            grid_contribution: {
              grid_stress_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
              priority_score: Math.random() * 100,
              recommended_action: ['discharge', 'standby', 'charge'][Math.floor(Math.random() * 3)]
            },
            battery_impact: {
              chemistry: vehicle.battery_chemistry,
              health_impact_level: ['minimal', 'low', 'medium'][Math.floor(Math.random() * 3)],
              estimated_health_impact_pct: Math.random() * 0.1
            },
            price_data: {
              current_price_kwh: 0.12 + Math.random() * 0.08,
              compensation_rate_kwh: 0.08 + Math.random() * 0.04
            }
          };
        }
      }
      
      setV2gPotentials(potentials);
    } catch (err) {
      console.error('Error fetching V2G potentials:', err);
      setError('Failed to load V2G potentials. Please try again later.');
    }
  };

  const fetchActiveTransactions = async () => {
    try {
      // For demo, use empty array (no active transactions initially)
      setActiveTransactions([]);
    } catch (err) {
      console.error('Error fetching active transactions:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchVehicles();
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (vehicles.length > 0) {
      fetchV2GPotentials();
      fetchActiveTransactions();
    }
  }, [vehicles]);

  const handleV2GToggle = (vehicleId: string, enabled: boolean) => {
    setVehicles(vehicles.map(v => 
      v.id === vehicleId ? { ...v, v2g_enabled: enabled } : v
    ));
  };

  const handleStartV2G = (vehicle: Vehicle) => {
    const newTransaction: V2GTransaction = {
      transaction_id: `v2g_tx_${Date.now()}`,
      vehicle_id: vehicle.id,
      timestamp_start: new Date().toISOString(),
      status: 'initiated',
      message: 'V2G transaction initiated successfully'
    };
    
    setActiveTransactions([...activeTransactions, newTransaction]);
  };

  const handleStopV2G = (transactionId: string) => {
    setActiveTransactions(activeTransactions.filter(t => t.transaction_id !== transactionId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">V2G Vehicle Management</h1>
        <p className="text-gray-600 mt-2">Manage vehicle-to-grid capabilities and monitor active grid contributions</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Active V2G Transactions */}
      {activeTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active V2G Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Vehicle</th>
                    <th className="text-left p-2">Started</th>
                    <th className="text-left p-2">Energy (kWh)</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTransactions.map((transaction) => {
                    const vehicle = vehicles.find(v => v.id === transaction.vehicle_id);
                    return (
                      <tr key={transaction.transaction_id} className="border-b">
                        <td className="p-2">{vehicle?.name || transaction.vehicle_id}</td>
                        <td className="p-2">{new Date(transaction.timestamp_start).toLocaleTimeString()}</td>
                        <td className="p-2">{transaction.energy_kwh || 'In progress'}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {transaction.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStopV2G(transaction.transaction_id)}
                          >
                            <Power className="h-4 w-4 mr-1" />
                            Stop
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* V2G Capable Vehicles */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Available Vehicles ({vehicles.filter(v => v.v2g_capable).length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const v2gPotential = v2gPotentials[vehicle.id];
            const isActive = activeTransactions.some(t => t.vehicle_id === vehicle.id);
            
            return (
              <Card key={vehicle.id} className={`${
                isActive ? 'border-l-4 border-l-blue-500' :
                !vehicle.v2g_capable ? 'border-l-4 border-l-gray-300' :
                !vehicle.v2g_enabled ? 'border-l-4 border-l-yellow-500' :
                'border-l-4 border-l-green-500'
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                    {vehicle.v2g_capable ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        V2G Capable
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Not V2G Capable
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Battery: {vehicle.nominal_battery_capacity} kWh • {vehicle.battery_chemistry}
                  </p>
                </CardHeader>
                
                <CardContent>
                  {vehicle.v2g_capable && v2gPotential && (
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Available Energy:</span>
                        <span className="text-sm font-semibold">
                          {v2gPotential.v2g_potential.available_energy_kwh.toFixed(1)} kWh
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm">Potential Earnings:</span>
                        <span className="text-sm font-semibold text-green-600">
                          ${v2gPotential.v2g_potential.earnings_potential.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm">Health Impact:</span>
                        <span className={`text-sm font-semibold ${
                          v2gPotential.battery_impact.health_impact_level === 'minimal' ? 'text-green-600' :
                          v2gPotential.battery_impact.health_impact_level === 'low' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          {v2gPotential.battery_impact.health_impact_level} ({v2gPotential.battery_impact.estimated_health_impact_pct.toFixed(3)}%)
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm">Priority Score:</span>
                        <span className={`text-sm font-semibold ${
                          v2gPotential.grid_contribution.priority_score > 80 ? 'text-red-600' :
                          v2gPotential.grid_contribution.priority_score > 50 ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {v2gPotential.grid_contribution.priority_score.toFixed(1)}/100
                        </span>
                      </div>
                      
                      <div className={`px-2 py-1 rounded text-xs text-center ${
                        v2gPotential.grid_contribution.recommended_action.includes('discharge') ? 'bg-red-100 text-red-800' :
                        v2gPotential.grid_contribution.recommended_action === 'standby' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        Recommended: {v2gPotential.grid_contribution.recommended_action.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    {vehicle.v2g_capable && (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={vehicle.v2g_enabled}
                          onChange={(e) => handleV2GToggle(vehicle.id, e.target.checked)}
                          disabled={isActive}
                          className="rounded"
                        />
                        <span className="text-sm">V2G Enabled</span>
                      </label>
                    )}
                    
                    {vehicle.v2g_capable && vehicle.v2g_enabled && !isActive && (
                      <Button
                        onClick={() => handleStartV2G(vehicle)}
                        className="flex items-center"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Start V2G
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default V2GVehicleManager; 