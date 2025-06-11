/**
 * EV Charging Optimization Service
 * 
 * Generates optimized charging schedules based on:
 * - Energy price predictions
 * - Vehicle battery characteristics
 * - User constraints (departure time, target SoC)
 * - Battery health preservation
 * - Grid stability considerations
 */

import { getEnergyPricePrediction, EnergyPricePrediction } from './EnergyPricePrediction';

interface BatteryParameters {
  currentSoC: number;        // Current state of charge (0-100)
  targetSoC: number;         // Target state of charge (0-100)
  batteryCapacity: number;   // Battery capacity in kWh
  maxChargingPower: number;  // Maximum charging power in kW
  batteryHealthFactor: number; // Battery health factor (0-1)
  chargeEfficiency: number;  // Charging efficiency (0-1)
}

interface ChargingConstraints {
  departureTime: Date;         // When the vehicle needs to be ready
  pluginTime?: Date;           // When the vehicle is plugged in (default: now)
  minimumSoC?: number;         // Minimum SoC to maintain at all times
  prioritizeBatteryHealth?: boolean; // Prefer slower charging for battery health
  prioritizeRenewable?: boolean;     // Prefer charging when renewable % is high
  costSensitivity?: number;    // How important is cost saving (0-1)
}

interface ChargingSchedulePoint {
  timestamp: string;
  chargingPower: number;     // Power in kW
  expectedSoC: number;       // Expected SoC at this point
  price: number;             // Energy price at this point
  renewable: number;         // Renewable percentage
  isCritical: boolean;       // Whether this is a critical charging period
}

interface OptimizedChargingSchedule {
  vehicleId: string;
  batteryCapacity: number;
  initialSoC: number;
  targetSoC: number;
  startTime: string;
  endTime: string;
  totalChargingTime: number; // In minutes
  totalEnergyCost: number;
  totalEnergyAdded: number;  // In kWh
  costSavingsPercent: number;
  averageRenewablePercent: number;
  schedule: ChargingSchedulePoint[];
}

export class ChargingOptimization {
  private energyPricePrediction: EnergyPricePrediction;
  
  constructor() {
    this.energyPricePrediction = getEnergyPricePrediction();
  }
  
  /**
   * Generate an optimized charging schedule based on vehicle, battery and user constraints
   */
  public generateOptimizedSchedule(
    vehicleId: string,
    batteryParams: BatteryParameters,
    constraints: ChargingConstraints
  ): OptimizedChargingSchedule {
    // Default plugin time to now if not specified
    const pluginTime = constraints.pluginTime || new Date();
    const departureTime = constraints.departureTime;
    
    // Calculate how much energy needs to be added
    const targetSoCDelta = batteryParams.targetSoC - batteryParams.currentSoC;
    const energyToAddKwh = (targetSoCDelta / 100) * batteryParams.batteryCapacity;
    
    // Calculate minimum charging time needed at maximum power (in minutes)
    const minChargingTimeMinutes = (energyToAddKwh / batteryParams.maxChargingPower) * 60;
    
    // Available time window in minutes
    const availableTimeMinutes = Math.floor((departureTime.getTime() - pluginTime.getTime()) / (60 * 1000));
    
    // Verify we have enough time for charging
    if (minChargingTimeMinutes > availableTimeMinutes) {
      throw new Error('Not enough time to reach target SoC before departure');
    }
    
    // Calculate optimal charging strategy based on constraints
    return this.calculateOptimalStrategy(
      vehicleId,
      batteryParams,
      constraints,
      pluginTime,
      departureTime,
      energyToAddKwh
    );
  }
  
