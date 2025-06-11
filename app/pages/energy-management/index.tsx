"use client";

import * as React from 'react';
import { 
  Battery, BarChart2, Filter, Download, Plus, Zap as Lightning,
  CheckCircle, AlertTriangle, Clock, Calendar,
  Info, Zap, Settings, ChevronDown, RefreshCw, 
  ArrowUp, ArrowDown, Sun, Moon, TrendingUp, 
  TrendingDown, Activity, Gauge, Cpu, Database, Droplets, DollarSign,
  Leaf, Wind, CloudRain, Thermometer, Globe, Smartphone,
  Shield, Lock, Eye, Brain, Sparkles, Target, Trophy,
  LineChart, PieChart, BarChart3, TrendingUp as Analytics,
  Grid3x3, Factory, Workflow, GitBranch as DevBranch,
  Code, Cloud, Monitor, Server, Recycle, Building2,
  Timer, MapPin, Route, Car, Truck, Users, Star,
  CreditCard, Banknote, Wallet, Receipt, FileCheck,
  ShieldCheck, Bell, AlertCircle, HelpCircle,
  Share, Link as LinkIcon, Upload, Maximize2,
  PlayCircle, PauseCircle, SkipForward, Rewind,
  Radio, Wifi, Bluetooth, Headphones, Volume2,
  ChevronRight, ChevronLeft, MoreHorizontal, Search,
  Home, Key, Phone, Mail, MessageCircle, Video,
  Camera, Image, Paperclip, Send, BookOpen,
  Award, Gift, Heart, Bookmark, Flag, Tag, Hash,
  Wrench
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

const EnergyManagementPage = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [refreshing, setRefreshing] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState('week');
  const [energyData, setEnergyData] = React.useState(null);
  const [aiInsights, setAiInsights] = React.useState([]);
  const [optimizationMode, setOptimizationMode] = React.useState('efficiency');
  const [alertsVisible, setAlertsVisible] = React.useState(true);

  // Premium features state
  const [smartGridConnected, setSmartGridConnected] = React.useState(true);
  const [renewableEnergyData, setRenewableEnergyData] = React.useState({
    solar: { available: 45, cost: 0.08 },
    wind: { available: 32, cost: 0.09 },
    grid: { available: 100, cost: 0.22 }
  });
  const [energyTradingActive, setEnergyTradingActive] = React.useState(false);
  const [carbonCredits, setCarbonCredits] = React.useState(847);

  React.useEffect(() => {
    // Simulate real-time data fetching
    const interval = setInterval(() => {
      // Update AI insights and energy optimization recommendations
      setAiInsights([
        {
          type: 'optimization',
          message: 'AI recommends shifting 40% of charging to off-peak hours (11PM-5AM) for $180/week savings',
          confidence: 94,
          impact: 'high'
        },
        {
          type: 'prediction',
          message: 'Weather forecast shows high solar availability tomorrow. Pre-charge batteries to 40% for optimal solar utilization',
          confidence: 89,
          impact: 'medium'
        },
        {
          type: 'efficiency',
          message: 'Vehicle EV-247 showing 15% efficiency drop. Recommend battery health check',
          confidence: 92,
          impact: 'high'
        }
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleOptimization = (mode) => {
    setOptimizationMode(mode);
    // Trigger AI optimization algorithms
  };

  // Add comprehensive click handlers for all interactive elements
  const handleMaximizeVisualization = () => {
    alert('Opening full-screen energy flow visualization...');
  };

  const handleOptimizeSchedule = () => {
    alert('AI optimization in progress... New schedule will be ready in 30 seconds.');
  };

  const handleApplyRecommendation = (insight) => {
    alert(`Applying AI recommendation: ${insight.message.slice(0, 50)}...`);
  };

  const handleEnergyTrading = (action) => {
    switch(action) {
      case 'sell':
        alert('Initiating energy credit sale... Market order placed.');
        break;
      case 'buy':
        alert('Purchasing energy at current market rate... Transaction processing.');
        break;
      case 'autoToggle':
        setEnergyTradingActive(!energyTradingActive);
        alert(`Auto trading ${!energyTradingActive ? 'enabled' : 'disabled'} successfully.`);
        break;
      default:
        break;
    }
  };

  const handleRenewableControls = (action, source) => {
    alert(`${action} action for ${source} initiated. System adjusting parameters...`);
  };

  const handleAnalyticsExport = (type) => {
    alert(`Exporting ${type} report... Download will begin shortly.`);
  };

  const handleSustainabilityAction = (action) => {
    switch(action) {
      case 'plantTrees':
        alert('Connecting to carbon offset marketplace... Tree planting initiative started.');
        break;
      case 'buyCredits':
        alert('Purchasing verified carbon credits... Transaction in progress.');
        break;
      case 'generateESG':
        alert('Generating comprehensive ESG report... This may take a few minutes.');
        break;
      default:
        alert(`${action} action initiated successfully.`);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative">
      {/* Premium Header with AI Status */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Energy Command Center
                </h1>
                <p className="text-gray-600 mt-1 flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-purple-500" />
                  Advanced ML-powered energy optimization & trading platform
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">AI Active</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <Grid3x3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Smart Grid Connected</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
                <Button 
                  variant={timeRange === 'hour' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setTimeRange('hour')}
                >
                  Live
                </Button>
                <Button 
                  variant={timeRange === 'day' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setTimeRange('day')}
                >
                  Day
                </Button>
                <Button 
                  variant={timeRange === 'week' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setTimeRange('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={timeRange === 'month' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setTimeRange('month')}
                >
                  Month
                </Button>
              </div>
              
              <Button variant="outline" size="sm" onClick={() => setEnergyTradingActive(!energyTradingActive)}>
                <DollarSign className="w-4 h-4 mr-2" />
                Energy Trading: {energyTradingActive ? 'ON' : 'OFF'}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Syncing...' : 'Refresh'}
              </Button>
              
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Settings size={16} className="mr-2" />
                AI Config
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* AI Alerts Banner */}
        {alertsVisible && aiInsights.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-900">AI Optimization Recommendations</h3>
                  <div className="mt-2 space-y-2">
                    {aiInsights.slice(0, 2).map((insight, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'}>
                          {insight.confidence}% confidence
                        </Badge>
                        <span className="text-sm text-purple-800">{insight.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setAlertsVisible(false)}>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Premium Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Real-Time Energy Flow</p>
                  <h3 className="text-3xl font-bold mt-1 text-blue-900">42.7 kW</h3>
                  <p className="text-xs text-blue-600 mt-1">Active charging: 8 vehicles</p>
                </div>
                <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-700">
                  <Lightning size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-green-600 flex items-center">
                  <TrendingDown size={14} className="mr-1" />
                  12% optimized vs baseline
                </span>
              </div>
              <div className="mt-3">
                <Progress value={67} className="h-2" />
                <p className="text-xs text-blue-600 mt-1">67% renewable energy mix</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Smart Cost Today</p>
                  <h3 className="text-3xl font-bold mt-1 text-green-900">$28.42</h3>
                  <p className="text-xs text-green-600 mt-1">AI-optimized pricing</p>
                </div>
                <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center text-green-700">
                  <DollarSign size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-green-600 flex items-center">
                  <ArrowDown size={14} className="mr-1" />
                  $31.85 saved today
                </span>
              </div>
              <div className="mt-3">
                <Progress value={78} className="h-2" />
                <p className="text-xs text-green-600 mt-1">78% off-peak optimization</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Carbon Credits Earned</p>
                  <h3 className="text-3xl font-bold mt-1 text-purple-900">{carbonCredits}</h3>
                  <p className="text-xs text-purple-600 mt-1">+47 today</p>
                </div>
                <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center text-purple-700">
                  <Leaf size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-purple-600 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  $2,541 trading value
                </span>
              </div>
              <div className="mt-3">
                <Progress value={89} className="h-2" />
                <p className="text-xs text-purple-600 mt-1">89% emission reduction</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">AI Efficiency Score</p>
                  <h3 className="text-3xl font-bold mt-1 text-amber-900">94.2%</h3>
                  <p className="text-xs text-amber-600 mt-1">Fleet optimization</p>
                </div>
                <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center text-amber-700">
                  <Brain size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-amber-600 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  +3.7% this week
                </span>
              </div>
              <div className="mt-3">
                <Progress value={94} className="h-2" />
                <p className="text-xs text-amber-600 mt-1">Target: 95% by month-end</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Tabs with Advanced Features */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-white/50 backdrop-blur-sm border border-gray-200">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white">
              <Activity className="w-4 h-4 mr-2" />
              Live Dashboard
            </TabsTrigger>
            <TabsTrigger value="optimization" className="data-[state=active]:bg-white">
              <Target className="w-4 h-4 mr-2" />
              AI Optimization
            </TabsTrigger>
            <TabsTrigger value="trading" className="data-[state=active]:bg-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Energy Trading
            </TabsTrigger>
            <TabsTrigger value="renewable" className="data-[state=active]:bg-white">
              <Sun className="w-4 h-4 mr-2" />
              Renewable Sources
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Advanced Analytics
            </TabsTrigger>
            <TabsTrigger value="sustainability" className="data-[state=active]:bg-white">
              <Leaf className="w-4 h-4 mr-2" />
              Sustainability
            </TabsTrigger>
          </TabsList>

          {/* Live Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Real-time Energy Flow Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-600" />
                        Real-Time Energy Flow Network
                      </CardTitle>
                      <CardDescription>Live visualization of energy distribution across fleet</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Live</Badge>
                      <Button variant="outline" size="sm" onClick={handleMaximizeVisualization}>
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                    {/* Animated energy flow visualization */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="grid grid-cols-8 grid-rows-6 gap-2 h-full p-4">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <div key={i} className="bg-blue-300 rounded animate-pulse" style={{
                            animationDelay: `${i * 100}ms`,
                            animationDuration: '2s'
                          }}></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center z-10">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white">
                          <Grid3x3 size={32} />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Grid Integration Active</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        AI is dynamically routing energy from 3 renewable sources to 24 vehicles across 8 charging hubs
                      </p>
                      <div className="flex items-center justify-center space-x-4 mt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">67%</p>
                          <p className="text-xs text-gray-500">Renewable Mix</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">42.7kW</p>
                          <p className="text-xs text-gray-500">Active Load</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">$0.14</p>
                          <p className="text-xs text-gray-500">Avg. Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-orange-600" />
                    Smart Charging Queue
                  </CardTitle>
                  <CardDescription>AI-optimized charging schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { id: 'EV-247', battery: 23, eta: '1h 15m', priority: 'high', status: 'charging' },
                      { id: 'EV-156', battery: 67, eta: '2h 30m', priority: 'medium', status: 'queued' },
                      { id: 'EV-089', battery: 45, eta: '3h 45m', priority: 'low', status: 'scheduled' },
                      { id: 'EV-312', battery: 12, eta: '45m', priority: 'urgent', status: 'charging' },
                      { id: 'EV-198', battery: 78, eta: '1h 50m', priority: 'medium', status: 'queued' }
                    ].map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            vehicle.status === 'charging' ? 'bg-green-500' :
                            vehicle.status === 'queued' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="font-semibold text-sm">{vehicle.id}</p>
                            <p className="text-xs text-gray-500">{vehicle.eta} remaining</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{vehicle.battery}%</p>
                          <Badge 
                            variant={vehicle.priority === 'urgent' ? 'destructive' : 
                                   vehicle.priority === 'high' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {vehicle.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline" size="sm" onClick={handleOptimizeSchedule}>
                    <Settings className="w-4 h-4 mr-2" />
                    Optimize Schedule
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Energy Sources and Load Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sun className="w-5 h-5 mr-2 text-yellow-600" />
                    Renewable Energy Sources
                  </CardTitle>
                  <CardDescription>Real-time renewable energy availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <Sun className="w-8 h-8 text-yellow-600" />
                        <div>
                          <h4 className="font-semibold">Solar Generation</h4>
                          <p className="text-sm text-gray-600">Peak efficiency: 11:30 AM</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-yellow-700">45 kW</p>
                        <p className="text-sm text-yellow-600">$0.08/kWh</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <Wind className="w-8 h-8 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">Wind Generation</h4>
                          <p className="text-sm text-gray-600">Optimal wind conditions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-700">32 kW</p>
                        <p className="text-sm text-blue-600">$0.09/kWh</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Grid3x3 className="w-8 h-8 text-gray-600" />
                        <div>
                          <h4 className="font-semibold">Grid Backup</h4>
                          <p className="text-sm text-gray-600">Peak rate period</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-700">∞ kW</p>
                        <p className="text-sm text-gray-600">$0.22/kWh</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                    Smart Load Distribution
                  </CardTitle>
                  <CardDescription>AI-optimized energy allocation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>HQ Charging Hub</span>
                        <span className="font-semibold">18.2 kW (38%)</span>
                      </div>
                      <Progress value={38} className="h-2 bg-blue-100" />
                      <p className="text-xs text-gray-500">8 vehicles charging • $0.14/kWh avg</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Warehouse Depot</span>
                        <span className="font-semibold">14.4 kW (30%)</span>
                      </div>
                      <Progress value={30} className="h-2 bg-green-100" />
                      <p className="text-xs text-gray-500">6 vehicles charging • $0.11/kWh avg</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Downtown Hub</span>
                        <span className="font-semibold">7.2 kW (15%)</span>
                      </div>
                      <Progress value={15} className="h-2 bg-purple-100" />
                      <p className="text-xs text-gray-500">3 vehicles charging • $0.18/kWh avg</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Mobile Units</span>
                        <span className="font-semibold">2.9 kW (6%)</span>
                      </div>
                      <Progress value={6} className="h-2 bg-amber-100" />
                      <p className="text-xs text-gray-500">2 vehicles charging • $0.25/kWh avg</p>
                    </div>

                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <Sparkles className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          AI optimized distribution saves $47/day vs manual allocation
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-600" />
                    ML Optimization Engine
                  </CardTitle>
                  <CardDescription>Advanced machine learning algorithms for energy optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Button 
                      variant={optimizationMode === 'efficiency' ? 'default' : 'outline'}
                      onClick={() => handleOptimization('efficiency')}
                      className="flex flex-col h-20"
                    >
                      <Target className="w-5 h-5 mb-1" />
                      <span className="text-xs">Max Efficiency</span>
                    </Button>
                    <Button 
                      variant={optimizationMode === 'cost' ? 'default' : 'outline'}
                      onClick={() => handleOptimization('cost')}
                      className="flex flex-col h-20"
                    >
                      <DollarSign className="w-5 h-5 mb-1" />
                      <span className="text-xs">Min Cost</span>
                    </Button>
                    <Button 
                      variant={optimizationMode === 'carbon' ? 'default' : 'outline'}
                      onClick={() => handleOptimization('carbon')}
                      className="flex flex-col h-20"
                    >
                      <Leaf className="w-5 h-5 mb-1" />
                      <span className="text-xs">Zero Carbon</span>
                    </Button>
                  </div>

                  <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                        <Brain size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">AI Learning Active</h3>
                      <p className="text-gray-600 max-w-md">
                        Neural networks analyzing 10,000+ data points per second to optimize {optimizationMode} 
                      </p>
                      <div className="mt-4 flex items-center justify-center space-x-6">
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">94.2%</p>
                          <p className="text-xs text-gray-500">Optimization Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">$47/day</p>
                          <p className="text-xs text-gray-500">Savings Generated</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Insights & Actions</CardTitle>
                  <CardDescription>Real-time recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {insight.confidence}% confidence
                          </Badge>
                          <Badge variant={insight.impact === 'high' ? 'destructive' : 'outline'} className="text-xs">
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{insight.message}</p>
                        <Button size="sm" className="w-full" onClick={() => handleApplyRecommendation(insight)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Apply Recommendation
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Energy Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Energy Trading Platform
                </CardTitle>
                <CardDescription>Buy and sell energy on the smart grid marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">Energy Credits Available</h3>
                    <p className="text-3xl font-bold text-green-700 mb-2">247 kWh</p>
                    <p className="text-sm text-green-600 mb-4">Market value: $61.75</p>
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleEnergyTrading('sell')}>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Sell Credits
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Market Opportunities</h3>
                    <p className="text-3xl font-bold text-blue-700 mb-2">$0.18</p>
                    <p className="text-sm text-blue-600 mb-4">Current buy rate</p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleEnergyTrading('buy')}>
                      <Lightning className="w-4 h-4 mr-2" />
                      Buy Energy
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4">Auto Trading</h3>
                    <p className="text-3xl font-bold text-purple-700 mb-2">{energyTradingActive ? 'ON' : 'OFF'}</p>
                    <p className="text-sm text-purple-600 mb-4">AI-powered trading</p>
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleEnergyTrading('autoToggle')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {energyTradingActive ? 'Disable' : 'Enable'} Auto
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-amber-800">Trading Alert</h4>
                      <p className="text-sm text-amber-700">
                        High demand period detected. Energy prices expected to increase 15% in next 2 hours. 
                        Consider selling excess capacity.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Renewable Sources Tab */}
          <TabsContent value="renewable" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Solar Panel Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sun className="w-5 h-5 mr-2 text-yellow-600" />
                    Solar Panel Control Center
                  </CardTitle>
                  <CardDescription>Real-time solar panel monitoring and optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-2">Current Generation</h4>
                        <p className="text-2xl font-bold text-yellow-700">45.2 kW</p>
                        <p className="text-sm text-yellow-600">92% of capacity</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">Daily Output</h4>
                        <p className="text-2xl font-bold text-green-700">387 kWh</p>
                        <p className="text-sm text-green-600">+12% vs yesterday</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Panel Efficiency</span>
                        <span className="text-sm text-green-600">92%</span>
                      </div>
                      <Progress value={92} className="h-2 bg-yellow-100" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Weather Conditions</span>
                        <Badge variant="secondary">Optimal</Badge>
                      </div>
                      <Progress value={87} className="h-2 bg-blue-100" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleRenewableControls('optimize', 'solar')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Panel Settings
                      </Button>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleAnalyticsExport('solar')}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Wind Energy Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wind className="w-5 h-5 mr-2 text-blue-600" />
                    Wind Turbine Network
                  </CardTitle>
                  <CardDescription>Wind energy generation monitoring and control</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">Wind Speed</h4>
                        <p className="text-2xl font-bold text-blue-700">18.3 mph</p>
                        <p className="text-sm text-blue-600">Optimal range</p>
                      </div>
                      <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-lg border border-cyan-200">
                        <h4 className="font-semibold text-cyan-800 mb-2">Power Output</h4>
                        <p className="text-2xl font-bold text-cyan-700">32.1 kW</p>
                        <p className="text-sm text-cyan-600">78% capacity</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Turbine Efficiency</span>
                        <span className="text-sm text-blue-600">78%</span>
                      </div>
                      <Progress value={78} className="h-2 bg-blue-100" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Maintenance Status</span>
                        <Badge variant="secondary">Good</Badge>
                      </div>
                      <Progress value={95} className="h-2 bg-green-100" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleRenewableControls('maintain', 'wind')}>
                        <Wrench className="w-4 h-4 mr-2" />
                        Maintenance
                      </Button>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleAnalyticsExport('wind')}>
                        <Activity className="w-4 h-4 mr-2" />
                        Live Monitor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Energy Storage Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Battery className="w-5 h-5 mr-2 text-indigo-600" />
                  Energy Storage System
                </CardTitle>
                <CardDescription>Battery storage management and grid integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Storage Capacity</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Battery Bank 1</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Battery Bank 2</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Emergency Reserve</span>
                        <span className="text-sm font-medium">100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Charging/Discharging</h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">Charging Rate</span>
                          <span className="text-sm text-green-600">+15.2 kW</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-800">Grid Export</span>
                          <span className="text-sm text-blue-600">12.8 kW</span>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-800">Net Storage</span>
                          <span className="text-sm text-purple-600">+2.4 kW</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Control Actions</h4>
                    <div className="space-y-3">
                      <Button className="w-full" variant="outline" onClick={() => handleRenewableControls('optimize', 'storage')}>
                        <Battery className="w-4 h-4 mr-2" />
                        Optimize Storage
                      </Button>
                      <Button className="w-full" variant="outline" onClick={() => handleRenewableControls('balance', 'grid')}>
                        <Grid3x3 className="w-4 h-4 mr-2" />
                        Grid Balance
                      </Button>
                      <Button className="w-full" variant="outline" onClick={() => handleRenewableControls('emergency', 'storage')}>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Emergency Mode
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Energy Consumption Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                    Energy Consumption Analytics
                  </CardTitle>
                  <CardDescription>Detailed analysis of energy usage patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Time Period Selector */}
                    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                      <Button variant="default" size="sm" className="flex-1">Today</Button>
                      <Button variant="ghost" size="sm" className="flex-1">Week</Button>
                      <Button variant="ghost" size="sm" className="flex-1">Month</Button>
                      <Button variant="ghost" size="sm" className="flex-1">Year</Button>
                    </div>

                    {/* Analytics Chart Area */}
                    <div className="h-48 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl flex items-center justify-center relative">
                      <div className="absolute inset-0 opacity-30">
                        <div className="grid grid-cols-12 gap-1 h-full p-4">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} className="flex flex-col justify-end">
                              <div 
                                className="bg-purple-400 rounded-t"
                                style={{ height: `${Math.random() * 80 + 20}%` }}
                              ></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-center z-10">
                        <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                        <h3 className="font-bold text-gray-800">Live Energy Flow Chart</h3>
                        <p className="text-sm text-gray-600">24-hour consumption pattern</p>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-700">387 kWh</p>
                        <p className="text-sm text-purple-600">Daily Consumption</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-700">$42.18</p>
                        <p className="text-sm text-blue-600">Daily Cost</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Predictive Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-indigo-600" />
                    AI Predictive Analytics
                  </CardTitle>
                  <CardDescription>Machine learning insights and forecasting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Prediction Models */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Energy Demand Forecast</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <div>
                            <p className="font-medium text-green-800">Next Hour</p>
                            <p className="text-sm text-green-600">High confidence</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-700">52.3 kW</p>
                            <Badge variant="secondary">95%</Badge>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div>
                            <p className="font-medium text-blue-800">Next 6 Hours</p>
                            <p className="text-sm text-blue-600">Medium confidence</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-700">48.7 kW</p>
                            <Badge variant="outline">87%</Badge>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div>
                            <p className="font-medium text-amber-800">Tomorrow</p>
                            <p className="text-sm text-amber-600">Estimation</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-amber-700">445 kWh</p>
                            <Badge variant="outline">72%</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">AI Recommendations</h4>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-purple-800">Optimization Alert</p>
                            <p className="text-xs text-purple-600">Shift 30% load to off-peak hours for 18% cost reduction</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Efficiency Gain</p>
                            <p className="text-xs text-green-600">Current settings are optimal for renewable energy usage</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gauge className="w-5 h-5 mr-2 text-orange-600" />
                  Performance Metrics Dashboard
                </CardTitle>
                <CardDescription>Comprehensive system performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 relative">
                      <div className="w-full h-full rounded-full border-8 border-green-200 border-t-green-600 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">94%</span>
                      </div>
                    </div>
                    <h4 className="font-semibold">System Efficiency</h4>
                    <p className="text-sm text-gray-600">Overall performance</p>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 relative">
                      <div className="w-full h-full rounded-full border-8 border-blue-200 border-t-blue-600 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">87%</span>
                      </div>
                    </div>
                    <h4 className="font-semibold">Renewable Mix</h4>
                    <p className="text-sm text-gray-600">Clean energy ratio</p>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 relative">
                      <div className="w-full h-full rounded-full border-8 border-purple-200 border-t-purple-600 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-purple-600">92%</span>
                      </div>
                    </div>
                    <h4 className="font-semibold">Cost Optimization</h4>
                    <p className="text-sm text-gray-600">Financial efficiency</p>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 relative">
                      <div className="w-full h-full rounded-full border-8 border-amber-200 border-t-amber-600 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-amber-600">98%</span>
                      </div>
                    </div>
                    <h4 className="font-semibold">Uptime</h4>
                    <p className="text-sm text-gray-600">System availability</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="w-full" onClick={() => handleAnalyticsExport('performance')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Analysis
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Metrics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sustainability Tab */}
          <TabsContent value="sustainability" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Carbon Footprint Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Leaf className="w-5 h-5 mr-2 text-green-600" />
                    Carbon Footprint Tracker
                  </CardTitle>
                  <CardDescription>Environmental impact monitoring and reporting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Impact */}
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <h3 className="text-3xl font-bold text-green-700 mb-2">2.47 tons</h3>
                      <p className="text-sm text-green-600 mb-1">CO₂ Avoided This Month</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        +23% vs last month
                      </Badge>
                    </div>

                    {/* Emission Sources */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Emission Sources</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Grid Energy</span>
                          <span className="text-sm font-medium text-red-600">0.34 tons CO₂</span>
                        </div>
                        <Progress value={25} className="h-2 bg-red-100" />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Transportation</span>
                          <span className="text-sm font-medium text-orange-600">0.12 tons CO₂</span>
                        </div>
                        <Progress value={15} className="h-2 bg-orange-100" />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Operations</span>
                          <span className="text-sm font-medium text-yellow-600">0.08 tons CO₂</span>
                        </div>
                        <Progress value={10} className="h-2 bg-yellow-100" />
                      </div>
                    </div>

                    {/* Offset Actions */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Carbon Offset Actions</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleSustainabilityAction('plantTrees')}>
                          <Recycle className="w-4 h-4 mr-2" />
                          Plant Trees
                        </Button>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleSustainabilityAction('buyCredits')}>
                          <Wind className="w-4 h-4 mr-2" />
                          Buy Credits
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Environmental Impact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-blue-600" />
                    Environmental Impact
                  </CardTitle>
                  <CardDescription>Positive environmental contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Impact Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-2xl font-bold text-blue-700">847</p>
                        <p className="text-sm text-blue-600">Trees Equivalent</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-2xl font-bold text-green-700">1,240</p>
                        <p className="text-sm text-green-600">Miles Not Driven</p>
                      </div>
                    </div>

                    {/* Renewable Energy Stats */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Renewable Energy Impact</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center space-x-2">
                            <Sun className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm font-medium">Solar Energy</span>
                          </div>
                          <span className="text-sm font-bold text-yellow-700">67% of total</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2">
                            <Wind className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium">Wind Energy</span>
                          </div>
                          <span className="text-sm font-bold text-blue-700">23% of total</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <Droplets className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium">Hydro Energy</span>
                          </div>
                          <span className="text-sm font-bold text-green-700">10% of total</span>
                        </div>
                      </div>
                    </div>

                    {/* Achievement Badges */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Sustainability Achievements</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Badge variant="secondary" className="justify-center py-2">
                          <Trophy className="w-4 h-4 mr-1" />
                          Carbon Neutral
                        </Badge>
                        <Badge variant="secondary" className="justify-center py-2">
                          <Star className="w-4 h-4 mr-1" />
                          90% Renewable
                        </Badge>
                        <Badge variant="secondary" className="justify-center py-2">
                          <Target className="w-4 h-4 mr-1" />
                          Zero Waste
                        </Badge>
                        <Badge variant="secondary" className="justify-center py-2">
                          <Leaf className="w-4 h-4 mr-1" />
                          Green Certified
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sustainability Goals and Reporting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Sustainability Goals & Reporting
                </CardTitle>
                <CardDescription>Track progress towards environmental objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Goals Progress */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">2024 Goals Progress</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">100% Renewable Energy</span>
                          <span className="text-sm text-green-600">87%</span>
                        </div>
                        <Progress value={87} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">Target: December 2024</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">50% Carbon Reduction</span>
                          <span className="text-sm text-green-600">73%</span>
                        </div>
                        <Progress value={73} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">Target: June 2024</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Zero Waste Operations</span>
                          <span className="text-sm text-yellow-600">45%</span>
                        </div>
                        <Progress value={45} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">Target: September 2024</p>
                      </div>
                    </div>
                  </div>

                  {/* Reporting Actions */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Reporting & Compliance</h4>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" onClick={() => handleSustainabilityAction('generateESG')}>
                        <FileCheck className="w-4 h-4 mr-2" />
                        Generate ESG Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Carbon Disclosure Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Compliance Dashboard
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Share className="w-4 h-4 mr-2" />
                        Public Sustainability Report
                      </Button>
                    </div>

                    {/* Certifications */}
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-2">Active Certifications</h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          ISO 14001
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          ENERGY STAR
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          LEED Platinum
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnergyManagementPage; 