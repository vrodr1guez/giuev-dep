/// <reference path="../../types/react.d.ts" />
/// <reference path="../../types/recharts.d.ts" />

// @ts-ignore - suppress recharts JSX element type errors
import React from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { 
  DashboardVehicleStatus, 
  SoCDistribution, 
  ChargingSession, 
  AlertItem,
  FleetSummary 
} from '../../types/dashboard';
import { 
  Activity, 
  Battery, 
  Zap, 
  Car 
} from 'lucide-react';

// Mock data for the dashboard
const fleetSummary: FleetSummary = {
  totalVehicles: 26,
  avgSoC: 72,
  energyConsumed: {
    value: 156,
    unit: 'kWh',
    change: 5
  },
  chargingNow: 5
};

const vehicleStatusData: DashboardVehicleStatus[] = [
  { name: 'Online', count: 18, fill: '#22c55e' },
  { name: 'Charging', count: 5, fill: '#3b82f6' },
  { name: 'Offline', count: 2, fill: '#f59e0b' },
  { name: 'Maintenance', count: 1, fill: '#ef4444' },
];

const socDistributionData: SoCDistribution[] = [
  { name: '0-20%', value: 2, fill: '#ef4444' },
  { name: '21-40%', value: 3, fill: '#f59e0b' },
  { name: '41-60%', value: 5, fill: '#10b981' },
  { name: '61-80%', value: 10, fill: '#3b82f6' },
  { name: '81-100%', value: 6, fill: '#22c55e' },
];

const chargingSessionsData: ChargingSession[] = [
  { date: '05/01', sessions: 10, avgDurationMin: 45 },
  { date: '05/02', sessions: 12, avgDurationMin: 40 },
  { date: '05/03', sessions: 8, avgDurationMin: 50 },
  { date: '05/04', sessions: 15, avgDurationMin: 35 },
  { date: '05/05', sessions: 11, avgDurationMin: 42 },
  { date: '05/06', sessions: 9, avgDurationMin: 48 },
  { date: '05/07', sessions: 13, avgDurationMin: 38 },
];

const alertsData: AlertItem[] = [
  {
    id: 'alert-1',
    message: 'Vehicle EV007: Low SoC (15%)',
    severity: 'warning',
    linkText: 'View',
    linkHref: '/vehicles/EV007'
  },
  {
    id: 'alert-2',
    message: 'Charging Station CS002: Connector Offline',
    severity: 'critical',
    linkText: 'View',
    linkHref: '/charging-stations/CS002'
  },
  {
    id: 'alert-3',
    message: 'Driver John D: Harsh Braking Event Detected',
    severity: 'info',
    linkText: 'View',
    linkHref: '/drivers/JohnD/feedback'
  },
  {
    id: 'alert-4',
    message: 'V2G Dispatch Alert: Grid demand spike expected in 30 mins',
    severity: 'critical',
    linkText: 'Manage V2G',
    linkHref: '/v2g'
  }
];

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  href
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
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
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

const AlertCard: React.FC<{ alerts: AlertItem[] }> = ({ alerts }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {alerts.map((alert: AlertItem) => (
            <li 
              key={alert.id} 
              className={`text-sm p-2 rounded-md ${
                alert.severity === 'critical' 
                  ? 'bg-red-50 text-red-800' 
                  : alert.severity === 'warning'
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-blue-50 text-blue-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{alert.message}</span>
                <Link 
                  href={alert.linkHref} 
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    alert.severity === 'critical' 
                      ? 'bg-red-100 hover:bg-red-200 text-red-800' 
                      : alert.severity === 'warning'
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                  }`}
                >
                  {alert.linkText}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const DashboardOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total EVs" 
          value={fleetSummary.totalVehicles.toString()} 
          description="Active in fleet" 
          href="/vehicles" 
          icon={<Car className="h-4 w-4" />}
        />
        <StatCard 
          title="Avg. SoC" 
          value={`${fleetSummary.avgSoC}%`} 
          description="Across all online vehicles" 
          icon={<Battery className="h-4 w-4" />}
        />
        <StatCard 
          title="Energy Consumed (Today)" 
          value={`${fleetSummary.energyConsumed.value} ${fleetSummary.energyConsumed.unit}`} 
          description={`${fleetSummary.energyConsumed.change > 0 ? '+' : ''}${fleetSummary.energyConsumed.change}% from yesterday`} 
          href="/energy-management" 
          icon={<Zap className="h-4 w-4" />}
        />
        <StatCard 
          title="Charging Now" 
          value={`${fleetSummary.chargingNow} Vehicles`} 
          description="View details" 
          href="/charging-stations?status=charging" 
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Vehicles">
                  {vehicleStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Battery SoC Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={socDistributionData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  label
                >
                  {socDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Charging Sessions & Avg. Duration</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chargingSessionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" unit=" sessions" />
                <YAxis yAxisId="right" orientation="right" unit=" min" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#3b82f6" 
                  name="Sessions" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="avgDurationMin" 
                  stroke="#10b981" 
                  name="Avg. Duration (min)" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <AlertCard alerts={alertsData} />

      <div className="flex justify-between items-center mt-6">
        <Link href="/reports" className="text-sm font-medium text-primary hover:underline">
          View All Reports
        </Link>
        <Link href="/dashboard/customize" className="text-sm font-medium text-primary hover:underline">
          Customize Dashboard
        </Link>
      </div>
    </div>
  );
};

export default DashboardOverview; 