  /**
   * Calculate the optimal charging strategy
   */
  private calculateOptimalStrategy(
    vehicleId: string,
    batteryParams: BatteryParameters,
    constraints: ChargingConstraints,
    pluginTime: Date,
    departureTime: Date,
    energyToAddKwh: number
  ): OptimizedChargingSchedule {
    // Default values for optional constraints
    const minimumSoC = constraints.minimumSoC || batteryParams.currentSoC;
    const prioritizeBatteryHealth = constraints.prioritizeBatteryHealth || false;
    const prioritizeRenewable = constraints.prioritizeRenewable || false;
    const costSensitivity = constraints.costSensitivity ?? 0.7; // Default cost sensitivity
    
    // Get energy price predictions for the available time window
    const timeframeHours = Math.ceil((departureTime.getTime() - pluginTime.getTime()) / (60 * 60 * 1000));
    const priceForecast = this.energyPricePrediction.getPriceForecast({
      location: 'default',
      timeframe: timeframeHours,
      interval: 15, // 15-minute intervals
    });
    
    // Filter forecast to only include timepoints between plugin and departure
    const validForecast = priceForecast.filter(point => {
      const pointTime = new Date(point.timestamp);
      return pointTime >= pluginTime && pointTime <= departureTime;
    });
    
    // Maximum charging power considering battery health
    let adjustedMaxPower = batteryParams.maxChargingPower;
    if (prioritizeBatteryHealth) {
      // Reduce max power to preserve battery health
      adjustedMaxPower = Math.min(
        batteryParams.maxChargingPower, 
        batteryParams.maxChargingPower * 0.8
      );
    }
    
    // Determine if slow charging is possible
    const intervalCount = validForecast.length;
    const intervalDuration = 15; // minutes
    const energyPerIntervalAtMaxPower = (adjustedMaxPower * intervalDuration) / 60; // kWh per interval
    
    // Calculate a score for each time interval
    const intervalScores = validForecast.map(forecast => {
      // Base score is inverse of price (lower price = higher score)
      let score = 1 / forecast.price;
      
      // Adjust score based on renewable percentage if prioritized
      if (prioritizeRenewable) {
        score *= (1 + forecast.renewable / 100);
      }
      
      // Penalize very high demand periods for grid stability
      if (forecast.demand > 90) {
        score *= 0.7;
      }
      
      return {
        timestamp: forecast.timestamp,
        price: forecast.price,
        renewable: forecast.renewable,
        score: score
      };
    });
    
    // Sort intervals by score (highest first)
    intervalScores.sort((a, b) => b.score - a.score);
    
    // Calculate how many intervals we need to charge at max power
    const requiredIntervals = Math.ceil(energyToAddKwh / energyPerIntervalAtMaxPower);
    
    // Select the best intervals for charging
    const selectedIntervals = intervalScores.slice(0, requiredIntervals);
    
    // Re-sort selected intervals by timestamp for chronological schedule
    selectedIntervals.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Generate the charging schedule
    const schedule: ChargingSchedulePoint[] = [];
    let currentSoC = batteryParams.currentSoC;
    let totalCost = 0;
    let totalRenewable = 0;
    
    // First add all intervals with initial charging power = 0
    for (const interval of validForecast) {
      const isSelected = selectedIntervals.some(
        selected => selected.timestamp === interval.timestamp
      );
      
      let chargingPower = 0;
      let socDelta = 0;
      
      if (isSelected) {
        chargingPower = adjustedMaxPower;
        const energyAdded = (chargingPower * intervalDuration / 60) * batteryParams.chargeEfficiency;
        socDelta = (energyAdded / batteryParams.batteryCapacity) * 100;
        totalCost += energyAdded * interval.price;
        totalRenewable += interval.renewable;
      }
      
      currentSoC = Math.min(100, currentSoC + socDelta);
      
      schedule.push({
        timestamp: interval.timestamp,
        chargingPower: parseFloat(chargingPower.toFixed(2)),
        expectedSoC: parseFloat(currentSoC.toFixed(2)),
        price: interval.price,
        renewable: interval.renewable,
        isCritical: isSelected && currentSoC < constraints.minimumSoC
      });
    }
    
    // Verify the charging schedule reaches the target SoC
    const finalSoC = schedule[schedule.length - 1].expectedSoC;
    if (finalSoC < batteryParams.targetSoC - 0.5) { // Allow small rounding errors
      // If target SoC isn't reached, adjust schedule to add more charging
      this.adjustScheduleToReachTarget(
        schedule,
        batteryParams,
        batteryParams.targetSoC
      );
    }
    
    // Calculate schedule statistics
    const totalEnergyAdded = ((batteryParams.targetSoC - batteryParams.currentSoC) / 100) * batteryParams.batteryCapacity;
    const averagePrice = totalCost / totalEnergyAdded;
    const averageRenewable = totalRenewable / selectedIntervals.length;
    
    // Calculate cost savings relative to average price
    const avgMarketPrice = validForecast.reduce((sum, point) => sum + point.price, 0) / validForecast.length;
    const costSavingsPercent = ((avgMarketPrice - averagePrice) / avgMarketPrice) * 100;
    
    return {
      vehicleId,
      batteryCapacity: batteryParams.batteryCapacity,
      initialSoC: batteryParams.currentSoC,
      targetSoC: batteryParams.targetSoC,
      startTime: pluginTime.toISOString(),
      endTime: departureTime.toISOString(),
      totalChargingTime: requiredIntervals * intervalDuration,
      totalEnergyCost: parseFloat(totalCost.toFixed(2)),
      totalEnergyAdded: parseFloat(totalEnergyAdded.toFixed(2)),
      costSavingsPercent: parseFloat(costSavingsPercent.toFixed(1)),
      averageRenewablePercent: parseFloat(averageRenewable.toFixed(1)),
      schedule
    };
  }
  
