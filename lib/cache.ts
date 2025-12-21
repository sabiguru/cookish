/**
 * Caching layer for CookFort
 * Supports both in-memory LRU cache and Redis (when available)
 */

interface CacheEntry {
  value: any;
  expiresAt: number;
}

// In-memory LRU cache
class LRUCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: any, ttl: number): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global in-memory cache instance
const memoryCache = new LRUCache(1000);

// Redis client (optional)
let redisClient: any = null;

/**
 * Initialize Redis client if available
 */
export async function initRedis() {
  if (process.env.REDIS_URL) {
    try {
      const { createClient } = await import('redis');
      redisClient = createClient({
        url: process.env.REDIS_URL,
      });

      await redisClient.connect();
      console.log('✓ Redis cache connected');
    } catch (error) {
      console.warn('Redis not available, using in-memory cache:', error);
      redisClient = null;
    }
  }
}

/**
 * Get cached value
 */
export async function getCached<T = any>(key: string): Promise<T | null> {
  try {
    // Try Redis first if available
    if (redisClient && redisClient.isOpen) {
      const value = await redisClient.get(key);
      if (value) {
        return JSON.parse(value);
      }
    }

    // Fall back to memory cache
    return memoryCache.get(key);
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set cached value
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in seconds (default: 600 = 10 minutes)
 */
export async function setCached(
  key: string,
  value: any,
  ttl: number = 600
): Promise<void> {
  try {
    // Set in Redis if available
    if (redisClient && redisClient.isOpen) {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    }

    // Always set in memory cache as fallback
    memoryCache.set(key, value, ttl);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Delete cached value
 */
export async function deleteCached(key: string): Promise<void> {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.del(key);
    }

    memoryCache.delete(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Delete cached values by pattern
 */
export async function deleteCachedByPattern(pattern: string): Promise<void> {
  try {
    if (redisClient && redisClient.isOpen) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }

    // For memory cache, we need to iterate
    // This is less efficient but necessary for pattern matching
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const [key] of memoryCache['cache']) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  } catch (error) {
    console.error('Cache delete pattern error:', error);
  }
}

/**
 * Clear all cache
 */
export async function clearCache(): Promise<void> {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.flushAll();
    }

    memoryCache.clear();
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  memorySize: number;
  redisConnected: boolean;
}> {
  return {
    memorySize: memoryCache.size(),
    redisConnected: redisClient ? redisClient.isOpen : false,
  };
}

/**
 * Cache wrapper for functions
 * Automatically caches function results
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 600
): Promise<T> {
  // Try to get from cache
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function
  const result = await fn();

  // Cache result
  await setCached(key, result, ttl);

  return result;
}

/**
 * Cache key builders for consistency
 */
export const CacheKeys = {
  chefList: (page: number = 1) => `chefs:list:${page}`,
  chefProfile: (id: string) => `chef:${id}`,
  chefReviews: (id: string, page: number = 1) => `chef:${id}:reviews:${page}`,
  cuisineList: () => `cuisines:list`,
  cuisineChefs: (slug: string, page: number = 1) => `cuisine:${slug}:chefs:${page}`,
  menuList: (chefId: string) => `chef:${chefId}:menus`,
  menu: (id: string) => `menu:${id}`,
  reviewStats: (chefId: string) => `chef:${chefId}:review-stats`,
  searchResults: (query: string, page: number = 1) => `search:${query}:${page}`,
};

// Initialize Redis on module load if configured
if (process.env.REDIS_URL) {
  initRedis().catch(console.error);
}

export { memoryCache };
