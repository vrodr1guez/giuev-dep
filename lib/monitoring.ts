import { NextRequest } from 'next/server';

export interface LogLevel {
  level: 'error' | 'warn' | 'info' | 'debug';
}

export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  metadata?: Record<string, any>;
  traceId?: string;
  userId?: string;
  requestId?: string;
}

export interface MetricEntry {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  details?: Record<string, any>;
  timestamp: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: HealthCheck[];
  uptime: number;
  timestamp: string;
}

// In-memory storage for development (use Redis/database in production)
const logs: LogEntry[] = [];
const metrics: MetricEntry[] = [];
const healthChecks: Map<string, HealthCheck> = new Map();

// Maximum entries to keep in memory
const MAX_LOGS = 10000;
const MAX_METRICS = 50000;

// Logger class
export class Logger {
  private context: string;
  private defaultMetadata: Record<string, any>;

  constructor(context: string, defaultMetadata: Record<string, any> = {}) {
    this.context = context;
    this.defaultMetadata = defaultMetadata;
  }

  private log(level: 'error' | 'warn' | 'info' | 'debug', message: string, metadata: Record<string, any> = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: `[${this.context}] ${message}`,
      metadata: { ...this.defaultMetadata, ...metadata },
      traceId: metadata.traceId || generateTraceId(),
    };

    // Add to in-memory store
    logs.push(entry);
    if (logs.length > MAX_LOGS) {
      logs.shift(); // Remove oldest entry
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`${entry.timestamp} [${level.toUpperCase()}] ${entry.message}`, entry.metadata);
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      sendToLoggingService(entry);
    }
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log('debug', message, metadata);
  }
}

// Metrics collection
export class Metrics {
  static increment(name: string, value: number = 1, tags: Record<string, string> = {}) {
    const entry: MetricEntry = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags,
      type: 'counter',
    };

    metrics.push(entry);
    if (metrics.length > MAX_METRICS) {
      metrics.shift();
    }

    // Send to metrics service in production
    if (process.env.NODE_ENV === 'production') {
      sendToMetricsService(entry);
    }
  }

  static gauge(name: string, value: number, tags: Record<string, string> = {}) {
    const entry: MetricEntry = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags,
      type: 'gauge',
    };

    metrics.push(entry);
    if (metrics.length > MAX_METRICS) {
      metrics.shift();
    }

    if (process.env.NODE_ENV === 'production') {
      sendToMetricsService(entry);
    }
  }

  static timer(name: string, duration: number, tags: Record<string, string> = {}) {
    const entry: MetricEntry = {
      name,
      value: duration,
      timestamp: new Date().toISOString(),
      tags,
      type: 'timer',
    };

    metrics.push(entry);
    if (metrics.length > MAX_METRICS) {
      metrics.shift();
    }

    if (process.env.NODE_ENV === 'production') {
      sendToMetricsService(entry);
    }
  }
}

// Request monitoring middleware
export function createRequestLogger(context: string = 'API') {
  const logger = new Logger(context);

  return (request: NextRequest, response?: Response) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    logger.info(`${method} ${url}`, {
      requestId,
      method,
      url,
      userAgent,
      ip,
      timestamp: new Date().toISOString(),
    });

    // Metrics
    Metrics.increment('http_requests_total', 1, {
      method,
      endpoint: url.split('?')[0], // Remove query params
    });

    // Return completion handler
    return {
      requestId,
      complete: (statusCode: number, error?: Error) => {
        const duration = Date.now() - startTime;
        
        Metrics.timer('http_request_duration_ms', duration, {
          method,
          status_code: statusCode.toString(),
        });

        if (error) {
          logger.error(`${method} ${url} - ${statusCode} - ${error.message}`, {
            requestId,
            statusCode,
            duration,
            error: error.message,
            stack: error.stack,
          });
          
          Metrics.increment('http_errors_total', 1, {
            method,
            status_code: statusCode.toString(),
          });
        } else {
          logger.info(`${method} ${url} - ${statusCode} - ${duration}ms`, {
            requestId,
            statusCode,
            duration,
          });
        }
      },
    };
  };
}

