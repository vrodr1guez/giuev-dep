import { NextRequest, NextResponse } from 'next/server';
import { 
  performHealthCheck, 
  getRecentLogs, 
  getMetrics,
  createRequestLogger,
  SystemHealth
} from '../../../lib/monitoring';
import { requireAuth } from '../../../lib/auth';

// GET /api/health - System health check
export async function GET(request: NextRequest) {
  const requestLogger = createRequestLogger('Health');
  const { requestId, complete } = requestLogger(request);

  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    const logs = searchParams.get('logs') === 'true';
    const metrics = searchParams.get('metrics') === 'true';

    // Basic health check (public)
    const health = await performHealthCheck();

    // If detailed info is requested, check authentication
    if (detailed || logs || metrics) {
      const authCheck = requireAuth(['read:analytics']);
      const authResult = await authCheck(request);
      
      if (!authResult.authenticated) {
        // Return basic health without detailed info
        complete(200);
        return NextResponse.json({
          status: health.overall,
          timestamp: health.timestamp,
          uptime: health.uptime,
        });
      }
    }

    const response: any = {
      status: health.overall,
      timestamp: health.timestamp,
      uptime: health.uptime,
    };

    if (detailed) {
      response.services = health.services;
      response.environment = {
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV,
        memoryUsage: process.memoryUsage(),
      };
    }

    if (logs) {
      const logLevel = searchParams.get('logLevel');
      const logLimit = parseInt(searchParams.get('logLimit') || '50');
      response.recentLogs = getRecentLogs(logLimit, logLevel || undefined);
    }

    if (metrics) {
      const metricName = searchParams.get('metricName');
      const since = searchParams.get('since');
      response.metrics = getMetrics(metricName || undefined, since || undefined);
    }

    const statusCode = health.overall === 'healthy' ? 200 : 
                      health.overall === 'degraded' ? 206 : 503;

    complete(statusCode);
    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('Health check failed:', error);
    complete(500, error as Error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST /api/health/ping - Simple ping endpoint
export async function POST(request: NextRequest) {
  const requestLogger = createRequestLogger('Ping');
  const { requestId, complete } = requestLogger(request);

  complete(200);
  return NextResponse.json({
    message: 'pong',
    timestamp: new Date().toISOString(),
    requestId,
  });
} 