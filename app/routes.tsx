import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import DashboardOverview from './components/DashboardOverview';
import VehiclesList from './components/vehicles/VehiclesList';
import VehicleDetail from './components/vehicles/VehicleDetail';
import ChargingStationDetail from './components/charging/ChargingStationDetail';
import BatteryHealthDashboard from './components/maintenance/BatteryHealthDashboard';
import ChargingStationsPage from './pages/charging-stations';
import EnhancedBatteryHealth from './pages/maintenance/enhanced-battery-health';
import GridIntegrationPage from './pages/grid-integration';

// Placeholder components for routes
const Dashboard = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-2">Vehicle Status</h3>
        <p className="text-gray-600">10 vehicles in operation</p>
        <p className="text-gray-600">2 vehicles charging</p>
        <p className="text-gray-600">1 vehicle in maintenance</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-2">Energy Usage</h3>
        <p className="text-gray-600">Daily consumption: 450 kWh</p>
        <p className="text-gray-600">Weekly average: 3,150 kWh</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-2">Alerts</h3>
        <div className="text-red-500">2 critical alerts</div>
        <div className="text-yellow-500">5 warnings</div>
      </div>
    </div>
  </div>
);

const Login = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Login</h2>
    <p>Login interface will be displayed here.</p>
  </div>
);

const Register = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Register</h2>
    <p>Registration interface will be displayed here.</p>
  </div>
);

const Profile = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Profile</h2>
    <p>User profile interface will be displayed here.</p>
  </div>
);

const NotFound = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
  </div>
);

const BatteryHealth = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Battery Health</h2>
    <p>Battery health monitoring interface will be displayed here.</p>
  </div>
);

const Vehicles = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Vehicle Management</h2>
    <p>Vehicle list and management interface will be displayed here.</p>
  </div>
);

const ChargingStations = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Charging Stations</h2>
    <p>Charging station monitoring and management interface will be displayed here.</p>
  </div>
);

const RoutePlanning = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Route Planning</h2>
    <p>Route planning and optimization interface will be displayed here.</p>
  </div>
);

const Drivers = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Drivers & Coaching</h2>
    <p>Driver performance monitoring and coaching interface will be displayed here.</p>
  </div>
);

const EnergyManagement = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Energy Management</h2>
    <p>Energy usage monitoring and optimization interface will be displayed here.</p>
  </div>
);

const V2G = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">V2G Management</h2>
    <p>Vehicle-to-Grid integration and management interface will be displayed here.</p>
  </div>
);

const Reports = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Reports & Analytics</h2>
    <p>Reporting and analytics interface will be displayed here.</p>
  </div>
);

const Settings = () => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Settings</h2>
    <p>System configuration and settings interface will be displayed here.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="/vehicles" element={<VehiclesList />} />
        <Route path="/vehicles/:id" element={<VehicleDetail vehicleId={0} />} />
        <Route path="/charging-stations" element={<ChargingStationsPage />} />
        <Route path="/charging-stations/:id" element={<ChargingStationDetail stationId={0} />} />
        <Route path="/route-planning" element={<RoutePlanning />} />
        <Route path="/maintenance/battery-health" element={<BatteryHealth />} />
        <Route path="/maintenance/enhanced-battery-health" element={<EnhancedBatteryHealth />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/energy-management" element={<EnergyManagement />} />
        <Route path="/grid-integration" element={<GridIntegrationPage />} />
        <Route path="/v2g" element={<V2G />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes; 