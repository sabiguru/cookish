/**
 * Rate limiter for API endpoints
 * Supports in-memory and Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Custom identifier (default: IP address)
   */
  identifier?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  // Get current entry
  let entry = rateLimitStore.get(key);

  // Create new entry if doesn't exist or expired
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;

  // Check if exceeded
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Get identifier (IP address or custom)
  const identifier =
    config.identifier ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  return checkRateLimit(identifier, config);
}

/**
 * Predefined rate limit configs
 */
export const RateLimits = {
  // Authentication endpoints
  auth: {
    maxRequests: 5,
    windowSeconds: 60, // 5 requests per minute
  },

  // API endpoints (general)
  api: {
    maxRequests: 60,
    windowSeconds: 60, // 60 requests per minute
  },

  // Mobile API endpoints
  mobile: {
    maxRequests: 60,
    windowSeconds: 60, // 60 requests per minute
  },

  // Messaging (already handled in message routes, but for reference)
  messaging: {
    maxRequests: 10,
    windowSeconds: 30, // 10 messages per 30 seconds
  },

  // Reviews
  reviews: {
    maxRequests: 5,
    windowSeconds: 300, // 5 reviews per 5 minutes
  },

  // Search
  search: {
    maxRequests: 30,
    windowSeconds: 60, // 30 searches per minute
  },

  // File uploads
  uploads: {
    maxRequests: 10,
    windowSeconds: 60, // 10 uploads per minute
  },

  // Admin actions
  admin: {
    maxRequests: 100,
    windowSeconds: 60, // 100 requests per minute
  },
};

/**
 * Reset rate limit for a specific identifier
 */
export function resetRateLimit(identifier: string): void {
  const key = `ratelimit:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(identifier: string): RateLimitEntry | null {
  const key = `ratelimit:${identifier}`;
  return rateLimitStore.get(key) || null;
}

/**
 * Clear all rate limits (for testing)
 */
export function clearRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats(): {
  totalEntries: number;
  activeUsers: number;
} {
  const now = Date.now();
  let activeUsers = 0;

  for (const entry of rateLimitStore.values()) {
    if (now <= entry.resetAt) {
      activeUsers++;
    }
  }

  return {
    totalEntries: rateLimitStore.size,
    activeUsers,
  };
}
