/// <reference path="../../types/react.d.ts" />
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface BatteryHealthChartProps {
  vehicleId: string;
}

// Mock data for the demo
const generateMockHealthData = (vehicleId: string) => {
  // Generate 12 months of historical data
  const data = [];
  const now = new Date();
  
  // Get a consistent starting point based on vehicle ID
  const seed = vehicleId.charCodeAt(1) % 10;
  let stateOfHealth = 95 + seed;
  let capacity = 75 - (seed * 0.5); // Different starting capacity by vehicle
  
  if (vehicleId === 'v2') capacity = 125;
  if (vehicleId === 'v3') capacity = 58;
  if (vehicleId === 'v4') capacity = 128;
  if (vehicleId === 'v5') capacity = 72;
  
  const nominalCapacity = capacity + (seed * 0.8);
  
  // Simulate battery degradation over 12 months
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    
    // Degradation is not perfectly linear - add some natural variation
    const degradation = (0.2 + (Math.random() * 0.1)) * (i < 6 ? 0.8 : 1.2);
    
    // Temperature affects degradation rate
    const month = monthDate.getMonth();
    const isSummer = month >= 5 && month <= 8;
    const isWinter = month <= 1 || month >= 10;
    
    // Adjust degradation rate by season
    let seasonalDegradation = degradation;
    if (isSummer) seasonalDegradation *= 1.3; // Higher degradation in summer
    if (isWinter) seasonalDegradation *= 0.7; // Lower degradation in winter
    
    stateOfHealth -= seasonalDegradation;
    capacity = (nominalCapacity * stateOfHealth) / 100;
    
    data.push({
      month: monthDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
      timestamp: monthDate.toISOString(),
      stateOfHealth: parseFloat(stateOfHealth.toFixed(1)),
      capacity: parseFloat(capacity.toFixed(1)),
      prediction: null,
      temperatureImpact: isSummer ? 'high' : isWinter ? 'low' : 'medium',
      cycleCount: 10 + Math.floor(Math.random() * 5) + (11 - i) * 12,
    });
  }
  
  // Add 6 months of predictions
  let predictedSoh = stateOfHealth;
  let predictedCapacity = capacity;
  
  for (let i = 1; i <= 6; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    
    // Predicted degradation rate (slightly different formula to show uncertainty)
    const degradation = 0.2 + (Math.random() * 0.15);
    
    // Seasonal adjustments to prediction
    const month = monthDate.getMonth();
    const isSummer = month >= 5 && month <= 8;
    const isWinter = month <= 1 || month >= 10;
    
    let seasonalDegradation = degradation;
    if (isSummer) seasonalDegradation *= 1.3;
    if (isWinter) seasonalDegradation *= 0.7;
    
    predictedSoh -= seasonalDegradation;
    predictedCapacity = (nominalCapacity * predictedSoh) / 100;
    
    data.push({
      month: monthDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
      timestamp: monthDate.toISOString(),
      prediction: parseFloat(predictedSoh.toFixed(1)),
      predictedCapacity: parseFloat(predictedCapacity.toFixed(1)),
      temperatureImpact: isSummer ? 'high' : isWinter ? 'low' : 'medium',
      cycleCount: null,
    });
  }
  
  return data;
};

export const BatteryHealthChart: React.FC<BatteryHealthChartProps> = ({ vehicleId }) => {
  const [data, setData] = useState([] as any[]);
  const [activeMetric, setActiveMetric] = useState('soh' as 'soh' | 'capacity');
  
  useEffect(() => {
    // In a real application, this would be an API call
    // For demo purposes, we'll use mock data
    const mockData = generateMockHealthData(vehicleId);
    setData(mockData);
  }, [vehicleId]);
  
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-slate-500">Loading chart data...</p>
      </div>
    );
  }
  
  // Find index where prediction starts
  const predictionStartIndex = data.findIndex(point => point.prediction !== null);
  
  return (
    <div className="h-full">
      <div className="flex justify-end mb-2">
        <div className="inline-flex rounded-md shadow-sm text-xs" role="group">
          <button
            type="button"
            className={`px-3 py-1 rounded-l-md font-medium ${
              activeMetric === 'soh' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveMetric('soh')}
          >
            State of Health (%)
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-r-md font-medium ${
              activeMetric === 'capacity' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveMetric('capacity')}
          >
            Capacity (kWh)
          </button>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis 
            domain={
              activeMetric === 'soh' 
                ? [Math.min(60, Math.floor(Math.min(...data.map(d => d.stateOfHealth || d.prediction || 100)) - 5)), 100] 
                : ['auto', 'auto']
            }
            label={
              activeMetric === 'soh' 
                ? { value: 'State of Health (%)', angle: -90, position: 'insideLeft' }
                : { value: 'Capacity (kWh)', angle: -90, position: 'insideLeft' }
            }
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'stateOfHealth') return [`${value}%`, 'State of Health'];
              if (name === 'prediction') return [`${value}%`, 'Predicted SoH'];
              if (name === 'capacity') return [`${value} kWh`, 'Capacity'];
              if (name === 'predictedCapacity') return [`${value} kWh`, 'Predicted Capacity'];
              return [value, name];
            }}
          />
          <Legend />
          
          {activeMetric === 'soh' ? (
            <>
              <Line 
                type="monotone" 
                dataKey="stateOfHealth" 
                stroke="#2563eb" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="prediction" 
                stroke="#2563eb" 
                strokeWidth={2}
                strokeDasharray="5 5" 
                dot={{ r: 4, strokeDasharray: '' }}
              />
              
              {/* Reference line for 70% health threshold */}
              <ReferenceLine 
                y={70} 
                stroke="#ef4444" 
                strokeDasharray="3 3"
                label={{ value: "70% Replacement Threshold", position: "top", fill: "#ef4444" }}
              />
            </>
          ) : (
            <>
              <Line 
                type="monotone" 
                dataKey="capacity" 
                stroke="#10b981" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="predictedCapacity" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5" 
                dot={{ r: 4, strokeDasharray: '' }}
              />
            </>
          )}
          
          {/* Vertical line separating history from prediction */}
          {predictionStartIndex > 0 && (
            <ReferenceLine
              x={data[predictionStartIndex - 1].month}
              stroke="#9ca3af"
              strokeDasharray="3 3"
              label={{ value: "Prediction →", position: "top", fill: "#6b7280" }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}; 