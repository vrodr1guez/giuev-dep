import React from 'react';
import Link from 'next/link';
import { 
  Car, ArrowRight, Zap, Battery, Settings, 
  RefreshCw, LineChart, PlusCircle, CheckCircle,
  Calendar, Clock, Route
} from 'lucide-react';

export default function FleetIntegrationPage() {
  // Sample integrated systems
  const integratedSystems = [
    {
      id: 1,
      name: 'GIU Fleet Management',
      status: 'Connected',
      lastSync: '2 minutes ago',
      dataPoints: ['Vehicle Status', 'Route Optimization', 'Driver Assignments', 'Maintenance Records'],
      vehicles: 48
    },
    {
      id: 2,
      name: 'RouteOptimizer Pro',
      status: 'Connected',
      lastSync: '5 minutes ago',
      dataPoints: ['Route Planning', 'Delivery Schedules', 'Customer Locations', 'Service Areas'],
      vehicles: 36
    },
    {
      id: 3,
      name: 'Maintenance Plus',
      status: 'Connected',
      lastSync: '15 minutes ago',
      dataPoints: ['Service History', 'Maintenance Schedules', 'Parts Inventory', 'Work Orders'],
      vehicles: 48
    },
    {
      id: 4,
      name: 'Driver Portal',
      status: 'Issue Detected',
      lastSync: '2 hours ago',
      dataPoints: ['Driver Profiles', 'Training Records', 'Performance Analytics', 'Safety Metrics'],
      vehicles: 42
    }
  ];

  // Sample integration benefits
  const integrationBenefits = [
    {
      title: 'Intelligent Vehicle Rotation',
      description: 'Advanced algorithms automatically optimize vehicle assignments based on real-time charge levels, route requirements, and operational priorities to ensure maximum fleet efficiency.',
      icon: <RefreshCw className="h-8 w-8 text-blue-500" />
    },
    {
      title: 'Dynamic Charging Orchestration',
      description: 'Sophisticated charging schedules are dynamically calculated based on route demands, energy consumption patterns, and operational timelines to minimize downtime.',
      icon: <Route className="h-8 w-8 text-green-500" />
    },
    {
      title: 'Predictive Maintenance Intelligence',
      description: 'Advanced analytics integrate battery health data with maintenance schedules to prevent operational disruptions and optimize asset longevity.',
      icon: <LineChart className="h-8 w-8 text-purple-500" />
    }
  ];

  // Sample integrated data points
  const dataPoints = [
    { category: 'Vehicle', items: ['State of Charge', 'Range Estimation', 'Location Data', 'Maintenance Status', 'Battery Health'] },
    { category: 'Route', items: ['Distance Analysis', 'Energy Requirements', 'Stop Optimization', 'Timeline Estimation', 'Charging Opportunities'] },
    { category: 'Charging', items: ['Station Availability', 'Charging Rate', 'Cost Analysis', 'Optimal Time Windows', 'Priority Scheduling'] },
    { category: 'Driver', items: ['Schedule Management', 'Performance Analytics', 'Training Status', 'Vehicle Preferences', 'Compliance Requirements'] }
  ];

  // Sample upcoming vehicle assignments
  const vehicleAssignments = [
    {
      id: 1,
      vehicle: 'Delivery Van #103',
      batteryLevel: 85,
      estimatedRange: '180 miles',
      route: 'Downtown Loop',
      routeDistance: '120 miles',
      driver: 'Michael Chen',
      departureTime: '07:30 AM',
      status: 'Ready'
    },
    {
      id: 2,
      vehicle: 'Service Truck #54',
      batteryLevel: 65,
      estimatedRange: '130 miles',
      route: 'North Suburbs',
      routeDistance: '95 miles',
      driver: 'Sarah Johnson',
      departureTime: '08:00 AM',
      status: 'Charging'
    },
    {
      id: 3,
      vehicle: 'Cargo Van #87',
      batteryLevel: 92,
      estimatedRange: '210 miles',
      route: 'Airport Circuit',
      routeDistance: '140 miles',
      driver: 'James Wilson',
      departureTime: '06:45 AM',
      status: 'Ready'
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fleet Integration Platform</h1>
          <p className="text-gray-600">Enterprise-grade integration orchestrating seamless connectivity between EV charging infrastructure and fleet management ecosystems</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ev-management/fleet-integration/settings"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            <span>Integration Settings</span>
          </Link>
          <Link
            href="/ev-management/fleet-integration/connect"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Connect New System</span>
          </Link>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">System Integration Status</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connected System
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connection Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Synchronization
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Streams
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Count
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {integratedSystems.map((system) => (
                <tr key={system.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{system.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      system.status === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {system.status === 'Connected' ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <Settings className="mr-1 h-3 w-3" />
                      )}
                      {system.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {system.lastSync}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {system.dataPoints.slice(0, 2).join(', ')}
                      {system.dataPoints.length > 2 && (
                        <span className="text-gray-400"> +{system.dataPoints.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {system.vehicles}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/ev-management/fleet-integration/systems/${system.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Details
                    </Link>
                    <Link href={`/ev-management/fleet-integration/systems/${system.id}/settings`} className="text-blue-600 hover:text-blue-900">
                      Configure
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Integration Benefits */}
      <div className="mb-16 bg-gray-50 py-12 rounded-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">Strategic Business Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          {integrationBenefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="p-4 rounded-full bg-white shadow-sm mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Integrated Data */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Unified Data Integration Points</h2>
          <Link 
            href="/ev-management/fleet-integration/data-mapping" 
            className="text-blue-600 hover:text-blue-800"
          >
            Configure Data Mapping
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataPoints.map((category, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-100">
                {category.category} Analytics
              </h3>
              <ul className="space-y-2">
                {category.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Vehicle Assignments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Intelligent Vehicle Assignment Schedule</h2>
          <Link 
            href="/ev-management/fleet-integration/assignments" 
            className="text-blue-600 hover:text-blue-800"
          >
            View All Assignments
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Asset
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Battery Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimated Range
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Route
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operator
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departure
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Readiness Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicleAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{assignment.vehicle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className={`h-2.5 rounded-full ${
                            assignment.batteryLevel > 70 ? 'bg-green-500' : 
                            assignment.batteryLevel > 40 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${assignment.batteryLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{assignment.batteryLevel}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.estimatedRange}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{assignment.route}</div>
                    <div className="text-sm text-gray-500">{assignment.routeDistance}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.driver}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.departureTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      assignment.status === 'Ready' ? 'bg-green-100 text-green-800' : 
                      assignment.status === 'Charging' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Workflow */}
      <div className="bg-gray-50 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Enterprise Integration Architecture</h2>
        
        <div className="flex flex-col md:flex-row justify-between max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8 md:mb-0 md:w-1/4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl font-bold">1</span>
            </div>
            <h3 className="text-lg font-bold mb-2">System Connectivity</h3>
            <p className="text-sm text-gray-600">Establish secure API connections between fleet management, route optimization, and operational systems</p>
          </div>
          
          <div className="hidden md:block w-1/12">
            <ArrowRight className="h-6 w-24 text-gray-300" />
          </div>
          
          <div className="flex flex-col items-center text-center mb-8 md:mb-0 md:w-1/4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl font-bold">2</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Data Orchestration</h3>
            <p className="text-sm text-gray-600">Configure intelligent data mapping and real-time synchronization protocols across all integrated platforms</p>
          </div>
          
          <div className="hidden md:block w-1/12">
            <ArrowRight className="h-6 w-24 text-gray-300" />
          </div>
          
          <div className="flex flex-col items-center text-center mb-8 md:mb-0 md:w-1/4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl font-bold">3</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Intelligent Automation</h3>
            <p className="text-sm text-gray-600">Deploy advanced business rules for automated charging orchestration based on operational requirements and route optimization</p>
          </div>
          
          <div className="hidden md:block w-1/12">
            <ArrowRight className="h-6 w-24 text-gray-300" />
          </div>
          
          <div className="flex flex-col items-center text-center md:w-1/4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl font-bold">4</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Continuous Optimization</h3>
            <p className="text-sm text-gray-600">Machine learning algorithms continuously analyze performance data to optimize fleet efficiency and operational outcomes</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 text-white rounded-lg p-8 text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Accelerate Your Fleet Transformation</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Unlock the full potential of your electric fleet by integrating additional enterprise systems with our comprehensive integration platform.
        </p>
        <Link 
          href="/ev-management/fleet-integration/connect" 
          className="inline-block px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
        >
          Expand Integration Portfolio
        </Link>
      </div>

      <footer className="text-center text-gray-500 text-sm">
        <p>Last enterprise synchronization: 2 minutes ago | Real-time data streaming active</p>
      </footer>
    </div>
  );
} 