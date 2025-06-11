/**
 * A simulator for EV telemetry data.
 * This service generates realistic EV telemetry data for testing and demonstration purposes.
 */
export class TelematicsSimulator {
  private timerId: NodeJS.Timeout | null = null;
  private callbacks: ((data: any) => void)[] = [];
  private vehicleData: any;
  private config: SimulatorConfig;

  constructor(initialData: any, config: Partial<SimulatorConfig> = {}) {
    // Default initial data if not provided
    this.vehicleData = initialData || {
      vehicle_id: '1',
      state_of_charge_percent: 75.5,
      state_of_health_percent: 97.2,
      estimated_range_km: 295.8,
      latitude: 40.7128,
      longitude: -74.0060,
      speed_kmh: 45.0,
      is_charging: false,
      charging_power_kw: 0,
      odometer_km: 15478.2,
      battery_temperature_c: 24.5,
      outside_temperature_c: 21.2,
      energy_consumption_kwh_per_100km: 16.7,
      regenerated_energy_kwh: 2.3,
      power_output_kw: 24.0,
      timestamp: new Date().toISOString()
    };

    // Default configuration
    this.config = {
      updateInterval: 2000,
      enableDriving: true,
      enableCharging: false,
      randomizeData: true,
      batteryDrainRate: 0.05,
      drivingSpeedVariance: 10,
      ...config
    };
  }

  /**
   * Start the simulation
   */
  start(): void {
    if (this.timerId) {
      this.stop();
    }

    this.timerId = setInterval(() => {
      this.updateVehicleData();
      this.notifyCallbacks();
    }, this.config.updateInterval);
  }

