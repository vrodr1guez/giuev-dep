import React from 'react';
import { Card, CardContent } from '../ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, icon }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
          {trend && (
            <p className={`mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </CardContent>
  </Card>
);

interface KPICardsProps {
  metrics: {
    totalEvs: number;
    activeEvs: number;
    chargingEvs: number;
    avgSoc: number;
    energyConsumed: {
      value: number;
      trend: number;
    };
  };
}

const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      <KPICard
        title="Total EVs"
        value={metrics.totalEvs}
      />
      <KPICard
        title="Active EVs"
        value={metrics.activeEvs}
      />
      <KPICard
        title="Charging Now"
        value={metrics.chargingEvs}
      />
      <KPICard
        title="Average SoC"
        value={`${metrics.avgSoc}%`}
      />
      <KPICard
        title="Energy Consumed Today"
        value={`${metrics.energyConsumed.value} kWh`}
        trend={{
          value: metrics.energyConsumed.trend,
          isPositive: metrics.energyConsumed.trend > 0
        }}
      />
    </div>
  );
};

export default KPICards; 