/**
 * In-Memory Cache Utility for Next.js API Routes
 * 
 * Features:
 * - Time-based cache expiration (TTL)
 * - Automatic cache invalidation
 * - Tag-based cache clearing
 * - Memory-efficient storage
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  tags: string[]
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>
  private maxSize: number

  constructor(maxSize: number = 1000) {
    this.cache = new Map()
    this.maxSize = maxSize
    
    // Clean up expired entries every 5 minutes
    if (typeof window === 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000)
    }
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    console.log(`✅ Cache HIT: ${key}`)
    return entry.data as T
  }

  /**
   * Set cache data with TTL
   */
  set<T>(key: string, data: T, ttl: number = 300000, tags: string[] = []): void {
    // Enforce max cache size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
    })

    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}ms, Tags: [${tags.join(', ')}])`)
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries with specific tag
   */
  clearByTag(tag: string): number {
    let count = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key)
        count++
      }
    }

    if (count > 0) {
      console.log(`🗑️ Cleared ${count} cache entries with tag: ${tag}`)
    }

    return count
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    console.log(`🗑️ Cleared all cache (${size} entries)`)
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()
    let count = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        count++
      }
    }

    if (count > 0) {
      console.log(`🧹 Cleaned up ${count} expired cache entries`)
    }
  }

  /**
   * Get cache statistics
   */
  stats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.keys()),
    }
  }
}

// Singleton instance
const cache = new MemoryCache(1000)

/**
 * Cache wrapper for async functions
 * 
 * @example
 * const cities = await withCache('cities:all', async () => {
 *   return await City.find({ isActive: true }).lean()
 * }, 3600000, ['cities'])
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300000, // 5 minutes default
  tags: string[] = []
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch and cache
  console.log(`❌ Cache MISS: ${key}`)
  const data = await fetcher()
  cache.set(key, data, ttl, tags)
  
  return data
}

export { cache }

/**
 * Cache TTL Constants (in milliseconds)
 */
export const CacheTTL = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  SIX_HOURS: 6 * 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
} as const

/**
 * Cache Tags for invalidation
 */
export const CacheTags = {
  CITIES: 'cities',
  BRANCHES: 'branches',
  ROOMS: 'rooms',
  ROOM_TYPES: 'room-types',
  BOOKINGS: 'bookings',
  COMBOS: 'combos',
  MENU_ITEMS: 'menu-items',
} as const
