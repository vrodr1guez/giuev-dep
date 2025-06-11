import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Check if DATABASE_URL is configured
const isDatabaseConfigured = process.env.DATABASE_URL && process.env.DATABASE_URL !== '';

let prisma: PrismaClient | null = null;

// Only initialize Prisma if database is configured
if (isDatabaseConfigured) {
  prisma = globalThis.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
}

export { prisma };

// Database connection health check with graceful fallback
export async function checkDatabaseConnection(): Promise<boolean> {
  if (!isDatabaseConfigured) {
    console.warn('Database not configured - running in development mode without persistence');
    return true; // Return true for development mode
  }

  if (!prisma) {
    console.error('Prisma client not initialized');
    return false;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

// Transaction helper with fallback
export async function withTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  if (!prisma) {
    throw new Error('Database not configured - cannot perform transactions');
  }
  return prisma.$transaction(callback);
}

// In-memory storage fallback for development
interface InMemoryData {
  contactSubmissions: any[];
  demoSchedules: any[];
  chargingStations: any[];
  v2gSessions: any[];
}

const inMemoryStore: InMemoryData = {
  contactSubmissions: [],
  demoSchedules: [],
  chargingStations: [],
  v2gSessions: [],
};

// Development data access layer
export const devDataStore = {
  // Contact submissions
  async createContactSubmission(data: any) {
    const submission = { ...data, id: generateId(), createdAt: new Date(), updatedAt: new Date() };
    inMemoryStore.contactSubmissions.push(submission);
    return submission;
  },

  async getContactSubmissions() {
    return inMemoryStore.contactSubmissions;
  },

  // Demo schedules  
  async createDemoSchedule(data: any) {
    const schedule = { ...data, id: generateId(), createdAt: new Date(), updatedAt: new Date() };
    inMemoryStore.demoSchedules.push(schedule);
    return schedule;
  },

  async getDemoSchedules() {
    return inMemoryStore.demoSchedules;
  },

  // V2G Sessions
  async createV2GSession(data: any) {
    const session = { ...data, id: generateId(), createdAt: new Date(), updatedAt: new Date() };
    inMemoryStore.v2gSessions.push(session);
    return session;
  },

  async getV2GSessions() {
    return inMemoryStore.v2gSessions;
  },

  async updateV2GSession(id: string, data: any) {
    const index = inMemoryStore.v2gSessions.findIndex(s => s.id === id);
    if (index !== -1) {
      inMemoryStore.v2gSessions[index] = { ...inMemoryStore.v2gSessions[index], ...data, updatedAt: new Date() };
      return inMemoryStore.v2gSessions[index];
    }
    return null;
  },

  // Charging stations
  async createChargingStation(data: any) {
    const station = { ...data, id: generateId(), createdAt: new Date(), updatedAt: new Date() };
    inMemoryStore.chargingStations.push(station);
    return station;
  },

  async getChargingStations() {
    return inMemoryStore.chargingStations;
  },
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Check if we're running with database
export const isDatabaseAvailable = isDatabaseConfigured && prisma !== null;

// Database seeding helper
export async function seedDatabase() {
  if (!isDatabaseAvailable) {
    console.log('Database not available - seeding in-memory store for development');
    
    // Seed some demo data for development
    await devDataStore.createChargingStation({
      name: 'Downtown EV Hub',
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Main St, New York, NY',
      provider: 'GIU Energy',
      powerCapacity: 350,
      currentLoad: 125.5,
      status: 'operational'
    });

    await devDataStore.createChargingStation({
      name: 'Airport Charging Plaza',
      latitude: 40.6892,
      longitude: -74.1745,
      address: '456 Airport Rd, Newark, NJ',
      provider: 'GIU Energy',
      powerCapacity: 500,
      currentLoad: 287.3,
      status: 'operational'
    });

    console.log('Development data seeded successfully');
    return;
  }

  if (prisma) {
    // Add any database seeding logic here for production
    console.log('Database seeding would go here for production');
  }
} 