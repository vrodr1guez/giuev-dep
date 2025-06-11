/// <reference path="../../types/react.d.ts" />
import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Battery, Zap, ThermometerSun, AlertTriangle } from 'lucide-react';

interface TelemetryDataPoint {
  timestamp: string;
  voltage?: number;
  current?: number;
  state_of_charge?: number;
  state_of_health?: number;
  temperature_min?: number;
  temperature_max?: number;
  temperature_avg?: number;
  [key: string]: any;
}

interface EnhancedBatteryHealthChartProps {
  vehicleId: string;
  useEnhancedPrediction?: boolean;
}

const EnhancedBatteryHealthChart: React.FC<EnhancedBatteryHealthChartProps> = ({
  vehicleId,
  useEnhancedPrediction = false
}) => {
  const [telemetryData, setTelemetryData] = useState([] as TelemetryDataPoint[]);
  const [anomalies, setAnomalies] = useState([] as any[]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMetric, setActiveMetric] = useState('state_of_health' as string);
  const [timeRange, setTimeRange] = useState(30 as number);
  const [activeTab, setActiveTab] = useState('telemetry' as string);
  const [batteryChemistryInfo, setBatteryChemistryInfo] = useState(null as any);
  const [selectedChemistry, setSelectedChemistry] = useState('' as string);

  // Fetch telemetry data
  useEffect(() => {
    const fetchTelemetryData = async () => {
      if (!vehicleId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/battery-health/telemetry/${vehicleId}?days=${timeRange}`);
        if (response.ok) {
          const data = await response.json();
          setTelemetryData(formatTelemetryData(data));
        } else {
          console.error('Failed to fetch telemetry data');
        }
      } catch (error) {
        console.error('Error fetching telemetry data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTelemetryData();
  }, [vehicleId, timeRange]);

  // Fetch anomalies
  useEffect(() => {
    const fetchAnomalies = async () => {
      if (!vehicleId) return;
      
      try {
        const response = await fetch(`/api/v1/battery-health/anomalies/${vehicleId}?days=${timeRange}`);
        if (response.ok) {
          const data = await response.json();
          setAnomalies(data);
        } else {
          console.error('Failed to fetch anomalies');
        }
      } catch (error) {
        console.error('Error fetching anomalies:', error);
      }
    };
    
    fetchAnomalies();
  }, [vehicleId, timeRange]);

  // Fetch battery chemistry info
  useEffect(() => {
    const fetchChemistryInfo = async () => {
      try {
        const response = await fetch('/api/v1/battery-health/chemistry-info');
        if (response.ok) {
          const data = await response.json();
          setBatteryChemistryInfo(data);
          // Set default selected chemistry
          if (Object.keys(data).length > 0 && !selectedChemistry) {
            setSelectedChemistry(Object.keys(data)[0]);
          }
        } else {
          console.error('Failed to fetch battery chemistry info');
        }
      } catch (error) {
        console.error('Error fetching battery chemistry info:', error);
      }
    };
    
    fetchChemistryInfo();
  }, []);

  // Format telemetry data for charts
  const formatTelemetryData = (data: any[]): TelemetryDataPoint[] => {
    return data.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp).toLocaleString(),
      formattedDate: new Date(item.timestamp).toLocaleDateString(),
    }));
  };

  // Get metric name for display
  const getMetricDisplayName = (metricKey: string): string => {
    const metricNames: { [key: string]: string } = {
      'state_of_health': 'State of Health (%)',
      'state_of_charge': 'State of Charge (%)',
      'voltage': 'Voltage (V)',
      'current': 'Current (A)',
      'temperature_avg': 'Avg. Temperature (°C)',
      'temperature_min': 'Min. Temperature (°C)',
      'temperature_max': 'Max. Temperature (°C)'
    };
    
    return metricNames[metricKey] || metricKey;
  };

  // Get metric color
  const getMetricColor = (metricKey: string): string => {
    const metricColors: { [key: string]: string } = {
      'state_of_health': '#2563eb',
      'state_of_charge': '#10b981',
      'voltage': '#f59e0b',
      'current': '#6366f1',
      'temperature_avg': '#ef4444',
      'temperature_min': '#0891b2',
      'temperature_max': '#dc2626'
    };
    
    return metricColors[metricKey] || '#888888';
  };

  // Get anomaly severity color
  const getAnomalySeverityColor = (severity: string): string => {
    const severityColors: { [key: string]: string } = {
      'high': '#ef4444',
      'medium': '#f97316',
      'low': '#3b82f6'
    };
    
    return severityColors[severity.toLowerCase()] || '#888888';
  };

  // Render telemetry chart
  const renderTelemetryChart = () => {
    if (telemetryData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] bg-slate-50 rounded-lg">
          <p className="text-slate-500">No telemetry data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-1">
            <Button 
              variant={timeRange === 7 ? "default" : "outline"}
              onClick={() => setTimeRange(7)}
              size="sm"
            >
              7 Days
            </Button>
            <Button 
              variant={timeRange === 30 ? "default" : "outline"}
              onClick={() => setTimeRange(30)}
              size="sm"
            >
              30 Days
            </Button>
            <Button 
              variant={timeRange === 90 ? "default" : "outline"}
              onClick={() => setTimeRange(90)}
              size="sm"
            >
              90 Days
            </Button>
          </div>
          
          <Select value={activeMetric} onValueChange={setActiveMetric}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="state_of_health">State of Health</SelectItem>
              <SelectItem value="state_of_charge">State of Charge</SelectItem>
              <SelectItem value="voltage">Voltage</SelectItem>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="temperature_avg">Avg Temperature</SelectItem>
              <SelectItem value="temperature_min">Min Temperature</SelectItem>
              <SelectItem value="temperature_max">Max Temperature</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={telemetryData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis 
                domain={['auto', 'auto']}
                label={{ 
                  value: getMetricDisplayName(activeMetric), 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip />
              <Legend />
              
              <Line
                type="monotone"
                dataKey={activeMetric}
                stroke={getMetricColor(activeMetric)}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 8 }}
              />
              
              {/* Plot anomalies as reference lines if they exist */}
              {anomalies.length > 0 && anomalies.map((anomaly, index) => {
                // Find telemetry point closest to anomaly date
                const anomalyDate = new Date(anomaly.date);
                const closestPoint = telemetryData.reduce((closest, point) => {
                  const pointDate = new Date(point.timestamp);
                  const currentClosestDate = new Date(closest.timestamp);
                  return Math.abs(pointDate.getTime() - anomalyDate.getTime()) < 
                         Math.abs(currentClosestDate.getTime() - anomalyDate.getTime()) 
                           ? point : closest;
                }, telemetryData[0]);
                
                return (
                  <ReferenceLine
                    key={index}
                    x={closestPoint.timestamp}
                    stroke={getAnomalySeverityColor(anomaly.severity)}
                    strokeDasharray="3 3"
                    label={anomaly.type}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render anomalies chart
  const renderAnomalyChart = () => {
    if (anomalies.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] bg-slate-50 rounded-lg">
          <p className="text-slate-500">No anomalies detected</p>
        </div>
      );
    }

    // Group anomalies by type
    const anomalyTypes = Array.from(new Set(anomalies.map(a => a.type)));
    const anomaliesByType = anomalyTypes.map(type => {
      const typeAnomalies = anomalies.filter(a => a.type === type);
      
      return {
        name: (type as string).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: typeAnomalies.length,
        high: typeAnomalies.filter(a => a.severity === 'high').length,
        medium: typeAnomalies.filter(a => a.severity === 'medium').length,
        low: typeAnomalies.filter(a => a.severity === 'low').length,
      };
    });

    return (
      <div className="space-y-4">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={anomaliesByType}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="high" stroke="#ef4444" name="High Severity" />
              <Line type="monotone" dataKey="medium" stroke="#f97316" name="Medium Severity" />
              <Line type="monotone" dataKey="low" stroke="#3b82f6" name="Low Severity" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render chemistry comparison
  const renderChemistryComparison = () => {
    if (!batteryChemistryInfo) {
      return (
        <div className="flex items-center justify-center h-[300px] bg-slate-50 rounded-lg">
          <p className="text-slate-500">Loading chemistry information...</p>
        </div>
      );
    }

    // Create comparison data
    const chemistryData = Object.entries(batteryChemistryInfo).map(([key, info]: [string, any]) => ({
      name: key,
      cycleLife: info.cycle_life,
      degradationRate: info.typical_degradation_rate * 100, // Convert to percentage
    }));

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Select value={selectedChemistry} onValueChange={setSelectedChemistry}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chemistry" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(batteryChemistryInfo).map(chemistry => (
                <SelectItem key={chemistry} value={chemistry}>
                  {chemistry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedChemistry && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{selectedChemistry} Chemistry Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Cycle Life</dt>
                    <dd className="text-2xl font-bold">
                      {batteryChemistryInfo[selectedChemistry].cycle_life.toLocaleString()} cycles
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Typical Degradation Rate</dt>
                    <dd className="text-2xl font-bold">
                      {(batteryChemistryInfo[selectedChemistry].typical_degradation_rate * 100).toFixed(2)}% per month
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Chemistry Comparison</CardTitle>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chemistryData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'Cycle Life', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Degradation (%/month)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="cycleLife" stroke="#2563eb" name="Cycle Life" />
                    <Line yAxisId="right" type="monotone" dataKey="degradationRate" stroke="#ef4444" name="Degradation Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="telemetry">Telemetry Data</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Analysis</TabsTrigger>
          <TabsTrigger value="chemistry">Battery Chemistry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="telemetry">
          {renderTelemetryChart()}
        </TabsContent>
        
        <TabsContent value="anomalies">
          {renderAnomalyChart()}
        </TabsContent>
        
        <TabsContent value="chemistry">
          {renderChemistryComparison()}
        </TabsContent>
      </Tabs>
      
      {/* Anomaly Display */}
      {activeTab === 'telemetry' && anomalies.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="font-medium flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Anomalies Detected</span>
          </h3>
          <div className="space-y-2">
            {anomalies.slice(0, 2).map((anomaly, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-lg border-l-4 ${
                  anomaly.severity === 'high' ? 'border-red-500 bg-red-50' :
                  anomaly.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <p className="text-sm font-medium">{anomaly.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(anomaly.date).toLocaleDateString()}
                </p>
              </div>
            ))}
            {anomalies.length > 2 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => setActiveTab('anomalies')}
              >
                View all {anomalies.length} anomalies
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedBatteryHealthChart; 