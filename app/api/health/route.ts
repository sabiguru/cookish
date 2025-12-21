import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCacheStats } from '@/lib/cache';

/**
 * Health check endpoint
 * Returns status of key system components
 *
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now();
  const health: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {},
  };

  // Check Database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    health.checks.database = {
      status: 'ok',
      latency: `${dbLatency}ms`,
    };
  } catch (error: any) {
    health.status = 'unhealthy';
    health.checks.database = {
      status: 'error',
      message: error.message,
    };
  }

  // Check Cache
  try {
    const cacheStats = await getCacheStats();
    health.checks.cache = {
      status: 'ok',
      memorySize: cacheStats.memorySize,
      redisConnected: cacheStats.redisConnected,
    };
  } catch (error: any) {
    health.checks.cache = {
      status: 'warning',
      message: error.message,
    };
  }

  // Check Environment Variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  health.checks.environment = {
    status: missingEnvVars.length === 0 ? 'ok' : 'warning',
    ...(missingEnvVars.length > 0 && {
      missing: missingEnvVars,
    }),
  };

  // Memory Usage
  const memUsage = process.memoryUsage();
  health.checks.memory = {
    status: 'ok',
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
  };

  // Response Time
  health.responseTime = `${Date.now() - startTime}ms`;

  // HTTP Status Code
  const statusCode = health.status === 'healthy' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
