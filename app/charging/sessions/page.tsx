"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Battery, 
  Clock,
  Calendar,
  Zap,
  Car,
  MapPin,
  BarChart,
  FileText,
  Bell,
  Info,
  RefreshCw,
  CheckCircle2,
  ListFilter,
  Download,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';

// Mock data for active charging sessions
const ACTIVE_SESSIONS = [
  {
    id: "cs-001",
    vehicleId: "EV-102",
    vehicleName: "Nissan Leaf",
    stationId: "CS-002",
    stationName: "Main Building",
    startTime: "45 min ago",
    progress: 45,
    energy: "23 kWh",
  },
  {
    id: "cs-002",
    vehicleId: "EV-103",
    vehicleName: "BMW i3",
    stationId: "CS-005",
    stationName: "East Wing",
    startTime: "12 min ago",
    progress: 32,
    energy: "15 kWh",
  }
];

// Mock data for charging history
const CHARGING_HISTORY = [
  {
    id: "ch-001",
    date: "2023-05-10",
    vehicleId: "EV-101",
    vehicleName: "Tesla Model 3",
    stationId: "CS-001",
    stationName: "North Campus",
    duration: "1h 32m",
    energy: "45 kWh"
  },
  {
    id: "ch-002",
    date: "2023-05-09",
    vehicleId: "EV-102",
    vehicleName: "Nissan Leaf",
    stationId: "CS-003",
    stationName: "South Parking Lot",
    duration: "2h 15m",
    energy: "32 kWh"
  },
  {
    id: "ch-003",
    date: "2023-05-08",
    vehicleId: "EV-103",
    vehicleName: "BMW i3",
    stationId: "CS-002",
    stationName: "Main Building",
    duration: "0h 45m",
    energy: "18 kWh"
  }
];

export default function ChargingSessionsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Charging Sessions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor and control charging sessions for your electric vehicle fleet
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Energy Today</p>
              <h4 className="text-2xl font-bold">123 kWh</h4>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Session Time</p>
              <h4 className="text-2xl font-bold">1h 25m</h4>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed Sessions</p>
              <h4 className="text-2xl font-bold">15</h4>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Sessions</p>
              <h4 className="text-2xl font-bold">2</h4>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Active Charging Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Charging Sessions</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Currently active charging sessions across your fleet
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Vehicle</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Station</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Started</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {ACTIVE_SESSIONS.map((session) => (
                  <tr key={session.id}>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{session.vehicleId} ({session.vehicleName})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{session.stationId} ({session.stationName})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{session.startTime}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <Progress value={session.progress} className="h-2" />
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {session.progress}% ({session.energy})
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Stop</span>
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Info className="h-3.5 w-3.5" />
                          <span>Details</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Charging History */}
      <Card>
        <CardHeader>
          <CardTitle>Charging History</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Recent charging sessions for your fleet
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Vehicle</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Station</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Energy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {CHARGING_HISTORY.map((record) => (
                  <tr key={record.id}>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{record.date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{record.vehicleId} ({record.vehicleName})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{record.stationId} ({record.stationName})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{record.duration}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{record.energy}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <div className="flex justify-center border-t border-gray-200 dark:border-gray-800 py-4">
          <Button variant="outline">View Full History</Button>
        </div>
      </Card>
      
      {/* Quick Actions */}
      <div className="pt-2">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium mb-1">Start New Session</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Initiate a charging session</p>
            </CardContent>
          </Card>
          
          <Card className="hover:border-green-500 transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium mb-1">Generate Charging Report</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create detailed reports</p>
            </CardContent>
          </Card>
          
          <Card className="hover:border-amber-500 transition-colors cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full mb-4">
                <Bell className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="font-medium mb-1">Configure Alerts</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Set up custom notifications</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 