"use client";

import React from 'react';
import Link from 'next/link';
import { 
  BarChart, 
  LineChart, 
  PieChart as PieChartIcon,
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  ExternalLink, 
  RefreshCw,
  Filter,
  Zap,
  Battery,
  Clock,
  User,
  Users,
  Check,
  ArrowRight,
  ArrowUp,
  Plus,
  ChevronDown,
  Info,
  AlertTriangle
} from 'lucide-react';

import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription, PremiumCardContent, PremiumCardFooter } from '../components/ui/premium-card';
import { PremiumButton } from '../components/ui/premium-button';
import { PremiumChart } from '../components/ui/premium-chart';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { formatNumber } from '../lib/utils';

export default function PremiumAnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState('30d');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header section with premium gradient text and enhanced controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 animate-gradient">
            Premium Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Enhanced insights with premium visualizations
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <div className="relative">
            <select 
              className="appearance-none pl-4 pr-10 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow hover:shadow-md"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="6m">Last 6 months</option>
              <option value="1y">Last year</option>
              <option value="custom">Custom range</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          
          <PremiumButton 
            variant="outline" 
            size="sm"
            ripple={true}
            onClick={handleRefresh} 
            leftIcon={<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            <span className="hidden sm:inline">Refresh</span>
          </PremiumButton>
          
          <PremiumButton 
            variant="outline" 
            size="sm"
            ripple={true}
            leftIcon={<Download className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Export</span>
          </PremiumButton>
        </div>
      </div>
      
      {/* Premium KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard 
          variant="glass" 
          hover={true} 
          strokeHighlight={true}
          highlightColor="blue"
          className="backdrop-blur-md"
        >
          <PremiumCardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Energy Delivered</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">124,568 kWh</h3>
                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">+12.5%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Previous period: 110,726 kWh</span>
                <span className="text-green-600 dark:text-green-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> 12.5%
                </span>
              </div>
              <div className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-[87%] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
              </div>
            </div>
          </PremiumCardContent>
        </PremiumCard>
        
        <PremiumCard 
          variant="glass" 
          hover={true} 
          strokeHighlight={true}
          highlightColor="purple"
          className="backdrop-blur-md"
        >
          <PremiumCardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Charge Time</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">42 min</h3>
                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">-8.7%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Previous period: 46 min</span>
                <span className="text-green-600 dark:text-green-400 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" /> 8.7%
                </span>
              </div>
              <div className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-[65%] bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
              </div>
            </div>
          </PremiumCardContent>
        </PremiumCard>
        
        <PremiumCard 
          variant="glass" 
          hover={true} 
          strokeHighlight={true}
          highlightColor="green"
          className="backdrop-blur-md"
        >
          <PremiumCardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Charging Sessions</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">3,842</h3>
                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">+24.1%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                <Battery className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Previous period: 3,096 sessions</span>
                <span className="text-green-600 dark:text-green-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> 24.1%
                </span>
              </div>
              <div className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-[92%] bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
              </div>
            </div>
          </PremiumCardContent>
        </PremiumCard>
        
        <PremiumCard 
          variant="glass" 
          hover={true} 
          strokeHighlight={true}
          highlightColor="amber"
          className="backdrop-blur-md"
        >
          <PremiumCardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Network Utilization</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">68.2%</h3>
                  <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">+2.3%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                <BarChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Previous period: 66.7%</span>
                <span className="text-amber-600 dark:text-amber-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> 2.3%
                </span>
              </div>
              <div className="relative h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-[68%] bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" />
              </div>
            </div>
          </PremiumCardContent>
        </PremiumCard>
      </div>
      
      {/* Main Analytics Chart */}
      <PremiumChart 
        type="line"
        height="400px"
        title="Energy Consumption Trends"
        subtitle="Daily energy delivery across all charging stations"
        animated={true}
        gradientBackground={true}
      >
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <PremiumButton 
            variant="outline" 
            size="sm" 
            ripple={true}
            leftIcon={<Filter className="h-4 w-4" />}
          >
            Filter
          </PremiumButton>
          <PremiumButton 
            variant="outline" 
            size="sm" 
            ripple={true}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </PremiumButton>
        </div>
        
        {/* Placeholder for actual chart */}
        <div className="h-[300px] w-full flex items-center justify-center">
          <div className="text-center">
            <LineChart className="h-16 w-16 text-blue-100 dark:text-blue-900/20 mx-auto mb-4" />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Interactive energy consumption chart
            </div>
            <PremiumButton 
              variant="gradient" 
              ripple={true}
              className="mt-4"
            >
              Load Dynamic Chart
            </PremiumButton>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-sm text-gray-500">
          <Info className="h-4 w-4" />
          <span>Peak energy delivery time: 7:00 AM - 9:00 AM</span>
        </div>
      </PremiumChart>
      
      {/* Insights Section */}
      <PremiumCard
        variant="glass"
        glow="subtle"
        hover={true}
        innerGlow={true}
        highlightColor="blue"
      >
        <PremiumCardHeader>
          <PremiumCardTitle>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              AI-Powered Energy Insights
            </span>
          </PremiumCardTitle>
          <PremiumCardDescription>
            Smart recommendations to optimize your charging infrastructure
          </PremiumCardDescription>
        </PremiumCardHeader>
        <PremiumCardContent className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <div className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">Unusual Consumption Pattern Detected</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Headquarters Station showed a 32% increase in energy consumption during off-peak hours (1-4 AM).
                  This may indicate system inefficiency or unauthorized usage.
                </p>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  ripple={true}
                  className="mt-2"
                  strokeHighlight={true}
                >
                  Investigate
                </PremiumButton>
              </div>
            </div>
            
            <div className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">Cost Optimization Opportunity</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Shifting 15% of your charging load from evening peak (5-7 PM) to midday (11 AM-1 PM) 
                  could save approximately $1,240 per month based on time-of-use rates.
                </p>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  ripple={true}
                  className="mt-2"
                >
                  View Plan
                </PremiumButton>
              </div>
            </div>
            
            <div className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">Solar Integration Potential</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Based on your charging patterns and location data, installing solar canopies at your 
                  Depot Station could offset 38% of energy consumption with an estimated ROI of 3.2 years.
                </p>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  ripple={true}
                  className="mt-2"
                >
                  View Analysis
                </PremiumButton>
              </div>
            </div>
          </div>
        </PremiumCardContent>
        <PremiumCardFooter className="border-t border-gray-100 dark:border-gray-800 py-3">
          <PremiumButton
            variant="ghost"
            className="w-full justify-center text-blue-600 dark:text-blue-400"
            rightIcon={<ArrowRight className="ml-2 h-4 w-4" />}
          >
            View All Insights
          </PremiumButton>
        </PremiumCardFooter>
      </PremiumCard>
      
      {/* Distribution and Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PremiumCard
          variant="glass"
          glow="subtle"
          hover={true}
          innerGlow={true}
          highlightColor="purple"
        >
          <PremiumCardHeader>
            <PremiumCardTitle>Energy Distribution</PremiumCardTitle>
            <PremiumCardDescription>By station type</PremiumCardDescription>
          </PremiumCardHeader>
          <PremiumCardContent>
            <div className="h-64 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <PieChartIcon className="h-16 w-16 text-purple-100 dark:text-purple-900/20 mx-auto mb-4" />
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">DC Fast Chargers</span>
                </div>
                <div className="text-sm font-medium">64.2% (79,972 kWh)</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm">Level 2 AC Chargers</span>
                </div>
                <div className="text-sm font-medium">32.5% (40,485 kWh)</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Level 1 AC Chargers</span>
                </div>
                <div className="text-sm font-medium">3.3% (4,111 kWh)</div>
              </div>
            </div>
          </PremiumCardContent>
        </PremiumCard>
        
        <div className="lg:col-span-2 space-y-6">
          <PremiumCard
            variant="glass"
            glow="subtle"
            hover={true}
            innerGlow={true}
            highlightColor="green"
          >
            <PremiumCardHeader className="pb-2">
              <PremiumCardTitle>Energy Efficiency Analysis</PremiumCardTitle>
              <PremiumCardDescription>Cost and carbon metrics</PremiumCardDescription>
            </PremiumCardHeader>
            <PremiumCardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm transition-transform hover:scale-[1.02]">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Average Energy Cost</div>
                  <div className="text-2xl font-bold mt-1">$0.142/kWh</div>
                  <div className="flex items-center mt-2 text-xs">
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <ArrowUp className="h-3 w-3 mr-1 rotate-180" />
                      <span>3.4% vs previous period</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm transition-transform hover:scale-[1.02]">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Energy Cost</div>
                  <div className="text-2xl font-bold mt-1">$17,689</div>
                  <div className="flex items-center mt-2 text-xs">
                    <div className="flex items-center text-amber-600 dark:text-amber-400">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>8.7% vs previous period</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm transition-transform hover:scale-[1.02]">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Carbon Offset</div>
                  <div className="text-2xl font-bold mt-1">53.2 tCO₂e</div>
                  <div className="flex items-center mt-2 text-xs">
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>12.5% vs previous period</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm transition-transform hover:scale-[1.02]">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Renewable Energy Mix</div>
                  <div className="text-2xl font-bold mt-1">42.8%</div>
                  <div className="flex items-center mt-2 text-xs">
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      <span>5.2% vs previous period</span>
                    </div>
                  </div>
                </div>
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mt-8">
        <PremiumButton 
          variant="gradient" 
          size="lg" 
          ripple={true} 
          glow="subtle"
          leftIcon={<Download className="h-5 w-5" />}
        >
          Download Full Report
        </PremiumButton>
        
        <PremiumButton 
          variant="secondary" 
          size="lg" 
          ripple={true}
          leftIcon={<ExternalLink className="h-5 w-5" />}
        >
          Share Dashboard
        </PremiumButton>
        
        <PremiumButton 
          variant="neumorph" 
          size="lg" 
          ripple={true}
          leftIcon={<BarChart className="h-5 w-5" />}
        >
          Advanced Analytics
        </PremiumButton>
      </div>
      
      {/* Link back to standard analytics */}
      <div className="text-center mt-8">
        <Link href="/analytics" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
          Return to Standard Analytics Dashboard
        </Link>
      </div>
      
      {/* Add a style block for custom animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .bg-gradient-animate {
            background-size: 200% 200%;
            animation: gradient 15s ease infinite;
          }
          
          .hover-zoom {
            transition: transform 0.3s ease;
          }
          
          .hover-zoom:hover {
            transform: scale(1.05);
          }
        `
      }} />
    </div>
  );
} 