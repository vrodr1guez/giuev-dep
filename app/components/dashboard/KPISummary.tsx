"use client";

import React from 'react';
import Link from 'next/link';
import { Activity, Battery, Zap, Car } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface FleetSummary {
  totalVehicles: number;
  avgSoC: number;
  energyConsumed: {
    value: number;
    unit: string;
    change: number;
  };
  chargingNow: number;
}

interface KPISummaryProps {
  data?: FleetSummary;
}

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
  trendValue?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  href,
  trendValue,
  trendDirection,
}) => {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {description}
            {trendValue && (
              <span className={`ml-1 font-medium ${
                trendDirection === 'up' ? 'text-emerald-500' : 
                trendDirection === 'down' ? 'text-red-500' : 'text-gray-500'
              }`}>
                {trendValue}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

const KPISummary: React.FC<KPISummaryProps> = ({ data }) => {
  // Default mock data if no data is provided
  const mockData: FleetSummary = {
    totalVehicles: 42,
    avgSoC: 78,
    energyConsumed: {
      value: 124.5,
      unit: 'kWh',
      change: 3.2
    },
    chargingNow: 8
  };

  const summaryData = data || mockData;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total EVs" 
        value={summaryData.totalVehicles.toString()} 
        description="Active in fleet" 
        href="/vehicles" 
        icon={<Car className="h-4 w-4" />}
      />
      <StatCard 
        title="Avg. SoC" 
        value={`${summaryData.avgSoC}%`} 
        description="Across all online vehicles" 
        icon={<Battery className="h-4 w-4" />}
      />
      <StatCard 
        title="Energy Consumed (Today)" 
        value={`${summaryData.energyConsumed.value} ${summaryData.energyConsumed.unit}`} 
        description="From yesterday" 
        trendValue={`${summaryData.energyConsumed.change > 0 ? '+' : ''}${summaryData.energyConsumed.change}%`}
        trendDirection={summaryData.energyConsumed.change > 0 ? 'up' : 'down'}
        href="/energy-management" 
        icon={<Zap className="h-4 w-4" />}
      />
      <StatCard 
        title="Charging Now" 
        value={`${summaryData.chargingNow} Vehicles`} 
        description="View details" 
        href="/charging-stations?status=charging" 
        icon={<Activity className="h-4 w-4" />}
      />
    </div>
  );
};

export default KPISummary; 