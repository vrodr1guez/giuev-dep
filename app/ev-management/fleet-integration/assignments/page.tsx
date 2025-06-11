import React from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Filter, Calendar, Clock, Search,
  Plus, MapPin, RefreshCw, Download, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export default function FleetIntegrationAssignmentsPage() {
  // Sample vehicle assignments
  const vehicleAssignments = [
    {
      id: 1,
      vehicle: 'Delivery Van #103',
      vehicleType: 'Ford E-Transit',
      batteryLevel: 85,
      estimatedRange: '180 miles',
      route: 'Downtown Loop',
      routeDistance: '120 miles',
      driver: 'Michael Chen',
      departureTime: '07:30 AM',
      returnTime: '04:15 PM',
      status: 'Ready',
      notes: 'Multiple downtown deliveries with 15 scheduled stops'
    },
    {
      id: 2,
      vehicle: 'Service Truck #54',
      vehicleType: 'Lightning F-150',
      batteryLevel: 65,
      estimatedRange: '130 miles',
      route: 'North Suburbs',
      routeDistance: '95 miles',
      driver: 'Sarah Johnson',
      departureTime: '08:00 AM',
      returnTime: '05:30 PM',
      status: 'Charging',
      notes: 'Maintenance calls at 3 office buildings'
    },
    {
      id: 3,
      vehicle: 'Cargo Van #87',
      vehicleType: 'Mercedes eSprinter',
      batteryLevel: 92,
      estimatedRange: '210 miles',
      route: 'Airport Circuit',
      routeDistance: '140 miles',
      driver: 'James Wilson',
      departureTime: '06:45 AM',
      returnTime: '02:30 PM',
      status: 'Ready',
      notes: 'Express package deliveries to airport terminals'
    },
    {
      id: 4,
      vehicle: 'Passenger Van #35',
      vehicleType: 'BYD e6',
      batteryLevel: 45,
      estimatedRange: '120 miles',
      route: 'University Campus',
      routeDistance: '85 miles',
      driver: 'Lisa Rodriguez',
      departureTime: '08:15 AM',
      returnTime: '06:00 PM',
      status: 'Needs Charging',
      notes: 'Staff shuttle between campus locations'
    },
    {
      id: 5,
      vehicle: 'Delivery Van #68',
      vehicleType: 'Ford E-Transit',
      batteryLevel: 78,
      estimatedRange: '165 miles',
      route: 'West Industrial',
      routeDistance: '110 miles',
      driver: 'David Thompson',
      departureTime: '07:00 AM',
      returnTime: '03:45 PM',
      status: 'Ready',
      notes: 'Heavy package deliveries to industrial zone'
    },
    {
      id: 6,
      vehicle: 'Executive Car #12',
      vehicleType: 'Tesla Model 3',
      batteryLevel: 88,
      estimatedRange: '250 miles',
      route: 'Corporate HQ Tour',
      routeDistance: '75 miles',
      driver: 'Jennifer Adams',
      departureTime: '09:30 AM',
      returnTime: '04:00 PM',
      status: 'Ready',
      notes: 'Executive transport for regional office visits'
    },
    {
      id: 7,
      vehicle: 'Service Truck #29',
      vehicleType: 'Rivian R1T',
      batteryLevel: 34,
      estimatedRange: '95 miles',
      route: 'East County',
      routeDistance: '115 miles',
      driver: 'Robert Garcia',
      departureTime: '08:30 AM',
      returnTime: '06:15 PM',
      status: 'Needs Charging',
      notes: 'Field service calls at rural locations'
    },
    {
      id: 8,
      vehicle: 'Delivery Van #143',
      vehicleType: 'Ford E-Transit',
      batteryLevel: 72,
      estimatedRange: '155 miles',
      route: 'South Metro',
      routeDistance: '90 miles',
      driver: 'Kevin Martinez',
      departureTime: '07:45 AM',
      returnTime: '03:30 PM',
      status: 'Ready',
      notes: 'Grocery deliveries to residential neighborhoods'
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/ev-management/fleet-integration" className="flex items-center hover:text-blue-600 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Fleet Integration
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vehicle Assignments</h1>
          <p className="text-gray-600">Manage and view all fleet vehicle assignments and routes</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="inline-flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Schedule View</span>
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            <span>New Assignment</span>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Search assignments..." 
              className="pl-10 w-full"
            />
          </div>
          
          <div className="flex-1 flex flex-wrap gap-2">
            <select className="p-2 border border-gray-300 rounded-md text-sm">
              <option value="">All Vehicles</option>
              <option value="delivery">Delivery Vans</option>
              <option value="service">Service Trucks</option>
              <option value="passenger">Passenger Vans</option>
              <option value="executive">Executive Cars</option>
            </select>
            
            <select className="p-2 border border-gray-300 rounded-md text-sm">
              <option value="">All Drivers</option>
              <option value="team1">Team A</option>
              <option value="team2">Team B</option>
              <option value="team3">Team C</option>
            </select>
            
            <select className="p-2 border border-gray-300 rounded-md text-sm">
              <option value="">All Routes</option>
              <option value="north">North Region</option>
              <option value="south">South Region</option>
              <option value="east">East Region</option>
              <option value="west">West Region</option>
            </select>
            
            <select className="p-2 border border-gray-300 rounded-md text-sm">
              <option value="">All Statuses</option>
              <option value="ready">Ready</option>
              <option value="charging">Charging</option>
              <option value="needsCharging">Needs Charging</option>
              <option value="inUse">In Use</option>
            </select>
            
            <Button variant="outline" className="inline-flex items-center p-2 h-9">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center px-3 py-1 h-9">
              <Filter className="h-4 w-4 mr-1" />
              <span className="text-sm">Filter</span>
            </Button>
            
            <Button variant="outline" className="flex items-center px-3 py-1 h-9">
              <Download className="h-4 w-4 mr-1" />
              <span className="text-sm">Export</span>
            </Button>
            
            <Button variant="outline" className="p-2 h-9">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <Card className="mb-8">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl">All Vehicle Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    <div className="flex items-center">
                      Vehicle
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <div className="flex items-center">
                      Battery
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <div className="flex items-center">
                      Route
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <div className="flex items-center">
                      Driver
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <div className="flex items-center">
                      Departure
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <div className="flex items-center">
                      Return
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicleAssignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{assignment.vehicle}</div>
                      <div className="text-xs text-gray-500">{assignment.vehicleType}</div>
                    </td>
                    <td className="px-4 py-3">
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
                        <span className="text-xs">
                          {assignment.batteryLevel}% • {assignment.estimatedRange}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{assignment.route}</div>
                      <div className="text-xs text-gray-500">{assignment.routeDistance}</div>
                    </td>
                    <td className="px-4 py-3">
                      {assignment.driver}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                        <span>{assignment.departureTime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                        <span>{assignment.returnTime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assignment.status === 'Ready' ? 'bg-green-100 text-green-800' : 
                        assignment.status === 'Charging' ? 'bg-blue-100 text-blue-800' : 
                        assignment.status === 'Needs Charging' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" className="h-8 w-8 p-0" title="View Route">
                          <MapPin className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="h-8 w-8 p-0" title="Edit Assignment">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">8</span> of <span className="font-medium">24</span> assignments
            </div>
            <div className="flex space-x-1">
              <Button variant="outline" className="h-8 w-8 p-0" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </Button>
              <Button variant="outline" className="h-8 w-8 p-0 bg-blue-50">1</Button>
              <Button variant="outline" className="h-8 w-8 p-0">2</Button>
              <Button variant="outline" className="h-8 w-8 p-0">3</Button>
              <Button variant="outline" className="h-8 w-8 p-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Assignments</p>
                <h3 className="text-2xl font-bold mt-1">24</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600">
              ↑ 12% from last week
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Ready Vehicles</p>
                <h3 className="text-2xl font-bold mt-1">18</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-600">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600">
              75% of total fleet
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Charging Vehicles</p>
                <h3 className="text-2xl font-bold mt-1">4</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-600">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </div>
            </div>
            <div className="mt-4 text-xs text-blue-600">
              16.7% of total fleet
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Need Attention</p>
                <h3 className="text-2xl font-bold mt-1">2</h3>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-600">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
            </div>
            <div className="mt-4 text-xs text-red-600">
              8.3% of total fleet
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 