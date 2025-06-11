"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Save, 
  Trash, 
  Info,
  MapPin,
  PlugZap, 
  Power, 
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Textarea } from '../../../../components/ui/textarea';
import { Switch } from '../../../../components/ui/switch';

// Mock station data identical to detail page
const getStationData = (id) => {
  return {
    id,
    name: "Headquarters Station 3",
    location: "Main Campus Building A",
    coordinates: "37.7749,-122.4194",
    status: "active",
    lastMaintenance: "2023-08-15",
    nextMaintenance: "2023-11-15",
    installDate: "2022-05-10",
    model: "PowerCharge Pro 350",
    manufacturer: "ElectroFlow",
    firmwareVersion: "v4.2.1",
    connectorTypes: ["CCS", "CHAdeMO"],
    maxPower: 350,
    totalPorts: 4,
    availablePorts: 2,
    notes: "Located near the north entrance. Access requires keycard after business hours.",
    customId: "HQ-CS-03",
    firmwareAutoUpdate: true,
    accessRestriction: "keycard",
    networkConnection: "ethernet",
    networkId: "LAN-255",
    publiclyListed: true,
    supportContact: "support@electroflow.com",
    maintenanceSchedule: "quarterly"
  };
};

export default function EditStationPage({ params }) {
  const router = useRouter();
  const stationId = params.id;
  const stationInitial = getStationData(stationId);
  
  // State for form values
  const [station, setStation] = React.useState(stationInitial);
  const [activeTab, setActiveTab] = React.useState('general');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStation(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (name, checked) => {
    setStation(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setStation(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!station.name) newErrors.name = "Station name is required";
    if (!station.location) newErrors.location = "Location is required";
    if (!station.manufacturer) newErrors.manufacturer = "Manufacturer is required";
    if (!station.model) newErrors.model = "Model is required";
    if (!station.maxPower) newErrors.maxPower = "Max power is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      console.log("Station data updated:", station);
      setIsSubmitting(false);
      // Navigate back to station detail page
      router.push(`/ev-management/stations/${stationId}`);
    }, 1000);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link 
            href={`/ev-management/stations/${stationId}`} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Station</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              ID: {stationId} · {station.customId}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="destructive" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            <span className="hidden sm:inline">Delete Station</span>
          </Button>
          
          <Button 
            type="submit"
            form="station-form"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4" />
            <span>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </span>
          </Button>
        </div>
      </div>
      
      {/* Edit Form */}
      <form id="station-form" onSubmit={handleSubmit}>
        <Tabs defaultValue="general" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="access">Access & Network</TabsTrigger>
          </TabsList>
          
          {/* General Information Tab */}
          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Station Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Station Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={station.name}
                      onChange={handleChange}
                      placeholder="Enter station name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  
                  {/* Custom ID */}
                  <div className="space-y-2">
                    <Label htmlFor="customId" className="flex items-center gap-1">
                      Custom ID
                      <Info className="h-4 w-4 text-gray-400" />
                    </Label>
                    <Input
                      id="customId"
                      name="customId"
                      value={station.customId}
                      onChange={handleChange}
                      placeholder="Optional identifier"
                    />
                  </div>
                  
                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={station.location}
                      onChange={handleChange}
                      placeholder="Building, floor, area, etc."
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location}</p>
                    )}
                  </div>
                  
                  {/* Coordinates */}
                  <div className="space-y-2">
                    <Label htmlFor="coordinates" className="flex items-center gap-1">
                      GPS Coordinates
                      <Info className="h-4 w-4 text-gray-400" />
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="coordinates"
                        name="coordinates"
                        value={station.coordinates}
                        onChange={handleChange}
                        placeholder="Latitude, Longitude"
                      />
                      <Button type="button" variant="outline" className="shrink-0">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Install Date */}
                  <div className="space-y-2">
                    <Label htmlFor="installDate">
                      Installation Date
                    </Label>
                    <Input
                      id="installDate"
                      name="installDate"
                      type="date"
                      value={station.installDate}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">
                      Current Status
                    </Label>
                    <Select 
                      value={station.status} 
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Operational</SelectItem>
                        <SelectItem value="maintenance">In Maintenance</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Notes */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={station.notes}
                      onChange={handleChange}
                      placeholder="Additional information about this station"
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Technical Specifications Tab */}
          <TabsContent value="technical" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Manufacturer */}
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">
                      Manufacturer <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="manufacturer"
                      name="manufacturer"
                      value={station.manufacturer}
                      onChange={handleChange}
                      placeholder="Manufacturer name"
                      className={errors.manufacturer ? "border-red-500" : ""}
                    />
                    {errors.manufacturer && (
                      <p className="text-sm text-red-500">{errors.manufacturer}</p>
                    )}
                  </div>
                  
                  {/* Model */}
                  <div className="space-y-2">
                    <Label htmlFor="model">
                      Model <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="model"
                      name="model"
                      value={station.model}
                      onChange={handleChange}
                      placeholder="Model name/number"
                      className={errors.model ? "border-red-500" : ""}
                    />
                    {errors.model && (
                      <p className="text-sm text-red-500">{errors.model}</p>
                    )}
                  </div>
                  
                  {/* Firmware Version */}
                  <div className="space-y-2">
                    <Label htmlFor="firmwareVersion">
                      Firmware Version
                    </Label>
                    <Input
                      id="firmwareVersion"
                      name="firmwareVersion"
                      value={station.firmwareVersion}
                      onChange={handleChange}
                      placeholder="Current firmware version"
                    />
                  </div>
                  
                  {/* Auto Update Firmware */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="firmwareAutoUpdate">
                        Auto-update Firmware
                      </Label>
                      <Switch
                        id="firmwareAutoUpdate"
                        checked={station.firmwareAutoUpdate}
                        onCheckedChange={(checked) => handleCheckboxChange('firmwareAutoUpdate', checked)}
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow station to automatically install firmware updates
                    </p>
                  </div>
                  
                  {/* Maximum Power */}
                  <div className="space-y-2">
                    <Label htmlFor="maxPower">
                      Maximum Power (kW) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="maxPower"
                      name="maxPower"
                      type="number"
                      value={station.maxPower}
                      onChange={handleChange}
                      placeholder="Maximum charging power"
                      className={errors.maxPower ? "border-red-500" : ""}
                    />
                    {errors.maxPower && (
                      <p className="text-sm text-red-500">{errors.maxPower}</p>
                    )}
                  </div>
                  
                  {/* Total Ports */}
                  <div className="space-y-2">
                    <Label htmlFor="totalPorts">
                      Number of Charging Ports
                    </Label>
                    <Input
                      id="totalPorts"
                      name="totalPorts"
                      type="number"
                      value={station.totalPorts}
                      onChange={handleChange}
                      min={1}
                      max={12}
                    />
                  </div>
                  
                  {/* Connector Types */}
                  <div className="space-y-3 md:col-span-2">
                    <Label>
                      Connector Types
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="connector-ccs" 
                          checked={station.connectorTypes.includes('CCS')}
                          onCheckedChange={(checked) => {
                            const newTypes = checked 
                              ? [...station.connectorTypes, 'CCS'] 
                              : station.connectorTypes.filter(t => t !== 'CCS');
                            handleSelectChange('connectorTypes', newTypes);
                          }}
                        />
                        <label htmlFor="connector-ccs">CCS</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="connector-chademo" 
                          checked={station.connectorTypes.includes('CHAdeMO')}
                          onCheckedChange={(checked) => {
                            const newTypes = checked 
                              ? [...station.connectorTypes, 'CHAdeMO'] 
                              : station.connectorTypes.filter(t => t !== 'CHAdeMO');
                            handleSelectChange('connectorTypes', newTypes);
                          }}
                        />
                        <label htmlFor="connector-chademo">CHAdeMO</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="connector-type2" 
                          checked={station.connectorTypes.includes('Type 2')}
                          onCheckedChange={(checked) => {
                            const newTypes = checked 
                              ? [...station.connectorTypes, 'Type 2'] 
                              : station.connectorTypes.filter(t => t !== 'Type 2');
                            handleSelectChange('connectorTypes', newTypes);
                          }}
                        />
                        <label htmlFor="connector-type2">Type 2</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="connector-tesla" 
                          checked={station.connectorTypes.includes('Tesla')}
                          onCheckedChange={(checked) => {
                            const newTypes = checked 
                              ? [...station.connectorTypes, 'Tesla'] 
                              : station.connectorTypes.filter(t => t !== 'Tesla');
                            handleSelectChange('connectorTypes', newTypes);
                          }}
                        />
                        <label htmlFor="connector-tesla">Tesla</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Maintenance Schedule */}
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceSchedule">
                      Maintenance Schedule
                    </Label>
                    <Select 
                      value={station.maintenanceSchedule} 
                      onValueChange={(value) => handleSelectChange('maintenanceSchedule', value)}
                    >
                      <SelectTrigger id="maintenanceSchedule">
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="biannual">Bi-annual</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Next Maintenance */}
                  <div className="space-y-2">
                    <Label htmlFor="nextMaintenance">
                      Next Scheduled Maintenance
                    </Label>
                    <Input
                      id="nextMaintenance"
                      name="nextMaintenance"
                      type="date"
                      value={station.nextMaintenance}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Access & Network Tab */}
          <TabsContent value="access" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Access & Network Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Access Restriction */}
                  <div className="space-y-2">
                    <Label htmlFor="accessRestriction">
                      Access Restriction
                    </Label>
                    <Select 
                      value={station.accessRestriction} 
                      onValueChange={(value) => handleSelectChange('accessRestriction', value)}
                    >
                      <SelectTrigger id="accessRestriction">
                        <SelectValue placeholder="Select access type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Public)</SelectItem>
                        <SelectItem value="keycard">Keycard Required</SelectItem>
                        <SelectItem value="pin">PIN Required</SelectItem>
                        <SelectItem value="app">Mobile App Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Publicly Listed */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="publiclyListed">
                        Publicly Listed
                      </Label>
                      <Switch
                        id="publiclyListed"
                        checked={station.publiclyListed}
                        onCheckedChange={(checked) => handleCheckboxChange('publiclyListed', checked)}
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Show this station on public charging maps
                    </p>
                  </div>
                  
                  {/* Network Connection */}
                  <div className="space-y-2">
                    <Label htmlFor="networkConnection">
                      Network Connection Type
                    </Label>
                    <Select 
                      value={station.networkConnection} 
                      onValueChange={(value) => handleSelectChange('networkConnection', value)}
                    >
                      <SelectTrigger id="networkConnection">
                        <SelectValue placeholder="Select connection type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wifi">Wi-Fi</SelectItem>
                        <SelectItem value="ethernet">Ethernet</SelectItem>
                        <SelectItem value="cellular">Cellular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Network ID */}
                  <div className="space-y-2">
                    <Label htmlFor="networkId">
                      Network ID
                    </Label>
                    <Input
                      id="networkId"
                      name="networkId"
                      value={station.networkId}
                      onChange={handleChange}
                      placeholder="Network identifier"
                    />
                  </div>
                  
                  {/* Support Contact */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="supportContact">
                      Support Contact
                    </Label>
                    <Input
                      id="supportContact"
                      name="supportContact"
                      value={station.supportContact}
                      onChange={handleChange}
                      placeholder="Email or phone for support"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Form Actions (Fixed Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <Button 
            type="button" 
            variant="ghost"
            onClick={() => router.push(`/ev-management/stations/${stationId}`)}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        <div className="h-16">
          {/* Spacer to prevent content from being hidden behind fixed bottom bar */}
        </div>
      </form>
    </div>
  );
} 