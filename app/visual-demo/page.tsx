"use client";

import React from 'react';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent } from '../components/ui/premium-card';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  Zap, 
  Battery, 
  RefreshCw, 
  Activity,
  BarChart,
  Settings,
  Download
} from 'lucide-react';

const VisualDemoPage = () => {
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('cards');
  
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Visual Language Demo</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Demonstration of premium visual effects and animations
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleRefresh}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            <span>Apply Effects</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="cards">Premium Cards</TabsTrigger>
          <TabsTrigger value="controls">Interactive Controls</TabsTrigger>
          <TabsTrigger value="animations">Energy Animations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cards" className="space-y-8">
          <h2 className="text-2xl font-semibold mb-4">Premium Card Treatments</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Default Premium Card */}
            <PremiumCard>
              <PremiumCardHeader>
                <PremiumCardTitle>Default Style</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Standard premium card with hover effects</p>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <div className="text-sm font-medium">Energy: 128 kWh</div>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </PremiumCardContent>
            </PremiumCard>
            
            {/* Glass Premium Card */}
            <PremiumCard 
              variant="glass" 
              glowAccent="blue"
            >
              <PremiumCardHeader>
                <PremiumCardTitle>Glassmorphic Style</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Frosted glass effect with blue glow</p>
                  <div className="flex items-center gap-2">
                    <Battery className="h-5 w-5 text-green-500" />
                    <div className="text-sm font-medium">Battery: 87%</div>
                  </div>
                  <Progress value={87} className="h-2 bg-green-100 dark:bg-green-900/30" />
                </div>
              </PremiumCardContent>
            </PremiumCard>
            
            {/* Elevated Premium Card */}
            <PremiumCard 
              variant="elevated"
              glowAccent="purple"
            >
              <PremiumCardHeader>
                <PremiumCardTitle>Elevated Style</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stronger shadow with purple glow</p>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    <div className="text-sm font-medium">Activity: High</div>
                  </div>
                  <Progress value={92} className="h-2 bg-purple-100 dark:bg-purple-900/30" />
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </div>
          
          {/* Interactive Cards Row */}
          <h3 className="text-xl font-medium mt-8 mb-4">Interactive Card States</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Normal state */}
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Standard Card</p>
                  <h4 className="text-2xl font-bold">24.5</h4>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <BarChart className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            {/* Premium Cards with different glow colors */}
            <PremiumCard interactive={true} glowAccent="green">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Green Glow</p>
                  <h4 className="text-2xl font-bold">86%</h4>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <Zap className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </PremiumCard>
            
            <PremiumCard interactive={true} glowAccent="amber">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amber Glow</p>
                  <h4 className="text-2xl font-bold">48%</h4>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                  <Activity className="h-5 w-5 text-amber-500" />
                </div>
              </CardContent>
            </PremiumCard>
            
            <PremiumCard variant="glass" interactive={true} glowAccent="blue">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Glass + Glow</p>
                  <h4 className="text-2xl font-bold">112</h4>
                </div>
                <div className="bg-blue-100/50 dark:bg-blue-900/30 p-3 rounded-full backdrop-blur-sm">
                  <Settings className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </PremiumCard>
          </div>
        </TabsContent>
        
        <TabsContent value="controls" className="space-y-8">
          <h2 className="text-2xl font-semibold mb-4">Interactive Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PremiumCard variant="glass">
              <PremiumCardHeader>
                <PremiumCardTitle>Custom Button Treatments</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5">
                      Primary Action
                    </Button>
                    
                    <Button variant="outline" className="border-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                      Secondary
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="relative overflow-hidden bg-green-600 hover:bg-green-700">
                      <span className="relative z-10">Start Charging</span>
                      <span className="absolute inset-0 flex items-center justify-center w-full h-full">
                        <span className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-transparent via-green-400/30 to-transparent animate-shimmer" />
                      </span>
                    </Button>
                    
                    <Button className="relative overflow-hidden bg-red-600 hover:bg-red-700">
                      <span className="relative z-10">Stop Charging</span>
                      <span className="absolute inset-0 flex items-center justify-center w-full h-full">
                        <span className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-transparent via-red-400/30 to-transparent animate-shimmer" />
                      </span>
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" variant="ghost" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm" variant="ghost" className="hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button size="sm" variant="ghost" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </PremiumCardContent>
            </PremiumCard>
            
            <PremiumCard variant="glass">
              <PremiumCardHeader>
                <PremiumCardTitle>Advanced Indicator Styles</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent>
                <div className="space-y-6">
                  {/* Gradient Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Battery Charge</span>
                      <span>78%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 via-green-400 to-emerald-500 rounded-full relative"
                        style={{ width: '78%' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated Pulse Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Power Output</span>
                      <span>32 kW</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: '45%' }}
                      >
                        <div className="w-full h-full animate-pulse bg-blue-400/50" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Segmented Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Charging Stations</span>
                      <span>12/20 Active</span>
                    </div>
                    <div className="flex gap-1 w-full">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div 
                          key={i}
                          className={`h-2 flex-1 rounded-full ${i < 12 ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Premium Toggle Switch */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fast Charging Mode</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        id="toggle" 
                        defaultChecked 
                      />
                      <label 
                        htmlFor="toggle" 
                        className="flex h-6 w-11 cursor-pointer items-center rounded-full bg-gray-200 dark:bg-gray-700 
                        peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500 
                        transition-all duration-300 peer-checked:after:translate-x-5 after:h-5 after:w-5 
                        after:rounded-full after:bg-white after:shadow-md after:transition-all 
                        peer-checked:after:shadow-blue-500 relative overflow-hidden"
                      >
                        <span className="absolute inset-0 z-0 opacity-0 peer-checked:opacity-100">
                          <span className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r 
                          from-transparent via-blue-400/30 to-transparent animate-shimmer" />
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </div>
        </TabsContent>
        
        <TabsContent value="animations" className="space-y-8">
          <h2 className="text-2xl font-semibold mb-4">Energy Flow Effects</h2>
          
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Dynamic motion and animation effects to visualize energy flow. These effects would be integrated into 
            charts, maps, and interaction points throughout the application.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PremiumCard variant="glass" className="min-h-[300px] flex flex-col">
              <PremiumCardHeader>
                <PremiumCardTitle>Charging Station Map</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-b-lg overflow-hidden">
                  {/* Map placeholder */}
                  <div className="w-full h-full p-4 flex items-center justify-center">
                    <p className="text-sm text-gray-500">Interactive map with animated energy flow indicators</p>
                  </div>
                  
                  {/* Energy flow points */}
                  <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-blue-500 opacity-80 animate-pulse" />
                  <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-green-500 opacity-80 animate-pulse" />
                  <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-purple-500 opacity-80 animate-pulse" />
                  <div className="absolute bottom-1/4 right-1/3 w-3 h-3 rounded-full bg-blue-500 opacity-80 animate-pulse" />
                </div>
              </PremiumCardContent>
            </PremiumCard>
            
            <PremiumCard variant="glass" className="min-h-[300px] flex flex-col">
              <PremiumCardHeader>
                <PremiumCardTitle>Real-time Energy Flow</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-950/40 dark:to-teal-950/40 rounded-b-lg overflow-hidden">
                  {/* Energy flow chart placeholder */}
                  <div className="w-full h-full p-4 flex items-center justify-center">
                    <p className="text-sm text-gray-500">Interactive chart with animated data points</p>
                  </div>
                  
                  {/* Animated data paths */}
                  <svg className="absolute inset-0 w-full h-full">
                    <path 
                      d="M 0,150 Q 100,100 200,150 T 400,150" 
                      fill="none" 
                      stroke="rgba(16, 185, 129, 0.3)" 
                      strokeWidth="4"
                      strokeDasharray="5,5"
                      className="animate-dash"
                    />
                    <path 
                      d="M 0,180 Q 120,230 240,180 T 400,180" 
                      fill="none" 
                      stroke="rgba(59, 130, 246, 0.3)" 
                      strokeWidth="4"
                      strokeDasharray="5,5"
                      className="animate-dash-slow"
                    />
                  </svg>
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </div>
        </TabsContent>
      </Tabs>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          
          .shimmer-effect {
            position: relative;
            overflow: hidden;
          }
          
          .shimmer-effect::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.2) 25%,
              rgba(255, 255, 255, 0.2) 50%,
              rgba(255, 255, 255, 0) 100%
            );
            animation: shimmer 2s infinite;
          }
        `
      }} />
    </div>
  );
};

export default VisualDemoPage; 