  /**
   * Adjust schedule to ensure target SoC is reached
   */
  private adjustScheduleToReachTarget(
    schedule: ChargingSchedulePoint[],
    batteryParams: BatteryParameters,
    targetSoC: number
  ): void {
    // Sort by price (lowest first) for non-charging intervals
    const nonChargingIntervals = schedule
      .filter(point => point.chargingPower === 0)
      .sort((a, b) => a.price - b.price);
    
    let currentSoC = schedule[schedule.length - 1].expectedSoC;
    let index = 0;
    
    // Add charging to cheapest non-charging intervals until target is reached
    while (currentSoC < targetSoC && index < nonChargingIntervals.length) {
      const intervalToCharge = nonChargingIntervals[index];
      const scheduleIndex = schedule.findIndex(point => point.timestamp === intervalToCharge.timestamp);
      
      // Enable charging for this interval
      schedule[scheduleIndex].chargingPower = batteryParams.maxChargingPower;
      
      // Calculate energy and SoC delta
      const energyAdded = (batteryParams.maxChargingPower * 15 / 60) * batteryParams.chargeEfficiency;
      const socDelta = (energyAdded / batteryParams.batteryCapacity) * 100;
      
      // Update SoC for this and all future intervals
      for (let i = scheduleIndex; i < schedule.length; i++) {
        if (i === scheduleIndex) {
          schedule[i].expectedSoC = Math.min(100, schedule[i].expectedSoC + socDelta);
        } else {
          schedule[i].expectedSoC = Math.min(100, schedule[i].expectedSoC + socDelta);
        }
      }
      
      currentSoC = schedule[schedule.length - 1].expectedSoC;
      index++;
    }
  }
  
  /**
   * Optimize charging for a fleet of vehicles to balance grid load
   * This method coordinates charging across multiple vehicles to avoid demand spikes
   */
  public optimizeFleetCharging(
    vehicles: Array<{
      vehicleId: string;
      batteryParams: BatteryParameters;
      constraints: ChargingConstraints;
    }>
  ): OptimizedChargingSchedule[] {
    // First, generate individual optimized schedules for each vehicle
    const individualSchedules = vehicles.map(vehicle => 
      this.generateOptimizedSchedule(
        vehicle.vehicleId,
        vehicle.batteryParams,
        vehicle.constraints
      )
    );
    
    // Analyze the collective demand on the grid from all schedules
    const gridLoadMap = new Map<string, number>();
    
    // Calculate cumulative grid load for all 15-minute intervals
    individualSchedules.forEach(schedule => {
      schedule.schedule.forEach(point => {
        if (gridLoadMap.has(point.timestamp)) {
          gridLoadMap.set(
            point.timestamp, 
            gridLoadMap.get(point.timestamp)! + point.chargingPower
          );
        } else {
          gridLoadMap.set(point.timestamp, point.chargingPower);
        }
      });
    });
    
    // Find intervals with excessive grid load
    const gridCapacityThreshold = 100; // Example threshold in kW
    const overloadedIntervals = Array.from(gridLoadMap.entries())
      .filter(([timestamp, load]) => load > gridCapacityThreshold)
      .map(([timestamp, load]) => ({ 
        timestamp, 
        excessLoad: load - gridCapacityThreshold 
      }))
      .sort((a, b) => b.excessLoad - a.excessLoad); // Sort by most overloaded first
    
    // If no overloaded intervals, return individual schedules
    if (overloadedIntervals.length === 0) {
      return individualSchedules;
    }
    
    // Rebalance charging to avoid overloaded intervals
    const rebalancedSchedules = [...individualSchedules];
    
    // For each overloaded interval, try to shift charging to other times
    for (const overloadedInterval of overloadedIntervals) {
      // Find vehicles charging during this interval
      const chargingVehicles = rebalancedSchedules
        .map((schedule, index) => ({ 
          schedule, 
          index,
          point: schedule.schedule.find(p => p.timestamp === overloadedInterval.timestamp)
        }))
        .filter(item => item.point && item.point.chargingPower > 0)
        .sort((a, b) => {
          // Sort by priority (lower value = higher priority)
          // Consider vehicles with tighter deadlines as higher priority
          const timeToDeadlineA = new Date(a.schedule.endTime).getTime() - new Date(overloadedInterval.timestamp).getTime();
          const timeToDeadlineB = new Date(b.schedule.endTime).getTime() - new Date(overloadedInterval.timestamp).getTime();
          return timeToDeadlineA - timeToDeadlineB;
        });
      
      // Calculate how much charging we need to shift
      let loadToReduce = overloadedInterval.excessLoad;
      
      // Try to shift charging for lower priority vehicles first
      for (let i = chargingVehicles.length - 1; i >= 0 && loadToReduce > 0; i--) {
        const { schedule, index, point } = chargingVehicles[i];
        
        // Only modify vehicles that aren't in a critical charging state
        if (point && !point.isCritical) {
          // Find alternative charging intervals for this vehicle
          const vehicleData = vehicles[index];
          const alternativeSchedule = this.findAlternativeChargingTime(
            vehicleData.vehicleId,
            vehicleData.batteryParams,
            vehicleData.constraints,
            overloadedInterval.timestamp
          );
          
          // If we found a valid alternative, update the schedule
          if (alternativeSchedule) {
            rebalancedSchedules[index] = alternativeSchedule;
            loadToReduce -= point.chargingPower;
          }
        }
      }
    }
    
    return rebalancedSchedules;
  }
  
