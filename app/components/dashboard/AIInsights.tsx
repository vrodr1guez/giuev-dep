/// <reference path="../../types/react.d.ts" />
import React from 'react';
// Temporarily use relative imports until @/store path is properly configured
import { useSelector } from '../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { useAIFeatures } from '../../hooks/useAIFeatures';
import { RootState } from '../../store';
import { Vehicle } from '../../types/models';
import { RefreshCw, AlertCircle, CheckCircle2, BrainCircuit } from 'lucide-react';

interface AIRecommendation {
  type: 'battery' | 'charging' | 'route' | 'driver';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface BatteryPrediction {
  recommendations: string[];
  predictedSoH: number;
}

interface ChargingSchedule {
  energySavings: number;
}

interface DriverAnalysis {
  score: number;
  recommendations: string[];
}

const AIInsights: React.FC = () => {
  const [recommendations, setRecommendations] = React.useState([] as AIRecommendation[]);
  const [loading, setLoading] = React.useState(true as boolean);
  const [error, setError] = React.useState('' as string);
  const [actionTaken, setActionTaken] = React.useState({} as Record<number, boolean>);
  const [lastUpdated, setLastUpdated] = React.useState(null as Date | null);
  
  // Use a safer type approach with optional chaining
  const vehicles = useSelector((state: RootState) => state?.vehicles?.items || []);
  const {
    getPredictedBatteryHealth,
    getOptimalChargingSchedule,
    analyzeDriverBehavior
  } = useAIFeatures();

  const generateInsights = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const insights: AIRecommendation[] = [];

      // Get battery health predictions for all vehicles
      await Promise.all(vehicles.map(async (vehicle: Vehicle) => {
        try {
          const prediction = await getPredictedBatteryHealth(vehicle) as BatteryPrediction;
          if (prediction.recommendations.length > 0) {
            insights.push({
              type: 'battery',
              title: `Battery Health Alert - ${vehicle.name}`,
              description: prediction.recommendations[0],
              impact: prediction.predictedSoH < 80 ? 'high' : 'medium',
              actionable: true
            });
          }
        } catch (err) {
          console.error(`Error getting battery prediction for ${vehicle.name}:`, err);
        }
      }));

      // Get optimal charging schedule for active vehicles
      const activeVehicles = vehicles.filter((v: Vehicle) => v.status === 'available' || v.status === 'charging');
      if (activeVehicles.length > 0) {
        try {
          const schedule = await getOptimalChargingSchedule({
            vehicleIds: activeVehicles.map((v: Vehicle) => v.id),
            requiredSoC: 90,
            departureTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours from now
          }) as ChargingSchedule;

          if (schedule.energySavings > 0) {
            insights.push({
              type: 'charging',
              title: 'Charging Optimization Available',
              description: `Optimize charging schedule to save ${schedule.energySavings.toFixed(2)} kWh`,
              impact: schedule.energySavings > 10 ? 'high' : 'medium',
              actionable: true
            });
          }
        } catch (err) {
          console.error("Error getting charging schedule:", err);
          insights.push({
            type: 'charging',
            title: 'Charging Optimization',
            description: 'Unable to calculate optimal charging schedule at this time',
            impact: 'low',
            actionable: false
          });
        }
      }

      // Analyze driver behavior for vehicles in use
      const activeDrivers = vehicles.filter((v: Vehicle) => v.status === 'in_use' && v.driver);
      if (activeDrivers.length > 0) {
        const timeframe: [string, string] = [
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          new Date().toISOString()
        ];

        await Promise.all(activeDrivers.map(async (vehicle: Vehicle) => {
          try {
            const analysis = await analyzeDriverBehavior({
              vehicleId: vehicle.id,
              timeframe
            }) as DriverAnalysis;

            if (analysis.score < 0.7) {
              insights.push({
                type: 'driver',
                title: `Driver Performance - ${vehicle.driver?.name}`,
                description: analysis.recommendations[0] || 'Efficiency improvements recommended',
                impact: 'medium',
                actionable: true
              });
            }
          } catch (err) {
            console.error(`Error analyzing driver behavior for ${vehicle.name}:`, err);
          }
        }));
      }

      setRecommendations(insights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setError('Failed to generate AI insights. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [vehicles, getPredictedBatteryHealth, getOptimalChargingSchedule, analyzeDriverBehavior]);

  React.useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  const handleRefresh = () => {
    generateInsights();
  };

  const handleAction = (index: number) => {
    setActionTaken((prev: Record<number, boolean>) => ({
      ...prev,
      [index]: true
    }));
    // Here you would typically implement actual action logic
    // For example, opening a modal or navigating to a specific page
    console.log('Taking action on insight:', recommendations[index]);
  };

  const getImpactColor = (impact: AIRecommendation['impact']): string => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[impact];
  };

  const getImpactBgColor = (impact: AIRecommendation['impact']): string => {
    const colors = {
      high: 'bg-red-50',
      medium: 'bg-yellow-50',
      low: 'bg-green-50'
    };
    return colors[impact];
  };

  const formatUpdatedTime = (date: Date | null): string => {
    if (!date) return 'Never';
    
    // Check if it's today
    const now = new Date();
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <BrainCircuit className="mr-2 h-5 w-5 text-purple-500" />
          <CardTitle>AI-Powered Insights</CardTitle>
        </div>
        <div className="flex items-center">
          {lastUpdated && (
            <span className="text-xs text-gray-500 mr-3">
              Updated: {formatUpdatedTime(lastUpdated)}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Refresh insights"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-500' : 'text-gray-500'}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-red-500">
            <AlertCircle className="h-10 w-10 mb-2" />
            <p className="text-center mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec: AIRecommendation, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getImpactBgColor(rec.impact)} border-gray-200 transition-all ${
                  actionTaken[index] ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center">
                      {rec.title}
                      {actionTaken[index] && (
                        <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                      )}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">{rec.description}</p>
                  </div>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getImpactColor(rec.impact)} ${getImpactBgColor(rec.impact)}`}>
                    {rec.impact.toUpperCase()}
                  </span>
                </div>
                {rec.actionable && !actionTaken[index] && (
                  <button 
                    onClick={() => handleAction(index)}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    Take Action <span className="ml-1">→</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <BrainCircuit className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="mb-2">No AI insights available at this time</p>
            <p className="text-sm">All systems are running optimally!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights; 