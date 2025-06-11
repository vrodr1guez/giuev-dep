/// <reference path="../../types/react.d.ts" />
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  LayoutDashboard,
  Car,
  BatteryCharging,
  Map,
  BarChart,
  AlertTriangle,
  Settings,
  PlusCircle,
  CalendarPlus,
  MapPin,
  FileText,
  Menu,
  X,
  LayoutGrid
} from 'lucide-react';
import { Button } from "../../ui/button";
import { 
  Avatar, 
  AvatarFallback 
} from "../../ui/avatar";
import { Card } from "../../ui/card";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [showQuickActions, setShowQuickActions] = React.useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const mockUpcomingEvents = [
    {
      id: 'EVT001',
      type: 'maintenance',
      title: 'Maintenance',
      description: 'Vehicle EV012',
      time: 'Today',
      timeStatus: 'upcoming'
    },
    {
      id: 'EVT002',
      type: 'battery',
      title: 'Battery Check',
      description: '5 Vehicles',
      time: 'Tomorrow',
      timeStatus: 'scheduled'
    },
    {
      id: 'EVT003',
      type: 'route',
      title: 'Route Optimization',
      description: 'Weekly Schedule',
      time: 'In 2 days',
      timeStatus: 'scheduled'
    }
  ];

  const renderMobileMenu = () => {
    if (!isMobileMenuOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-900/90 z-50 lg:hidden">
        <div className="relative h-full max-w-xs w-full bg-gray-800 p-6 shadow-xl">
          <button 
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            onClick={toggleMobileMenu}
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center mb-8">
            <div className="font-bold text-lg">GIU AI EV Fleet</div>
          </div>
          
          <nav>
            <ul className="space-y-4">
              <li className="active">
                <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded-md bg-blue-900 text-blue-100">
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/vehicles" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors">
                  <Car size={20} />
                  <span>Vehicles</span>
                </Link>
              </li>
              <li>
                <Link href="/charging" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors">
                  <BatteryCharging size={20} />
                  <span>Charging</span>
                </Link>
              </li>
              <li>
                <Link href="/routes" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors">
                  <Map size={20} />
                  <span>Routes</span>
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors">
                  <BarChart size={20} />
                  <span>Analytics</span>
                </Link>
              </li>
              <li>
                <Link href="/alerts" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors">
                  <AlertTriangle size={20} />
                  <span>Alerts</span>
                </Link>
              </li>
              <li>
                <Link href="/settings" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors">
                  <Settings size={20} />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    );
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark' : 'light'} bg-gray-900 text-white min-h-screen`}>
      {/* Top Navigation Bar */}
      <header className="top-nav-bar flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={toggleMobileMenu}
          >
            <Menu size={24} />
          </button>
          <div className="logo font-bold text-lg">GIU AI EV Fleet</div>
          <button 
            className="hidden md:block lg:hidden text-gray-400 hover:text-white"
            onClick={toggleSidebar}
          >
            {isSidebarCollapsed ? <LayoutGrid size={20} /> : <Menu size={20} />}
          </button>
          <div className="global-search relative hidden md:block">
            <input 
              type="text" 
              placeholder="Search vehicles, stations..." 
              className="bg-gray-700 rounded-md px-3 py-2 pl-9 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="theme-toggle text-gray-400 hover:text-white"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <div className="notifications-dropdown relative">
            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </Button>
          </div>
          <div className="user-profile flex items-center gap-2">
            <Avatar className="w-8 h-8 bg-blue-600">
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">Admin</span>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex pt-16">
        {/* Left Sidebar Navigation */}
        <aside className={`sidebar ${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-800 h-screen fixed left-0 top-16 border-r border-gray-700 transition-all duration-300 hidden lg:block`}>
          <nav className="p-4">
            <ul className="space-y-2">
              <li className="active">
                <Link href="/dashboard" className={`flex items-center gap-3 p-2 rounded-md bg-blue-900 text-blue-100 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <LayoutDashboard size={20} />
                  {!isSidebarCollapsed && <span>Dashboard</span>}
                </Link>
              </li>
              <li>
                <Link href="/vehicles" className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <Car size={20} />
                  {!isSidebarCollapsed && <span>Vehicles</span>}
                </Link>
              </li>
              <li>
                <Link href="/charging" className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <BatteryCharging size={20} />
                  {!isSidebarCollapsed && <span>Charging</span>}
                </Link>
              </li>
              <li>
                <Link href="/routes" className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <Map size={20} />
                  {!isSidebarCollapsed && <span>Routes</span>}
                </Link>
              </li>
              <li>
                <Link href="/analytics" className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <BarChart size={20} />
                  {!isSidebarCollapsed && <span>Analytics</span>}
                </Link>
              </li>
              <li>
                <Link href="/alerts" className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <AlertTriangle size={20} />
                  {!isSidebarCollapsed && <span>Alerts</span>}
                </Link>
              </li>
              <li>
                <Link href="/settings" className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <Settings size={20} />
                  {!isSidebarCollapsed && <span>Settings</span>}
                </Link>
              </li>
            </ul>
          </nav>
          
          {!isSidebarCollapsed && (
            <div className="absolute bottom-4 left-0 right-0 p-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 border-dashed"
                onClick={toggleSidebar}
              >
                <Menu size={16} />
                <span>Collapse</span>
              </Button>
            </div>
          )}
          
          {isSidebarCollapsed && (
            <div className="absolute bottom-4 left-0 right-0 p-4 flex justify-center">
              <Button 
                variant="outline" 
                size="icon"
                className="border-dashed"
                onClick={toggleSidebar}
              >
                <ChevronDown size={16} className="rotate-90" />
              </Button>
            </div>
          )}
        </aside>

        {/* Main Dashboard Content */}
        <main className={`dashboard-content flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-6`}>
          {children}
        </main>

        {/* Right Sidebar for Quick Actions */}
        {showQuickActions && (
          <aside className="quick-actions-sidebar hidden xl:block w-72 bg-gray-800 h-screen fixed right-0 top-16 border-l border-gray-700 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Quick Actions</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowQuickActions(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <Button variant="default" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700">
                <PlusCircle size={16} />
                <span>Add New Vehicle</span>
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <CalendarPlus size={16} />
                <span>Schedule Charging</span>
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <MapPin size={16} />
                <span>Plan New Route</span>
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <FileText size={16} />
                <span>Generate Report</span>
              </Button>
            </div>
            
            <div className="mt-8 mb-4 border-t border-gray-700 pt-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CalendarPlus size={16} className="text-blue-400" />
                <span>Upcoming Events</span>
              </h3>
              
              <div className="space-y-3">
                {mockUpcomingEvents.map(event => (
                  <div key={event.id} className="bg-gray-700 p-3 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-gray-400">{event.description}</p>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        event.timeStatus === 'upcoming' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {event.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="link" className="text-sm text-blue-400 hover:text-blue-300 mt-2 pl-0">
                View all scheduled events
              </Button>
            </div>
          </aside>
        )}
      </div>
      
      {/* Mobile Navigation Menu */}
      {renderMobileMenu()}
    </div>
  );
};

export default DashboardLayout; 