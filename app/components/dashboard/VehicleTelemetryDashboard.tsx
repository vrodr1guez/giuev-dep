/// <reference path="../../types/react.d.ts" />
import { useState, useEffect } from 'react';
import { Card, Title, Text, Flex, Badge, Grid, Col, LineChart, DonutChart, AreaChart } from '@tremor/react';
import { Battery, Zap, Gauge, Wind, ThermometerSun, Clock, MapPin, PlugZap } from 'lucide-react';
import { useVehicleTelemetry } from '../../hooks/useWebSocket';

interface VehicleTelemetryProps {
  vehicleId: string;
  token: string;
  initialData?: any;
}

export default function VehicleTelemetryDashboard({ vehicleId, token, initialData }: VehicleTelemetryProps) {
  const [telemetryData, setTelemetryData] = useState(initialData || {
    state_of_charge_percent: 0,
    state_of_health_percent: 0,
    estimated_range_km: 0,
    latitude: 0,
    longitude: 0,
    speed_kmh: 0,
    is_charging: false,
    charging_power_kw: 0,
    odometer_km: 0,
    battery_temperature_c: 0,
    outside_temperature_c: 0,
    energy_consumption_kwh_per_100km: 0,
    regenerated_energy_kwh: 0,
    timestamp: new Date().toISOString()
  });
  
  const [telemetryHistory, setTelemetryHistory] = useState([] as any[]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting' as string);
  
  // Subscribe to real-time telemetry updates
  const { status, lastTelemetry } = useVehicleTelemetry({
    token,
    vehicleId,
    onTelemetryUpdate: (data) => {
      // Update current telemetry
      setTelemetryData(data);
      
      // Add to history (limiting to last 20 entries)
      setTelemetryHistory((prev) => {
        const newHistory = [...prev, data];
        return newHistory.slice(-20);
      });
    }
  });
  
  // Update connection status
  useEffect(() => {
    setConnectionStatus(status);
  }, [status]);
  
  // Format timestamp
  const formattedTime = new Date(telemetryData.timestamp).toLocaleTimeString();
  
  // Prepare chart data
  const socHistory = telemetryHistory.map(record => ({
    time: new Date(record.timestamp).toLocaleTimeString(),
    'State of Charge': record.state_of_charge_percent || 0
  }));
  
  const rangeHistory = telemetryHistory.map(record => ({
    time: new Date(record.timestamp).toLocaleTimeString(),
    'Range (km)': record.estimated_range_km || 0
  }));
  
  const energyConsumptionHistory = telemetryHistory.map(record => ({
    time: new Date(record.timestamp).toLocaleTimeString(),
    'kWh/100km': record.energy_consumption_kwh_per_100km || 0
  }));
  
  // DonutChart data
  const batteryData = [
    {
      name: 'Remaining',
      value: telemetryData.state_of_charge_percent || 0
    },
    {
      name: 'Used',
      value: 100 - (telemetryData.state_of_charge_percent || 0)
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <Flex justifyContent="between" alignItems="center">
          <Title>Real-Time Vehicle Telemetry</Title>
          <Badge color={status === 'open' ? 'green' : status === 'connecting' ? 'yellow' : 'red'}>
            {status === 'open' ? 'Connected' : status === 'connecting' ? 'Connecting' : 'Disconnected'}
          </Badge>
        </Flex>
        <Text className="mt-2">Last updated: {formattedTime}</Text>
      </Card>
      
      <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
        <Card decoration="top" decorationColor="blue">
          <Flex justifyContent="start" alignItems="center">
            <Battery className="h-6 w-6 text-blue-500" />
            <Title className="ml-2">Battery Status</Title>
          </Flex>
          <Flex className="mt-4" justifyContent="center">
            <DonutChart
              data={batteryData}
              category="value"
              index="name"
              colors={['emerald', 'slate']}
              className="mt-6"
            />
          </Flex>
          <Flex justifyContent="between" className="mt-4">
            <Text>State of Charge</Text>
            <Text>{telemetryData.state_of_charge_percent?.toFixed(1)}%</Text>
          </Flex>
          <Flex justifyContent="between" className="mt-2">
            <Text>Battery Health</Text>
            <Text>{telemetryData.state_of_health_percent?.toFixed(1)}%</Text>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="green">
          <Flex justifyContent="start" alignItems="center">
            <Zap className="h-6 w-6 text-green-500" />
            <Title className="ml-2">Range & Energy</Title>
          </Flex>
          <Flex justifyContent="between" className="mt-6">
            <Text>Estimated Range</Text>
            <Text className="text-lg font-semibold">{telemetryData.estimated_range_km?.toFixed(1)} km</Text>
          </Flex>
          <Flex justifyContent="between" className="mt-4">
            <Text>Energy Consumption</Text>
            <Text>{telemetryData.energy_consumption_kwh_per_100km?.toFixed(1)} kWh/100km</Text>
          </Flex>
          <Flex justifyContent="between" className="mt-4">
            <Text>Regenerated Energy</Text>
            <Text>{telemetryData.regenerated_energy_kwh?.toFixed(1)} kWh</Text>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="amber">
          <Flex justifyContent="start" alignItems="center">
            <Gauge className="h-6 w-6 text-amber-500" />
            <Title className="ml-2">Performance</Title>
          </Flex>
          <Flex justifyContent="between" className="mt-6">
            <Text>Current Speed</Text>
            <Text className="text-lg font-semibold">{telemetryData.speed_kmh?.toFixed(1)} km/h</Text>
          </Flex>
          <Flex justifyContent="between" className="mt-4">
            <Text>Odometer</Text>
            <Text>{(telemetryData.odometer_km / 1000)?.toFixed(1)} km</Text>
          </Flex>
          <Flex justifyContent="between" className="mt-4">
            <div className="flex">
              <Text>Power Output</Text>
              {telemetryData.is_charging && (
                <Badge size="xs" color="green" className="ml-2">Charging</Badge>
              )}
            </div>
            <Text>
              {telemetryData.is_charging 
                ? `+${telemetryData.charging_power_kw?.toFixed(1)} kW` 
                : `${telemetryData.power_output_kw?.toFixed(1) || '0.0'} kW`}
            </Text>
          </Flex>
        </Card>
        
        <Card decoration="top" decorationColor="indigo">
          <Flex justifyContent="start" alignItems="center">
            <ThermometerSun className="h-6 w-6 text-indigo-500" />
            <Title className="ml-2">Environment</Title>
          </Flex>
          <Flex justifyContent="between" className="mt-6">
            <Text>Battery Temperature</Text>
            <Text>{telemetryData.battery_temperature_c?.toFixed(1)}°C</Text>
          </Flex>
          <Flex justifyContent="between" className="mt-4">
            <Text>Outside Temperature</Text>
            <Text>{telemetryData.outside_temperature_c?.toFixed(1)}°C</Text>
          </Flex>
          <Flex justifyContent="between" className="mt-4">
            <Text>Location</Text>
            <Text>
              {telemetryData.latitude?.toFixed(4)}, {telemetryData.longitude?.toFixed(4)}
            </Text>
          </Flex>
        </Card>
      </Grid>
      
      <Grid numItemsMd={1} numItemsLg={3} className="gap-6 mt-6">
        <Card>
          <Title>State of Charge History</Title>
          <LineChart
            className="h-72 mt-4"
            data={socHistory}
            index="time"
            categories={["State of Charge"]}
            colors={["blue"]}
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            showLegend={false}
          />
        </Card>
        
        <Card>
          <Title>Range History</Title>
          <AreaChart
            className="h-72 mt-4"
            data={rangeHistory}
            index="time"
            categories={["Range (km)"]}
            colors={["green"]}
            valueFormatter={(value) => `${value.toFixed(1)} km`}
            showLegend={false}
          />
        </Card>
        
        <Card>
          <Title>Energy Consumption</Title>
          <LineChart
            className="h-72 mt-4"
            data={energyConsumptionHistory}
            index="time"
            categories={["kWh/100km"]}
            colors={["amber"]}
            valueFormatter={(value) => `${value.toFixed(1)} kWh/100km`}
            showLegend={false}
          />
        </Card>
      </Grid>
    </div>
  );
} 