  /**
   * Find an alternative charging schedule that avoids charging at a specific time
   */
  private findAlternativeChargingTime(
    vehicleId: string,
    batteryParams: BatteryParameters,
    constraints: ChargingConstraints,
    avoidTimestamp: string
  ): OptimizedChargingSchedule | null {
    try {
      // Create a modified constraints object that avoids charging at the specified time
      const modifiedConstraints: ChargingConstraints = {
        ...constraints,
        // Add additional constraint to avoid the specified time
        // In a real implementation, this would use a more sophisticated algorithm
      };
      
      // Generate a new schedule with the modified constraints
      const alternativeSchedule = this.generateOptimizedSchedule(
        vehicleId,
        batteryParams,
        modifiedConstraints
      );
      
      // Manually modify the generated schedule to avoid charging at the specified time
      const schedulePoint = alternativeSchedule.schedule.find(p => p.timestamp === avoidTimestamp);
      if (schedulePoint) {
        schedulePoint.chargingPower = 0;
        
        // Recalculate SoC for all points after this one
        const pointIndex = alternativeSchedule.schedule.indexOf(schedulePoint);
        let currentSoC = pointIndex > 0 
          ? alternativeSchedule.schedule[pointIndex - 1].expectedSoC
          : batteryParams.currentSoC;
        
        for (let i = pointIndex; i < alternativeSchedule.schedule.length; i++) {
          const point = alternativeSchedule.schedule[i];
          const energyAdded = (point.chargingPower * 15 / 60) * batteryParams.chargeEfficiency;
          const socDelta = (energyAdded / batteryParams.batteryCapacity) * 100;
          currentSoC = Math.min(100, currentSoC + socDelta);
          point.expectedSoC = parseFloat(currentSoC.toFixed(2));
        }
        
        // Check if the final SoC meets the target
        const finalSoC = alternativeSchedule.schedule[alternativeSchedule.schedule.length - 1].expectedSoC;
        if (finalSoC >= batteryParams.targetSoC - 1) { // Allow a small tolerance
          return alternativeSchedule;
        }
      }
      
      return null; // No valid alternative found
    } catch (error) {
      console.error('Error finding alternative charging time:', error);
      return null;
    }
  }
}

// Singleton instance for convenience
let chargingOptimizationInstance: ChargingOptimization | null = null;

export function getChargingOptimization(): ChargingOptimization {
  if (!chargingOptimizationInstance) {
    chargingOptimizationInstance = new ChargingOptimization();
  }
  return chargingOptimizationInstance;
} 