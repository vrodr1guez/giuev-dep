/// <reference path="../../types/react.d.ts" />
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  BatteryCharging, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Power
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GridStatus {
  timestamp: string;
  grid_status: {
    demand_percentage: number;
    capacity_available: number;
    grid_stress_level: string;
    current_price_kwh: number;
    price_tier: string;
  };
  v2g_opportunity: {
    level: string;
    estimated_return_per_kwh: number;
    recommended_action: string;
  };
}

interface PriceForecast {
  generated_at: string;
  forecast: {
    timestamp: string;
    price_kwh: number;
    price_tier: string;
  }[];
}

const GridStatusMonitor: React.FC = () => {
  const [gridStatus, setGridStatus] = useState(null as GridStatus | null);
  const [priceForecast, setPriceForecast] = useState(null as PriceForecast | null);
  const [loading, setLoading] = useState(true as boolean);
  const [error, setError] = useState(null as string | null);

  const fetchGridStatus = async () => {
    try {
      // Mock data for demonstration
      const mockGridStatus: GridStatus = {
        timestamp: new Date().toISOString(),
        grid_status: {
          demand_percentage: 75,
          capacity_available: 85,
          grid_stress_level: 'medium',
          current_price_kwh: 0.12,
          price_tier: 'mid-peak'
        },
        v2g_opportunity: {
          level: 'high',
          estimated_return_per_kwh: 0.08,
          recommended_action: 'discharge'
        }
      };
      setGridStatus(mockGridStatus);
      setError(null);
    } catch (err) {
      console.error('Error fetching grid status:', err);
      setError('Failed to load grid status. Please try again later.');
    }
  };

  const fetchPriceForecast = async () => {
    try {
      // Mock data for demonstration
      const mockForecast: PriceForecast = {
        generated_at: new Date().toISOString(),
        forecast: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
          price_kwh: 0.08 + Math.random() * 0.08,
          price_tier: i >= 17 && i <= 21 ? 'peak' : i >= 9 && i <= 16 ? 'mid-peak' : 'off-peak'
        }))
      };
      setPriceForecast(mockForecast);
      setError(null);
    } catch (err) {
      console.error('Error fetching price forecast:', err);
      setError('Failed to load price forecast. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchGridStatus(), fetchPriceForecast()]);
      setLoading(false);
    };

    fetchData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Transform forecast data for chart
  const chartData = priceForecast?.forecast.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    price: item.price_kwh,
    tier: item.price_tier
  })) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grid Status Monitor</h1>
        <p className="text-gray-600 mt-2">Real-time grid information and V2G opportunities</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Grid Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Grid Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Grid Demand</span>
                <span className="text-sm">{gridStatus?.grid_status.demand_percentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={gridStatus?.grid_status.demand_percentage || 0}
                className="h-3"
              />
            </div>
            
            <div className="flex gap-4">
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                gridStatus?.grid_status.grid_stress_level === 'high' ? 'bg-red-100 text-red-800' :
                gridStatus?.grid_status.grid_stress_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                Grid Stress: {gridStatus?.grid_status.grid_stress_level}
              </div>
              
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                gridStatus?.grid_status.price_tier === 'peak' ? 'bg-red-100 text-red-800' :
                gridStatus?.grid_status.price_tier === 'mid-peak' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                ${gridStatus?.grid_status.current_price_kwh.toFixed(4)}/kWh
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">V2G Opportunity</h3>
              
              <div className="flex justify-between items-center mb-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  gridStatus?.v2g_opportunity.level === 'high' ? 'bg-green-100 text-green-800' :
                  gridStatus?.v2g_opportunity.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Level: {gridStatus?.v2g_opportunity.level}
                </div>
                
                <span className="text-sm font-medium">
                  Return: ${gridStatus?.v2g_opportunity.estimated_return_per_kwh.toFixed(4)}/kWh
                </span>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium">Recommended Action: </span>
                <span className={`font-bold uppercase ${
                  gridStatus?.v2g_opportunity.recommended_action === 'discharge' ? 'text-red-600' :
                  gridStatus?.v2g_opportunity.recommended_action === 'standby' ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {gridStatus?.v2g_opportunity.recommended_action}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Price Forecast Card */}
        <Card>
          <CardHeader>
            <CardTitle>24-Hour Price Forecast</CardTitle>
            <p className="text-sm text-gray-600">
              Updated: {priceForecast ? new Date(priceForecast.generated_at).toLocaleString() : 'Loading...'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval={2}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toFixed(3)}`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toFixed(4)}/kWh`, 'Price']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Bar 
                    dataKey="price" 
                    fill="#3b82f6" 
                    name="Price per kWh"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
                <span>Off-Peak</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
                <span>Mid-Peak</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
                <span>Peak</span>
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Energy Price Strategy:</strong> During peak hours (shown in red), consider discharging EV batteries back to the grid through V2G. During off-peak hours (green), prioritize charging for maximum cost efficiency.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GridStatusMonitor; 