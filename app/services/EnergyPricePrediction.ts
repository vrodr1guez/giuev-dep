/**
 * Energy Price Prediction Service
 * Predicts electricity prices for different time periods based on historical data,
 * grid load forecasts, and renewable energy availability.
 */

interface EnergyPricePoint {
  timestamp: string;
  price: number;      // Price in currency units per kWh
  renewable: number;  // Percentage of renewable energy (0-100)
  demand: number;     // Relative demand level (0-100)
  isOptimal: boolean; // Whether this is an optimal charging time
}

interface PricePredictionOptions {
  location: string;
  timeframe: number;    // Hours to forecast
  interval: number;     // Minutes between each prediction point
  includeHistorical?: boolean;
}

export class EnergyPricePrediction {
  private baselinePrice: number = 0.15; // Default price per kWh
  private priceVolatility: number = 0.05;
  private dailyPattern: number[] = [];
  private historicalPrices: EnergyPricePoint[] = [];
  private forecastPrices: EnergyPricePoint[] = [];

  constructor() {
    // Initialize daily price pattern based on typical grid demand
    this.initializeDailyPattern();
    
    // Generate some historical data
    this.generateHistoricalPrices();
  }

  /**
   * Initialize a daily price pattern based on typical grid demand
   * Higher values indicate higher relative prices
   */
  private initializeDailyPattern(): void {
    // 24-hour pattern with higher prices during peak hours (morning and evening)
    this.dailyPattern = [
      0.7,  // 12 AM - low demand
      0.65, // 1 AM
      0.6,  // 2 AM
      0.55, // 3 AM  
      0.5,  // 4 AM - lowest demand
      0.6,  // 5 AM
      0.7,  // 6 AM
      0.85, // 7 AM
      1.0,  // 8 AM - morning peak
      1.1,  // 9 AM
      1.05, // 10 AM
      1.0,  // 11 AM
      0.95, // 12 PM
      0.9,  // 1 PM
      0.85, // 2 PM
      0.9,  // 3 PM
      1.0,  // 4 PM
      1.1,  // 5 PM
      1.2,  // 6 PM - evening peak
      1.15, // 7 PM
      1.05, // 8 PM
      0.95, // 9 PM
      0.85, // 10 PM
      0.75, // 11 PM
    ];
  }

  /**
   * Generate historical price data for the past 24 hours
   */
  private generateHistoricalPrices(): void {
    const now = new Date();
    const hours = now.getHours();
    const startHour = hours + 1; // Start from next hour for the forecast
    
    // Generate 24 hours of "historical" data
    for (let i = 0; i < 24; i++) {
      const historyHour = (24 + hours - i) % 24;
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
      
      // Calculate price using pattern with some randomness
      const basePrice = this.baselinePrice * this.dailyPattern[historyHour];
      const randomFactor = 1 + ((Math.random() * 2 - 1) * this.priceVolatility);
      const price = basePrice * randomFactor;
      
      // Estimate renewable percentage - higher during midday for solar
      let renewable = 20 + (Math.random() * 10); // Base renewable
      if (historyHour >= 10 && historyHour <= 16) {
        renewable += 30 + (Math.random() * 20); // Solar boost during day
      }
      
      // Demand is correlated with price pattern
      const demand = this.dailyPattern[historyHour] * 80 + (Math.random() * 20);
      
      // Determine if this is an optimal charging time (low price)
      const isOptimal = price < (this.baselinePrice * 0.85);
      
      this.historicalPrices.push({
        timestamp: timestamp.toISOString(),
        price: parseFloat(price.toFixed(4)),
        renewable: Math.min(100, parseFloat(renewable.toFixed(1))),
        demand: parseFloat(demand.toFixed(1)),
        isOptimal
      });
    }
    
    // Reverse to get chronological order
    this.historicalPrices.reverse();
  }

