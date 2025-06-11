/// <reference path="../../types/react.d.ts" />
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Zap, MapPin, BatteryCharging, Settings } from 'lucide-react';

interface AddStationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: any) => void;
}

const AddStationDialog: React.FC<AddStationDialogProps> = ({ 
  open, 
  onOpenChange,
  onSubmit 
}) => {
  const [activeTab, setActiveTab] = useState('details');
  
  const handleSubmit = (e: any) => {
    e.preventDefault();
    // In a real implementation, we would collect form data and validate
    if (onSubmit) {
      onSubmit({
        // Form data would be collected here
      });
    }
    
    if (onOpenChange) {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <BatteryCharging className="h-4 w-4" />
          <span>Add Station</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <DialogTitle>Add Charging Station</DialogTitle>
          <DialogDescription>
            Enter the details of the new charging station to add it to your network.
          </DialogDescription>
        </div>
        
        <Tabs defaultValue={activeTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="connectors">Connectors</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Station Name</Label>
                <Input id="name" placeholder="e.g., Downtown Hub - Station 1" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="network">Network</Label>
                  <Select>
                    <SelectTrigger id="network">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Network</SelectItem>
                      <SelectItem value="partner">Partner Network</SelectItem>
                      <SelectItem value="public">Public Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Brief description of the charging station" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" placeholder="Any additional information about this station" />
              </div>
            </TabsContent>
            
            <TabsContent value="connectors" className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Connector 1</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="connector1-type">Connector Type</Label>
                      <Select>
                        <SelectTrigger id="connector1-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ccs">CCS</SelectItem>
                          <SelectItem value="chademo">CHAdeMO</SelectItem>
                          <SelectItem value="type2">Type 2</SelectItem>
                          <SelectItem value="tesla">Tesla</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="connector1-power">Power (kW)</Label>
                      <Input id="connector1-power" type="number" placeholder="e.g., 150" />
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Connector 2</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="connector2-type">Connector Type</Label>
                      <Select>
                        <SelectTrigger id="connector2-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ccs">CCS</SelectItem>
                          <SelectItem value="chademo">CHAdeMO</SelectItem>
                          <SelectItem value="type2">Type 2</SelectItem>
                          <SelectItem value="tesla">Tesla</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="connector2-power">Power (kW)</Label>
                      <Input id="connector2-power" type="number" placeholder="e.g., 150" />
                    </div>
                  </div>
                </div>
                
                <Button type="button" variant="outline" className="w-full">
                  + Add Another Connector
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="e.g., 123 Main St" />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="e.g., Ottawa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" placeholder="e.g., ON" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Postal Code</Label>
                  <Input id="zip" placeholder="e.g., K1P 1J1" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input id="latitude" placeholder="e.g., 45.4215" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input id="longitude" placeholder="e.g., -75.6972" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="locationNotes">Location Notes</Label>
                <Textarea id="locationNotes" placeholder="Parking details, access instructions, etc." />
              </div>
            </TabsContent>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange && onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Station</Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddStationDialog; 