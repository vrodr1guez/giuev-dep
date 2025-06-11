"use client";

import React, { useState } from 'react';
import { 
  Settings, User, Bell, Shield, 
  RefreshCw, Save, Check, ChevronRight, 
  Sun, Moon, Smartphone, Key
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

export default function SettingsPage() {
  const [currentTab, setCurrentTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [requestedAccess, setRequestedAccess] = useState(null as string | null);
  const [fadeIn, setFadeIn] = useState(true);
  
  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };
  
  const handleRequestAccess = (tab: string) => {
    setRequestedAccess(tab);
    setTimeout(() => {
      setRequestedAccess(null);
    }, 3000);
  };
  
  const handleTabChange = (tab: string) => {
    if (currentTab !== tab) {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentTab(tab);
        setFadeIn(true);
      }, 200);
    }
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6 bg-white dark:bg-gray-950 min-h-screen relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900 bg-[top_1rem_right_1rem] pointer-events-none" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='24' height='24' fill='none' stroke='%23f1f5f9' stroke-dasharray='1 4' stroke-linecap='round' stroke-linejoin='round' opacity='0.2'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E")`,
        backgroundSize: '24px 24px'
      }} aria-hidden="true"></div>
      
      <div className="relative z-10 mb-6">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Dashboard</span>
          <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 dark:text-gray-100">Settings</span>
          {currentTab !== 'account' && (
            <>
              <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 dark:text-gray-100">
                {currentTab === 'organization' && 'Organization'}
                {currentTab === 'team' && 'Team Members'}
                {currentTab === 'notifications' && 'Notifications'}
                {currentTab === 'security' && 'Security'}
                {currentTab === 'billing' && 'Billing'}
                {currentTab === 'integrations' && 'Integrations'}
                {currentTab === 'appearance' && 'Appearance'}
              </span>
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Settings
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your account, organization, and system preferences
            </p>
          </div>
          <div>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 relative z-10">
        <div className="lg:w-64 flex-shrink-0">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-none">
            <CardContent className="p-0">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">John Adams</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fleet Administrator</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-3">
                <div className="space-y-1.5">
                  <div className="mb-2 px-3 pt-3 pb-1">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User Settings
                    </h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start rounded-md group transition-all duration-200 ${currentTab === 'account' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}
                    onClick={() => handleTabChange('account')}
                  >
                    <User className={`mr-2 h-4 w-4 ${currentTab !== 'account' ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200' : ''}`} />
                    <span>Account</span>
                    {currentTab === 'account' && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start rounded-md group transition-all duration-200 ${currentTab === 'security' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}
                    onClick={() => handleTabChange('security')}
                  >
                    <Shield className={`mr-2 h-4 w-4 ${currentTab !== 'security' ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200' : ''}`} />
                    <span>Security</span>
                    {currentTab === 'security' && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start rounded-md group transition-all duration-200 ${currentTab === 'notifications' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}
                    onClick={() => setCurrentTab('notifications')}
                  >
                    <Bell className={`mr-2 h-4 w-4 ${currentTab !== 'notifications' ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200' : ''}`} />
                    <span>Notifications</span>
                    {currentTab === 'notifications' && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start rounded-md group transition-all duration-200 ${currentTab === 'appearance' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}
                    onClick={() => setCurrentTab('appearance')}
                  >
                    <Sun className={`mr-2 h-4 w-4 ${currentTab !== 'appearance' ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200' : ''}`} />
                    <span>Appearance</span>
                    {currentTab === 'appearance' && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Button>
                  
                  <div className="mb-2 mt-5 px-3 pt-3 pb-1">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Organization
                    </h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start rounded-md group transition-all duration-200 ${currentTab === 'organization' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}
                    onClick={() => setCurrentTab('organization')}
                  >
                    <Settings className={`mr-2 h-4 w-4 ${currentTab !== 'organization' ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200' : ''}`} />
                    <span>Organization</span>
                    {currentTab === 'organization' && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start rounded-md group transition-all duration-200 ${currentTab === 'team' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}
                    onClick={() => setCurrentTab('team')}
                  >
                    <User className={`mr-2 h-4 w-4 ${currentTab !== 'team' ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200' : ''}`} />
                    <span>Team Members</span>
                    {currentTab === 'team' && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start rounded-md group transition-all duration-200 ${currentTab === 'billing' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}
                    onClick={() => setCurrentTab('billing')}
                  >
                    <Settings className={`mr-2 h-4 w-4 ${currentTab !== 'billing' ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200' : ''}`} />
                    <span>Billing</span>
                    {currentTab === 'billing' && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start rounded-md group transition-all duration-200 ${currentTab === 'integrations' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'}`}
                    onClick={() => setCurrentTab('integrations')}
                  >
                    <Settings className={`mr-2 h-4 w-4 ${currentTab !== 'integrations' ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200' : ''}`} />
                    <span>Integrations</span>
                    {currentTab === 'integrations' && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Button>
                </div>
              </nav>
              
              <div className="p-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-white hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200 hover:border-red-600">
                  <Settings className="h-4 w-4" />
                  <span>Log Out</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex-1">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-none overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/10 dark:to-indigo-950/10 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  {currentTab === 'account' && (
                    <>
                      <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Account Settings
                    </>
                  )}
                  {currentTab === 'organization' && (
                    <>
                      <Settings className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Organization Settings
                    </>
                  )}
                  {currentTab === 'team' && (
                    <>
                      <User className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Team Members
                    </>
                  )}
                  {currentTab === 'notifications' && (
                    <>
                      <Bell className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Notification Preferences
                    </>
                  )}
                  {currentTab === 'security' && (
                    <>
                      <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Security Settings
                    </>
                  )}
                  {currentTab === 'billing' && (
                    <>
                      <Settings className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Billing & Subscription
                    </>
                  )}
                  {currentTab === 'integrations' && (
                    <>
                      <Settings className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      API & Integrations
                    </>
                  )}
                  {currentTab === 'appearance' && (
                    <>
                      <Sun className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Appearance & Localization
                    </>
                  )}
                </CardTitle>
                {currentTab === 'account' && <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">Active</Badge>}
                {currentTab === 'organization' && <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Premium</Badge>}
                {currentTab === 'team' && <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">3 Members</Badge>}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="animate-fadeIn transition-opacity duration-300">
                {currentTab === 'account' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Personal Information</h3>
                      
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input id="first-name" defaultValue="John" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input id="last-name" defaultValue="Adams" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="john.adams@example.com" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="text-lg font-medium">Preferences</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <select 
                          id="language" 
                          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                        >
                          <option value="en-US">English (US)</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select 
                          id="timezone" 
                          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                        >
                          <option value="America/New_York">Eastern Time (US & Canada)</option>
                          <option value="America/Chicago">Central Time (US & Canada)</option>
                          <option value="America/Denver">Mountain Time (US & Canada)</option>
                          <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="units">Distance Units</Label>
                        <div className="flex items-center border rounded overflow-hidden">
                          <button className="px-4 py-2 bg-blue-600 text-white">Miles</button>
                          <button className="px-4 py-2 bg-white dark:bg-gray-800">Kilometers</button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Account Actions</h3>
                        <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          Active
                        </Badge>
                      </div>
                      
                      <Button variant="outline" className="border-dashed border-gray-400 text-gray-600 dark:text-gray-400 w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Request Support
                      </Button>
                      
                      <Button variant="outline" className="text-red-600 w-full justify-start">
                        <span>Deactivate Account</span>
                      </Button>
                    </div>
                  </div>
                )}
                
                {currentTab === 'security' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Password</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" placeholder="••••••••" />
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" placeholder="••••••••" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" placeholder="••••••••" />
                        </div>
                      </div>
                      
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-2">
                        <Key className="mr-2 h-4 w-4" />
                        Update Password
                      </Button>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                      
                      <div className="flex items-center justify-between p-4 border border-green-100 dark:border-green-900/30 rounded-lg bg-green-50 dark:bg-green-900/10">
                        <div className="flex items-center gap-3">
                          <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-300">Two-factor authentication is enabled</p>
                            <p className="text-sm text-green-700 dark:text-green-400">Your account is secured with authenticator app</p>
                          </div>
                        </div>
                        <Button variant="outline" className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                          Manage
                        </Button>
                      </div>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Two-factor authentication adds an extra layer of security to your account. 
                        In addition to your password, you'll need to enter a code from your authenticator app when signing in.
                      </p>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="text-lg font-medium">Security Log</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800">
                          <div>
                            <p className="font-medium">Password changed</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">June 15, 2024 at 10:34 AM</p>
                          </div>
                          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            192.168.1.1
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800">
                          <div>
                            <p className="font-medium">Login successful</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">June 14, 2024 at 8:12 AM</p>
                          </div>
                          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            192.168.1.1
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800">
                          <div>
                            <p className="font-medium">Login successful</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">June 13, 2024 at 9:01 AM</p>
                          </div>
                          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            192.168.1.1
                          </Badge>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">View Full Security Log</Button>
                    </div>
                  </div>
                )}
                
                {currentTab === 'appearance' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Theme Preferences</h3>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4 flex flex-col items-center bg-white cursor-pointer border-blue-600">
                          <Sun className="h-8 w-8 mb-2 text-amber-500" />
                          <p className="font-medium">Light</p>
                          <div className="mt-2 bg-blue-600 text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4 flex flex-col items-center bg-gray-900 text-white cursor-pointer">
                          <Moon className="h-8 w-8 mb-2 text-indigo-400" />
                          <p className="font-medium">Dark</p>
                        </div>
                        
                        <div className="border rounded-lg p-4 flex flex-col items-center bg-gradient-to-b from-white to-gray-900 text-gray-800 cursor-pointer">
                          <Smartphone className="h-8 w-8 mb-2 text-purple-500" />
                          <p className="font-medium">System</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="text-lg font-medium">Layout Preferences</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="compact-mode">Compact Mode</Label>
                          <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-tooltips">Show Tooltips</Label>
                          <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="animations">UI Animations</Label>
                          <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="text-lg font-medium">Localization</h3>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="language-setting">Language</Label>
                          <select 
                            id="language-setting" 
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                          >
                            <option value="en-US">English (US)</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="date-format">Date Format</Label>
                          <select 
                            id="date-format" 
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="time-format">Time Format</Label>
                          <select 
                            id="time-format" 
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                          >
                            <option value="12h">12-hour (AM/PM)</option>
                            <option value="24h">24-hour</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentTab === 'organization' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Organization Information</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input id="org-name" defaultValue="GIU Electric Fleet" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="org-website">Website</Label>
                        <Input id="org-website" type="url" defaultValue="https://giu-fleet.example.com" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="org-address">Headquarters Address</Label>
                        <Input id="org-address" defaultValue="123 Energy Drive, San Francisco, CA 94105" />
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="text-lg font-medium">Branding</h3>
                      
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="primary-color">Primary Color</Label>
                          <div className="flex gap-2">
                            <Input id="primary-color" defaultValue="#3B82F6" />
                            <div className="h-10 w-10 rounded-md bg-blue-500 border border-gray-300 dark:border-gray-700" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="secondary-color">Secondary Color</Label>
                          <div className="flex gap-2">
                            <Input id="secondary-color" defaultValue="#4F46E5" />
                            <div className="h-10 w-10 rounded-md bg-indigo-600 border border-gray-300 dark:border-gray-700" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Logo</Label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                          <div className="mx-auto h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">
                            Logo
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Drag and drop or 
                            <Button variant="link" className="px-1">browse</Button>
                            to upload
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Recommended size: 512x512px, PNG or SVG
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="text-lg font-medium">Contact Information</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="support-email">Support Email</Label>
                        <Input id="support-email" type="email" defaultValue="support@giu-fleet.example.com" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="support-phone">Support Phone</Label>
                        <Input id="support-phone" type="tel" defaultValue="+1 (555) 123-4567" />
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-6">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
                        <Save className="mr-2 h-4 w-4" />
                        Save Organization Settings
                      </Button>
                    </div>
                  </div>
                )}
                
                {currentTab === 'team' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Team Members</h3>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
                        <User className="mr-2 h-4 w-4" />
                        Invite New Member
                      </Button>
                    </div>
                    
                    <div className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                  JA
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    John Adams
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Last active: Today
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">john.adams@example.com</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                Administrator
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Active
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">
                                Edit
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center text-pink-600 dark:text-pink-400">
                                  SJ
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Sarah Johnson
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Last active: Yesterday
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">sarah.johnson@example.com</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                Fleet Manager
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Active
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">
                                Edit
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                                  TB
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Tom Brooks
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Last active: 3 days ago
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">tom.brooks@example.com</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                Technician
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                Inactive
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">
                                Edit
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing 3 of 3 team members
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" disabled>Previous</Button>
                        <Button variant="outline" disabled>Next</Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentTab === 'billing' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Current Plan</h3>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-3 py-1">
                        Premium Fleet Manager
                      </Badge>
                      </div>
                      
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-5 border border-blue-100 dark:border-blue-900/30">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-300">Premium Fleet Manager</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-400">Billed annually</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">$499<span className="text-sm font-normal">/month</span></p>
                          <p className="text-sm text-blue-700 dark:text-blue-400">$5,988 billed annually</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                          <p className="text-sm">Unlimited charging stations</p>
                      </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                          <p className="text-sm">Advanced fleet analytics</p>
                    </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                          <p className="text-sm">24/7 priority support</p>
                          </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                          <p className="text-sm">Custom integrations</p>
                          </div>
                        </div>
                      
                      <div className="flex gap-3">
                        <Button variant="outline" className="border-blue-300 dark:border-blue-700">
                          Change Plan
                        </Button>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
                          Download Invoices
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                      <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                      
                      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-8 bg-blue-900 dark:bg-blue-800 rounded mr-4 flex items-center justify-center text-white text-xs font-bold">VISA</div>
                          <div>
                            <p className="font-medium">Visa ending in 4242</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Expires 08/2025</p>
                          </div>
                        </div>
                        <Button variant="ghost" className="text-blue-600 dark:text-blue-400">
                          Edit
                        </Button>
                        </div>
                        
                      <Button variant="outline" className="border-dashed">
                        + Add Payment Method
                      </Button>
                        </div>
                        
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                      <h3 className="text-lg font-medium mb-4">Billing History</h3>
                      
                      <div className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Description
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Amount
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Invoice
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                June 1, 2024
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                Premium Fleet Manager (Annual)
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                $5,988.00
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <Button variant="link" className="text-blue-600 dark:text-blue-400">
                                  Download
                                </Button>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                June 1, 2023
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                Premium Fleet Manager (Annual)
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                $5,988.00
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <Button variant="link" className="text-blue-600 dark:text-blue-400">
                                  Download
                                </Button>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                June 1, 2022
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                Standard Fleet Manager (Annual)
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                $3,588.00
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <Button variant="link" className="text-blue-600 dark:text-blue-400">
                                  Download
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                          </div>
                    </div>
                  </div>
                )}
                
                {currentTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Email Notifications</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                          <div>
                            <p className="font-medium">Charging Session Complete</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive notification when a vehicle completes charging</p>
                          </div>
                          <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                          <div>
                            <p className="font-medium">Charging Station Error</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive notification when a charging station reports an error</p>
                          </div>
                          <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                          <div>
                            <p className="font-medium">Billing and Payments</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive invoices and payment confirmations</p>
                          </div>
                          <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                          <div>
                            <p className="font-medium">Fleet Vehicle Updates</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive notification when fleet vehicles are updated or maintenance is required</p>
                          </div>
                          <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="text-lg font-medium">Mobile Notifications</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                          <div>
                            <p className="font-medium">Push Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications on your mobile device</p>
                          </div>
                          <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                          <div>
                            <p className="font-medium">Critical Alerts</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive critical alerts even when Do Not Disturb is on</p>
                          </div>
                          <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-md">
                          <div>
                            <p className="font-medium">SMS Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive text message notifications for critical events</p>
                          </div>
                          <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-pointer">
                            <div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div>
                        </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="phone-notifications">Mobile Phone Number</Label>
                        <Input id="phone-notifications" type="tel" defaultValue="+1 (555) 123-4567" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Used only for critical SMS alerts if enabled</p>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="text-lg font-medium">Notification Schedule</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="quiet-hours">Quiet Hours</Label>
                          <div className="flex items-center gap-2">
                            <select
                              id="quiet-hours-start"
                              className="p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                            >
                              <option value="22">10:00 PM</option>
                              <option value="21">9:00 PM</option>
                              <option value="20">8:00 PM</option>
                              <option value="19">7:00 PM</option>
                            </select>
                            <span>to</span>
                            <select
                              id="quiet-hours-end"
                              className="p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                            >
                              <option value="6">6:00 AM</option>
                              <option value="7">7:00 AM</option>
                              <option value="8">8:00 AM</option>
                              <option value="9">9:00 AM</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor="digest-notifications">Daily Digest</Label>
                          <div className="flex items-center gap-2">
                            <select
                              id="digest-time"
                              className="p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                            >
                              <option value="8">8:00 AM</option>
                              <option value="9">9:00 AM</option>
                              <option value="18">6:00 PM</option>
                              <option value="19">7:00 PM</option>
                            </select>
                            <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                              <div className="w-3 h-3 bg-white rounded-full absolute top-1 right-1"></div>
                          </div>
                        </div>
                          </div>
                        </div>
                      </div>
                    
                    <div className="flex justify-end pt-6">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
                        <Save className="mr-2 h-4 w-4" />
                        Save Notification Preferences
                      </Button>
                    </div>
                  </div>
                )}
                
                {currentTab === 'integrations' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">API Access</h3>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
                        <Key className="mr-2 h-4 w-4" />
                        Generate New API Key
                      </Button>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                      <div className="flex justify-between items-center mb-2">
                            <div>
                          <p className="font-medium">Primary API Key</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Created on May 15, 2024</p>
                            </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Active
                        </Badge>
                          </div>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded flex-1 font-mono text-sm">
                          giu_pk_a7x9b3d5e8f2h1j4k6m0n3p5q7r9t2v4w6y8z1
                        </code>
                        <Button variant="outline" size="sm">
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">
                          Revoke
                          </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        This key provides full access to the API. Protect it like a password.
                      </p>
                        </div>
                        
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Active Integrations</h3>
                        <Button variant="outline">
                          Browse Integration Directory
                        </Button>
                            </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="h-10 w-10 bg-white dark:bg-gray-800 rounded-md flex items-center justify-center mr-3">
                              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                                <rect width="24" height="24" rx="4" fill="#4285F4" />
                                <path d="M12 11V8L9 12L12 16V13H15V11H12Z" fill="white" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium">Google Workspace</p>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  Connected
                                </Badge>
                          </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Calendar, Drive, and user management integration
                              </p>
                              <div className="flex gap-2 mt-3">
                                <Button variant="outline" size="sm">Configure</Button>
                                <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400">Disconnect</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="h-10 w-10 bg-white dark:bg-gray-800 rounded-md flex items-center justify-center mr-3">
                              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                                <rect width="24" height="24" rx="4" fill="#00A1E0" />
                                <path d="M11.5 7.5C11.5 6.12 12.62 5 14 5C15.38 5 16.5 6.12 16.5 7.5C16.5 8.88 15.38 10 14 10C12.62 10 11.5 8.88 11.5 7.5Z" fill="white" />
                                <path d="M9.5 16.5C9.5 15.12 10.62 14 12 14C13.38 14 14.5 15.12 14.5 16.5C14.5 17.88 13.38 19 12 19C10.62 19 9.5 17.88 9.5 16.5Z" fill="white" />
                                <path d="M7.5 11.5C7.5 10.12 8.62 9 10 9C11.38 9 12.5 10.12 12.5 11.5C12.5 12.88 11.38 14 10 14C8.62 14 7.5 12.88 7.5 11.5Z" fill="white" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium">Salesforce</p>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  Connected
                                </Badge>
                            </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Customer data and billing integration
                              </p>
                              <div className="flex gap-2 mt-3">
                                <Button variant="outline" size="sm">Configure</Button>
                                <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400">Disconnect</Button>
                          </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="h-10 w-10 bg-white dark:bg-gray-800 rounded-md flex items-center justify-center mr-3">
                              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                                <rect width="24" height="24" rx="4" fill="#0052CC" />
                                <path d="M11.571 9.143L9.428 15H11.571L13.714 9.143H11.571Z" fill="white" />
                                <path d="M8 11.286L5.857 17.143H8L10.143 11.286H8Z" fill="white" />
                                <path d="M15.143 7L13 12.857H15.143L17.286 7H15.143Z" fill="white" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium">Atlassian</p>
                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                                  Needs Attention
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Jira, Confluence, and project management integration
                              </p>
                              <div className="flex gap-2 mt-3">
                                <Button variant="outline" size="sm">Reconfigure</Button>
                                <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400">Disconnect</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 border-dashed">
                          <div className="flex items-center justify-center h-32">
                            <Button variant="outline" className="border-dashed">
                              + Connect New Integration
                          </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="text-lg font-medium">Webhooks</h3>
                      
                      <div className="space-y-4">
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Charging Status Webhook</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                https://api.example.com/webhooks/charging-events
                              </p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Active
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Events: </span>
                              <span>session.started, session.completed, station.error</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Last triggered: </span>
                              <span>2 hours ago</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Secret: </span>
                              <span>••••••••••••••••</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Version: </span>
                              <span>2023-08-01</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">Test</Button>
                            <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400">Delete</Button>
                          </div>
                        </div>
                        
                        <Button variant="outline" className="w-full border-dashed">
                          + Add Webhook Endpoint
                          </Button>
                      </div>
                        </div>
                        
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <h3 className="text-lg font-medium">Developer Resources</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer">
                          <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="font-medium">API Documentation</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              Comprehensive guides and API reference
                            </p>
                            </div>
                          </div>
                        
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer">
                          <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-3">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="font-medium">Developer Console</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              Test API calls and debug integrations
                            </p>
                        </div>
                      </div>
                      
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer">
                          <div className="flex flex-col items-center text-center">
                            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-3">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <p className="font-medium">SDK Documentation</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              Client libraries for multiple languages
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-6">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
                        <Save className="mr-2 h-4 w-4" />
                        Save Integration Settings
                      </Button>
                    </div>
                  </div>
                )}
                
                {currentTab !== 'account' && currentTab !== 'security' && currentTab !== 'appearance' && currentTab !== 'organization' && currentTab !== 'team' && currentTab !== 'billing' && currentTab !== 'notifications' && currentTab !== 'integrations' && (
                  <div className="flex items-center justify-center h-80">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                      <h3 className="text-lg font-medium">{currentTab === 'notifications' ? 'Notification Settings' : 
                         currentTab === 'billing' ? 'Billing Settings' : 
                         currentTab === 'integrations' ? 'Integration Settings' : 'Settings'}</h3>
                      <p className="max-w-md mt-2">
                        This settings panel is under development and will be available in a future update.
                      </p>
                      {requestedAccess === currentTab ? (
                        <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md animate-pulse">
                          <Check className="h-5 w-5 inline-block mr-2" />
                          Access request submitted! We'll notify you when this feature is available.
                        </div>
                      ) : (
                        <Button 
                          className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg"
                          onClick={() => handleRequestAccess(currentTab)}
                        >
                          Request Early Access
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer with help resources */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Need help? <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Contact support</a> or check our <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">documentation</a>.</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.602-3.369-1.34-3.369-1.34-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.162 5.656a8.384 8.384 0 01-2.402.658A4.196 4.196 0 0021.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 00-7.126 3.814 11.874 11.874 0 01-8.62-4.37 4.168 4.168 0 00-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 01-1.894-.523v.052a4.185 4.185 0 003.355 4.101 4.21 4.21 0 01-1.89.072A4.185 4.185 0 007.97 16.65a8.394 8.394 0 01-6.191 1.732 11.83 11.83 0 006.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 002.087-2.165z" />
              </svg>
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          © 2024 GIU Electric Fleet. All rights reserved. <span className="mx-2">|</span> <a href="#" className="hover:text-gray-600 dark:hover:text-gray-400">Privacy Policy</a> <span className="mx-2">|</span> <a href="#" className="hover:text-gray-600 dark:hover:text-gray-400">Terms of Service</a>
        </div>
      </div>
    </div>
  );
} 