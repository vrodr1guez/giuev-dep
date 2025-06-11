import React from 'react';
import Link from 'next/link';
import { 
  Clock, Battery, Zap, DollarSign, LineChart, 
  Calendar, Settings, ArrowRight, CheckCircle, 
  BrainCircuit, TrendingDown 
} from 'lucide-react';

export default function EnergyOptimizationPage() {
  // Sample scheduled vehicles
  const scheduledVehicles = [
    {
      id: 1,
      name: 'Delivery Van #103',
      model: 'E-Transit',
      currentCharge: 35,
      targetCharge: 95,
      priority: 'High',
      departureTime: '07:30 AM',
      startCharging: '11:30 PM',
      endCharging: '05:45 AM',
      rate: 'Off-peak'
    },
    {
      id: 2,
      name: 'Service Truck #218',
      model: 'Lightning F-150',
      currentCharge: 62,
      targetCharge: 90,
      priority: 'Medium',
      departureTime: '09:00 AM',
      startCharging: '01:15 AM',
      endCharging: '06:30 AM',
      rate: 'Off-peak'
    },
    {
      id: 3,
      name: 'Executive Car #305',
      model: 'Model 3',
      currentCharge: 41,
      targetCharge: 100,
      priority: 'High',
      departureTime: '08:00 AM',
      startCharging: '12:00 AM',
      endCharging: '04:30 AM',
      rate: 'Off-peak'
    },
    {
      id: 4,
      name: 'Delivery Van #127',
      model: 'E-Transit',
      currentCharge: 28,
      targetCharge: 85,
      priority: 'Medium',
      departureTime: '10:30 AM',
      startCharging: '02:30 AM',
      endCharging: '07:45 AM',
      rate: 'Off-peak'
    },
    {
      id: 5,
      name: 'Maintenance Truck #412',
      model: 'eCantor',
      currentCharge: 55,
      targetCharge: 90,
      priority: 'Low',
      departureTime: '01:00 PM',
      startCharging: '08:30 AM',
      endCharging: '11:45 AM',
      rate: 'Standard'
    }
  ];

  // Sample rate periods
  const ratePeriods = [
    { id: 1, period: 'Off-peak', time: '10:00 PM - 6:00 AM', rate: '$0.08/kWh', color: 'bg-green-100 text-green-800' },
    { id: 2, period: 'Standard', time: '6:00 AM - 4:00 PM', rate: '$0.15/kWh', color: 'bg-blue-100 text-blue-800' },
    { id: 3, period: 'Peak', time: '4:00 PM - 10:00 PM', rate: '$0.28/kWh', color: 'bg-orange-100 text-orange-800' }
  ];

  // Sample optimization stats
  const optimizationStats = [
    { id: 1, label: 'Monthly Savings', value: '$3,250', change: '+12%', icon: <DollarSign className="h-6 w-6 text-green-500" /> },
    { id: 2, label: 'Off-Peak Charging', value: '78%', change: '+8%', icon: <Clock className="h-6 w-6 text-blue-500" /> },
    { id: 3, label: 'Optimization Score', value: '92/100', change: '+5', icon: <LineChart className="h-6 w-6 text-purple-500" /> },
    { id: 4, label: 'CO₂ Reduction', value: '15.2 tons', change: '+6%', icon: <TrendingDown className="h-6 w-6 text-teal-500" /> },
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Energy Optimization</h1>
          <p className="text-gray-600">AI-powered charging schedules that reduce costs and maximize efficiency</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ev-management/optimization/settings"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            <span>Configure Settings</span>
          </Link>
          <Link
            href="/ev-management/optimization/schedule"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Calendar className="h-4 w-4 mr-2" />
            <span>View Weekly Schedule</span>
          </Link>
        </div>
      </div>

      {/* AI Optimization Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <BrainCircuit className="h-48 w-48" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center mb-4">
            <BrainCircuit className="h-8 w-8 mr-3" />
            <h2 className="text-2xl font-bold">AI Optimization Active</h2>
          </div>
          <p className="mb-4">
            Our AI is actively analyzing your fleet's usage patterns, electricity rates, and vehicle priorities 
            to create the most cost-effective charging schedule while ensuring all vehicles are ready for their assigned routes.
          </p>
          <div className="flex flex-wrap gap-6 mt-6">
            <div>
              <div className="text-sm opacity-75">Today's Savings</div>
              <div className="text-2xl font-bold">$146.28</div>
            </div>
            <div>
              <div className="text-sm opacity-75">Monthly Projection</div>
              <div className="text-2xl font-bold">$3,580</div>
            </div>
            <div>
              <div className="text-sm opacity-75">Optimization Score</div>
              <div className="text-2xl font-bold">92/100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {optimizationStats.map(stat => (
          <div key={stat.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">{stat.label}</h3>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-green-600 mt-2 flex items-center">
              {stat.change}
              <svg className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 01-1-1V5.414l-3.293 3.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L13 5.414V6a1 1 0 01-1 1z" clipRule="evenodd" />
              </svg>
            </p>
          </div>
        ))}
      </div>

      {/* Rate Periods */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Electricity Rate Periods</h2>
          <Link href="/ev-management/optimization/rates" className="text-blue-600 hover:text-blue-800">
            Edit Rates
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ratePeriods.map((period) => (
            <div key={period.id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${period.color}`}>
                {period.period}
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{period.time}</div>
                <div className="text-lg font-bold">{period.rate}</div>
              </div>
              <div className="mt-3 border-t border-gray-100 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Optimal for charging:</span>
                  {period.period === 'Off-peak' ? (
                    <span className="text-green-600 font-medium">Highly Recommended</span>
                  ) : period.period === 'Standard' ? (
                    <span className="text-blue-600 font-medium">When Necessary</span>
                  ) : (
                    <span className="text-orange-600 font-medium">Avoid If Possible</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charging Schedule */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tonight's Charging Schedule</h2>
          <div className="flex gap-3">
            <button className="text-blue-600 hover:text-blue-800">Optimize Again</button>
            <Link href="/ev-management/optimization/schedule" className="text-blue-600 hover:text-blue-800">
              View Full Schedule
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current SOC
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departure
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Charging Window
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scheduledVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{vehicle.name}</div>
                    <div className="text-sm text-gray-500">{vehicle.model}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${vehicle.currentCharge}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{vehicle.currentCharge}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.targetCharge}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vehicle.priority === 'High' ? 'bg-red-100 text-red-800' :
                      vehicle.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {vehicle.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.departureTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.startCharging} - {vehicle.endCharging}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vehicle.rate === 'Off-peak' ? 'bg-green-100 text-green-800' :
                      vehicle.rate === 'Standard' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {vehicle.rate}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/ev-management/optimization/vehicles/${vehicle.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      View
                    </Link>
                    <Link href={`/ev-management/optimization/schedule/${vehicle.id}`} className="text-blue-600 hover:text-blue-900">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimization Strategies */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6">AI Optimization Strategies</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold">Time-of-Use Optimization</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Our AI analyzes electricity rates across different times of day to schedule charging during the most cost-effective periods.
            </p>
            <div className="mt-4">
              <div className="text-sm text-blue-600 font-medium flex items-center">
                <span>Learn more</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold">Route-Based Prioritization</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Vehicles are prioritized based on their upcoming routes, ensuring that those with longer distances or earlier departures are charged first.
            </p>
            <div className="mt-4">
              <div className="text-sm text-purple-600 font-medium flex items-center">
                <span>Learn more</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <Battery className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold">Battery Health Preservation</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Charging schedules are designed to minimize battery degradation by avoiding extreme states of charge and optimizing charging rates.
            </p>
            <div className="mt-4">
              <div className="text-sm text-green-600 font-medium flex items-center">
                <span>Learn more</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call-to-Action */}
      <div className="bg-gray-50 rounded-lg p-8 text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Ready to further optimize your charging costs?</h2>
        <p className="mb-6 max-w-2xl mx-auto text-gray-600">
          Our advanced energy optimization strategies can reduce your charging costs by up to 35% while ensuring your fleet is always ready for operation.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/ev-management/optimization/customize" 
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Customize Optimization Settings
          </Link>
          <Link 
            href="/ev-management/optimization/report" 
            className="px-6 py-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Download Savings Report
          </Link>
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm">
        <p>Last optimization: Today at 3:15 PM • Next scheduled optimization: Tonight at 9:00 PM</p>
      </footer>
    </div>
  );
} 