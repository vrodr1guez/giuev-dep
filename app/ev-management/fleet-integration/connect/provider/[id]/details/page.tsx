"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckCircle, Star, Shield, Globe, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Button } from '../../../../../../components/ui/button';
import { Badge } from '../../../../../../components/ui/badge';

export default function ProviderDetailsPage({ params }: { params: { id: string } }) {
  // Mock provider data based on ID
  const providerData = {
    '1': {
      name: 'SAP Fleet Management',
      description: 'Enterprise-grade fleet management with advanced analytics and predictive maintenance.',
      rating: 4.9,
      reviews: 1247,
      setupTime: '8 minutes',
      tier: 'Enterprise',
      pricing: 'Enterprise',
      security: ['SOC2', 'ISO27001', 'GDPR'],
      features: [
        'Real-time Vehicle Telemetry',
        'Predictive Maintenance',
        'Driver Analytics',
        'Route Optimization',
        'Fuel Management',
        'Compliance Tracking'
      ]
    },
    '2': {
      name: 'Oracle Transportation Management',
      description: 'Comprehensive transportation and logistics management with AI optimization.',
      rating: 4.8,
      reviews: 892,
      setupTime: '12 minutes',
      tier: 'Enterprise',
      pricing: 'Enterprise',
      security: ['SOC2', 'ISO27001', 'HIPAA'],
      features: [
        'Logistics Optimization',
        'Transportation Analytics',
        'Supply Chain Data',
        'Cost Management',
        'Performance KPIs',
        'Regulatory Compliance'
      ]
    }
    // Add more providers as needed
  };

  const provider = providerData[params.id] || providerData['1'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6">
        {/* Navigation */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/ev-management/fleet-integration/connect" className="flex items-center hover:text-blue-600 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Integration Hub
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {provider.name}
          </h1>
          <p className="text-gray-600 text-lg">{provider.description}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-700">Setup Time</h4>
                    <p className="text-2xl font-bold text-blue-600">{provider.setupTime}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Service Tier</h4>
                    <p className="text-2xl font-bold text-green-600">{provider.tier}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Key Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {provider.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {provider.security.map((cert, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Shield className="w-4 h-4 mr-2" />
                      {cert} Certified
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Provider Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-500 mb-2">{provider.rating}</div>
                  <div className="flex justify-center items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(provider.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">Based on {provider.reviews} reviews</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/ev-management/fleet-integration/connect/provider/${params.id}/preview`}>
                  <Button className="w-full" variant="outline">
                    <Globe className="w-4 h-4 mr-2" />
                    Live Preview
                  </Button>
                </Link>
                <Link href={`/ev-management/fleet-integration/connect/provider/${params.id}/auth`}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Code className="w-4 h-4 mr-2" />
                    Start Integration
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 