  /**
   * Get energy price forecast for a specific location
   */
  public getPriceForecast(options: PricePredictionOptions): EnergyPricePoint[] {
    const { 
      timeframe = 24, 
      interval = 60, 
      includeHistorical = false 
    } = options;
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    const result: EnergyPricePoint[] = [];
    const intervalHours = interval / 60;
    const intervalsPerDay = Math.floor(24 / intervalHours);
    
    // Calculate how many intervals to forecast
    const forecastIntervals = Math.ceil(timeframe / intervalHours);
    
    // Include historical data if requested
    if (includeHistorical) {
      result.push(...this.historicalPrices);
    }
    
    // Generate forecast data points
    for (let i = 0; i < forecastIntervals; i++) {
      // Calculate forecast time
      const forecastTime = new Date(now.getTime() + (i * interval * 60 * 1000));
      const forecastHour = forecastTime.getHours();
      const forecastMinute = forecastTime.getMinutes();
      
      // Add variability to the forecast based on time distance
      // Further predictions have more variability
      const uncertaintyFactor = 1 + (i * 0.01);
      
      // Base price based on time of day pattern
      const hourIndex = forecastHour;
      const patternPrice = this.baselinePrice * this.dailyPattern[hourIndex];
      
      // Generate variability - more variability for further predictions
      const randomFactor = 1 + ((Math.random() * 2 - 1) * this.priceVolatility * uncertaintyFactor);
      const price = patternPrice * randomFactor;
      
      // Estimate renewable percentage
      let renewable = 20 + (Math.random() * 15); // Base renewable
      if (forecastHour >= 10 && forecastHour <= 16) {
        renewable += 20 + (Math.random() * 30); // Solar boost during day
      }
      
      // Weather effect on renewables (simulated)
      // In a real system, this would use weather forecast data
      const weatherFactor = 0.7 + (Math.random() * 0.6);
      renewable *= weatherFactor;
      
      // Demand is correlated with price pattern but includes randomness
      const demand = this.dailyPattern[hourIndex] * 70 + (Math.random() * 30);
      
      // Determine if this is an optimal charging time (low price)
      const isOptimal = price < (this.baselinePrice * 0.85);
      
      result.push({
        timestamp: forecastTime.toISOString(),
        price: parseFloat(price.toFixed(4)),
        renewable: Math.min(100, parseFloat(renewable.toFixed(1))),
        demand: parseFloat(demand.toFixed(1)),
        isOptimal
      });
    }
    
    return result;
  }

  /**
   * Find the optimal charging window within a given timeframe
   * @param duration - Charging duration needed in minutes
   * @param startAfter - Start charging after this time
   * @param endBefore - End charging before this time
   * @param options - Price forecast options
   * @returns The best time window to start charging
   */
  public findOptimalChargingWindow(
    duration: number,
    startAfter: Date = new Date(),
    endBefore: Date = new Date(Date.now() + 24 * 60 * 60 * 1000),
    options: Partial<PricePredictionOptions> = {}
  ): { startTime: Date; endTime: Date; avgPrice: number; savings: number } {
    // Get price forecast with 15-minute intervals
    const forecastOptions: PricePredictionOptions = {
      location: options.location || 'default',
      timeframe: Math.ceil((endBefore.getTime() - startAfter.getTime()) / (60 * 60 * 1000)),
      interval: 15,
      ...options
    };
    
    const forecast = this.getPriceForecast(forecastOptions);
    
    // Filter forecast to only include timepoints between startAfter and endBefore
    const validForecast = forecast.filter(point => {
      const pointTime = new Date(point.timestamp);
      return pointTime >= startAfter && pointTime <= endBefore;
    });
    
    if (validForecast.length === 0) {
      throw new Error('No valid time periods found within constraints');
    }
    
    // Number of 15-minute intervals needed for the charging duration
    const intervalsNeeded = Math.ceil(duration / 15);
    
    if (intervalsNeeded > validForecast.length) {
      throw new Error('Charging duration exceeds available time window');
    }
    
    // Find the window with the lowest average price
    let bestStartIndex = 0;
    let lowestAvgPrice = Number.MAX_VALUE;
    
    for (let i = 0; i <= validForecast.length - intervalsNeeded; i++) {
      const window = validForecast.slice(i, i + intervalsNeeded);
      const avgPrice = window.reduce((sum, point) => sum + point.price, 0) / window.length;
      
      if (avgPrice < lowestAvgPrice) {
        lowestAvgPrice = avgPrice;
        bestStartIndex = i;
      }
    }
    
    // Calculate the starting and ending times
    const bestStartTime = new Date(validForecast[bestStartIndex].timestamp);
    const bestEndTime = new Date(bestStartTime.getTime() + (duration * 60 * 1000));
    
    // Calculate savings compared to average price across all valid intervals
    const avgPriceOverall = validForecast.reduce((sum, point) => sum + point.price, 0) / validForecast.length;
    const savingsPercent = ((avgPriceOverall - lowestAvgPrice) / avgPriceOverall) * 100;
    
    return {
      startTime: bestStartTime,
      endTime: bestEndTime,
      avgPrice: parseFloat(lowestAvgPrice.toFixed(4)),
      savings: parseFloat(savingsPercent.toFixed(1))
    };
  }
}

// Singleton instance for convenience
let energyPricePredictionInstance: EnergyPricePrediction | null = null;

export function getEnergyPricePrediction(): EnergyPricePrediction {
  if (!energyPricePredictionInstance) {
    energyPricePredictionInstance = new EnergyPricePrediction();
  }
  return energyPricePredictionInstance;
} 