// Health check functions
export async function performHealthCheck(): Promise<SystemHealth> {
  const startTime = Date.now();
  const services: HealthCheck[] = [];

  // Database health check
  try {
    const dbStart = Date.now();
    const { checkDatabaseConnection } = await import('./db');
    const isDbHealthy = await checkDatabaseConnection();
    const dbResponseTime = Date.now() - dbStart;

    services.push({
      service: 'database',
      status: isDbHealthy ? 'healthy' : 'unhealthy',
      responseTime: dbResponseTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    services.push({
      service: 'database',
      status: 'unhealthy',
      details: { error: (error as Error).message },
      timestamp: new Date().toISOString(),
    });
  }

  // Email service health check
  try {
    const emailStart = Date.now();
    const { checkEmailService } = await import('./email');
    const isEmailHealthy = await checkEmailService();
    const emailResponseTime = Date.now() - emailStart;

    services.push({
      service: 'email',
      status: isEmailHealthy ? 'healthy' : 'degraded',
      responseTime: emailResponseTime,
      details: { configured: isEmailHealthy },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    services.push({
      service: 'email',
      status: 'unhealthy',
      details: { error: (error as Error).message },
      timestamp: new Date().toISOString(),
    });
  }

  // Meeting platform health check
  try {
    const meetingStart = Date.now();
    const { checkMeetingPlatform } = await import('./meetings');
    const meetingStatus = await checkMeetingPlatform();
    const meetingResponseTime = Date.now() - meetingStart;

    services.push({
      service: 'meetings',
      status: meetingStatus.configured ? 'healthy' : 'degraded',
      responseTime: meetingResponseTime,
      details: meetingStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    services.push({
      service: 'meetings',
      status: 'unhealthy',
      details: { error: (error as Error).message },
      timestamp: new Date().toISOString(),
    });
  }

  // Determine overall health
  const unhealthyServices = services.filter(s => s.status === 'unhealthy');
  const degradedServices = services.filter(s => s.status === 'degraded');
  
  let overall: 'healthy' | 'unhealthy' | 'degraded';
  if (unhealthyServices.length > 0) {
    overall = 'unhealthy';
  } else if (degradedServices.length > 0) {
    overall = 'degraded';
  } else {
    overall = 'healthy';
  }

  return {
    overall,
    services,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}

// Error tracking
export function trackError(error: Error, context?: Record<string, any>) {
  const logger = new Logger('ErrorTracker');
  
  logger.error(`Unhandled error: ${error.message}`, {
    error: error.message,
    stack: error.stack,
    context,
  });

  Metrics.increment('errors_total', 1, {
    error_type: error.constructor.name,
  });

  // Send to error tracking service (Sentry, etc.)
  if (process.env.NODE_ENV === 'production') {
    sendToErrorTracker(error, context);
  }
}

// Performance monitoring
export function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  tags: Record<string, string> = {}
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      
      Metrics.timer(`performance_${name}`, duration, tags);
      resolve(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      Metrics.timer(`performance_${name}`, duration, { ...tags, status: 'error' });
      trackError(error as Error, { operation: name, tags });
      reject(error);
    }
  });
}

// Utility functions
function generateTraceId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// External service integrations (production)
async function sendToLoggingService(entry: LogEntry): Promise<void> {
  // Implement integration with CloudWatch, DataDog, etc.
  if (process.env.LOGGING_ENDPOINT) {
    try {
      await fetch(process.env.LOGGING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }
}

async function sendToMetricsService(entry: MetricEntry): Promise<void> {
  // Implement integration with DataDog, New Relic, etc.
  if (process.env.METRICS_ENDPOINT) {
    try {
      await fetch(process.env.METRICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send metric to external service:', error);
    }
  }
}

async function sendToErrorTracker(error: Error, context?: Record<string, any>): Promise<void> {
  // Implement integration with Sentry, Bugsnag, etc.
  if (process.env.ERROR_TRACKING_DSN) {
    // Sentry example (would need @sentry/node installed)
    // Sentry.captureException(error, { extra: context });
  }
}

// API endpoints for monitoring data
export function getRecentLogs(limit: number = 100, level?: string): LogEntry[] {
  let filteredLogs = logs;
  
  if (level) {
    filteredLogs = logs.filter(log => log.level === level);
  }
  
  return filteredLogs.slice(-limit);
}

export function getMetrics(name?: string, since?: string): MetricEntry[] {
  let filteredMetrics = metrics;
  
  if (name) {
    filteredMetrics = metrics.filter(metric => metric.name === name);
  }
  
  if (since) {
    const sinceDate = new Date(since);
    filteredMetrics = filteredMetrics.filter(metric => new Date(metric.timestamp) >= sinceDate);
  }
  
  return filteredMetrics;
}

// Initialize monitoring
export function initializeMonitoring(): void {
  const logger = new Logger('Monitoring');
  
  // Log startup
  logger.info('Monitoring system initialized', {
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform,
  });

  // Track startup metrics
  Metrics.increment('app_starts_total', 1, {
    environment: process.env.NODE_ENV || 'unknown',
  });

  // Set up periodic health checks
  setInterval(async () => {
    try {
      const health = await performHealthCheck();
      Metrics.gauge('system_health_score', health.overall === 'healthy' ? 1 : health.overall === 'degraded' ? 0.5 : 0);
    } catch (error) {
      logger.error('Health check failed', { error: (error as Error).message });
    }
  }, 30000); // Every 30 seconds

  // Track memory usage
  setInterval(() => {
    const memUsage = process.memoryUsage();
    Metrics.gauge('memory_usage_bytes', memUsage.heapUsed, { type: 'heap_used' });
    Metrics.gauge('memory_usage_bytes', memUsage.heapTotal, { type: 'heap_total' });
    Metrics.gauge('memory_usage_bytes', memUsage.external, { type: 'external' });
  }, 60000); // Every minute
}

// Export default logger
export const logger = new Logger('App'); 