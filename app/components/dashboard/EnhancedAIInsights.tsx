/// <reference path="../../types/react.d.ts" />
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Battery, Zap, Calendar, AlertCircle, Car, Route, 
  TrendingUp, TrendingDown, LineChart, Settings, 
  ExternalLink, RefreshCw, Info, Clock
} from 'lucide-react';

// Type definitions
interface BatteryPrediction {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  currentSoH: number;
  predictedSoH: number;
  monthsToReplacement: number;
  recommendations: string[];
}

interface MaintenanceSchedule {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  nextMaintenanceDate: string;
  maintenanceType: string;
  criticalComponents: {
    name: string;
    health: number;
    replacementStatus: 'ok' | 'soon' | 'urgent';
  }[];
  estimatedCost: number;
  recommendations: string[];
}

interface RouteOptimization {
  routeId: string;
  routeName: string;
  currentEnergy: number;
  optimizedEnergy: number;
  savingsPercentage: number;
  optimizedDuration: number;
  currentDuration: number;
  timeReduction: number;
  recommendations: string[];
}

interface EnergyPrediction {
  period: string;
  predictedUsage: number;
  previousUsage: number;
  changePercentage: number;
  costPrediction: number;
  peakTimes: string[];
  recommendations: string[];
}

interface DriverBehaviorInsight {
  driverId: string;
  driverName: string;
  efficiencyScore: number;
  trend: 'improving' | 'declining' | 'stable';
  strongPoints: string[];
  improvementAreas: string[];
  recommendations: string[];
}

