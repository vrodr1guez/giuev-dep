/// <reference path="../../types/react.d.ts" />
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowRight, Download, LineChart, BarChart, PieChart, Table, Plus, Trash, Save, FileText } from 'lucide-react';

interface Metric {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface Dimension {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface Filter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multi-select' | 'range';
  options?: string[];
  min?: number;
  max?: number;
}

interface FilterValue {
  id: string;
  value: any;
}

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  dimensions: string[];
  filters: FilterValue[];
  visualizationType: 'bar' | 'line' | 'pie' | 'table';
  dateRange: [Date, Date];
}

const ReportBuilder = () => {
  // Mock data - in a real app, this would come from an API
  const availableMetrics: Metric[] = [
    { id: 'energy_consumed', name: 'Energy Consumed (kWh)', category: 'energy', description: 'Total energy consumed by the fleet' },
    { id: 'energy_cost', name: 'Energy Cost ($)', category: 'energy', description: 'Total cost of energy consumed' },
    { id: 'charge_sessions', name: 'Charging Sessions', category: 'charging', description: 'Number of charging sessions' },
    { id: 'avg_soc', name: 'Average SoC (%)', category: 'battery', description: 'Average state of charge' },
    { id: 'avg_soh', name: 'Average SoH (%)', category: 'battery', description: 'Average state of health' },
    { id: 'miles_driven', name: 'Miles Driven', category: 'utilization', description: 'Total miles driven by the fleet' },
    { id: 'co2_saved', name: 'CO₂ Saved (kg)', category: 'environmental', description: 'Estimated CO₂ emissions saved' },
    { id: 'charging_time', name: 'Charging Time (h)', category: 'charging', description: 'Total time spent charging' },
    { id: 'driver_score', name: 'Driver Score', category: 'performance', description: 'Average driver efficiency score' },
  ];

  const availableDimensions: Dimension[] = [
    { id: 'date', name: 'Date', category: 'time', description: 'Group by date' },
    { id: 'week', name: 'Week', category: 'time', description: 'Group by week' },
    { id: 'month', name: 'Month', category: 'time', description: 'Group by month' },
    { id: 'vehicle', name: 'Vehicle', category: 'asset', description: 'Group by vehicle' },
    { id: 'driver', name: 'Driver', category: 'personnel', description: 'Group by driver' },
    { id: 'charging_station', name: 'Charging Station', category: 'infrastructure', description: 'Group by charging station' },
    { id: 'connector_type', name: 'Connector Type', category: 'infrastructure', description: 'Group by connector type' },
    { id: 'route', name: 'Route', category: 'operations', description: 'Group by route' },
    { id: 'fleet', name: 'Fleet', category: 'organization', description: 'Group by fleet' },
  ];

  const availableFilters: Filter[] = [
    { id: 'date_range', name: 'Date Range', type: 'date' },
    { id: 'vehicle', name: 'Vehicle', type: 'multi-select', options: ['Tesla Model Y', 'Tesla Model 3', 'Ford F-150 Lightning', 'Chevrolet Bolt', 'Rivian R1T'] },
    { id: 'driver', name: 'Driver', type: 'multi-select', options: ['John Smith', 'Emily Chen', 'Michael Brown', 'Sarah Johnson', 'David Wilson'] },
    { id: 'charging_station', name: 'Charging Station', type: 'multi-select', options: ['Main Depot', 'Downtown', 'East End', 'West Ottawa', 'South Mall'] },
    { id: 'soc_range', name: 'SoC Range (%)', type: 'range', min: 0, max: 100 },
    { id: 'soh_range', name: 'SoH Range (%)', type: 'range', min: 0, max: 100 },
  ];

  // State for the report configuration
  const [reportConfig, setReportConfig] = React.useState({
    id: 'new-report',
    name: 'New Report',
    description: '',
    type: 'custom' as const,
    dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()] as [Date, Date],
    metrics: [] as string[],
    filters: [] as any[],
    groupBy: [] as string[],
    dimensions: ['date'] as string[],
    visualization: 'table' as const,
    visualizationType: 'bar' as const,
    schedule: null as any
  } as ReportConfig);

  // State for saved reports
  const [savedReports, setSavedReports] = React.useState([] as ReportConfig[]);
  
  // Function to add a metric
  const addMetric = (metricId: string) => {
    if (!reportConfig.metrics.includes(metricId)) {
      setReportConfig({
        ...reportConfig,
        metrics: [...reportConfig.metrics, metricId]
      });
    }
  };

  // Function to remove a metric
  const removeMetric = (metricId: string) => {
    setReportConfig({
      ...reportConfig,
      metrics: reportConfig.metrics.filter((id: string) => id !== metricId)
    });
  };

  // Function to add a dimension
  const addDimension = (dimensionId: string) => {
    if (!reportConfig.dimensions.includes(dimensionId)) {
      setReportConfig({
        ...reportConfig,
        dimensions: [...reportConfig.dimensions, dimensionId]
      });
    }
  };

  // Function to remove a dimension
  const removeDimension = (dimensionId: string) => {
    if (reportConfig.dimensions.length > 1) {
      setReportConfig({
        ...reportConfig,
        dimensions: reportConfig.dimensions.filter((id: string) => id !== dimensionId)
      });
    }
  };

  // Function to add a filter
  const addFilter = (filterId: string) => {
    if (!reportConfig.filters.some((f: FilterValue) => f.id === filterId)) {
      setReportConfig({
        ...reportConfig,
        filters: [...reportConfig.filters, { id: filterId, value: null }]
      });
    }
  };

  // Function to remove a filter
  const removeFilter = (filterId: string) => {
    setReportConfig({
      ...reportConfig,
      filters: reportConfig.filters.filter((f: FilterValue) => f.id !== filterId)
    });
  };

  // Function to update filter value
  const updateFilterValue = (filterId: string, value: any) => {
    setReportConfig({
      ...reportConfig,
      filters: reportConfig.filters.map((f: FilterValue) => 
        f.id === filterId ? { ...f, value } : f
      )
    });
  };

  // Function to update visualization type
  const setVisualizationType = (type: 'bar' | 'line' | 'pie' | 'table') => {
    setReportConfig({
      ...reportConfig,
      visualizationType: type
    });
  };

  // Function to save current report
  const saveReport = () => {
    const newReport = {
      ...reportConfig,
      id: `report-${Date.now()}`,
    };
    setSavedReports([...savedReports, newReport]);
  };

  // Function to load saved report
  const loadReport = (report: ReportConfig) => {
    setReportConfig(report);
  };

  // Function to generate report (in a real app, this would call an API)
  const generateReport = () => {
    console.log('Generating report with config:', reportConfig);
    // This would typically call an API to generate the report
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Custom Report Builder</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveReport}>
            <Save className="h-4 w-4 mr-2" />
            Save Report
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Builder Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Report Name */}
                <div>
                  <label htmlFor="report-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Report Name
                  </label>
                  <input
                    id="report-name"
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={reportConfig.name}
                    onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                  />
                </div>

                {/* Report Description */}
                <div>
                  <label htmlFor="report-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="report-description"
                    rows={2}
                    className="w-full p-2 border rounded-md"
                    value={reportConfig.description}
                    onChange={(e) => setReportConfig({ ...reportConfig, description: e.target.value })}
                  />
                </div>

                {/* Visualization Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visualization Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant={reportConfig.visualizationType === 'bar' ? 'default' : 'outline'}
                      className="p-2 h-auto"
                      onClick={() => setVisualizationType('bar')}
                    >
                      <BarChart className="h-5 w-5 mx-auto" />
                    </Button>
                    <Button
                      variant={reportConfig.visualizationType === 'line' ? 'default' : 'outline'}
                      className="p-2 h-auto"
                      onClick={() => setVisualizationType('line')}
                    >
                      <LineChart className="h-5 w-5 mx-auto" />
                    </Button>
                    <Button
                      variant={reportConfig.visualizationType === 'pie' ? 'default' : 'outline'}
                      className="p-2 h-auto"
                      onClick={() => setVisualizationType('pie')}
                    >
                      <PieChart className="h-5 w-5 mx-auto" />
                    </Button>
                    <Button
                      variant={reportConfig.visualizationType === 'table' ? 'default' : 'outline'}
                      className="p-2 h-auto"
                      onClick={() => setVisualizationType('table')}
                    >
                      <Table className="h-5 w-5 mx-auto" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="metrics">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="metrics" className="flex-1">Metrics</TabsTrigger>
                  <TabsTrigger value="dimensions" className="flex-1">Dimensions</TabsTrigger>
                  <TabsTrigger value="filters" className="flex-1">Filters</TabsTrigger>
                </TabsList>
                
                <TabsContent value="metrics">
                  <div className="space-y-4">
                    <div className="mb-2 font-medium">Selected Metrics</div>
                    {reportConfig.metrics.length === 0 ? (
                      <p className="text-sm text-gray-500">No metrics selected. Select at least one metric.</p>
                    ) : (
                      <div className="space-y-2">
                        {reportConfig.metrics.map((metricId: string) => {
                          const metric = availableMetrics.find(m => m.id === metricId);
                          return metric ? (
                            <div key={metricId} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                              <div>
                                <div className="font-medium text-sm">{metric.name}</div>
                                <div className="text-xs text-gray-500">{metric.category}</div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => removeMetric(metricId)}>
                                <Trash className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="mb-2 font-medium">Available Metrics</div>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {availableMetrics
                          .filter(metric => !reportConfig.metrics.includes(metric.id))
                          .map(metric => (
                            <div 
                              key={metric.id} 
                              className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                              onClick={() => addMetric(metric.id)}
                            >
                              <div>
                                <div className="font-medium text-sm">{metric.name}</div>
                                <div className="text-xs text-gray-500">{metric.description}</div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="dimensions">
                  <div className="space-y-4">
                    <div className="mb-2 font-medium">Selected Dimensions</div>
                    {reportConfig.dimensions.length === 0 ? (
                      <p className="text-sm text-gray-500">No dimensions selected. Select at least one dimension.</p>
                    ) : (
                      <div className="space-y-2">
                        {reportConfig.dimensions.map((dimensionId: string) => {
                          const dimension = availableDimensions.find(d => d.id === dimensionId);
                          return dimension ? (
                            <div key={dimensionId} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                              <div>
                                <div className="font-medium text-sm">{dimension.name}</div>
                                <div className="text-xs text-gray-500">{dimension.category}</div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeDimension(dimensionId)}
                                disabled={reportConfig.dimensions.length <= 1}
                              >
                                <Trash className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="mb-2 font-medium">Available Dimensions</div>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {availableDimensions
                          .filter(dimension => !reportConfig.dimensions.includes(dimension.id))
                          .map(dimension => (
                            <div 
                              key={dimension.id} 
                              className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                              onClick={() => addDimension(dimension.id)}
                            >
                              <div>
                                <div className="font-medium text-sm">{dimension.name}</div>
                                <div className="text-xs text-gray-500">{dimension.description}</div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="filters">
                  <div className="space-y-4">
                    <div className="mb-2 font-medium">Applied Filters</div>
                    {reportConfig.filters.length === 0 ? (
                      <p className="text-sm text-gray-500">No filters applied. Filters are optional.</p>
                    ) : (
                      <div className="space-y-2">
                        {reportConfig.filters.map((filter: FilterValue) => {
                          const filterDef = availableFilters.find(f => f.id === filter.id);
                          return filterDef ? (
                            <div key={filter.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                              <div>
                                <div className="font-medium text-sm">{filterDef.name}</div>
                                <div className="text-xs text-gray-500">{filter.value || 'Not configured'}</div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => removeFilter(filter.id)}>
                                <Trash className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="mb-2 font-medium">Available Filters</div>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {availableFilters
                          .filter(filter => !reportConfig.filters.some((f: FilterValue) => f.id === filter.id))
                          .map(filter => (
                            <div 
                              key={filter.id} 
                              className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                              onClick={() => addFilter(filter.id)}
                            >
                              <div>
                                <div className="font-medium text-sm">{filter.name}</div>
                                <div className="text-xs text-gray-500">{filter.type}</div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6">
                <Button className="w-full" onClick={generateReport} disabled={reportConfig.metrics.length === 0}>
                  Generate Report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {reportConfig.metrics.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg h-96">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-500">No Data to Display</h3>
                  <p className="text-gray-400 text-center mt-2">
                    Select at least one metric to generate a report preview.
                  </p>
                </div>
              ) : (
                <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500">Report visualization will appear here</p>
                    <p className="text-sm text-gray-400 mt-1">Based on selected metrics, dimensions, and visualization type</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Saved Reports */}
      {savedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-3 font-medium">Report Name</th>
                    <th className="p-3 font-medium">Description</th>
                    <th className="p-3 font-medium">Metrics</th>
                    <th className="p-3 font-medium">Dimensions</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {savedReports.map((report: ReportConfig) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{report.name}</td>
                      <td className="p-3 text-gray-500">{report.description || '-'}</td>
                      <td className="p-3">{report.metrics.length} metrics</td>
                      <td className="p-3">{report.dimensions.join(', ')}</td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => loadReport(report)}
                          >
                            Load
                          </button>
                          <button className="text-gray-600 hover:text-gray-800">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportBuilder; 