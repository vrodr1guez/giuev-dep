"use client";

import React from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Save, Server, Settings, 
  RefreshCw, ArrowRight, Check, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';

export default function DataMappingPage() {
  // Sample data fields from fleet management system
  const fleetFields = [
    { id: 1, name: 'vehicle_id', type: 'string', description: 'Unique identifier for the vehicle' },
    { id: 2, name: 'driver_id', type: 'string', description: 'Unique identifier for the driver' },
    { id: 3, name: 'route_id', type: 'string', description: 'Unique identifier for the route' },
    { id: 4, name: 'scheduled_departure', type: 'datetime', description: 'Scheduled departure time' },
    { id: 5, name: 'estimated_return', type: 'datetime', description: 'Estimated return time' },
    { id: 6, name: 'battery_level', type: 'number', description: 'Current battery level (%)' },
    { id: 7, name: 'estimated_range', type: 'number', description: 'Estimated range in miles' },
    { id: 8, name: 'maintenance_due', type: 'boolean', description: 'Whether maintenance is due' },
    { id: 9, name: 'last_charge', type: 'datetime', description: 'Last time the vehicle was charged' },
    { id: 10, name: 'location_lat', type: 'number', description: 'Current latitude coordinate' },
    { id: 11, name: 'location_lon', type: 'number', description: 'Current longitude coordinate' }
  ];

  // Sample data fields from EV charging system
  const chargingFields = [
    { id: 1, name: 'evVehicleId', type: 'string', description: 'Unique identifier for the vehicle in EV system' },
    { id: 2, name: 'batteryCapacity', type: 'number', description: 'Total battery capacity in kWh' },
    { id: 3, name: 'currentCharge', type: 'number', description: 'Current charge level in kWh' },
    { id: 4, name: 'chargePercentage', type: 'number', description: 'Current charge percentage (%)' },
    { id: 5, name: 'estimatedMileage', type: 'number', description: 'Estimated range in miles' },
    { id: 6, name: 'nextChargeTime', type: 'datetime', description: 'Next scheduled charging time' },
    { id: 7, name: 'chargingRate', type: 'number', description: 'Current charging rate in kW' },
    { id: 8, name: 'isCharging', type: 'boolean', description: 'Whether the vehicle is currently charging' },
    { id: 9, name: 'lastChargeCompleted', type: 'datetime', description: 'Last time charging was completed' },
    { id: 10, name: 'preferredStation', type: 'string', description: 'Preferred charging station ID' }
  ];

  // Sample mappings
  const mappings = [
    { fleetField: 'vehicle_id', evField: 'evVehicleId', status: 'mapped' },
    { fleetField: 'battery_level', evField: 'chargePercentage', status: 'mapped' },
    { fleetField: 'estimated_range', evField: 'estimatedMileage', status: 'mapped' },
    { fleetField: 'last_charge', evField: 'lastChargeCompleted', status: 'mapped' },
    { fleetField: 'maintenance_due', evField: null, status: 'unmapped' },
    { fleetField: 'location_lat', evField: null, status: 'unmapped' },
    { fleetField: 'location_lon', evField: null, status: 'unmapped' }
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
          <h1 className="text-3xl font-bold mb-2">Data Field Mapping</h1>
          <p className="text-gray-600">Define how data is mapped between your fleet management system and EV charging infrastructure</p>
        </div>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Save Mappings
        </Button>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 gap-2 p-1">
            <TabsTrigger value="current" className="rounded-md transition-all">
              <Server className="mr-2 h-4 w-4" />
              <span>Current Mappings</span>
            </TabsTrigger>
            <TabsTrigger value="available" className="rounded-md transition-all">
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Available Fields</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="rounded-md transition-all">
              <Settings className="mr-2 h-4 w-4" />
              <span>Advanced Configuration</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Current Mappings Tab */}
        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Current Data Field Mappings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
                <p className="text-sm text-blue-700">
                  These mappings determine how data is synchronized between your fleet management system and EV charging infrastructure.
                  Drag and drop fields to create new mappings or edit existing ones.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3">Fleet System Field</th>
                      <th scope="col" className="px-4 py-3 text-center">Direction</th>
                      <th scope="col" className="px-4 py-3">EV Charging Field</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map((mapping, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          {mapping.fleetField}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ArrowRight className="mx-auto h-4 w-4 text-gray-500" />
                        </td>
                        <td className="px-4 py-3">
                          {mapping.evField ? (
                            <span>{mapping.evField}</span>
                          ) : (
                            <span className="text-gray-400">Not mapped</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {mapping.status === 'mapped' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check className="mr-1 h-3 w-3" />
                              Mapped
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Unmapped
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="outline" size="sm" className="h-8">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="outline" className="mr-2">
                  Auto-Map Fields
                </Button>
                <Button variant="outline" className="text-red-600">
                  Clear All Mappings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Fields Tab */}
        <TabsContent value="available" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Fleet System Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="relative">
                    <Input 
                      type="search" 
                      placeholder="Search fleet fields..." 
                      className="pl-10"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto max-h-96 border rounded-md">
                    {fleetFields.map((field) => (
                      <div key={field.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                        <div className="font-medium">{field.name}</div>
                        <div className="text-xs text-gray-500 mt-1">Type: {field.type}</div>
                        <div className="text-xs text-gray-500">{field.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">EV Charging System Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="relative">
                    <Input 
                      type="search" 
                      placeholder="Search EV fields..." 
                      className="pl-10"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto max-h-96 border rounded-md">
                    {chargingFields.map((field) => (
                      <div key={field.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                        <div className="font-medium">{field.name}</div>
                        <div className="text-xs text-gray-500 mt-1">Type: {field.type}</div>
                        <div className="text-xs text-gray-500">{field.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Create New Mapping</h3>
            <p className="text-gray-600 mb-4">Drag fields from above and drop them here to create a new mapping</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 mb-4 bg-white">
              <p className="text-gray-500">Drop fields here to create a mapping</p>
            </div>
            <Button disabled>Create Mapping</Button>
          </div>
        </TabsContent>

        {/* Advanced Configuration Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Transform & Format Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 mb-6">
                <p className="text-sm text-yellow-700">
                  Advanced configuration allows you to transform data between systems.
                  Use these options when fields don't exactly match and need conversion.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="date-format" className="block mb-2 font-medium">Date Format</Label>
                  <select 
                    id="date-format" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="iso">ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)</option>
                    <option value="us">US Format (MM/DD/YYYY)</option>
                    <option value="eu">European Format (DD/MM/YYYY)</option>
                    <option value="unix">Unix Timestamp</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="unit-conversion" className="block mb-2 font-medium">Unit Conversion</Label>
                  <select 
                    id="unit-conversion" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="none">No Conversion</option>
                    <option value="miles-km">Miles ↔ Kilometers</option>
                    <option value="kwh-percent">kWh ↔ Percentage</option>
                    <option value="custom">Custom Formula</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="custom-formula" className="block mb-2 font-medium">Custom Formula</Label>
                  <Input 
                    id="custom-formula" 
                    type="text" 
                    placeholder="e.g. value * 1.60934 (for miles to km)"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="import-json" className="block mb-2 font-medium">Import/Export Mapping Configuration</Label>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      Import JSON
                    </Button>
                    <Button variant="outline">
                      Export JSON
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 