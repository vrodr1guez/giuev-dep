'use client';

import React from 'react';
import KPISummary from './dashboard/KPISummary';
import FleetMapComponent from './dashboard/FleetMap';
import RecentAlerts from './dashboard/RecentAlerts';
import QuickStats from './dashboard/QuickStats';
import VehicleSummary from './dashboard/VehicleSummary';

const DashboardOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">EV Fleet Management Dashboard</h1>
      
      {/* KPI Summary */}
      <section>
        <KPISummary />
      </section>
      
      {/* Interactive Fleet Map */}
      <section>
        <FleetMapComponent />
      </section>
      
      {/* Two-column layout for lower sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Recent Alerts */}
        <section>
          <RecentAlerts alerts={[]} />
        </section>
        
        {/* Column 2: Quick Stats and Charts */}
        <section>
          <QuickStats 
            batteryHealthData={[]}
            energyConsumptionData={[]}
            driverEfficiencyData={[]}
            timeRange="day"
            onTimeRangeChange={() => {}}
            stats={{
              totalVehicles: 0,
              activeVehicles: 0,
              totalDistance: 0,
              energyConsumed: 0
            }}
          />
        </section>
      </div>
      
      {/* Vehicle Summary */}
      <section className="mt-6">
        <VehicleSummary vehicles={[]} />
      </section>
    </div>
  );
}

export default DashboardOverview; 