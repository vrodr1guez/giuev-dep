"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Settings, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  ChevronLeft, 
  Filter,
  Search,
  Plus,
  RefreshCw,
  Download,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

// Mock data for maintenance tasks
const MAINTENANCE_TASKS = [
  {
    id: "mt-001",
    stationId: "cs-1243",
    stationName: "Headquarters Station 3",
    status: "scheduled",
    priority: "high",
    type: "repair",
    description: "Charger connector damaged - needs replacement",
    assignedTo: "John Technician",
    scheduledDate: "2023-10-15",
    estimatedHours: 2
  },
  {
    id: "mt-002",
    stationId: "cs-2150",
    stationName: "Downtown Hub Station 1",
    status: "in-progress",
    priority: "critical",
    type: "repair",
    description: "Power delivery issues - intermittent charging failures",
    assignedTo: "Sarah Engineer",
    scheduledDate: "2023-10-12",
    estimatedHours: 4
  },
  {
    id: "mt-003",
    stationId: "cs-3211",
    stationName: "East Campus Station 2",
    status: "completed",
    priority: "medium",
    type: "inspection",
    description: "Quarterly safety inspection and certification",
    assignedTo: "Mike Inspector",
    scheduledDate: "2023-10-05",
    completedDate: "2023-10-05",
    actualHours: 1.5
  },
  {
    id: "mt-004",
    stationId: "cs-1832",
    stationName: "West Terminal Station 5",
    status: "scheduled",
    priority: "low",
    type: "upgrade",
    description: "Software update to v4.2.1",
    assignedTo: "Tech Team",
    scheduledDate: "2023-10-18",
    estimatedHours: 1
  },
  {
    id: "mt-005",
    stationId: "cs-2150",
    stationName: "Downtown Hub Station 1",
    status: "delayed",
    priority: "medium",
    type: "repair",
    description: "Display panel replacement - parts on backorder",
    assignedTo: "John Technician",
    scheduledDate: "2023-10-08",
    estimatedHours: 1
  }
];

export default function StationMaintenancePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  
  // Filter the tasks based on the search query and filters
  const filteredTasks = MAINTENANCE_TASKS.filter(task => {
    // Search query filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !task.stationName.toLowerCase().includes(query) &&
        !task.description.toLowerCase().includes(query) &&
        !task.assignedTo.toLowerCase().includes(query) &&
        !task.stationId.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    
    // Status filtering
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    
    // Priority filtering
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    
    // Type filtering
    if (typeFilter !== 'all' && task.type !== typeFilter) {
      return false;
    }
    
    return true;
  });
  
  // Helper function for status badges
  const getStatusBadge = (status) => {
    switch(status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Scheduled</Badge>;
      case 'in-progress':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>;
      case 'delayed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Delayed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Helper function for priority indicators
  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Critical</Badge>;
      case 'high':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/ev-management/stations" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Station Maintenance</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Schedule and track maintenance for charging stations
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Maintenance Task</span>
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-10" 
              placeholder="Search by station, description, or assigned technician..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <div className="w-1/2">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-1/2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="upgrade">Upgrade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Upcoming Maintenance</CardTitle>
              <CardDescription>
                Scheduled maintenance tasks for charging stations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredTasks
                  .filter(task => task.status === 'scheduled' || task.status === 'delayed')
                  .map(task => (
                    <div key={task.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{task.stationName}</h3>
                          {task.status === 'delayed' && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline">{task.stationId}</Badge>
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{task.scheduledDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Est. {task.estimatedHours} hours</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Wrench className="h-4 w-4 text-gray-500" />
                          <span>{task.assignedTo}</span>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/ev-management/stations/${task.stationId}`}>
                              View Station
                            </Link>
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Start Task
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="in-progress" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>In Progress</CardTitle>
              <CardDescription>
                Maintenance tasks currently being worked on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredTasks
                  .filter(task => task.status === 'in-progress')
                  .map(task => (
                    <div key={task.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{task.stationName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline">{task.stationId}</Badge>
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Started: {task.scheduledDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Est. {task.estimatedHours} hours</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Wrench className="h-4 w-4 text-gray-500" />
                          <span>{task.assignedTo}</span>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/ev-management/stations/${task.stationId}`}>
                              View Station
                            </Link>
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            Complete Task
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Completed Maintenance</CardTitle>
              <CardDescription>
                Finished maintenance tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredTasks
                  .filter(task => task.status === 'completed')
                  .map(task => (
                    <div key={task.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{task.stationName}</h3>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline">{task.stationId}</Badge>
                          {getStatusBadge(task.status)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Completed: {task.completedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Time: {task.actualHours} hours</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Wrench className="h-4 w-4 text-gray-500" />
                          <span>{task.assignedTo}</span>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/ev-management/stations/${task.stationId}`}>
                              View Station
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            View Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled</p>
              <h4 className="text-2xl font-bold">3</h4>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
              <h4 className="text-2xl font-bold">1</h4>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
              <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <h4 className="text-2xl font-bold">8</h4>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Delayed</p>
              <h4 className="text-2xl font-bold">1</h4>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 