const EnhancedAIInsights: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('battery');
  const [isLoading, setIsLoading] = React.useState(true);
  const [showDetail, setShowDetail] = React.useState(null as string | null);

  // State for each insight type
  const [batteryPredictions, setBatteryPredictions] = React.useState([] as BatteryPrediction[]);
  const [maintenanceSchedules, setMaintenanceSchedules] = React.useState([] as MaintenanceSchedule[]);
  const [routeOptimizations, setRouteOptimizations] = React.useState([] as RouteOptimization[]);
  const [energyPredictions, setEnergyPredictions] = React.useState([] as EnergyPrediction[]);
  const [driverInsights, setDriverInsights] = React.useState([] as DriverBehaviorInsight[]);

  React.useEffect(() => {
    // Simulating API calls to fetch AI insights
    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        // In a real app, these would be actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in a real app, this would come from backend ML services
        setBatteryPredictions([
          {
            vehicleId: '1',
            vehicleName: 'Tesla Model Y',
            licensePlate: 'ABC123',
            currentSoH: 92,
            predictedSoH: 88,
            monthsToReplacement: 18,
            recommendations: [
              'Schedule charging to avoid frequent deep discharges',
              'Avoid exposure to extreme temperatures when parked',
              'Consider reducing DC fast charging frequency'
            ]
          },
          {
            vehicleId: '2',
            vehicleName: 'Tesla Model 3',
            licensePlate: 'XYZ789',
            currentSoH: 86,
            predictedSoH: 78,
            monthsToReplacement: 12,
            recommendations: [
              'Battery degradation accelerating - schedule diagnostic',
              'Limit charging to 80% maximum to extend lifespan',
              'Reduce rapid acceleration patterns'
            ]
          },
          {
            vehicleId: '3',
            vehicleName: 'Ford F-150 Lightning',
            licensePlate: 'DEF456',
            currentSoH: 95,
            predictedSoH: 93,
            monthsToReplacement: 24,
            recommendations: [
              'Battery performing optimally - maintain current usage patterns',
              'Continue using scheduled off-peak charging'
            ]
          }
        ]);

        setMaintenanceSchedules([
          {
            vehicleId: '2',
            vehicleName: 'Tesla Model 3',
            licensePlate: 'XYZ789',
            nextMaintenanceDate: '2024-06-15',
            maintenanceType: 'Comprehensive Service',
            criticalComponents: [
              { name: 'Brake Pads', health: 65, replacementStatus: 'soon' },
              { name: 'Coolant System', health: 82, replacementStatus: 'ok' },
              { name: 'Cabin Air Filter', health: 45, replacementStatus: 'urgent' }
            ],
            estimatedCost: 480,
            recommendations: [
              'Schedule brake pad replacement within 2 weeks',
              'Check coolant levels and quality',
              'Replace cabin air filter immediately'
            ]
          },
          {
            vehicleId: '4',
            vehicleName: 'Chevrolet Bolt',
            licensePlate: 'GHI789',
            nextMaintenanceDate: '2024-05-30',
            maintenanceType: 'Software Update',
            criticalComponents: [
              { name: 'BMS Firmware', health: 70, replacementStatus: 'soon' },
              { name: 'Tire Tread', health: 62, replacementStatus: 'soon' },
              { name: 'Suspension', health: 88, replacementStatus: 'ok' }
            ],
            estimatedCost: 120,
            recommendations: [
              'Schedule BMS firmware update to address charging issues',
              'Rotate tires and check pressure',
              'Monitor suspension during next service'
            ]
          }
        ]);

        setRouteOptimizations([
          {
            routeId: 'R001',
            routeName: 'Downtown Delivery Loop',
            currentEnergy: 45.2,
            optimizedEnergy: 38.6,
            savingsPercentage: 14.6,
            currentDuration: 175,
            optimizedDuration: 158,
            timeReduction: 17,
            recommendations: [
              'Reorder stops to reduce backtracking',
              'Adjust departure time to avoid peak traffic at 8:30am',
              'Use regenerative braking more effectively on downhill segments'
            ]
          },
          {
            routeId: 'R002',
            routeName: 'Airport Shuttle',
            currentEnergy: 62.5,
            optimizedEnergy: 59.8,
            savingsPercentage: 4.3,
            currentDuration: 210,
            optimizedDuration: 205,
            timeReduction: 5,
            recommendations: [
              'Minor optimizations available - route already efficient',
              'Consider using HOV lanes during peak hours',
              'Maintain steady speed to maximize range'
            ]
          },
          {
            routeId: 'R003',
            routeName: 'Suburban Distribution',
            currentEnergy: 78.3,
            optimizedEnergy: 65.1,
            savingsPercentage: 16.9,
            currentDuration: 245,
            optimizedDuration: 218,
            timeReduction: 27,
            recommendations: [
              'Significant optimization opportunity by reordering stops',
              'Use alternative roads to avoid construction on Main St',
              'Schedule charging stop at Midway Point for optimal efficiency'
            ]
          }
        ]);

        setEnergyPredictions([
          {
            period: 'Next Week',
            predictedUsage: 1250,
            previousUsage: 1150,
            changePercentage: 8.7,
            costPrediction: 187.5,
            peakTimes: ['Mon 5-7pm', 'Thu 6-8pm', 'Fri 4-7pm'],
            recommendations: [
              'Shift charging to off-peak hours (11pm-6am) to save 15% on energy costs',
              'Expected temperature increase will impact battery cooling - optimize for morning departures',
              'Consider demand response program participation during peak times'
            ]
          },
          {
            period: 'Next Month',
            predictedUsage: 5600,
            previousUsage: 5300,
            changePercentage: 5.7,
            costPrediction: 840,
            peakTimes: ['Weekdays 4-8pm'],
            recommendations: [
              'Summer rate schedule starts next month - shift charging to take advantage of new time-of-use rates',
              'Schedule vehicle maintenance to optimize energy efficiency',
              'Projected savings of $120 by implementing smart charging across fleet'
            ]
          }
        ]);

        setDriverInsights([
          {
            driverId: 'D001',
            driverName: 'John Smith',
            efficiencyScore: 87,
            trend: 'improving',
            strongPoints: ['Smooth acceleration', 'Optimal speed maintenance', 'Effective use of regenerative braking'],
            improvementAreas: ['Route planning', 'Climate control usage'],
            recommendations: [
              'Continue improvement in acceleration patterns',
              'Pre-condition vehicle while connected to charger',
              'Use navigation system for all trips to optimize routes'
            ]
          },
          {
            driverId: 'D002',
            driverName: 'Emily Chen',
            efficiencyScore: 92,
            trend: 'stable',
            strongPoints: ['Excellent energy management', 'Optimal route selection', 'Proactive battery management'],
            improvementAreas: ['Peak hour driving unavoidable due to schedule'],
            recommendations: [
              'Consider schedule adjustments to avoid peak congestion',
              'Share best practices with other drivers',
              'Minimal improvement needed - maintain current driving behavior'
            ]
          },
          {
            driverId: 'D003',
            driverName: 'Michael Brown',
            efficiencyScore: 72,
            trend: 'declining',
            strongPoints: ['Good route adherence'],
            improvementAreas: ['Harsh acceleration', 'Excessive speed', 'Poor regenerative braking usage'],
            recommendations: [
              'Schedule driver coaching session on efficient EV driving techniques',
              'Reduce acceleration intensity by 30% to improve range',
              'Use cruise control on highway segments',
              'Watch training video on regenerative braking optimization'
            ]
          }
        ]);
      } catch (error) {
        console.error('Error fetching AI insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  // Helper functions for rendering
  const getHealthColor = (value: number) => {
    if (value >= 85) return 'text-green-500';
    if (value >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800';
      case 'soon': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <LineChart className="h-4 w-4 text-blue-500" />;
    }
  };

  // Render battery health predictions
  const renderBatteryPredictions = () => (
    <div className="space-y-4">
      {batteryPredictions.map((prediction: BatteryPrediction) => (
        <Card key={prediction.vehicleId} className="overflow-hidden">
          <div className={`h-1 ${prediction.predictedSoH >= 85 ? 'bg-green-500' : prediction.predictedSoH >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{prediction.vehicleName}</h3>
                <p className="text-sm text-gray-500">{prediction.licensePlate}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium">Current SoH</div>
                  <div className={`text-lg font-bold ${getHealthColor(prediction.currentSoH)}`}>
                    {prediction.currentSoH}%
                  </div>
                </div>
                <Battery className={`h-6 w-6 ${getHealthColor(prediction.currentSoH)}`} />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Predicted SoH (6 months)</span>
                <span className={`text-sm font-bold ${getHealthColor(prediction.predictedSoH)}`}>
                  {prediction.predictedSoH}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${prediction.predictedSoH >= 85 ? 'bg-green-500' : prediction.predictedSoH >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${prediction.predictedSoH}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm">
                Estimated months to replacement: <span className="font-medium">{prediction.monthsToReplacement}</span>
              </p>
            </div>
            
            {showDetail === prediction.vehicleId ? (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {prediction.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-blue-600" 
                  onClick={() => setShowDetail(null)}
                >
                  Hide Details
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 text-blue-600" 
                onClick={() => setShowDetail(prediction.vehicleId)}
              >
                View Recommendations
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render maintenance schedules
  const renderMaintenanceSchedules = () => (
    <div className="space-y-4">
      {maintenanceSchedules.map((schedule: MaintenanceSchedule) => (
        <Card key={schedule.vehicleId}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{schedule.vehicleName}</h3>
                <p className="text-sm text-gray-500">{schedule.licensePlate}</p>
              </div>
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                {schedule.maintenanceType}
              </div>
            </div>
            
            <div className="mt-3 flex items-center">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">
                <span className="font-medium">Next Maintenance:</span> {new Date(schedule.nextMaintenanceDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Critical Components:</h4>
              <div className="space-y-2">
                {schedule.criticalComponents.map((component: { name: string; health: number; replacementStatus: string }, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${component.health >= 85 ? 'bg-green-500' : component.health >= 70 ? 'bg-yellow-500' : 'bg-red-500'} mr-2`}></div>
                      <span className="text-sm">{component.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{component.health}%</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(component.replacementStatus)}`}>
                        {component.replacementStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Estimated Cost</span>
                <span className="font-bold">${schedule.estimatedCost}</span>
              </div>
            </div>
            
            {showDetail === schedule.vehicleId ? (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {schedule.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-blue-600" 
                  onClick={() => setShowDetail(null)}
                >
                  Hide Details
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 text-blue-600" 
                onClick={() => setShowDetail(schedule.vehicleId)}
              >
                View Recommendations
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render route optimizations
  const renderRouteOptimizations = () => (
    <div className="space-y-4">
      {routeOptimizations.map((route: RouteOptimization) => (
        <Card key={route.routeId}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{route.routeName}</h3>
                <p className="text-sm text-gray-500">Route ID: {route.routeId}</p>
              </div>
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                {route.savingsPercentage.toFixed(1)}% Savings
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">Energy Usage</div>
                <div className="flex items-end justify-between mt-1">
                  <div>
                    <div className="text-xs text-gray-500">Current</div>
                    <div className="font-bold">{route.currentEnergy} kWh</div>
                  </div>
                  <div className="text-center">
                    <Zap className="h-4 w-4 text-green-500 mx-auto" />
                    <div className="text-xs text-green-600 font-medium">Save {(route.currentEnergy - route.optimizedEnergy).toFixed(1)} kWh</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Optimized</div>
                    <div className="font-bold text-green-600">{route.optimizedEnergy} kWh</div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">Duration</div>
                <div className="flex items-end justify-between mt-1">
                  <div>
                    <div className="text-xs text-gray-500">Current</div>
                    <div className="font-bold">{Math.floor(route.currentDuration/60)}h {route.currentDuration%60}m</div>
                  </div>
                  <div className="text-center">
                    <Clock className="h-4 w-4 text-blue-500 mx-auto" />
                    <div className="text-xs text-blue-600 font-medium">Save {route.timeReduction}m</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Optimized</div>
                    <div className="font-bold text-blue-600">{Math.floor(route.optimizedDuration/60)}h {route.optimizedDuration%60}m</div>
                  </div>
                </div>
              </div>
            </div>
            
            {showDetail === route.routeId ? (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {route.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm">
                    Apply Optimization
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDetail(null)}
                  >
                    Hide Details
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 text-blue-600" 
                onClick={() => setShowDetail(route.routeId)}
              >
                View Recommendations
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render energy predictions
  const renderEnergyPredictions = () => (
    <div className="space-y-4">
      {energyPredictions.map((prediction: EnergyPrediction, index: number) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{prediction.period} Energy Forecast</h3>
                <p className="text-sm text-gray-500">Prediction based on historical usage and weather forecasts</p>
              </div>
              <div className={`flex items-center ${prediction.changePercentage > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {prediction.changePercentage > 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {prediction.changePercentage > 0 ? '+' : ''}{prediction.changePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">Energy Usage (kWh)</div>
                <div className="flex items-end justify-between mt-1">
                  <div>
                    <div className="text-xs text-gray-500">Previous</div>
                    <div className="font-bold">{prediction.previousUsage}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Predicted</div>
                    <div className="font-bold">{prediction.predictedUsage}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">Estimated Cost</div>
                <div className="flex items-center justify-center mt-1">
                  <div className="font-bold text-lg">${prediction.costPrediction}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-2">Predicted Peak Usage Times:</h4>
              <div className="flex flex-wrap gap-2">
                {prediction.peakTimes.map((time: string, i: number) => (
                  <div key={i} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    {time}
                  </div>
                ))}
              </div>
            </div>
            
            {showDetail === `energy-${index}` ? (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-2">AI Recommendations:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {prediction.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-blue-600" 
                  onClick={() => setShowDetail(null)}
                >
                  Hide Recommendations
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 text-blue-600" 
                onClick={() => setShowDetail(`energy-${index}`)}
              >
                View Recommendations
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render driver insights
  const renderDriverInsights = () => (
    <div className="space-y-4">
      {driverInsights.map((driver: DriverBehaviorInsight) => (
        <Card key={driver.driverId}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{driver.driverName}</h3>
                <p className="text-sm text-gray-500">Driver ID: {driver.driverId}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {getTrendIcon(driver.trend)}
                  <span className="text-xs font-medium ml-1">{driver.trend}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  driver.efficiencyScore >= 85 ? 'bg-green-100 text-green-800' : 
                  driver.efficiencyScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  Score: {driver.efficiencyScore}
                </div>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Strong Points</h4>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  {driver.strongPoints.map((point: string, i: number) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Areas to Improve</h4>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  {driver.improvementAreas.map((area: string, i: number) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {showDetail === driver.driverId ? (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-2">AI Recommendations:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {driver.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm">
                    Send to Driver
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowDetail(null)}
                  >
                    Hide Details
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 text-blue-600" 
                onClick={() => setShowDetail(driver.driverId)}
              >
                View Recommendations
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500 animate-pulse" />
            AI-Powered Insights
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsLoading(true)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">AI analyzing fleet data...</p>
          </div>
        ) : (
          <>
            <Tabs>
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="battery" className="flex items-center justify-center gap-1">
                  <Battery className="h-4 w-4" />
                  <span className="hidden sm:inline">Battery</span>
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="flex items-center justify-center gap-1">
                  <Car className="h-4 w-4" />
                  <span className="hidden sm:inline">Maintenance</span>
                </TabsTrigger>
                <TabsTrigger value="routes" className="flex items-center justify-center gap-1">
                  <Route className="h-4 w-4" />
                  <span className="hidden sm:inline">Routes</span>
                </TabsTrigger>
                <TabsTrigger value="energy" className="flex items-center justify-center gap-1">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Energy</span>
                </TabsTrigger>
                <TabsTrigger value="drivers" className="flex items-center justify-center gap-1">
                  <LineChart className="h-4 w-4" />
                  <span className="hidden sm:inline">Drivers</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="battery">
                <div className="mb-3 flex items-center text-sm">
                  <Info className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-gray-600">AI prediction of battery state of health (SoH) based on usage patterns and environmental factors.</span>
                </div>
                {renderBatteryPredictions()}
              </TabsContent>
              
              <TabsContent value="maintenance">
                <div className="mb-3 flex items-center text-sm">
                  <Info className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-gray-600">Predictive maintenance schedules and component health forecasts.</span>
                </div>
                {renderMaintenanceSchedules()}
              </TabsContent>
              
              <TabsContent value="routes">
                <div className="mb-3 flex items-center text-sm">
                  <Info className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-gray-600">Route optimization recommendations to improve energy efficiency and reduce travel time.</span>
                </div>
                {renderRouteOptimizations()}
              </TabsContent>
              
              <TabsContent value="energy">
                <div className="mb-3 flex items-center text-sm">
                  <Info className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-gray-600">Energy usage forecasts and cost optimization recommendations.</span>
                </div>
                {renderEnergyPredictions()}
              </TabsContent>
              
              <TabsContent value="drivers">
                <div className="mb-3 flex items-center text-sm">
                  <Info className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-gray-600">Driver behavior analysis and efficiency improvement recommendations.</span>
                </div>
                {renderDriverInsights()}
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" asChild>
                <a href="#" className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>View Full AI Analysis</span>
                </a>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAIInsights; 