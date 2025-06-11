interface EnergyConsumption {
  vehicleId: string;
  date: string;
  kwhConsumed: number;
  distanceTraveled: number;
  efficiencyKwhPer100km: number;
}

interface EnergyCost {
  date: string;
  costPerKwh: number;
  totalCost: number;
  kwhConsumed: number;
}

interface EnergySource {
  source: 'grid' | 'renewable' | 'mixed';
  percentage: number;
  co2Emissions: number; // g/kWh
}

interface FleetEnergySummary {
  totalKwhConsumed: number;
  averageEfficiency: number;
  totalCost: number;
  co2Saved: number;
  periodStart: string;
  periodEnd: string;
  energySources: EnergySource[];
}

// Mock data
const mockEnergyConsumption: Record<string, EnergyConsumption[]> = {
  'v-001': [
    {
      vehicleId: 'v-001',
      date: '2024-05-20',
      kwhConsumed: 18.5,
      distanceTraveled: 120,
      efficiencyKwhPer100km: 15.4
    },
    {
      vehicleId: 'v-001',
      date: '2024-05-21',
      kwhConsumed: 12.8,
      distanceTraveled: 85,
      efficiencyKwhPer100km: 15.1
    }
  ],
  'v-002': [
    {
      vehicleId: 'v-002',
      date: '2024-05-20',
      kwhConsumed: 21.2,
      distanceTraveled: 150,
      efficiencyKwhPer100km: 14.1
    },
    {
      vehicleId: 'v-002',
      date: '2024-05-21',
      kwhConsumed: 10.5,
      distanceTraveled: 72,
      efficiencyKwhPer100km: 14.6
    }
  ],
  'v-003': [
    {
      vehicleId: 'v-003',
      date: '2024-05-20',
      kwhConsumed: 25.8,
      distanceTraveled: 145,
      efficiencyKwhPer100km: 17.8
    },
    {
      vehicleId: 'v-003',
      date: '2024-05-21',
      kwhConsumed: 22.4,
      distanceTraveled: 128,
      efficiencyKwhPer100km: 17.5
    }
  ]
};

const mockEnergyCosts: EnergyCost[] = [
  {
    date: '2024-05-20',
    costPerKwh: 0.12,
    totalCost: 7.86,
    kwhConsumed: 65.5
  },
  {
    date: '2024-05-21',
    costPerKwh: 0.14,
    totalCost: 6.40,
    kwhConsumed: 45.7
  }
];

export class FleetEnergyService {
  /**
   * Get energy consumption for a vehicle
   */
  async getVehicleEnergyConsumption(vehicleId: string): Promise<EnergyConsumption[]> {
    return mockEnergyConsumption[vehicleId] || [];
  }

  /**
   * Get energy consumption for all vehicles
   */
  async getAllVehiclesEnergyConsumption(): Promise<Record<string, EnergyConsumption[]>> {
    return mockEnergyConsumption;
  }

  /**
   * Get energy costs
   */
  async getEnergyCosts(startDate: string, endDate: string): Promise<EnergyCost[]> {
    // In a real app, we would filter by date range
    return mockEnergyCosts;
  }

  /**
   * Get fleet energy summary
   */
  async getFleetEnergySummary(startDate: string, endDate: string): Promise<FleetEnergySummary> {
    // Calculate total kWh consumed across all vehicles
    let totalKwhConsumed = 0;
    let totalDistanceTraveled = 0;
    
    Object.values(mockEnergyConsumption).forEach(vehicleData => {
      vehicleData.forEach(data => {
        totalKwhConsumed += data.kwhConsumed;
        totalDistanceTraveled += data.distanceTraveled;
      });
    });
    
    // Calculate average efficiency
    const averageEfficiency = totalDistanceTraveled > 0 
      ? (totalKwhConsumed / totalDistanceTraveled) * 100
      : 0;
    
    // Calculate total cost
    const totalCost = mockEnergyCosts.reduce((sum, cost) => sum + cost.totalCost, 0);
    
    // Mock CO2 saved calculation (compared to gas vehicles)
    // Assuming gas vehicle emits 120g CO2/km and EV charging emits 50g CO2/km on average
    const co2Saved = totalDistanceTraveled * (120 - 50) / 1000; // in kg
    
    return {
      totalKwhConsumed,
      averageEfficiency,
      totalCost,
      co2Saved,
      periodStart: startDate,
      periodEnd: endDate,
      energySources: [
        { source: 'grid', percentage: 65, co2Emissions: 85 },
        { source: 'renewable', percentage: 30, co2Emissions: 10 },
        { source: 'mixed', percentage: 5, co2Emissions: 45 }
      ]
    };
  }
  
  /**
   * Get energy efficiency recommendations
   */
  async getEnergyEfficiencyRecommendations(): Promise<string[]> {
    return [
      "Schedule charging during off-peak hours to reduce costs",
      "Implement route optimization to decrease overall energy consumption",
      "Provide regular driver coaching on energy-efficient driving techniques",
      "Ensure proper tire inflation to improve vehicle efficiency",
      "Consider upgrading older fleet vehicles to more efficient models"
    ];
  }
} 