  /**
   * Stop the simulation
   */
  stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Subscribe to telemetry updates
   */
  subscribe(callback: (data: any) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Update simulator configuration
   */
  updateConfig(config: Partial<SimulatorConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart if running
    if (this.timerId) {
      this.stop();
      this.start();
    }
  }

  /**
   * Set vehicle to charging mode
   */
  startCharging(chargingPower: number = 11): void {
    this.config.enableDriving = false;
    this.config.enableCharging = true;
    this.vehicleData.is_charging = true;
    this.vehicleData.charging_power_kw = chargingPower;
    this.vehicleData.speed_kmh = 0;
  }

  /**
   * Set vehicle to driving mode
   */
  startDriving(): void {
    this.config.enableDriving = true;
    this.config.enableCharging = false;
    this.vehicleData.is_charging = false;
    this.vehicleData.charging_power_kw = 0;
    this.vehicleData.speed_kmh = 45;
  }

  /**
   * Update the vehicle data with simulated changes
   */
  private updateVehicleData(): void {
    const { randomizeData, enableDriving, enableCharging } = this.config;
    
    // Update timestamp
    this.vehicleData.timestamp = new Date().toISOString();

    // Randomly adjust speed if driving
    if (enableDriving) {
      this.simulateDriving();
    } 
    // Simulate charging if in charging mode
    else if (enableCharging) {
      this.simulateCharging();
    }
    // Vehicle is idle
    else {
      this.simulateIdle();
    }

    // Always randomize some values slightly if enabled
    if (randomizeData) {
      this.randomizeValues();
    }

    // Ensure data consistency
    this.ensureDataConsistency();
  }

  /**
   * Simulate a driving vehicle
   */
  private simulateDriving(): void {
    const { drivingSpeedVariance, batteryDrainRate } = this.config;
    
    // Adjust speed
    const speedDelta = (Math.random() * 2 - 1) * drivingSpeedVariance;
    this.vehicleData.speed_kmh += speedDelta;
    
    // Constrain speed to realistic values (0-120 km/h)
    this.vehicleData.speed_kmh = Math.max(0, Math.min(120, this.vehicleData.speed_kmh));
    
    // Drain battery based on usage
    const consumptionFactor = 1 + (this.vehicleData.speed_kmh / 100); // Higher speed = higher consumption
    const drain = batteryDrainRate * consumptionFactor;
    this.vehicleData.state_of_charge_percent -= drain;
    
    // Update odometer
    const distanceTraveled = (this.vehicleData.speed_kmh / 3600) * (this.config.updateInterval / 1000);
    this.vehicleData.odometer_km += distanceTraveled;
    
    // Update energy consumption (kWh per 100km)
    this.vehicleData.energy_consumption_kwh_per_100km = 15 + (Math.random() * 5 - 2.5);
    
    // Regenerative braking simulation (random chance when slowing down)
    if (speedDelta < -5 && Math.random() > 0.7) {
      const regen = Math.abs(speedDelta) / 100;
      this.vehicleData.regenerated_energy_kwh += regen;
      this.vehicleData.state_of_charge_percent += regen / 10;
    }
    
    // Update power output based on speed
    this.vehicleData.power_output_kw = this.vehicleData.speed_kmh * 0.5 * (0.9 + Math.random() * 0.2);
  }

  /**
   * Simulate a charging vehicle
   */
  private simulateCharging(): void {
    // Increase state of charge based on charging power
    const timeFactorHours = this.config.updateInterval / 3600000; // Convert ms to hours
    const batteryCapacityKwh = 75; // Assumed battery capacity in kWh
    
    // Energy added to battery in this interval
    const energyAddedKwh = this.vehicleData.charging_power_kw * timeFactorHours;
    
    // Convert to percentage points of SoC
    const socIncrease = (energyAddedKwh / batteryCapacityKwh) * 100;
    
    // Add to state of charge
    this.vehicleData.state_of_charge_percent += socIncrease;
    
    // Charging slows down as battery fills up (simulated taper)
    if (this.vehicleData.state_of_charge_percent > 80) {
      const taperFactor = 1 - ((this.vehicleData.state_of_charge_percent - 80) / 40);
      this.vehicleData.charging_power_kw *= Math.max(0.1, taperFactor);
    }
    
    // Update battery temperature (slight increase during charging)
    this.vehicleData.battery_temperature_c += 0.1 * Math.random();
  }

  /**
   * Simulate an idle vehicle (not driving or charging)
   */
  private simulateIdle(): void {
    // Minimal battery drain when idle
    this.vehicleData.state_of_charge_percent -= 0.01;
    
    // Vehicle is stationary
    this.vehicleData.speed_kmh = 0;
    this.vehicleData.power_output_kw = 0;
    
    // Battery slowly cools down
    if (this.vehicleData.battery_temperature_c > this.vehicleData.outside_temperature_c) {
      this.vehicleData.battery_temperature_c -= 0.05;
    }
  }

  /**
   * Add slight randomization to values for more realistic data
   */
  private randomizeValues(): void {
    // Slightly adjust temperatures
    this.vehicleData.battery_temperature_c += (Math.random() * 0.4 - 0.2);
    this.vehicleData.outside_temperature_c += (Math.random() * 0.2 - 0.1);
    
    // Slightly adjust GPS position (simulate drift or movement)
    const latLonChange = 0.0001 * (Math.random() * 2 - 1);
    this.vehicleData.latitude += latLonChange;
    this.vehicleData.longitude += latLonChange;
  }

  /**
   * Ensure data consistency and realistic values
   */
  private ensureDataConsistency(): void {
    // Constrain state of charge between 0 and 100%
    this.vehicleData.state_of_charge_percent = Math.max(0, Math.min(100, this.vehicleData.state_of_charge_percent));
    
    // Update estimated range based on state of charge
    // Assuming a full battery provides 400km range
    const maxRange = 400;
    this.vehicleData.estimated_range_km = (this.vehicleData.state_of_charge_percent / 100) * maxRange;
    
    // Ensure speed is non-negative
    this.vehicleData.speed_kmh = Math.max(0, this.vehicleData.speed_kmh);
    
    // Ensure charging power is zero when not charging
    if (!this.vehicleData.is_charging) {
      this.vehicleData.charging_power_kw = 0;
    }
    
    // Round values to 1 decimal place for cleaner data
    this.vehicleData.state_of_charge_percent = parseFloat(this.vehicleData.state_of_charge_percent.toFixed(1));
    this.vehicleData.estimated_range_km = parseFloat(this.vehicleData.estimated_range_km.toFixed(1));
    this.vehicleData.speed_kmh = parseFloat(this.vehicleData.speed_kmh.toFixed(1));
    this.vehicleData.charging_power_kw = parseFloat(this.vehicleData.charging_power_kw.toFixed(1));
    this.vehicleData.battery_temperature_c = parseFloat(this.vehicleData.battery_temperature_c.toFixed(1));
    this.vehicleData.outside_temperature_c = parseFloat(this.vehicleData.outside_temperature_c.toFixed(1));
  }

  /**
   * Notify all callbacks with the latest vehicle data
   */
  private notifyCallbacks(): void {
    for (const callback of this.callbacks) {
      callback({ ...this.vehicleData });
    }
  }

  /**
   * Get the current vehicle data
   */
  getCurrentData(): any {
    return { ...this.vehicleData };
  }
}

interface SimulatorConfig {
  updateInterval: number; // milliseconds
  enableDriving: boolean;
  enableCharging: boolean;
  randomizeData: boolean;
  batteryDrainRate: number; // percentage points per update when driving
  drivingSpeedVariance: number; // km/h
}

// Singleton instance for easy usage
let simulatorInstance: TelematicsSimulator | null = null;

export function getTelematicsSimulator(
  initialData?: any, 
  config?: Partial<SimulatorConfig>
): TelematicsSimulator {
  if (!simulatorInstance) {
    simulatorInstance = new TelematicsSimulator(initialData, config);
  }
  // Update config if provided
  else if (config) {
    simulatorInstance.updateConfig(config);
  }
  return simulatorInstance;
} 