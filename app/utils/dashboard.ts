import { VehicleStatus, SoCDistribution, ChargingSession } from '../types/dashboard';

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const formatEnergy = (kWh: number): string => {
  return `${formatNumber(kWh)} kWh`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

type StatusColorMap = {
  online: string;
  charging: string;
  offline: string;
  maintenance: string;
  error: string;
};

export const getStatusColor = (status: string): string => {
  const colors: StatusColorMap = {
    online: 'bg-green-100 text-green-800',
    charging: 'bg-blue-100 text-blue-800',
    offline: 'bg-gray-100 text-gray-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };
  return colors[status.toLowerCase() as keyof StatusColorMap] || colors.offline;
};

export const calculateSoCDistribution = (vehicles: { soc: number }[]): SoCDistribution[] => {
  const distribution = Array(5).fill(0);
  vehicles.forEach(vehicle => {
    const index = Math.min(Math.floor(vehicle.soc / 20), 4);
    distribution[index]++;
  });

  return [
    { name: '0-20%', value: distribution[0], fill: '#FF8042' },
    { name: '21-40%', value: distribution[1], fill: '#FFBB28' },
    { name: '41-60%', value: distribution[2], fill: '#00C49F' },
    { name: '61-80%', value: distribution[3], fill: '#0088FE' },
    { name: '81-100%', value: distribution[4], fill: '#82ca9d' },
  ];
};

export const calculateVehicleStatus = (vehicles: { status: string }[]): VehicleStatus[] => {
  const counts = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return [
    { name: 'Online', count: counts.online || 0, fill: '#82ca9d' },
    { name: 'Charging', count: counts.charging || 0, fill: '#8884d8' },
    { name: 'Offline', count: counts.offline || 0, fill: '#ffc658' },
    { name: 'Maintenance', count: counts.maintenance || 0, fill: '#ff8042' },
  ];
};

export const aggregateChargingSessions = (
  sessions: { startTime: Date; duration: number }[],
  days: number = 7
): ChargingSession[] => {
  const result: ChargingSession[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate.toISOString().split('T')[0] === dateStr;
    });

    result.push({
      date: dateStr,
      sessions: daySessions.length,
      avgDurationMin: daySessions.length > 0
        ? Math.round(daySessions.reduce((sum, s) => sum + s.duration, 0) / daySessions.length)
        : 0,
    });
  }

  return result;
}; 