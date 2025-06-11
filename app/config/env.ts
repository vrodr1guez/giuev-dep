/**
 * Environment configuration for the application.
 * Provides type-safe access to environment variables with fallbacks.
 */

// Type-safe environment variable access
interface EnvConfig {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  API_KEY_SECRET?: string;
  EXTERNAL_NETWORK_API_KEY: string;
  EXTERNAL_NETWORK_BASE_URL: string;
  PAYMENT_GATEWAY_API_KEY?: string;
}

// Safe environment variable access that works in both Node.js and browser contexts
const getEnvVar = (key: string): string | undefined => {
  try {
    // @ts-ignore - Ignore process.env access since we don't have @types/node
    return typeof process !== 'undefined' ? process.env[key] : undefined;
  } catch {
    return undefined;
  }
};

// Default values for the environment
const defaultEnv: Partial<EnvConfig> = {
  DATABASE_URL: 'postgresql://user:password@localhost:5432/giu_ev_fleet',
  NODE_ENV: 'development',
  PORT: 3000,
  EXTERNAL_NETWORK_BASE_URL: 'https://api.externalnetwork.com/v1',
};

// Build the environment configuration
const env: EnvConfig = {
  DATABASE_URL: getEnvVar('DATABASE_URL') || defaultEnv.DATABASE_URL || '',
  NODE_ENV: (getEnvVar('NODE_ENV') as EnvConfig['NODE_ENV']) || defaultEnv.NODE_ENV || 'development',
  PORT: Number(getEnvVar('PORT')) || defaultEnv.PORT || 3000,
  API_KEY_SECRET: getEnvVar('API_KEY_SECRET'),
  EXTERNAL_NETWORK_API_KEY: getEnvVar('EXTERNAL_NETWORK_API_KEY') || '',
  EXTERNAL_NETWORK_BASE_URL: getEnvVar('EXTERNAL_NETWORK_BASE_URL') || defaultEnv.EXTERNAL_NETWORK_BASE_URL || '',
  PAYMENT_GATEWAY_API_KEY: getEnvVar('PAYMENT_GATEWAY_API_KEY'),
};

// Runtime type checking can be added back once zod is properly installed
// const envSchema = z.object({...});
// const validatedEnv = envSchema.parse(env);

export default env; 