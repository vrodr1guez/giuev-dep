"use client";

import * as React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

const RoutePlanningPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Route Planning</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Optimize routes and charging schedules for your EV fleet
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">Refresh</Button>
          <Button size="sm">New Route</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500 p-8">
              <h3 className="text-lg font-medium text-gray-700">Interactive Map</h3>
              <p className="max-w-md mx-auto mt-2">
                This would be an interactive map showing all active routes, vehicle positions, 
                charging stations, and delivery destinations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Your active routes would be displayed here, with options to view details,
              edit routes, and see real-time status.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Route Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              AI-powered route optimization tools would be displayed here,
              helping you create the most efficient routes considering charging needs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoutePlanningPage; 