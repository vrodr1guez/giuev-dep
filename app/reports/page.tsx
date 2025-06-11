"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, BarChart, PieChart, Download, 
  Calendar, Filter, RefreshCw, Clock, 
  ArrowRight, AlertTriangle, CheckCircle,
  TrendingUp, Users, DollarSign, Zap
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';

export default function ReportsPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [reportsData, setReportsData] = useState(null);
  
  // Fetch real-time data
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/dashboard/metrics');
        if (response.ok) {
          const data = await response.json();
          setReportsData(data);
        }
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
        setReportsData(mockReportsData);
      }
    };
    
    fetchReportsData();
  }, []);
  
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/dashboard/metrics');
      if (response.ok) {
        const data = await response.json();
        setReportsData(data);
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
    setTimeout(() => setIsLoading(false), 1500);
  };
  
  // Mock data
  const mockReportsData = {
    totalReports: 27,
    generatedThisMonth: 12,
    scheduledReports: 4,
    storageUsed: 156
  };
  
  // Sample report types with enhanced data
  const reportTypes = [
    { 
      id: 1, 
      name: 'Energy Consumption', 
      description: 'Track and analyze energy usage patterns and trends',
      icon: <BarChart className="h-10 w-10 text-blue-500" />,
      available: 5,
      lastGenerated: '2 hours ago',
      trend: '+12%',
      size: '24.5 MB'
    },
    { 
      id: 2, 
      name: 'Fleet Performance', 
      description: 'Comprehensive analysis of vehicle efficiency and utilization',
      icon: <PieChart className="h-10 w-10 text-purple-500" />,
      available: 8,
      lastGenerated: '1 day ago',
      trend: '+8%',
      size: '18.2 MB'
    },
    { 
      id: 3, 
      name: 'Charging Analytics', 
      description: 'Insights on charging patterns, costs, and optimization',
      icon: <Zap className="h-10 w-10 text-green-500" />,
      available: 3,
      lastGenerated: '3 days ago',
      trend: '+5%',
      size: '12.8 MB'
    }
  ];
  
  // Enhanced recent reports
  const recentReports = [
    { 
      id: 'RPT-001', 
      name: 'Monthly Fleet Performance', 
      type: 'PDF', 
      date: '2024-06-01', 
      size: '2.4 MB',
      status: 'Available',
      downloads: 23,
      category: 'Performance'
    },
    { 
      id: 'RPT-002', 
      name: 'Energy Consumption Q2', 
      type: 'Excel', 
      date: '2024-05-15',
      size: '4.1 MB', 
      status: 'Available',
      downloads: 45,
      category: 'Energy'
    },
    { 
      id: 'RPT-003', 
      name: 'Driver Efficiency Analysis', 
      type: 'PDF', 
      date: '2024-05-10',
      size: '1.8 MB', 
      status: 'Available',
      downloads: 12,
      category: 'Efficiency'
    },
    { 
      id: 'RPT-004', 
      name: 'Maintenance Cost Report', 
      type: 'PDF', 
      date: '2024-05-01',
      size: '3.2 MB', 
      status: 'Available',
      downloads: 18,
      category: 'Maintenance'
    },
    { 
      id: 'RPT-005', 
      name: 'Carbon Emissions Reduction', 
      type: 'Excel', 
      date: '2024-04-15',
      size: '5.6 MB', 
      status: 'Available',
      downloads: 34,
      category: 'Environmental'
    }
  ];

  // Sample analytics data
  const data = reportsData || mockReportsData;
  
  // Chart data for report trends
  const reportTrendsData = [
    { month: 'Jan', generated: 18, downloaded: 156, size: 245 },
    { month: 'Feb', generated: 22, downloaded: 189, size: 312 },
    { month: 'Mar', generated: 19, downloaded: 167, size: 278 },
    { month: 'Apr', generated: 25, downloaded: 203, size: 356 },
    { month: 'May', generated: 28, downloaded: 234, size: 398 },
    { month: 'Jun', generated: 24, downloaded: 198, size: 342 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 pt-20 pb-20">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Analytics & Reporting
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Generate, view, and analyze reports for your EV fleet operations
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </motion.div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reports</p>
                    <h3 className="text-3xl font-bold mt-1">{data.totalReports}</h3>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {data.generatedThisMonth} generated this month
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled Reports</p>
                    <h3 className="text-3xl font-bold mt-1">{data.scheduledReports}</h3>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Clock className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-600 dark:text-purple-400">
                    Next report in 2 days
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Popular</p>
                    <h3 className="text-2xl font-bold mt-1">Energy</h3>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Users className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    45 downloads this month
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage Used</p>
                    <h3 className="text-3xl font-bold mt-1">{data.storageUsed} MB</h3>
                  </div>
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <BarChart className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-sm text-amber-600 dark:text-amber-400">
                    15.6% of available storage
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Report Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Report Generation Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="generated" stroke="#3b82f6" strokeWidth={2} name="Reports Generated" />
                    <Line type="monotone" dataKey="downloaded" stroke="#10b981" strokeWidth={2} name="Downloads" />
                    <Area type="monotone" dataKey="size" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Storage (MB)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      
        {/* Enhanced Tabs for different report views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Tabs defaultValue="overview" onValueChange={setSelectedTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 md:w-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm">
              <TabsTrigger value="overview">
                <BarChart className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="reports">
                <FileText className="h-4 w-4 mr-2" />
                Available Reports
              </TabsTrigger>
              <TabsTrigger value="scheduled">
                <Calendar className="h-4 w-4 mr-2" />
                Scheduled Reports
              </TabsTrigger>
            </TabsList>
            
            {/* Enhanced Overview Tab Content */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reportTypes.map((reportType, index) => (
                  <motion.div
                    key={reportType.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="border-none shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-full">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{reportType.name}</CardTitle>
                          <div className="flex flex-col gap-1">
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                              {reportType.available} Available
                            </Badge>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                              {reportType.trend}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center py-6">
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full">
                            {reportType.icon}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4">
                          {reportType.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              Last generated
                            </span>
                            <span>{reportType.lastGenerated}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              Total size
                            </span>
                            <span>{reportType.size}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                            Generate
                          </Button>
                          <Button variant="outline" className="flex-1">
                            View Reports
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            {/* Enhanced Available Reports Tab Content */}
            <TabsContent value="reports" className="mt-6">
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Available Reports</CardTitle>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Input placeholder="Search reports..." className="pl-10 w-full md:w-64" />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th scope="col" className="px-4 py-3">Report Name</th>
                          <th scope="col" className="px-4 py-3">Type</th>
                          <th scope="col" className="px-4 py-3">Category</th>
                          <th scope="col" className="px-4 py-3">Generated Date</th>
                          <th scope="col" className="px-4 py-3">Size</th>
                          <th scope="col" className="px-4 py-3">Downloads</th>
                          <th scope="col" className="px-4 py-3">Status</th>
                          <th scope="col" className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentReports.map((report, index) => (
                          <motion.tr
                            key={report.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="px-4 py-3 font-medium">
                              <div>{report.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{report.id}</div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={`${
                                report.type === 'PDF' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                                {report.type}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-xs">
                                {report.category}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500 dark:text-gray-400" />
                                <span>{report.date}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{report.size}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <Download className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                <span>{report.downloads}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                <span>{report.status}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Download className="h-3.5 w-3.5 mr-1.5" />
                                  Download
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Enhanced Scheduled Reports Tab Content */}
            <TabsContent value="scheduled" className="mt-6">
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle>Scheduled Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-12 text-center">
                    <div className="max-w-md">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Calendar className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Schedule Automated Reports</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                          Set up recurring reports to be automatically generated and delivered to you or your team.
                        </p>
                        <div className="space-y-3">
                          <Button className="w-full">Set Up New Schedule</Button>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm">Daily Reports</Button>
                            <Button variant="outline" size="sm">Weekly Reports</Button>
                            <Button variant="outline" size="sm">Monthly Reports</Button>
                            <Button variant="outline" size="sm">Custom Schedule</Button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
        
        {/* Enhanced Additional Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  Data Export Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Export your data in various formats for external analysis or backup purposes.
                </p>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Export to Excel
                    <Badge className="ml-auto">XLSX</Badge>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Export to CSV
                    <Badge className="ml-auto">CSV</Badge>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Bulk Download
                    <Badge className="ml-auto">ZIP</Badge>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart className="h-4 w-4 mr-2" />
                    API Export
                    <Badge className="ml-auto">JSON</Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Report Archive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Access your historical reports from previous months and years.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      2024 Archives
                    </span>
                    <div className="flex items-center">
                      <Badge className="mr-2">24 reports</Badge>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      2023 Archives
                    </span>
                    <div className="flex items-center">
                      <Badge className="mr-2">67 reports</Badge>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      2022 Archives
                    </span>
                    <div className="flex items-center">
                      <Badge className="mr-2">43 reports</Badge>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 