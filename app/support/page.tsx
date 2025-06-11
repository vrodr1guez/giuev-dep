"use client";

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  MessageSquare, 
  Search,
  Info,
  ChevronRight,
  ChevronDown,
  User,
  Calendar
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null as string | null);
  
  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };
  
  const faqs = [
    {
      id: 'faq-1',
      question: 'How do I add a new charging station to my network?',
      answer: 'To add a new charging station, navigate to the Charging Stations page and click the "Add Station" button. Fill in the required information including location, charger type, and network configuration. Once saved, the station will be added to your network and available for monitoring.'
    },
    {
      id: 'faq-2',
      question: 'What do the different station status indicators mean?',
      answer: 'Station status indicators provide at-a-glance information about your charging stations. Green (Available) means the station is operational and ready for use. Blue (In Use) indicates the station is currently being used. Amber (Maintenance) shows the station is undergoing scheduled maintenance. Red (Error) indicates a problem that requires attention.'
    },
    {
      id: 'faq-3',
      question: 'How can I export charging data for billing purposes?',
      answer: 'To export charging data, go to the Analytics page and select the date range you need. Click the "Export" button in the top right corner and choose your preferred format (CSV, Excel, or PDF). You can filter the data by station, vehicle, or user before exporting to get exactly what you need for billing.'
    },
    {
      id: 'faq-4',
      question: 'How do I set up alert notifications for my charging stations?',
      answer: 'To set up alerts, navigate to Settings > Notifications. You can configure alerts for various events such as station errors, completed charging sessions, or maintenance reminders. Choose your preferred notification method (email, SMS, or in-app) and set the priority level for each alert type.'
    },
    {
      id: 'faq-5',
      question: 'What should I do if a charging station shows an error status?',
      answer: 'If a station shows an error status, first check the specific error code in the station details page. Many common issues can be resolved remotely by using the "Reset Station" function. If that doesn\'t work, you can create a maintenance ticket directly from the error notification, which will dispatch a technician to the location.'
    }
  ];
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Help & Support
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Get assistance with your EV charging infrastructure
          </p>
        </div>
        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Contact Support</span>
        </Button>
      </div>
      
      {/* Search bar */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input 
          className="pl-10 py-6 text-lg" 
          placeholder="Search for help topics..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Quick support options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Documentation</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Browse detailed guides and technical documentation
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/support/documentation">
                  View Documentation
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Support Tickets</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Create and track support requests
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/support/tickets">
                  Submit a Ticket
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Info className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Knowledge Base</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Explore FAQs and troubleshooting guides
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/support/knowledge-base">
                  Browse Articles
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Frequently Asked Questions */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card 
              key={faq.id}
              className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <button
                className="w-full text-left p-4 flex justify-between items-center"
                onClick={() => toggleFaq(faq.id)}
              >
                <h3 className="font-medium">{faq.question}</h3>
                <ChevronDown 
                  className={`h-5 w-5 text-gray-500 transition-transform ${
                    expandedFaq === faq.id ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>
              
              {expandedFaq === faq.id && (
                <CardContent className="pt-0 pb-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-gray-600 dark:text-gray-300">
                    {faq.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-6">
          <Button variant="outline" asChild>
            <Link href="/support/knowledge-base">
              View All FAQs
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Support Channels */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Contact Support</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                <span>Submit a Support Request</span>
              </CardTitle>
              <CardDescription>
                Get help from our technical support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input id="subject" placeholder="Brief description of your issue" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category</label>
                  <select 
                    id="category"
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="">Select a category</option>
                    <option value="account">Account & Billing</option>
                    <option value="technical">Technical Issue</option>
                    <option value="station">Charging Station Problem</option>
                    <option value="app">Mobile App Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea 
                    id="description" 
                    placeholder="Please provide details about your issue..." 
                    rows={4}
                  />
                </div>
                
                <div className="pt-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <ChevronRight className="mr-2 h-4 w-4" />
                    <span>Submit Request</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-green-600" />
                  <span>Call Us</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Available Monday - Friday, 8am - 6pm EST
                </p>
                <div className="text-lg font-medium">+1 (555) 123-4567</div>
                <div className="flex items-center mt-4 text-sm">
                  <span className="mr-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Available now
                  </span>
                  <span className="text-gray-500">Average wait time: 5 minutes</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-purple-600" />
                  <span>Email Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  24/7 email support with response within 24 hours
                </p>
                <div className="text-lg font-medium">support@giuevcharging.com</div>
                <Button variant="outline" size="sm" className="mt-4 flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <span>Copy Email Address</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Popular Resources */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Popular Resources</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/support/documentation/getting-started">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Getting Started Guide</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Complete setup instructions for new users</p>
              </div>
            </div>
          </Link>
          
          <Link href="/support/documentation/network-configuration">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-600 dark:text-purple-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Network Configuration</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Learn how to set up your charging network</p>
              </div>
            </div>
          </Link>
          
          <Link href="/support/documentation/troubleshooting">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-amber-600 dark:text-amber-400">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Troubleshooting Guide</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Solutions for common charging issues</p>
              </div>
            </div>
          </Link>
          
          <Link href="/support/documentation/api-reference">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded text-green-600 dark:text-green-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">API Documentation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Integration guides and API reference</p>
              </div>
            </div>
          </Link>
          
          <Link href="/support/documentation/billing">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Billing & Reports</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">How to manage billing and generate reports</p>
              </div>
            </div>
          </Link>
          
          <Link href="/support/videos">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded text-red-600 dark:text-red-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Video Tutorials</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Step-by-step video guides for key features</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 