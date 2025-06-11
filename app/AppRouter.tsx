import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Import actual page components
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import ReportsPage from './pages/ReportsPage';
import ChargingStationsPage from './pages/charging-stations';
import RoutePlanningPage from './pages/route-planning';
import V2GManagementPage from './pages/v2g';
import EnergyManagementPage from './pages/energy-management';

// Placeholder components for other pages - these will be developed later
const VehiclesPage: React.FC = () => (
  <div className="p-6">
    <h2 className="text-3xl font-semibold">Vehicles Management</h2>
    <p>Content for vehicle management will go here.</p>
  </div>
);

const DriversPage: React.FC = () => (
  <div className="p-6">
    <h2 className="text-3xl font-semibold">Drivers & Coaching</h2>
    <p>Content for driver management and coaching feedback will go here.</p>
  </div>
);

const SettingsPage: React.FC = () => (
  <div className="p-6">
    <h2 className="text-3xl font-semibold">Settings</h2>
    <p>System and user settings will be configured here.</p>
  </div>
);

// Layout wrapper component
const LayoutWrapper = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LayoutWrapper />}>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/:vehicleId" element={<VehiclesPage />} />
          <Route path="charging-stations" element={<ChargingStationsPage />} />
          <Route path="charging-stations/:stationId" element={<ChargingStationsPage />} />
          <Route path="route-planning" element={<RoutePlanningPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="drivers/:driverId/feedback" element={<DriversPage />} />
          <Route path="energy-management" element={<EnergyManagementPage />} />
          <Route path="v2g" element={<V2GManagementPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter; 