"use client";

import * as React from 'react';
import Link from 'next/link';
import { 
  User, 
  Settings, 
  Shield, 
  Bell,
  Car,
  DollarSign as CreditCard,
  Clock,
  ChevronRight,
  Edit as Edit2,
  MapPin,
  Key,
  ArrowRight as LogOut,
  Shield as Lock,
  MessageSquare as Mail,
  User as Phone,
  Upload,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';

export default function ProfilePage() {
  const [fullName, setFullName] = React.useState('Alex Johnson');
  const [email, setEmail] = React.useState('alex.johnson@example.com');
  const [phone, setPhone] = React.useState('+1 (555) 123-4567');
  const [isEditing, setIsEditing] = React.useState(false);
  
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            User Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your account details and preferences
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </Button>
      </div>
      
      {/* Profile Overview */}
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24 border-2 border-blue-200 dark:border-blue-800">
                <AvatarImage src="/images/avatar.jpg" alt="Profile picture" />
                <AvatarFallback className="text-lg">AJ</AvatarFallback>
              </Avatar>
              
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Change Photo</span>
              </Button>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full">
                Premium Account
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{fullName}</h2>
                  <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">{email}</div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                      <MapPin className="h-3 w-3" />
                      <span>Fleet Manager</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Verified</span>
                    </Badge>
                  </div>
                </div>
                
                <Button size="sm" onClick={toggleEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                </Button>
              </div>
              
              {isEditing ? (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                      <Input 
                        id="fullName" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                      <Input 
                        id="phone" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="role" className="text-sm font-medium">Role</label>
                      <select 
                        id="role"
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      >
                        <option value="fleet-manager">Fleet Manager</option>
                        <option value="administrator">Administrator</option>
                        <option value="technician">Technician</option>
                        <option value="driver">Driver</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 pt-2">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                    <div className="font-medium">{phone}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Role</div>
                    <div className="font-medium">Fleet Manager</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Department</div>
                    <div className="font-medium">Operations</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Member Since</div>
                    <div className="font-medium">October 15, 2022</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-6 mt-6">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                <div className="p-4 flex items-start gap-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                    <Car className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Fleet Vehicle Assignment</h4>
                      <span className="text-xs text-gray-500">Today, 9:42 AM</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      You assigned Tesla Model Y (VIN: 5YJ3E1EA8LF123456) to Jane Smith.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 flex items-start gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Station Configuration Update</h4>
                      <span className="text-xs text-gray-500">Yesterday, 3:15 PM</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      You updated charging parameters for Headquarters Station.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 flex items-start gap-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Alert Configuration</h4>
                      <span className="text-xs text-gray-500">Oct 10, 2023</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      You set up new maintenance alerts for all charging stations.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 flex items-start gap-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Billing Update</h4>
                      <span className="text-xs text-gray-500">Oct 1, 2023</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      You updated the company billing information.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
              <Button variant="ghost" className="w-full justify-center text-blue-600 dark:text-blue-400">
                View Full Activity Log
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="vehicles" className="space-y-6 mt-6">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Assigned Vehicles</CardTitle>
                  <CardDescription>Vehicles under your management</CardDescription>
                </div>
                <Button size="sm">
                  <Car className="h-4 w-4 mr-2" />
                  <span>Assign Vehicle</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Tesla Model Y</h4>
                      <div className="text-sm text-gray-500">VIN: 5YJ3E1EA8LF123456</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </Badge>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Ford F-150 Lightning</h4>
                      <div className="text-sm text-gray-500">VIN: 1FTFW1RG5NFA12345</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </Badge>
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Rivian R1T</h4>
                      <div className="text-sm text-gray-500">VIN: 7FTTW2950NR123456</div>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    Maintenance
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
              <Button variant="ghost" className="w-full justify-center text-blue-600 dark:text-blue-400" asChild>
                <Link href="/vehicles">
                  View All Vehicles
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Enabled via Authenticator App</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Manage 2FA</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Recovery Email</h4>
                    <p className="text-sm text-gray-500">a********@gmail.com</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Active Sessions</h4>
                    <p className="text-sm text-gray-500">3 devices currently logged in</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View Sessions</Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                <LogOut className="h-4 w-4 mr-2" />
                <span>Sign Out</span>
              </Button>
              
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Advanced Security Settings</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6 mt-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>Customize your account experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Notification Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="email-notifications" 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <label htmlFor="email-notifications" className="text-sm">Email Notifications</label>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Configure
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="sms-notifications" 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <label htmlFor="sms-notifications" className="text-sm">SMS Notifications</label>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Configure
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="app-notifications" 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <label htmlFor="app-notifications" className="text-sm">In-App Notifications</label>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-3">Display Preferences</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="theme" className="text-sm font-medium">Theme</label>
                      <select 
                        id="theme"
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      >
                        <option value="system">System Default</option>
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="language" className="text-sm font-medium">Language</label>
                      <select 
                        id="language"
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="timezone" className="text-sm font-medium">Time Zone</label>
                    <select 
                      id="timezone"
                      className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                    >
                      <option value="utc-8">Pacific Time (UTC-8)</option>
                      <option value="utc-5">Eastern Time (UTC-5)</option>
                      <option value="utc+0">Greenwich Mean Time (UTC+0)</option>
                      <option value="utc+1">Central European Time (UTC+1)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-3">Data & Privacy</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="data-analytics" 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <label htmlFor="data-analytics" className="text-sm">Share Anonymous Usage Data</label>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Learn More
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="personalized-insights" 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <label htmlFor="personalized-insights" className="text-sm">Personalized Insights & Recommendations</label>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-end space-x-2">
              <Button variant="outline">Reset Preferences</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 