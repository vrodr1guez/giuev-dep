import { NextRequest, NextResponse } from 'next/server';

interface StationTwin {
  stationId: string;
  location: { lat: number; lng: number };
  powerCapacity: number;
  currentLoad: number;
  efficiency: number;
  status: 'available' | 'charging' | 'maintenance' | 'offline';
  connectedVehicle?: string;
  federatedLearning: {
    modelVersion: string;
    learningContributions: number;
    accuracy: number;
  };
}

interface VehicleTwin {
  vehicleId: string;
  batteryId: string;
  soc: number;
  soh: number;
  voltage: number;
  current: number;
  temperature: number;
  connectedStation?: string;
  degradationModel: {
    calendarAging: number;
    cycleAging: number;
    thermalStress: number;
  };
}

// Mock data for demonstration
let stationTwins: Map<string, StationTwin> = new Map();
let vehicleTwins: Map<string, VehicleTwin> = new Map();

export async function POST(request: NextRequest) {
  try {
    const { action, stationId, vehicleId, data } = await request.json();

    switch (action) {
      case 'create_station':
        const stationTwin: StationTwin = {
          stationId,
          location: data.location || { lat: 40.7128, lng: -74.0060 },
          powerCapacity: data.powerCapacity || 150,
          currentLoad: 0,
          efficiency: 0.95,
          status: 'available',
          federatedLearning: {
            modelVersion: 'v1.0',
            learningContributions: 0,
            accuracy: 0.94
          }
        };
        stationTwins.set(stationId, stationTwin);
        return NextResponse.json({
          success: true,
          message: 'Station twin created',
          data: stationTwin
        });

      case 'create_vehicle':
        const vehicleTwin: VehicleTwin = {
          vehicleId,
          batteryId: data.batteryId || `bat_${vehicleId}`,
          soc: data.soc || 50,
          soh: data.soh || 95,
          voltage: data.voltage || 400,
          current: data.current || 0,
          temperature: data.temperature || 25,
          degradationModel: {
            calendarAging: 0.02,
            cycleAging: 0.01,
            thermalStress: 0.005
          }
        };
        vehicleTwins.set(vehicleId, vehicleTwin);
        return NextResponse.json({
          success: true,
          message: 'Vehicle twin created',
          data: vehicleTwin
        });

      case 'establish_session':
        const station = stationTwins.get(stationId);
        const vehicle = vehicleTwins.get(vehicleId);
        
        if (!station || !vehicle) {
          return NextResponse.json({ error: 'Station or vehicle not found' }, { status: 404 });
        }

        // Update twins with connection
        station.connectedVehicle = vehicleId;
        station.status = 'charging';
        vehicle.connectedStation = stationId;

        // Calculate optimal charging power
        const optimalPower = calculateOptimalPower(station, vehicle);
        
        // Simulate federated learning update
        station.federatedLearning.learningContributions += 1;
        station.federatedLearning.accuracy = Math.min(0.98, 
          station.federatedLearning.accuracy + 0.001);

        const sessionData = {
          sessionId: `session_${Date.now()}`,
          stationId,
          vehicleId,
          startTime: new Date().toISOString(),
          optimalPower,
          efficiency: station.efficiency,
          predictedCompletion: new Date(Date.now() + 3600000).toISOString(), // 1 hour
          recommendations: generateRecommendations(station, vehicle),
          federatedInsights: {
            networkAccuracy: station.federatedLearning.accuracy,
            modelVersion: station.federatedLearning.modelVersion,
            learningContributions: station.federatedLearning.learningContributions
          }
        };

        return NextResponse.json({
          success: true,
          message: 'Bidirectional session established',
          data: sessionData
        });

      case 'update_station':
        const existingStation = stationTwins.get(stationId);
        if (!existingStation) {
          return NextResponse.json({ error: 'Station not found' }, { status: 404 });
        }

        // Update station data
        Object.assign(existingStation, data);
        
        // Predict maintenance
        const maintenancePrediction = predictMaintenance(existingStation);
        
        return NextResponse.json({
          success: true,
          message: 'Station updated',
          data: existingStation,
          maintenancePrediction
        });

      case 'federated_learning':
        const participants = data.participatingStations || [];
        const networkInsights = processFederatedLearning(participants);
        
        return NextResponse.json({
          success: true,
          message: 'Federated learning cycle completed',
          data: networkInsights
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Bidirectional twin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  if (type === 'network_status') {
    return NextResponse.json({
      totalStations: stationTwins.size,
      totalVehicles: vehicleTwins.size,
      activeSessions: Array.from(stationTwins.values()).filter(s => s.status === 'charging').length,
      networkEfficiency: calculateNetworkEfficiency(),
      federatedAccuracy: calculateAverageFederatedAccuracy(),
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    stations: Array.from(stationTwins.values()),
    vehicles: Array.from(vehicleTwins.values())
  });
}

// Helper functions
function calculateOptimalPower(station: StationTwin, vehicle: VehicleTwin): number {
  const basePower = Math.min(station.powerCapacity, 150);
  const socFactor = vehicle.soc < 80 ? 1.0 : 0.5;
  const tempFactor = (vehicle.temperature >= 15 && vehicle.temperature <= 35) ? 1.0 : 0.8;
  const healthFactor = vehicle.soh / 100;
  
  return Math.round(basePower * socFactor * tempFactor * healthFactor);
}

function generateRecommendations(station: StationTwin, vehicle: VehicleTwin): string[] {
  const recommendations = [];
  
  if (station.efficiency < 0.9) {
    recommendations.push("🔧 Optimize station efficiency - below optimal threshold");
  }
  
  if (vehicle.temperature > 35) {
    recommendations.push("❄️ Activate battery cooling - temperature elevated");
  }
  
  if (vehicle.soh < 85) {
    recommendations.push("🔋 Schedule battery health assessment");
  }
  
  if (station.currentLoad > station.powerCapacity * 0.8) {
    recommendations.push("⚡ Consider load balancing");
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ Optimal charging conditions detected");
  }
  
  return recommendations;
}

function predictMaintenance(station: StationTwin): object {
  const riskFactors = [
    station.currentLoad / station.powerCapacity,
    1 - station.efficiency,
    station.federatedLearning.learningContributions / 1000
  ];
  
  const riskScore = riskFactors.reduce((a, b) => a + b, 0) / riskFactors.length;
  
  return {
    riskScore: Math.round(riskScore * 100) / 100,
    predictedMaintenanceDays: Math.max(30, Math.round(365 * (1 - riskScore))),
    recommendations: riskScore > 0.7 ? ['Schedule preventive maintenance'] : ['Continue monitoring']
  };
}

function processFederatedLearning(participatingStations: string[]): object {
  const participants = participatingStations.length;
  const accuracyImprovement = participants * 0.002; // 0.2% per participant
  
  return {
    networkId: `network_${Date.now()}`,
    participants,
    accuracyImprovement: Math.round(accuracyImprovement * 100) / 100,
    modelVersion: `v${Math.floor(Date.now() / 100000)}`,
    privacyPreserved: true,
    convergenceRate: 0.95,
    recommendations: [
      "Network learning optimized",
      `${participants} stations contributing to model`,
      "Privacy-preserving aggregation successful"
    ]
  };
}

function calculateNetworkEfficiency(): number {
  const stations = Array.from(stationTwins.values());
  if (stations.length === 0) return 0;
  
  const avgEfficiency = stations.reduce((sum, s) => sum + s.efficiency, 0) / stations.length;
  return Math.round(avgEfficiency * 100) / 100;
}

function calculateAverageFederatedAccuracy(): number {
  const stations = Array.from(stationTwins.values());
  if (stations.length === 0) return 0;
  
  const avgAccuracy = stations.reduce((sum, s) => sum + s.federatedLearning.accuracy, 0) / stations.length;
  return Math.round(avgAccuracy * 100) / 100;
} 